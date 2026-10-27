import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { localePath, type Locale } from '@/lib/i18n'
import type { Order, Payment } from './store'

/**
 * Payment provider boundary. The site never takes card details: it sends the guest to the provider's
 * secure page and trusts only a signed server-to-server notice (the webhook) to mark a payment paid.
 *
 * Only the demo provider exists for now: its "secure page" is a local simulation and nothing is
 * charged. A real provider (e.g. Stripe Checkout) implements the same two methods.
 */
export type PaymentEvent = { type: 'payment.succeeded' | 'payment.failed'; paymentId: string; providerRef: string }

export interface PaymentProvider {
  name: string
  createCheckout(input: { order: Order; payment: Payment; locale: Locale }): Promise<{ redirectUrl: string }>
  /** Verifies the notice's signature; returns null when it is not authentic. */
  parseWebhook(rawBody: string, signature: string | null): PaymentEvent | null
}

const globalSecret = globalThis as typeof globalThis & { __seasmatesWebhookSecret?: string }
function webhookSecret() {
  // A per-process random secret unless one is configured
  return process.env.PAYMENT_WEBHOOK_SECRET || (globalSecret.__seasmatesWebhookSecret ??= randomBytes(32).toString('hex'))
}

export function sign(rawBody: string) {
  return createHmac('sha256', webhookSecret()).update(rawBody).digest('hex')
}

function verify(rawBody: string, signature: string | null) {
  if (!signature) return false
  const expected = Buffer.from(sign(rawBody))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export const demoProvider: PaymentProvider = {
  name: 'demo',
  async createCheckout({ payment, locale }) {
    return { redirectUrl: `${localePath(locale, '/journeys/caribbean/book/checkout')}?payment=${payment.id}` }
  },
  parseWebhook(rawBody, signature) {
    if (!verify(rawBody, signature)) return null
    try {
      const event = JSON.parse(rawBody) as PaymentEvent
      if ((event.type === 'payment.succeeded' || event.type === 'payment.failed') && typeof event.paymentId === 'string') return event
    } catch {}
    return null
  },
}

/** Real charges stay off until a provider is agreed: only the demo provider can be selected. */
export function paymentProvider(): PaymentProvider {
  return demoProvider
}
