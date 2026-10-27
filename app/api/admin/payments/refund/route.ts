import { PaymentNotAllowed, requestRefund } from '@/lib/booking/payment-flow'
import { authorized } from '@/lib/cron-auth'

/**
 * Staff only (Authorization: Bearer ADMIN_API_TOKEN): refunds a captured payment, fully or partly.
 * Body: { "paymentId": "pay_…", "amountCents": 126000 }  (amountCents optional = full refund).
 * The booking is flagged for manual review; amounts are recorded from PayPal's refund webhook.
 */
export async function POST(request: Request) {
  if (!authorized(request, process.env.ADMIN_API_TOKEN)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { paymentId, amountCents } = (await request.json().catch(() => ({}))) as { paymentId?: string; amountCents?: number }
  if (!paymentId) return Response.json({ error: 'paymentId required' }, { status: 400 })
  try {
    const refund = await requestRefund(paymentId, amountCents)
    return Response.json({ refund })
  } catch (error) {
    const status = error instanceof PaymentNotAllowed ? 409 : 502
    return Response.json({ error: (error as Error).message }, { status })
  }
}
