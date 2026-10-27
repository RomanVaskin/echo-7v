import { handleWebhook } from '@/lib/booking/payment-flow'

/** PayPal webhook (register this URL in the PayPal app; its id goes to PAYPAL_WEBHOOK_ID). */
export async function POST(request: Request) {
  const status = await handleWebhook(await request.text(), request.headers)
  return new Response(null, { status })
}
