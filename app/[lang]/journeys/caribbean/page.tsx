import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { EnquirySection } from '@/components/site/enquiry-section'
import { JourneyHero } from '@/components/journey/journey-hero'
import { JourneyOverview } from '@/components/journey/journey-overview'
import { JourneyHighlights } from '@/components/journey/journey-highlights'
import { RouteMap } from '@/components/journey/route-map'
import { DayByDay } from '@/components/journey/day-by-day'
import { Inclusions } from '@/components/journey/inclusions'
import { YachtDetails } from '@/components/journey/yacht-details'
import { JourneyActions } from '@/components/journey/journey-actions'
import { Faq } from '@/components/journey/faq'
import { MobileBookBar } from '@/components/journey/mobile-book-bar'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { getJourneys } from '@/lib/journeys'

const PATH = '/journeys/caribbean'

export async function generateMetadata({ params }: PageProps<'/[lang]/journeys/caribbean'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.caribbeanTitle,
    description: dict.meta.caribbeanDescription,
    alternates: alternates(lang, PATH),
  }
}

export default async function CaribbeanJourneyPage({ params }: PageProps<'/[lang]/journeys/caribbean'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const journeys = getJourneys(locale, dict)
  const journey = journeys.find((j) => j.slug === 'caribbean')
  if (!journey) notFound()

  const caribbean = dict.caribbean

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <JourneyHero journey={journey} locale={locale} dict={dict} />
        <JourneyOverview dict={caribbean.overview} />
        <JourneyHighlights dict={caribbean.highlights} />
        <RouteMap dict={caribbean.map} />
        <DayByDay dict={caribbean.days} />
        <Inclusions dict={caribbean.inclusions} />
        <YachtDetails dict={caribbean.yacht} />
        <JourneyActions dict={caribbean.actions} bookingHref={journey.bookingHref ?? null} />
        <Faq dict={caribbean.faq} />

        <EnquirySection
          index="08"
          locale={locale}
          eyebrow={caribbean.contact.eyebrow}
          form={dict.form}
          journey="caribbean"
          title={
            <>
              {dict.enquirySection.caribbean.titleLead}{' '}
              <em className="text-primary">{dict.enquirySection.caribbean.titleAccent}</em>
            </>
          }
          description={dict.enquirySection.caribbean.description}
        />
      </main>
      {journey.bookingHref && journey.pricePerPerson && (
        <MobileBookBar
          href={journey.bookingHref}
          price={journey.pricePerPerson}
          perPerson={dict.common.perPerson}
          from={dict.common.priceFrom}
          label={dict.common.book}
        />
      )}
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
