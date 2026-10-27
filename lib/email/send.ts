import { db } from '@/lib/db'
import { getBookingDetails } from '@/lib/booking/bookings'
import { renderEmail, type EmailTemplate } from './templates'

/**
 * Sends a booking email once per `dedupeKey` (a retried webhook or reminder run sends nothing twice).
 *
 * The mail service is not chosen yet: the only transport, 'log', records the rendered email in the
 * email_log table (shown on the booking page) and in the server log. A provider plugs in here.
 */
export async function sendBookingEmail(template: EmailTemplate, bookingId: string, dedupeKey: string, amountCents?: number) {
  const details = await getBookingDetails(bookingId)
  const to = details?.guests[0]?.email
  if (!details || !to) return false
  const { subject, text } = renderEmail(template, details, amountCents)
  const transport = process.env.EMAIL_TRANSPORT || 'log'
  const { rowCount } = await db().query(
    `INSERT INTO email_log (booking_id, template, dedupe_key, to_address, subject, body, transport)
     VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (dedupe_key) DO NOTHING`,
    [bookingId, template, dedupeKey, to, subject, text, transport],
  )
  if (!rowCount) return false
  console.info(`[email:${transport}] ${template} → ${to}: ${subject}`)
  return true
}
