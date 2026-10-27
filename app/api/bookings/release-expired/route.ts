import { releaseExpiredHolds } from '@/lib/booking/service'

/** For a scheduled job (cron): releases unpaid holds that have expired. Holds are also released on every booking read. */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  return Response.json({ released: releaseExpiredHolds() })
}
