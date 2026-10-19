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
import { journeys } from '@/lib/journeys'
import { caribbeanItinerary, faqs, included, notIncluded } from '@/lib/caribbean'

export const metadata: Metadata = {
  title: 'The Caribbean — 9 Nights',
  description:
    'Our signature 9-night Caribbean sailing journey: quiet anchorages, turquoise lagoons and island life with a small crew.',
}

export default function CaribbeanJourneyPage() {
  const journey = journeys.find((j) => j.slug === 'caribbean')
  if (!journey) notFound()

  const routePoints = caribbeanItinerary.map((day) => ({
    id: `day-${day.day}`,
    label: day.place,
    sublabel: `Day ${day.day} · ${day.title}`,
    marker: String(day.day),
    coordinates: day.coordinates,
  }))

  return (
    <>
      <SiteHeader />
      <main>
        <JourneyHero journey={journey} />
        <JourneyOverview />

        <section aria-labelledby="route-title" className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            id="route-title"
            index="02"
            eyebrow="Sailing route"
            title="Chart the voyage"
            description="Select a stop to follow the route. Indicative route, subject to confirmation."
          />
          <div className="reveal mt-14">
            <SailingMapLoader points={routePoints} showRoute listTitle="Route stops" focusZoom={12} />
          </div>
        </section>

        <Itinerary days={caribbeanItinerary} />
        <YachtDetails />
        <Inclusions included={included} notIncluded={notIncluded} />
        <Gallery />
        <Pricing journey={journey} />

        <div className="border-t border-border">
          <HowItWorks />
        </div>

        <Faq items={faqs} />

        <EnquirySection
          index="09"
          defaultJourney="caribbean"
          title={
            <>
              Begin your <em className="text-primary">Caribbean voyage.</em>
            </>
          }
          description="Share a few details and our team will be in touch personally to discuss dates, cabins and travel arrangements."
        />
      </main>
      <SiteFooter />
    </>
  )
}
