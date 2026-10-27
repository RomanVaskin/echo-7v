import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingFlow, type OptionView } from '@/components/booking/booking-flow'
import { BookingShell } from '@/components/booking/booking-shell'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { getAvailability } from '@/lib/booking/service'
import { cabinOptionIds, cabinOptions, quote } from '@/lib/booking/voyage'

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
  const availability = getAvailability()

  const options: OptionView[] = cabinOptionIds.map((id) => ({
    id,
    ...dict.booking.options[id],
    guestCount: cabinOptions[id].guests,
    ...quote(id),
    available: availability.options[id],
  }))

  return (
    <BookingShell locale={locale} dict={dict} path={PATH}>
      <BookingFlow locale={locale} dict={dict.booking} options={options} freeCabins={availability.freeCabins} />
    </BookingShell>
  )
}
