import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingFlow, type OptionView } from '@/components/booking/booking-flow'
import { BookingShell } from '@/components/booking/booking-shell'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { formatDate } from '@/lib/booking/links'
import { getAvailability, loadTrip, paymentScheme } from '@/lib/booking/bookings'
import { cabinOptionIds, cabinOptions, displayPricing, quote } from '@/lib/booking/voyage'
import { hasDatabase } from '@/lib/db'
import { paypalReady } from '@/lib/payments/paypal'

const PATH = '/journeys/caribbean/book'

// Availability changes with every booking
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps<'/[lang]/journeys/caribbean/book'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  return {
    title: getDictionary(lang).booking.metaTitle,
    alternates: alternates(lang, PATH),
    robots: { index: false, follow: false },
  }
}

export default async function BookingPage({ params }: PageProps<'/[lang]/journeys/caribbean/book'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const f = dict.booking.form

  // Prices, dates and availability from the database; without it the page still shows the offer
  const trip = hasDatabase() ? await loadTrip() : null
  const availability = trip ? await getAvailability(trip.id) : null
  const pricing = trip ?? displayPricing
  const scheme = trip ? paymentScheme(trip) : 'deposit'
  const notice = !trip || !paypalReady() ? f.notAvailable : scheme === 'late-contact' ? f.late : undefined

  const options: OptionView[] = cabinOptionIds.map((id) => ({
    id,
    ...dict.booking.options[id],
    guestCount: cabinOptions[id].guests,
    ...quote(id, pricing),
    available: availability ? availability.options[id] : true,
  }))

  return (
    <BookingShell locale={locale} dict={dict} path={PATH}>
      <BookingFlow
        locale={locale}
        dict={dict.booking}
        options={options}
        freeCabins={availability?.freeCabins ?? null}
        dueDate={formatDate(pricing.balanceDueDate, locale)}
        notice={notice}
      />
    </BookingShell>
  )
}
