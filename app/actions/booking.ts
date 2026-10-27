'use server'

import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/dictionaries'
import { defaultLocale, isLocale, localePath } from '@/lib/i18n'
import { createBooking, getBookingDetails, type Guest } from '@/lib/booking/bookings'
import { startPayment, type PaymentKind } from '@/lib/booking/payment-flow'
import { cabinOptions, isCabinOptionId } from '@/lib/booking/voyage'
import { hasDatabase } from '@/lib/db'
import { sendBookingEmail } from '@/lib/email/send'
import { paypalReady } from '@/lib/payments/paypal'
import { requestOrigin } from '@/lib/request-origin'

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
  const f = getDictionary(locale).booking.form
  const t = f.errors
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

  const guests: Guest[] = [
    { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone, country: values.country },
  ]
  if (twoGuests) {
    guests.push({ firstName: values.guest2FirstName, lastName: values.guest2LastName, email: values.guest2Email || undefined })
  }

  if (!hasDatabase() || !paypalReady()) return { status: 'error', message: f.notAvailable, values }
  const result = await createBooking({ option: optionId, locale, guests, requests: values.requests.slice(0, 1000) })
  if ('error' in result) {
    if (result.error === 'unavailable') return { status: 'error', message: t.unavailable, values, unavailable: true }
    return { status: 'error', message: result.error === 'late' ? f.late : f.notAvailable, values }
  }
  const { booking } = result
  await sendBookingEmail('booking_received', booking.id, `booking_received:${booking.id}`)

  let approveUrl: string | null = null
  try {
    approveUrl = await startPayment(booking.id, 'deposit', await requestOrigin())
  } catch (error) {
    console.error('[booking] could not start the deposit payment', booking.id, error)
  }
  // On failure the booking page offers the payment again
  redirect(approveUrl ?? `${bookingPath(locale, booking.id, booking.token)}&result=error`)
}

const bookingPath = (locale: string, id: string, token: string) =>
  `${localePath(isLocale(locale) ? locale : defaultLocale, '/journeys/caribbean/book/order')}?id=${id}&t=${token}`

/** From the booking page: pays the deposit (while berths are held) or the remaining balance through PayPal. */
export async function payBooking(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const token = String(formData.get('t') ?? '')
  const kind: PaymentKind = formData.get('kind') === 'balance' ? 'balance' : 'deposit'
  const details = await getBookingDetails(id, token)
  if (!details) redirect('/')
  let approveUrl: string | null = null
  try {
    approveUrl = await startPayment(id, kind, await requestOrigin())
  } catch (error) {
    console.error('[booking] could not start payment', id, error)
  }
  redirect(approveUrl ?? `${bookingPath(details.booking.locale, id, token)}&result=error`)
}
