import { randomBytes } from 'node:crypto'
import type { PoolClient } from 'pg'
import { db, transaction } from '@/lib/db'
import { sendBookingEmail } from '@/lib/email/send'
import {
  approvalUrl,
  captureOrder,
  createOrder,
  fromPayPalValue,
  getOrder,
  PayPalError,
  refundCapture,
  verifyWebhook,
  type PayPalCapture,
  type PayPalOrder,
} from '@/lib/payments/paypal'
import { cabinStates, pickCabin } from './availability'
import { releaseExpired, toBooking, toPayment, type Booking, type Payment } from './bookings'
import { caribbeanVoyage } from './voyage'

/*
 * Payment lifecycle (PayPal Orders API v2, intent CAPTURE):
 *   1. startPayment: a `payments` row (status created) and a PayPal order for exactly its amount;
 *      the guest is sent to PayPal to approve it.
 *   2. The guest comes back (or PayPal's CHECKOUT.ORDER.APPROVED webhook arrives): the berths are
 *      re-checked, then the order is captured on the server.
 *   3. applyCapture: amount, currency, our payment id and the PayPal order id are verified; only a
 *      COMPLETED capture confirms the booking (deposit) or completes it (balance).
 * Webhooks are verified with PayPal and recorded once in payment_events; every step is idempotent.
 */

export type PaymentKind = Payment['kind']

const newPaymentId = () => `pay_${randomBytes(12).toString('hex')}`

async function lockPayment(client: PoolClient, paymentId: string) {
  const { rows } = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId])
  return rows[0] ? toPayment(rows[0]) : null
}

async function lockBooking(client: PoolClient, bookingId: string) {
  const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId])
  return rows[0] ? toBooking(rows[0]) : null
}

export class PaymentNotAllowed extends Error {}

/**
 * Opens a payment for a booking and returns the PayPal approval link. The amount always comes from
 * the booking in the database: the deposit, or for the balance whatever is still unpaid.
 */
export async function startPayment(bookingId: string, kind: PaymentKind, origin: string): Promise<string> {
  const { payment, booking } = await transaction(async (client) => {
    await releaseExpired(client)
    const booking = await lockBooking(client, bookingId)
    if (!booking) throw new PaymentNotAllowed('booking not found')
    let amountCents: number
    if (kind === 'deposit') {
      if (booking.status !== 'pending_payment' || !booking.holdsBerths) throw new PaymentNotAllowed('deposit not payable')
      amountCents = booking.depositCents
    } else {
      if (booking.status !== 'confirmed') throw new PaymentNotAllowed('balance not payable')
      amountCents = booking.totalCents - booking.paidCents
      if (amountCents <= 0) throw new PaymentNotAllowed('nothing due')
    }
    // An earlier, unfinished attempt of the same kind is superseded
    await client.query(
      `UPDATE payments SET status = 'cancelled', failure_reason = 'superseded', updated_at = now()
        WHERE booking_id = $1 AND kind = $2 AND status = 'created'`,
      [bookingId, kind],
    )
    const { rows } = await client.query(
      `INSERT INTO payments (id, booking_id, kind, amount_cents, currency, status) VALUES ($1, $2, $3, $4, 'USD', 'created') RETURNING *`,
      [newPaymentId(), bookingId, kind, amountCents],
    )
    return { payment: toPayment(rows[0]), booking }
  })

  try {
    const order = await createOrder({
      paymentId: payment.id,
      bookingId: booking.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      description: `${caribbeanVoyage.title} — ${kind === 'deposit' ? 'deposit' : 'balance'} (${booking.id})`,
      returnUrl: `${origin}/api/payments/paypal/return?payment=${payment.id}`,
      cancelUrl: `${origin}/api/payments/paypal/cancel?payment=${payment.id}`,
      locale: booking.locale,
    })
    const link = approvalUrl(order)
    if (!link) throw new Error('PayPal returned no approval link')
    await db().query('UPDATE payments SET paypal_order_id = $2, updated_at = now() WHERE id = $1', [payment.id, order.id])
    return link
  } catch (error) {
    await db().query(`UPDATE payments SET status = 'cancelled', failure_reason = $2, updated_at = now() WHERE id = $1`, [
      payment.id,
      `create_failed: ${(error as Error).message}`.slice(0, 300),
    ])
    throw error
  }
}

export type ReturnOutcome = 'completed' | 'pending' | 'declined' | 'unavailable' | 'cancelled' | 'error'

/**
 * Captures an approved order: after the guest returns from PayPal, or from the APPROVED webhook.
 * Before money is taken the booking is re-checked; if its hold expired and the berths are gone,
 * the order is not captured at all.
 */
export async function captureApproved(paymentId: string, paypalOrderId: string): Promise<{ booking: Booking | null; outcome: ReturnOutcome }> {
  const ready = await transaction(async (client) => {
    await releaseExpired(client)
    const payment = await lockPayment(client, paymentId)
    if (!payment || payment.paypalOrderId !== paypalOrderId) return { error: 'error' as const, booking: null }
    const booking = (await lockBooking(client, payment.bookingId))!
    if (payment.status === 'completed') return { error: 'completed' as const, booking }
    if (payment.status === 'pending') return { error: 'pending' as const, booking }
    if (payment.status !== 'created') return { error: 'cancelled' as const, booking }

    if (payment.kind === 'deposit' && (booking.status !== 'pending_payment' || !booking.holdsBerths)) {
      // The hold ran out while the guest was at PayPal: take the berths again if still free
      const revived = booking.status === 'expired' && (await reserveAgain(client, booking))
      if (!revived) {
        await client.query(`UPDATE payments SET status = 'cancelled', failure_reason = 'berths_unavailable', updated_at = now() WHERE id = $1`, [
          payment.id,
        ])
        return { error: 'unavailable' as const, booking }
      }
    }
    if (payment.kind === 'balance' && booking.status !== 'confirmed') return { error: 'cancelled' as const, booking }
    return { payment, booking }
  })
  if (!('payment' in ready)) return { booking: ready.booking, outcome: ready.error }

  let order: PayPalOrder
  try {
    order = await captureOrder(paypalOrderId, paymentId)
  } catch (error) {
    if (error instanceof PayPalError && error.issue === 'ORDER_ALREADY_CAPTURED') {
      order = await getOrder(paypalOrderId)
    } else if (error instanceof PayPalError && error.issue === 'INSTRUMENT_DECLINED') {
      await markFailed(paymentId, 'declined', 'INSTRUMENT_DECLINED')
      return { booking: ready.booking, outcome: 'declined' }
    } else {
      console.error('[paypal] capture failed', paymentId, error)
      return { booking: ready.booking, outcome: 'error' }
    }
  }
  const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
  if (!capture) return { booking: ready.booking, outcome: 'error' }
  return applyCapture(paymentId, paypalOrderId, capture)
}

/** Puts an expired booking back on hold if its option still fits a cabin. */
async function reserveAgain(client: PoolClient, booking: Booking) {
  await client.query('SELECT 1 FROM trips WHERE id = $1 FOR UPDATE', [booking.tripId])
  const cabins = (await client.query('SELECT id, berths FROM cabins WHERE trip_id = $1 ORDER BY name', [booking.tripId])).rows
  const reservations = (
    await client.query('SELECT cabin_id, berths, private_cabin FROM bookings WHERE trip_id = $1 AND holds_berths', [booking.tripId])
  ).rows.map((r) => ({ cabinId: r.cabin_id, berths: r.berths, privateCabin: r.private_cabin }))
  const cabinId = pickCabin(cabinStates(cabins, reservations), booking.option)
  if (!cabinId) return false
  await client.query(
    `UPDATE bookings SET cabin_id = $2, holds_berths = true, status = 'pending_payment',
            hold_expires_at = now() + make_interval(mins => $3), updated_at = now() WHERE id = $1`,
    [booking.id, cabinId, caribbeanVoyage.holdMinutes],
  )
  return true
}

async function markFailed(paymentId: string, status: 'declined' | 'cancelled', reason: string) {
  const { rows } = await db().query(
    `UPDATE payments SET status = $2, failure_reason = $3, updated_at = now()
      WHERE id = $1 AND status IN ('created', 'pending') RETURNING booking_id, amount_cents`,
    [paymentId, status, reason],
  )
  if (rows[0] && status === 'declined') {
    await sendBookingEmail('payment_failed', rows[0].booking_id, `payment_failed:${paymentId}`, rows[0].amount_cents)
  }
}

/**
 * Applies a capture reported by PayPal (capture response or webhook). Verifies it belongs to this
 * payment and matches its amount and currency; a mismatch is kept for manual review instead.
 */
export async function applyCapture(
  paymentId: string,
  paypalOrderId: string | null,
  capture: Pick<PayPalCapture, 'id' | 'status' | 'amount' | 'custom_id' | 'status_details'>,
): Promise<{ booking: Booking | null; outcome: ReturnOutcome }> {
  const result = await transaction(async (client) => {
    const payment = await lockPayment(client, paymentId)
    if (!payment) return { booking: null, outcome: 'error' as const, email: null }
    const booking = (await lockBooking(client, payment.bookingId))!
    if (payment.status === 'completed' || payment.status === 'refunded' || payment.status === 'partially_refunded' || payment.status === 'reversed') {
      return { booking, outcome: 'completed' as const, email: null } // already applied
    }

    const amountMatches = capture.amount?.currency_code === payment.currency && fromPayPalValue(capture.amount.value) === payment.amountCents
    const belongs = (!capture.custom_id || capture.custom_id === payment.id) && (!paypalOrderId || paypalOrderId === payment.paypalOrderId)

    if (capture.status === 'COMPLETED') {
      await client.query(
        `UPDATE payments SET status = 'completed', paypal_capture_id = $2, completed_at = now(), updated_at = now(),
                failure_reason = $3 WHERE id = $1`,
        [payment.id, capture.id, amountMatches && belongs ? null : 'verification_mismatch'],
      )
      if (!amountMatches || !belongs) {
        // Money arrived but does not match what we asked for: a person decides (keep or refund)
        await client.query(`UPDATE bookings SET status = 'needs_review', review_reason = 'payment_mismatch', updated_at = now() WHERE id = $1`, [
          booking.id,
        ])
        return { booking, outcome: 'completed' as const, email: null }
      }
      const paid = booking.paidCents + payment.amountCents
      const status = paid >= booking.totalCents ? 'paid_in_full' : 'confirmed'
      const expected = payment.kind === 'deposit' ? ['pending_payment', 'expired'] : ['confirmed']
      // A deposit after the hold expired keeps the booking only if the berths can be taken again
      const lost = payment.kind === 'deposit' && booking.status === 'expired' && !(await reserveAgain(client, booking))
      if (!expected.includes(booking.status) || lost) {
        // Paid for a booking that is not awaiting this payment (or whose berths are gone): a person decides
        await client.query(`UPDATE bookings SET status = 'needs_review', review_reason = $2, updated_at = now() WHERE id = $1`, [
          booking.id,
          lost ? 'paid_after_berths_released' : 'unexpected_payment',
        ])
        return { booking, outcome: 'completed' as const, email: null }
      }
      const { rows } = await client.query(
        `UPDATE bookings SET paid_cents = $2, status = $3, hold_expires_at = NULL, holds_berths = true, updated_at = now()
          WHERE id = $1 RETURNING *`,
        [booking.id, paid, status],
      )
      const email = status === 'paid_in_full' ? ('paid_in_full' as const) : ('deposit_received' as const)
      return { booking: toBooking(rows[0]), outcome: 'completed' as const, email: { template: email, key: `${email}:${payment.id}`, amount: payment.amountCents } }
    }

    if (capture.status === 'PENDING') {
      await client.query(`UPDATE payments SET status = 'pending', paypal_capture_id = $2, failure_reason = $3, updated_at = now() WHERE id = $1`, [
        payment.id,
        capture.id,
        capture.status_details?.reason ?? null,
      ])
      if (payment.kind === 'deposit') {
        // Keep the berths while PayPal clears the payment; the COMPLETED webhook confirms it
        await client.query(`UPDATE bookings SET hold_expires_at = now() + make_interval(hours => $2), updated_at = now() WHERE id = $1`, [
          booking.id,
          caribbeanVoyage.pendingHoldHours,
        ])
      }
      return { booking, outcome: 'pending' as const, email: null }
    }

    // DECLINED / FAILED
    await client.query(`UPDATE payments SET status = 'declined', paypal_capture_id = $2, failure_reason = $3, updated_at = now() WHERE id = $1`, [
      payment.id,
      capture.id,
      capture.status_details?.reason ?? capture.status,
    ])
    return { booking, outcome: 'declined' as const, email: { template: 'payment_failed' as const, key: `payment_failed:${payment.id}`, amount: payment.amountCents } }
  })

  if (result.email && result.booking) await sendBookingEmail(result.email.template, result.booking.id, result.email.key, result.email.amount)
  return { booking: result.booking, outcome: result.outcome }
}

/** The guest cancelled on PayPal's page: the attempt ends, the berths stay held until the hold expires. */
export async function cancelPayment(paymentId: string) {
  const { rows } = await db().query(
    `UPDATE payments SET status = 'cancelled', failure_reason = 'cancelled_by_payer', updated_at = now()
      WHERE id = $1 AND status = 'created' RETURNING booking_id`,
    [paymentId],
  )
  const bookingId = rows[0]?.booking_id ?? (await db().query('SELECT booking_id FROM payments WHERE id = $1', [paymentId])).rows[0]?.booking_id
  return bookingId as string | undefined
}

type WebhookEvent = { id: string; event_type: string; resource: Record<string, unknown> & { id?: string } }

/** PayPal webhook: verify with PayPal, record once, apply. Returns the HTTP status to answer with. */
export async function handleWebhook(rawBody: string, headers: Headers): Promise<number> {
  if (!(await verifyWebhook(headers, rawBody))) return 400
  const event = JSON.parse(rawBody) as WebhookEvent
  const inserted = await db().query(
    `INSERT INTO payment_events (id, event_type, resource_id, payload) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO NOTHING RETURNING id`,
    [event.id, event.event_type, event.resource?.id ?? null, rawBody],
  )
  if (!inserted.rowCount) {
    const done = await db().query('SELECT processed_at FROM payment_events WHERE id = $1', [event.id])
    if (done.rows[0]?.processed_at) return 200 // repeated delivery: already applied
  }

  let outcome = 'ignored'
  const resource = event.resource
  try {
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // The guest approved but did not come back to the site: capture from here
        const payment = await paymentBy('paypal_order_id', resource.id as string)
        if (payment?.status === 'created') outcome = (await captureApproved(payment.id, payment.paypalOrderId!)).outcome
        break
      }
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'PAYMENT.CAPTURE.PENDING':
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const capture = resource as unknown as PayPalCapture
        const orderId = capture.supplementary_data?.related_ids?.order_id ?? null
        const payment =
          (capture.custom_id && (await paymentBy('id', capture.custom_id))) ||
          (await paymentBy('paypal_capture_id', capture.id)) ||
          (orderId && (await paymentBy('paypal_order_id', orderId)))
        if (payment) {
          const status = event.event_type === 'PAYMENT.CAPTURE.COMPLETED' ? 'COMPLETED' : event.event_type === 'PAYMENT.CAPTURE.PENDING' ? 'PENDING' : 'DECLINED'
          outcome = (await applyCapture(payment.id, orderId, { ...capture, status })).outcome
        }
        break
      }
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        outcome = await applyRefund(event)
        break
      }
    }
    await db().query('UPDATE payment_events SET processed_at = now(), outcome = $2 WHERE id = $1', [event.id, outcome])
    return 200
  } catch (error) {
    console.error('[paypal] webhook failed', event.id, error)
    return 500 // PayPal retries; the event row stays unprocessed until it succeeds
  }
}

async function paymentBy(column: 'id' | 'paypal_order_id' | 'paypal_capture_id', value: string) {
  const { rows } = await db().query(`SELECT * FROM payments WHERE ${column} = $1`, [value])
  return rows[0] ? toPayment(rows[0]) : null
}

/** Refunds and reversals (chargebacks): recorded on the payment; the booking goes to manual review. */
async function applyRefund(event: WebhookEvent) {
  const resource = event.resource as { id?: string; amount?: { value: string }; links?: { rel: string; href: string }[] }
  const captureId =
    event.event_type === 'PAYMENT.CAPTURE.REVERSED'
      ? (resource.id as string)
      : resource.links?.find((l) => l.rel === 'up')?.href.split('/').pop()
  if (!captureId) return 'no_capture'
  return transaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM payments WHERE paypal_capture_id = $1 FOR UPDATE', [captureId])
    if (!rows[0]) return 'unknown_capture'
    const payment = toPayment(rows[0])
    if (event.event_type === 'PAYMENT.CAPTURE.REVERSED') {
      await client.query(`UPDATE payments SET status = 'reversed', updated_at = now() WHERE id = $1`, [payment.id])
      await client.query(`UPDATE bookings SET status = 'needs_review', review_reason = 'payment_reversed', updated_at = now() WHERE id = $1`, [
        payment.bookingId,
      ])
      return 'reversed'
    }
    const refunded = Math.min(payment.refundedCents + fromPayPalValue(resource.amount?.value ?? '0'), payment.amountCents)
    await client.query(`UPDATE payments SET refunded_cents = $2, status = $3, updated_at = now() WHERE id = $1`, [
      payment.id,
      refunded,
      refunded >= payment.amountCents ? 'refunded' : 'partially_refunded',
    ])
    await client.query(`UPDATE bookings SET status = 'needs_review', review_reason = 'payment_refunded', updated_at = now() WHERE id = $1`, [
      payment.bookingId,
    ])
    return 'refunded'
  })
}

/**
 * Starts a refund at PayPal (for staff, via /api/admin/payments/refund). The amounts are recorded
 * when PayPal's PAYMENT.CAPTURE.REFUNDED webhook arrives, so a refund is never counted twice.
 */
export async function requestRefund(paymentId: string, amountCents?: number) {
  const payment = await paymentBy('id', paymentId)
  if (!payment?.paypalCaptureId || payment.status !== 'completed') throw new PaymentNotAllowed('payment cannot be refunded')
  const amount = amountCents ? { currency_code: payment.currency, value: (amountCents / 100).toFixed(2) } : undefined
  const refund = await refundCapture(payment.paypalCaptureId, `refund-${payment.id}-${amountCents ?? 'full'}`, amount)
  await db().query(`UPDATE bookings SET status = 'needs_review', review_reason = 'refund_requested', updated_at = now() WHERE id = $1`, [
    payment.bookingId,
  ])
  return refund
}
