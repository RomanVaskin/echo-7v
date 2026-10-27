'use server'

import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionaries'
import { defaultLocale, isLocale, localePath } from '@/lib/i18n'
import { handlePaymentNotice } from '@/lib/booking/events'
import { paymentProvider, sign } from '@/lib/booking/payments'
import { createBalancePayment, createBooking, getOrder, getPayment } from '@/lib/booking/service'
import type { Traveller } from '@/lib/booking/store'
import { cabinOptions, isCabinOptionId } from '@/lib/booking/voyage'

type Field =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'country'
  | 'guest2FirstName'
  | 'guest2LastName'
  | 'guest2Email'
  | 'consent'

export type BookingState = {
  status: 'idle' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
  /** Echoed back on error so nothing has to be retyped. */
  values?: Record<string, string>
  /** The chosen accommodation has sold out meanwhile. */
  unavailable?: boolean
}

const isEmail = (v: string) => v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const isPhone = (v: string) => {
  const digits = v.replace(/\D/g, '')
  return /^\+?[\d\s()-]+$/.test(v) && digits.length >= 7 && digits.length <= 15
}

/** Step 2: validates the form, holds the berths, creates the order and sends the guest to the payment page. */
export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const get = (name: string) => String(formData.get(name) ?? '').trim()
  const localeRaw = get('locale')
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale
  const t = getDictionary(locale).booking.form.errors
  const optionId = get('option')
  if (!isCabinOptionId(optionId)) return { status: 'error', message: t.review }
  const twoGuests = cabinOptions[optionId].guests === 2

  const values: Record<string, string> = {}
  for (const name of ['firstName', 'lastName', 'email', 'phone', 'country', 'requests', 'guest2FirstName', 'guest2LastName', 'guest2Email']) {
    values[name] = get(name)
  }
  const errors: BookingState['errors'] = {}
  const name = (field: Field) => {
    if (values[field].length < 1 || values[field].length > 60) errors[field] = t.required
  }
  name('firstName')
  name('lastName')
  if (!isEmail(values.email)) errors.email = t.email
  if (!isPhone(values.phone)) errors.phone = t.phone
  if (values.country.length < 2 || values.country.length > 60) errors.country = t.required
  if (twoGuests) {
    name('guest2FirstName')
    name('guest2LastName')
    if (values.guest2Email && !isEmail(values.guest2Email)) errors.guest2Email = t.email
  }
  if (formData.get('consent') !== 'on') errors.consent = t.consent
  if (Object.keys(errors).length > 0) return { status: 'error', message: t.review, errors, values }

  const guests: Traveller[] = [
    { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone, country: values.country },
  ]
  if (twoGuests) {
    guests.push({ firstName: values.guest2FirstName, lastName: values.guest2LastName, email: values.guest2Email || undefined })
  }

  const provider = paymentProvider()
  const result = createBooking({ option: optionId, locale, guests, requests: values.requests.slice(0, 1000), provider: provider.name })
  if ('error' in result) return { status: 'error', message: t.unavailable, values, unavailable: true }

  const { redirectUrl } = await provider.createCheckout({ order: result.order, payment: result.payment, locale })
  redirect(redirectUrl)
}

const orderPath = (locale: string, id: string, token: string) =>
  `${localePath(isLocale(locale) ? locale : defaultLocale, '/journeys/caribbean/book/order')}?id=${id}&t=${token}`

/**
 * Demo checkout only: stands in for the provider. It sends itself the same signed notice a real
 * provider would post to /api/payments/webhook, and the notice goes through the same verification.
 */
export async function completeDemoPayment(formData: FormData) {
  const paymentId = String(formData.get('payment') ?? '')
  const outcome = formData.get('outcome') === 'succeeded' ? 'payment.succeeded' : 'payment.failed'
  const found = getPayment(paymentId)
  if (!found) redirect('/')
  const raw = JSON.stringify({ type: outcome, paymentId, providerRef: `demo_${Date.now().toString(36)}` })
  await handlePaymentNotice(raw, sign(raw))
  redirect(orderPath(found.order.locale, found.order.id, found.order.token))
}

/** Opens the payment of the remaining 70% (or resumes the deposit payment of a held booking). */
export async function payRemaining(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const token = String(formData.get('t') ?? '')
  const found = getOrder(id, token)
  if (!found) redirect('/')
  const provider = paymentProvider()
  let payment = found.payments.find((p) => p.kind === 'deposit' && p.status === 'pending')
  if (found.order.status === 'confirmed') payment = createBalancePayment(id, token, provider.name)?.payment
  if (!payment) redirect(orderPath(found.order.locale, id, token))
  const { redirectUrl } = await provider.createCheckout({ order: found.order, payment, locale: found.order.locale })
  redirect(redirectUrl)
}
