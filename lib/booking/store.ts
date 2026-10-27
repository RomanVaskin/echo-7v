import type { Locale } from '@/lib/i18n'
import type { CabinOptionId, Quote } from './voyage'

export type Traveller = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  country?: string
}

export type OrderStatus =
  /** Berths held, deposit not paid yet. */
  | 'pending_payment'
  /** Deposit (30%) paid: the booking is confirmed, the balance (70%) is due later. */
  | 'confirmed'
  | 'paid_in_full'
  /** The hold ran out before payment; the berths went back on sale. */
  | 'expired'
  /** Paid after its hold expired and the berths were gone in the meantime: needs a manual look (refund). */
  | 'payment_review'

export type Payment = {
  id: string
  orderId: string
  kind: 'deposit' | 'balance'
  amountCents: number
  status: 'pending' | 'succeeded' | 'cancelled'
  provider: string
  providerRef?: string
  createdAt: number
  paidAt?: number
}

export type SentEmail = { to: string; subject: string; text: string; via: 'resend' | 'outbox'; sentAt: number }

export type Order = {
  /** Booking reference shown to the guest, e.g. SM-7K3Q9XPA. */
  id: string
  /** Secret part of the order page link. */
  token: string
  createdAt: number
  locale: Locale
  journey: string
  option: CabinOptionId
  /** Lead traveller first. */
  guests: Traveller[]
  requests: string
  quote: Quote
  cabinId: string
  reservation: { berths: 1 | 2; privateCabin: boolean; status: 'held' | 'confirmed' | 'released'; holdExpiresAt: number | null }
  status: OrderStatus
  paidCents: number
  payments: string[]
  emails: SentEmail[]
}

type BookingData = { orders: Map<string, Order>; payments: Map<string, Payment> }

/*
 * Demo storage: in the server's memory, empty after every restart, so no real bookings are kept.
 * Every operation runs synchronously inside `withBookings`, which makes it atomic in Node's single
 * thread: two requests can never take the same berth. A database version keeps the same
 * operations and runs each one in a transaction that locks the voyage's reservations.
 */
const globalStore = globalThis as typeof globalThis & { __seasmatesBookings?: BookingData }

export function withBookings<T>(fn: (data: BookingData) => T): T {
  globalStore.__seasmatesBookings ??= { orders: new Map(), payments: new Map() }
  return fn(globalStore.__seasmatesBookings)
}
