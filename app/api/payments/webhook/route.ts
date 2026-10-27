import { handlePaymentNotice } from '@/lib/booking/events'

/** Server-to-server payment notices. Only a correctly signed notice changes a booking. */
export async function POST(request: Request) {
  const raw = await request.text()
  const result = await handlePaymentNotice(raw, request.headers.get('x-seasmates-signature'))
  return Response.json({ received: result.ok }, { status: result.ok ? 200 : 400 })
}
