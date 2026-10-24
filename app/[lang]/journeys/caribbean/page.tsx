import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SectionHeading } from '@/components/site/section-heading'
import { SailingMapLoader } from '@/components/site/sailing-map-loader'
import { HowItWorks } from '@/components/site/how-it-works'
import { EnquirySection } from '@/components/site/enquiry-section'
import { JourneyHero } from '@/components/journey/journey-hero'
import { JourneyOverview } from '@/components/journey/journey-overview'
import { Itinerary } from '@/components/journey/itinerary'
import { YachtDetails } from '@/components/journey/yacht-details'
import { Inclusions } from '@/components/journey/inclusions'
import { Gallery } from '@/components/journey/gallery'
import { Pricing } from '@/components/journey/pricing'
import { Faq } from '@/components/journey/faq'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { getJourneys } from '@/lib/journeys'
import { caribbeanCoordinates, type ItineraryDay } from '@/lib/caribbean'

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
  const itinerary: ItineraryDay[] = caribbean.itinerary.days.map((day, i) => ({
    day: i + 1,
    ...day,
    coordinates: caribbeanCoordinates[i],
  }))

  const routePoints = itinerary.map((day) => ({
    id: `day-${day.day}`,
    label: day.place,
    sublabel: `${caribbean.route.day} ${day.day} · ${day.title}`,
    marker: String(day.day),
    coordinates: day.coordinates,
  }))

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <JourneyHero journey={journey} locale={locale} dict={dict} />
        <JourneyOverview dict={caribbean.overview} />

        <section aria-labelledby="route-title" className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            id="route-title"
            index="02"
            eyebrow={caribbean.route.eyebrow}
            title={caribbean.route.title}
            description={caribbean.route.description}
          />
          <div className="reveal mt-14">
            <SailingMapLoader
              points={routePoints}
              showRoute
              listTitle={caribbean.route.listTitle}
              exploreLabel={dict.common.exploreJourney}
              loadingLabel={dict.common.loadingChart}
              focusZoom={12}
            />
          </div>
        </section>

        <Itinerary days={itinerary} dict={caribbean.itinerary} />
        <YachtDetails dict={caribbean.yacht} tba={dict.common.tba} />
        <Inclusions dict={caribbean.inclusions} />
        <Gallery dict={caribbean.gallery} />
        <Pricing journey={journey} locale={locale} dict={caribbean.pricing} common={dict.common} status={dict.status} />

        <div className="border-t border-border">
          <HowItWorks dict={dict.howItWorks} />
        </div>

        <Faq dict={caribbean.faq} />

        <EnquirySection
          index="09"
          locale={locale}
          eyebrow={dict.enquirySection.eyebrow}
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
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
