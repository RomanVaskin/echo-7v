/**
 * PayPal Checkout through the server-side Orders API v2 (https://developer.paypal.com/docs/api/orders/v2/).
 * The client secret is read from the server environment only and never reaches the browser.
 *
 * Environment:
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET  sandbox REST app credentials
 *   PAYPAL_WEBHOOK_ID                       id of the webhook registered for /api/payments/paypal/webhook
 *   PAYPAL_ENV                              'sandbox' (default). 'live' is refused until it is enabled on purpose.
 */
const SANDBOX_API = 'https://api-m.sandbox.paypal.com'
const LIVE_API_HOST = 'api-m.paypal.com'

export class PayPalError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly issue?: string,
    readonly details?: unknown,
  ) {
    super(message)
  }
}

type Config = { base: string; clientId: string; secret: string; webhookId: string | undefined }

export function paypalConfig(): Config | null {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) return null
  if ((process.env.PAYPAL_ENV ?? 'sandbox') !== 'sandbox') {
    throw new Error('PayPal Live is not enabled: only the sandbox may be used until live payments are approved')
  }
  // A local stand-in for the sandbox may be set for automated tests; the live API never
  const base = process.env.PAYPAL_API_BASE || SANDBOX_API
  if (new URL(base).host === LIVE_API_HOST) throw new Error('PayPal Live API is not allowed')
  return { base, clientId, secret, webhookId: process.env.PAYPAL_WEBHOOK_ID }
}

export function paypalReady() {
  try {
    return paypalConfig() !== null
  } catch {
    return false
  }
}

const tokenCache = globalThis as typeof globalThis & { __paypalToken?: { value: string; expiresAt: number } }

async function accessToken(config: Config) {
  const cached = tokenCache.__paypalToken
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value
  const response = await fetch(`${config.base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!response.ok) throw new PayPalError('PayPal authentication failed', response.status)
  const data = (await response.json()) as { access_token: string; expires_in: number }
  tokenCache.__paypalToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return data.access_token
}

async function call<T>(path: string, init: { method: 'GET' | 'POST'; body?: unknown; requestId?: string }): Promise<T> {
  const config = paypalConfig()
  if (!config) throw new Error('PayPal is not configured')
  const response = await fetch(`${config.base}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${await accessToken(config)}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      // Idempotency: a retried request with the same id is not executed twice by PayPal
      ...(init.requestId ? { 'PayPal-Request-Id': init.requestId } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) {
    throw new PayPalError(data.message ?? `PayPal request failed (${response.status})`, response.status, data.details?.[0]?.issue, data)
  }
  return data as T
}

export type Money = { currency_code: string; value: string }
export type PayPalCapture = {
  id: string
  status: 'COMPLETED' | 'PENDING' | 'DECLINED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  amount: Money
  custom_id?: string
  invoice_id?: string
  status_details?: { reason?: string }
  supplementary_data?: { related_ids?: { order_id?: string } }
}
export type PayPalOrder = {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  links?: { href: string; rel: string; method?: string }[]
  purchase_units?: {
    reference_id?: string
    custom_id?: string
    amount?: Money
    payments?: { captures?: PayPalCapture[] }
  }[]
}

export const toPayPalValue = (cents: number) => (cents / 100).toFixed(2)
export const fromPayPalValue = (value: string) => Math.round(Number(value) * 100)

export function createOrder(input: {
  paymentId: string
  bookingId: string
  amountCents: number
  currency: string
  description: string
  returnUrl: string
  cancelUrl: string
  locale: 'en' | 'ru'
}) {
  return call<PayPalOrder>('/v2/checkout/orders', {
    method: 'POST',
    requestId: `create-${input.paymentId}`,
    body: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.bookingId,
          custom_id: input.paymentId,
          invoice_id: input.paymentId,
          description: input.description.slice(0, 127),
          amount: { currency_code: input.currency, value: toPayPalValue(input.amountCents) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'seasmates',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            locale: input.locale === 'ru' ? 'ru-RU' : 'en-US',
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    },
  })
}

export function approvalUrl(order: PayPalOrder) {
  return order.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href ?? null
}

export const getOrder = (orderId: string) => call<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: 'GET' })

export const captureOrder = (orderId: string, paymentId: string) =>
  call<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    requestId: `capture-${paymentId}`,
    body: {},
  })

export function refundCapture(captureId: string, requestId: string, amount?: Money) {
  return call<{ id: string; status: string; amount?: Money }>(`/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
    method: 'POST',
    requestId,
    body: amount ? { amount } : {},
  })
}

/** Asks PayPal whether a webhook delivery is authentic (signature, certificate, our webhook id). */
export async function verifyWebhook(headers: Headers, rawBody: string) {
  const config = paypalConfig()
  if (!config?.webhookId) return false
  const header = (name: string) => headers.get(name)
  if (!header('paypal-transmission-sig')) return false
  try {
    const result = await call<{ verification_status: string }>('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: {
        auth_algo: header('paypal-auth-algo'),
        cert_url: header('paypal-cert-url'),
        transmission_id: header('paypal-transmission-id'),
        transmission_sig: header('paypal-transmission-sig'),
        transmission_time: header('paypal-transmission-time'),
        webhook_id: config.webhookId,
        webhook_event: JSON.parse(rawBody),
      },
    })
    return result.verification_status === 'SUCCESS'
  } catch {
    return false
  }
}
