import { localePath, siteUrl } from '@/lib/i18n'
import type { BookingDetails } from '@/lib/booking/bookings'
import { formatUsd } from '@/lib/booking/voyage'

/**
 * Booking emails in the guest's language. Plain text for now; the mail service (and any HTML
 * layout) is chosen separately — see send.ts.
 */
export type EmailTemplate = 'booking_received' | 'deposit_received' | 'balance_reminder' | 'paid_in_full' | 'payment_failed'

const optionNames = { shared: 'Shared Cabin', 'private-solo': 'Private Cabin · Solo', 'private-two': 'Private Cabin · Two Guests' }

/** Absolute link to the guest's booking page (payments are made from there). */
export function bookingUrl(details: BookingDetails) {
  const base = process.env.SITE_URL || siteUrl
  const { booking } = details
  return `${base}${localePath(booking.locale, '/journeys/caribbean/book/order')}?id=${booking.id}&t=${booking.token}`
}

function formatDate(iso: string, locale: 'en' | 'ru') {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

const copy = {
  en: {
    dear: (name: string) => `Dear ${name},`,
    summary: 'Your booking',
    reference: 'Booking reference',
    journey: 'Journey',
    accommodation: 'Accommodation',
    guests: 'Guests',
    total: 'Total price',
    paid: 'Paid so far',
    balance: 'Remaining balance',
    due: 'Balance due by',
    link: 'Your booking page',
    sign: 'With warm regards,\nseasmates',
    noCharge: 'We never charge your card automatically: the balance is paid by you, from your booking page.',
    subjects: {
      booking_received: 'Booking received — complete your deposit',
      deposit_received: 'Deposit received — your booking is confirmed',
      balance_reminder: 'Reminder: remaining balance due',
      paid_in_full: 'Paid in full — see you on board',
      payment_failed: 'Your payment did not go through',
    },
    intro: {
      booking_received: (amount: string) =>
        `Thank you for booking with seasmates. Your berths are held for a short time: to confirm the booking, please pay the deposit of ${amount} from your booking page.`,
      deposit_received: (amount: string) => `We have received your deposit of ${amount}. Your place on board is confirmed.`,
      balance_reminder: (amount: string, date: string) => `This is a friendly reminder that the remaining balance of ${amount} is due by ${date}.`,
      paid_in_full: () => 'Thank you: your booking is now paid in full. We look forward to welcoming you on board.',
      payment_failed: (amount: string) =>
        `Your payment of ${amount} was not completed, so nothing has been charged. You can try again from your booking page or choose another payment method in PayPal.`,
    },
  },
  ru: {
    dear: (name: string) => `Здравствуйте, ${name}!`,
    summary: 'Ваше бронирование',
    reference: 'Номер брони',
    journey: 'Путешествие',
    accommodation: 'Размещение',
    guests: 'Гости',
    total: 'Полная стоимость',
    paid: 'Оплачено',
    balance: 'Остаток',
    due: 'Срок оплаты остатка',
    link: 'Страница вашей брони',
    sign: 'С наилучшими пожеланиями,\nseasmates',
    noCharge: 'Мы никогда не списываем деньги автоматически: остаток вы оплачиваете сами на странице брони.',
    subjects: {
      booking_received: 'Бронирование получено — оплатите предоплату',
      deposit_received: 'Предоплата получена — бронирование подтверждено',
      balance_reminder: 'Напоминание об оплате остатка',
      paid_in_full: 'Бронирование оплачено полностью',
      payment_failed: 'Платёж не прошёл',
    },
    intro: {
      booking_received: (amount: string) =>
        `Спасибо за бронирование в seasmates. Места удерживаются недолго: чтобы подтвердить бронь, оплатите предоплату ${amount} на странице брони.`,
      deposit_received: (amount: string) => `Мы получили вашу предоплату ${amount}. Ваше место на борту подтверждено.`,
      balance_reminder: (amount: string, date: string) => `Напоминаем, что остаток ${amount} нужно оплатить до ${date}.`,
      paid_in_full: () => 'Спасибо! Бронирование оплачено полностью. Ждём вас на борту.',
      payment_failed: (amount: string) =>
        `Платёж на сумму ${amount} не завершён, деньги не списаны. Вы можете повторить оплату на странице брони или выбрать другой способ оплаты в PayPal.`,
    },
  },
}

export function renderEmail(template: EmailTemplate, details: BookingDetails, amountCents?: number) {
  const { booking, guests, trip } = details
  const t = copy[booking.locale] ?? copy.en
  const balance = Math.max(booking.totalCents - booking.paidCents, 0)
  const due = formatDate(booking.balanceDueDate, booking.locale)
  const amount = formatUsd(amountCents ?? (template === 'booking_received' ? booking.depositCents : balance))
  const intro = {
    booking_received: t.intro.booking_received(amount),
    deposit_received: t.intro.deposit_received(amount),
    balance_reminder: t.intro.balance_reminder(amount, due),
    paid_in_full: t.intro.paid_in_full(),
    payment_failed: t.intro.payment_failed(amount),
  }[template]

  const lines = [
    t.dear(guests[0]?.firstName ?? ''),
    '',
    intro,
    '',
    `${t.summary}`,
    `${t.reference}: ${booking.id}`,
    `${t.journey}: ${trip.title}, ${formatDate(trip.startDate, booking.locale)} – ${formatDate(trip.endDate, booking.locale)}`,
    `${t.accommodation}: ${optionNames[booking.option]}`,
    `${t.guests}: ${guests.map((g) => `${g.firstName} ${g.lastName}`).join(', ')}`,
    `${t.total}: ${formatUsd(booking.totalCents)}`,
    `${t.paid}: ${formatUsd(booking.paidCents)}`,
  ]
  if (balance > 0 && booking.status !== 'pending_payment') lines.push(`${t.balance}: ${formatUsd(balance)}`, `${t.due}: ${due}`)
  lines.push('', `${t.link}: ${bookingUrl(details)}`)
  if (template === 'deposit_received' || template === 'balance_reminder') lines.push('', t.noCharge)
  lines.push('', t.sign)

  return { subject: `${t.subjects[template]} · ${trip.title} (${booking.id})`, text: lines.join('\n') }
}
