import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { PoolClient } from 'pg'
import { db, transaction } from '@/lib/db'
import type { Locale } from '@/lib/i18n'
import { cabinStates, pickCabin, summarize, type AvailabilitySummary } from './availability'
import { cabinOptions, caribbeanVoyage, lateBookingRule, quote, type CabinOptionId, type Pricing } from './voyage'

export type Trip = Pricing & {
  id: string
  title: string
  currency: string
  startDate: string
  endDate: string
  nights: number
  /** YYYY-MM-DD */
  balanceDueDate: string
}

export type BookingStatus = 'pending_payment' | 'confirmed' | 'paid_in_full' | 'expired' | 'cancelled' | 'needs_review'
export type PaymentStatus = 'created' | 'pending' | 'completed' | 'declined' | 'cancelled' | 'refunded' | 'partially_refunded' | 'reversed'

export type Guest = { firstName: string; lastName: string; email?: string; phone?: string; country?: string }

export type Booking = {
  id: string
  token: string
  tripId: string
  cabinId: string
  option: CabinOptionId
  status: BookingStatus
  holdsBerths: boolean
  holdExpiresAt: Date | null
  listCents: number
  totalCents: number
  depositCents: number
  balanceCents: number
  paidCents: number
  balanceDueDate: string
  locale: Locale
  requests: string
  reviewReason: string | null
  createdAt: Date
}

export type Payment = {
  id: string
  bookingId: string
  kind: 'deposit' | 'balance'
  amountCents: number
  currency: string
  status: PaymentStatus
  paypalOrderId: string | null
  paypalCaptureId: string | null
  refundedCents: number
  failureReason: string | null
  createdAt: Date
  completedAt: Date | null
}

type Row = Record<string, unknown>
const isoDate = (value: unknown) => (value instanceof Date ? value.toISOString().slice(0, 10) : String(value))

const toTrip = (r: Row): Trip => ({
  id: r.id as string,
  title: r.title as string,
  currency: (r.currency as string).trim(),
  startDate: isoDate(r.start_date),
  endDate: isoDate(r.end_date),
  nights: r.nights as number,
  seatPriceCents: r.seat_price_cents as number,
  depositPercent: r.deposit_percent as number,
  balanceDueDate: isoDate(r.balance_due_date),
})

export const toBooking = (r: Row): Booking => ({
  id: r.id as string,
  token: r.token as string,
  tripId: r.trip_id as string,
  cabinId: r.cabin_id as string,
  option: r.option as CabinOptionId,
  status: r.status as BookingStatus,
  holdsBerths: r.holds_berths as boolean,
  holdExpiresAt: (r.hold_expires_at as Date | null) ?? null,
  listCents: r.list_cents as number,
  totalCents: r.total_cents as number,
  depositCents: r.deposit_cents as number,
  balanceCents: r.balance_cents as number,
  paidCents: r.paid_cents as number,
  balanceDueDate: isoDate(r.balance_due_date),
  locale: r.locale as Locale,
  requests: r.requests as string,
  reviewReason: (r.review_reason as string | null) ?? null,
  createdAt: r.created_at as Date,
})

export const toPayment = (r: Row): Payment => ({
  id: r.id as string,
  bookingId: r.booking_id as string,
  kind: r.kind as Payment['kind'],
  amountCents: r.amount_cents as number,
  currency: (r.currency as string).trim(),
  status: r.status as PaymentStatus,
  paypalOrderId: (r.paypal_order_id as string | null) ?? null,
  paypalCaptureId: (r.paypal_capture_id as string | null) ?? null,
  refundedCents: r.refunded_cents as number,
  failureReason: (r.failure_reason as string | null) ?? null,
  createdAt: r.created_at as Date,
  completedAt: (r.completed_at as Date | null) ?? null,
})

const toGuest = (r: Row): Guest => ({
  firstName: r.first_name as string,
  lastName: r.last_name as string,
  email: (r.email as string | null) ?? undefined,
  phone: (r.phone as string | null) ?? undefined,
  country: (r.country as string | null) ?? undefined,
})

export async function loadTrip(tripId: string = caribbeanVoyage.tripId, client: Pick<PoolClient, 'query'> = db()) {
  const { rows } = await client.query('SELECT * FROM trips WHERE id = $1', [tripId])
  return rows[0] ? toTrip(rows[0]) : null
}

/** Today's date (UTC) as YYYY-MM-DD. */
export const today = () => new Date().toISOString().slice(0, 10)

/**
 * Whether the usual 30/70 split applies: only for bookings made on or before the balance due date.
 * After it, the late-booking rule decides (see `lateBookingRule`).
 */
export function paymentScheme(trip: Trip, on = today()): 'deposit' | 'late-contact' | 'late-full-payment' {
  if (on <= trip.balanceDueDate) return 'deposit'
  return lateBookingRule === 'full_payment' ? 'late-full-payment' : 'late-contact'
}

/** Unpaid bookings whose hold ran out give their berths back. Runs before every allocation and read. */
export async function releaseExpired(client: Pick<PoolClient, 'query'> = db()) {
  const { rows } = await client.query(
    `UPDATE bookings SET status = 'expired', holds_berths = false, updated_at = now()
      WHERE status = 'pending_payment' AND hold_expires_at <= now()
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.booking_id = bookings.id AND p.status = 'pending')
      RETURNING id`,
  )
  // Open PayPal orders stay as they are: if the guest still approves one, the capture step takes the
  // berths again when they are free, or ends the payment without charging
  return rows.length
}

async function cabinsWithReservations(client: Pick<PoolClient, 'query'>, tripId: string) {
  const cabins = (await client.query('SELECT id, berths FROM cabins WHERE trip_id = $1 ORDER BY name', [tripId])).rows as {
    id: string
    berths: number
  }[]
  const reservations = (
    await client.query('SELECT cabin_id, berths, private_cabin FROM bookings WHERE trip_id = $1 AND holds_berths', [tripId])
  ).rows.map((r) => ({ cabinId: r.cabin_id as string, berths: r.berths as 1 | 2, privateCabin: r.private_cabin as boolean }))
  return cabinStates(cabins, reservations)
}

export async function getAvailability(tripId: string = caribbeanVoyage.tripId): Promise<AvailabilitySummary> {
  await releaseExpired()
  return summarize(await cabinsWithReservations(db(), tripId))
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const reference = () => 'SM-' + Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join('')

export type NewBooking = { option: CabinOptionId; locale: Locale; guests: Guest[]; requests: string }

/**
 * Creates a booking and holds its berths, in one transaction. The trip row is locked while a cabin
 * is chosen, so two guests can never get the same berth; the database trigger double-checks it.
 */
export async function createBooking(input: NewBooking): Promise<{ booking: Booking } | { error: 'unavailable' | 'late' | 'no_trip' }> {
  return transaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [caribbeanVoyage.tripId])
    if (!rows[0]) return { error: 'no_trip' as const }
    const trip = toTrip(rows[0])
    const scheme = paymentScheme(trip)
    if (scheme === 'late-contact') return { error: 'late' as const }

    await releaseExpired(client)
    const cabinId = pickCabin(await cabinsWithReservations(client, trip.id), input.option)
    if (!cabinId) return { error: 'unavailable' as const }

    const option = cabinOptions[input.option]
    const price = quote(input.option, trip)
    // Late full payment (only if the owner enables it): the whole amount is due now
    const depositCents = scheme === 'late-full-payment' ? price.totalCents : price.depositCents
    const id = reference()
    const inserted = await client.query(
      `INSERT INTO bookings (id, token, trip_id, cabin_id, option, berths, private_cabin, status, hold_expires_at,
                             list_cents, total_cents, deposit_cents, balance_cents, balance_due_date, locale, requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_payment', now() + make_interval(mins => $8), $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        id,
        randomBytes(24).toString('base64url'),
        trip.id,
        cabinId,
        input.option,
        option.berths,
        option.privateCabin,
        caribbeanVoyage.holdMinutes,
        price.listCents,
        price.totalCents,
        depositCents,
        price.totalCents - depositCents,
        trip.balanceDueDate,
        input.locale,
        input.requests,
      ],
    )
    for (const [i, guest] of input.guests.slice(0, option.guests).entries()) {
      await client.query(
        'INSERT INTO guests (booking_id, position, first_name, last_name, email, phone, country) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, i + 1, guest.firstName, guest.lastName, guest.email ?? null, guest.phone ?? null, guest.country ?? null],
      )
    }
    return { booking: toBooking(inserted.rows[0]) }
  })
}

function tokenMatches(booking: Booking, token: string) {
  const a = Buffer.from(booking.token)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function getBookingDetails(id: string, token?: string) {
  await releaseExpired()
  const client = db()
  const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1', [id])
  if (!rows[0]) return null
  const booking = toBooking(rows[0])
  if (token !== undefined && !tokenMatches(booking, token)) return null
  const [guests, payments, trip, emails] = await Promise.all([
    client.query('SELECT * FROM guests WHERE booking_id = $1 ORDER BY position', [id]),
    client.query('SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at', [id]),
    loadTrip(booking.tripId, client),
    client.query('SELECT template, to_address, subject, body, transport, sent_at FROM email_log WHERE booking_id = $1 ORDER BY sent_at', [id]),
  ])
  return {
    booking,
    trip: trip!,
    guests: guests.rows.map(toGuest),
    payments: payments.rows.map(toPayment),
    emails: emails.rows as { template: string; to_address: string; subject: string; body: string; transport: string; sent_at: Date }[],
  }
}

export type BookingDetails = NonNullable<Awaited<ReturnType<typeof getBookingDetails>>>
