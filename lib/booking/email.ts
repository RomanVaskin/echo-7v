import { localePath, siteUrl } from '@/lib/i18n'
import { recordEmail } from './service'
import type { Order } from './store'
import { caribbeanVoyage, formatUsd } from './voyage'

const optionNames = { shared: 'Shared Cabin', 'private-solo': 'Private Cabin · Solo', 'private-two': 'Private Cabin · Two Guests' }

export function orderUrl(order: Order) {
  return `${siteUrl}${localePath(order.locale, '/journeys/caribbean/book/order')}?id=${order.id}&t=${order.token}`
}

/** Booking confirmation for the lead guest, sent after a verified payment. */
export async function sendConfirmation(order: Order) {
  const lead = order.guests[0]
  if (!lead?.email) return
  const balance = order.quote.totalCents - order.paidCents
  const subject =
    order.status === 'paid_in_full'
      ? `Paid in full — ${caribbeanVoyage.title} (${order.id})`
      : `Booking confirmed — ${caribbeanVoyage.title} (${order.id})`
  const text = [
    `Dear ${lead.firstName},`,
    '',
    order.status === 'paid_in_full'
      ? 'Thank you: your booking is now paid in full.'
      : 'Thank you: we have received your deposit and your place on board is confirmed.',
    '',
    `Booking reference: ${order.id}`,
    `Journey: ${caribbeanVoyage.title}, 28 December 2026 – 7 January 2027 (${caribbeanVoyage.nights} nights)`,
    `Accommodation: ${optionNames[order.option]}`,
    `Guests: ${order.guests.map((g) => `${g.firstName} ${g.lastName}`).join(', ')}`,
    `Total price: ${formatUsd(order.quote.totalCents)}`,
    `Paid: ${formatUsd(order.paidCents)}`,
    `Remaining balance: ${formatUsd(Math.max(balance, 0))}`,
    '',
    `Your booking: ${orderUrl(order)}`,
    '',
    'seasmates',
  ].join('\n')

  // Sent through Resend when configured; otherwise kept in the booking's outbox (demo)
  let via: 'resend' | 'outbox' = 'outbox'
  const key = process.env.RESEND_API_KEY
  const from = process.env.BOOKING_EMAIL_FROM
  if (key && from) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: lead.email, subject, text }),
      })
      if (response.ok) via = 'resend'
    } catch {}
  }
  recordEmail(order.id, { to: lead.email, subject, text, via, sentAt: Date.now() })
}
