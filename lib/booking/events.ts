import { sendConfirmation } from './email'
import { paymentProvider } from './payments'
import { cancelPendingPayment, markPaymentSucceeded } from './service'

/** Handles a provider notice: verify, apply once, then email the guest. Shared by the webhook and the demo checkout. */
export async function handlePaymentNotice(rawBody: string, signature: string | null) {
  const event = paymentProvider().parseWebhook(rawBody, signature)
  if (!event) return { ok: false as const }
  if (event.type === 'payment.succeeded') {
    const order = markPaymentSucceeded(event.paymentId, event.providerRef)
    if (order && order.status !== 'payment_review') await sendConfirmation(order)
  } else {
    cancelPendingPayment(event.paymentId)
  }
  return { ok: true as const, event }
}
