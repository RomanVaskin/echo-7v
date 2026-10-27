import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { Locale } from '@/lib/i18n'
import { cabinStates, pickCabin, summarize, type AvailabilitySummary, type CabinReservation } from './availability'
import { withBookings, type Order, type Payment, type Traveller } from './store'
import { caribbeanVoyage, cabinOptions, quote, type CabinOptionId } from './voyage'

type Data = Parameters<Parameters<typeof withBookings>[0]>[0]

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function reference() {
  return 'SM-' + Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join('')
}

/** Unpaid bookings whose hold ran out give their berths back. Run before every read and write. */
function releaseExpired(data: Data, now: number) {
  let released = 0
  for (const order of data.orders.values()) {
    const hold = order.reservation
    if (order.status === 'pending_payment' && hold.holdExpiresAt !== null && hold.holdExpiresAt <= now) {
      order.status = 'expired'
      hold.status = 'released'
      for (const id of order.payments) {
        const payment = data.payments.get(id)
        if (payment?.status === 'pending') payment.status = 'cancelled'
      }
      released++
    }
  }
  return released
}

function activeReservations(data: Data): CabinReservation[] {
  return [...data.orders.values()]
    .filter((o) => o.reservation.status !== 'released')
    .map((o) => ({ cabinId: o.cabinId, berths: o.reservation.berths, privateCabin: o.reservation.privateCabin }))
}

export function getAvailability(now = Date.now()): AvailabilitySummary {
  return withBookings((data) => {
    releaseExpired(data, now)
    return summarize(cabinStates(activeReservations(data)))
  })
}

/** For a scheduled job: release expired holds without waiting for the next visitor. */
export function releaseExpiredHolds(now = Date.now()) {
  return withBookings((data) => releaseExpired(data, now))
}

export type NewBooking = { option: CabinOptionId; locale: Locale; guests: Traveller[]; requests: string; provider: string }

/** Creates the order, holds its berths and opens the deposit payment. Prices come from `quote`, never from the browser. */
export function createBooking(input: NewBooking, now = Date.now()): { order: Order; payment: Payment } | { error: 'unavailable' } {
  return withBookings((data) => {
    releaseExpired(data, now)
    const cabinId = pickCabin(cabinStates(activeReservations(data)), input.option)
    if (!cabinId) return { error: 'unavailable' as const }

    let id = reference()
    while (data.orders.has(id)) id = reference()
    const option = cabinOptions[input.option]
    const price = quote(input.option)
    const order: Order = {
      id,
      token: randomBytes(24).toString('base64url'),
      createdAt: now,
      locale: input.locale,
      journey: caribbeanVoyage.journey,
      option: input.option,
      guests: input.guests.slice(0, option.guests),
      requests: input.requests,
      quote: price,
      cabinId,
      reservation: {
        berths: option.berths,
        privateCabin: option.privateCabin,
        status: 'held',
        holdExpiresAt: now + caribbeanVoyage.holdMinutes * 60_000,
      },
      status: 'pending_payment',
      paidCents: 0,
      payments: [],
      emails: [],
    }
    const payment = newPayment(order, 'deposit', price.depositCents, input.provider, now)
    data.orders.set(order.id, order)
    data.payments.set(payment.id, payment)
    return { order, payment }
  })
}

function newPayment(order: Order, kind: Payment['kind'], amountCents: number, provider: string, now: number): Payment {
  const payment: Payment = {
    id: `pay_${randomBytes(12).toString('hex')}`,
    orderId: order.id,
    kind,
    amountCents,
    status: 'pending',
    provider,
    createdAt: now,
  }
  order.payments.push(payment.id)
  return payment
}

function tokenMatches(order: Order, token: string) {
  const a = Buffer.from(order.token)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function getOrder(id: string, token: string, now = Date.now()) {
  return withBookings((data) => {
    releaseExpired(data, now)
    const order = data.orders.get(id)
    if (!order || !tokenMatches(order, token)) return null
    return { order, payments: order.payments.map((p) => data.payments.get(p)!).filter(Boolean) }
  })
}

export function getPayment(id: string, now = Date.now()) {
  return withBookings((data) => {
    releaseExpired(data, now)
    const payment = data.payments.get(id)
    if (!payment) return null
    return { payment, order: data.orders.get(payment.orderId)! }
  })
}

/**
 * Applies a verified "payment succeeded" notice from the provider. Idempotent: a repeated notice
 * changes nothing. Returns the order when this call changed it (so the confirmation email goes once).
 */
export function markPaymentSucceeded(paymentId: string, providerRef: string, now = Date.now()): Order | null {
  return withBookings((data) => {
    releaseExpired(data, now)
    const payment = data.payments.get(paymentId)
    if (!payment || payment.status === 'succeeded') return null
    const order = data.orders.get(payment.orderId)
    if (!order) return null

    payment.status = 'succeeded'
    payment.providerRef = providerRef
    payment.paidAt = now
    order.paidCents += payment.amountCents

    if (payment.kind === 'deposit') {
      if (order.reservation.status === 'released') {
        // Paid after the hold expired: take the berths again if they are still free
        const cabinId = pickCabin(cabinStates(activeReservations(data)), order.option)
        if (!cabinId) {
          order.status = 'payment_review'
          return order
        }
        order.cabinId = cabinId
      }
      order.reservation.status = 'confirmed'
      order.reservation.holdExpiresAt = null
      order.status = 'confirmed'
    } else if (order.paidCents >= order.quote.totalCents) {
      order.status = 'paid_in_full'
    }
    return order
  })
}

export function cancelPendingPayment(paymentId: string) {
  return withBookings((data) => {
    const payment = data.payments.get(paymentId)
    if (payment?.status === 'pending') payment.status = 'cancelled'
    return payment ? data.orders.get(payment.orderId) ?? null : null
  })
}

/** The separate payment of the remaining balance (70%) of a confirmed booking. */
export function createBalancePayment(orderId: string, token: string, provider: string, now = Date.now()) {
  return withBookings((data) => {
    const order = data.orders.get(orderId)
    if (!order || !tokenMatches(order, token) || order.status !== 'confirmed') return null
    const due = order.quote.totalCents - order.paidCents
    if (due <= 0) return null
    const open = order.payments.map((id) => data.payments.get(id)!).find((p) => p.kind === 'balance' && p.status === 'pending')
    if (open) return { order, payment: open }
    const payment = newPayment(order, 'balance', due, provider, now)
    data.payments.set(payment.id, payment)
    return { order, payment }
  })
}

export function recordEmail(orderId: string, email: Order['emails'][number]) {
  withBookings((data) => data.orders.get(orderId)?.emails.push(email))
}
