import { releaseExpired } from '@/lib/booking/bookings'
import { authorized } from '@/lib/cron-auth'

/** Scheduled job: releases unpaid holds that have expired (they are also released on every booking read). */
export async function POST(request: Request) {
  if (!authorized(request, process.env.CRON_SECRET)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  return Response.json({ released: await releaseExpired() })
}
