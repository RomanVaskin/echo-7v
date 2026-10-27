import { db } from '@/lib/db'
import { today } from '@/lib/booking/bookings'
import { authorized } from '@/lib/cron-auth'
import { sendBookingEmail } from '@/lib/email/send'

/**
 * Scheduled job (daily): emails a link to pay the remaining balance — 14 days and 3 days before the
 * due date, and once when it is overdue. Each reminder goes once per booking. Nothing is ever charged
 * automatically; the guest pays from the link.
 */
export async function POST(request: Request) {
  if (!authorized(request, process.env.CRON_SECRET)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { rows } = await db().query(
    `SELECT id, balance_due_date - $1::date AS days_left FROM bookings
      WHERE status = 'confirmed' AND paid_cents < total_cents AND balance_due_date - $1::date <= 14`,
    [today()],
  )
  let sent = 0
  for (const row of rows as { id: string; days_left: number }[]) {
    const stage = row.days_left < 0 ? 'overdue' : row.days_left <= 3 ? 'd3' : 'd14'
    if (await sendBookingEmail('balance_reminder', row.id, `balance_reminder:${row.id}:${stage}`)) sent++
  }
  return Response.json({ checked: rows.length, sent })
}
