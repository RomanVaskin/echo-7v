import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SectionHeading } from '@/components/site/section-heading'
import { HowItWorks } from '@/components/site/how-it-works'
import { EnquirySection } from '@/components/site/enquiry-section'
import { SailingMapLoader } from '@/components/site/sailing-map-loader'
import { Hero } from '@/components/home/hero'
import { Intro } from '@/components/home/intro'
import { FeaturedJourney } from '@/components/home/featured-journey'
import { ScheduleGrid } from '@/components/home/schedule'
import { journeys, statusLabel } from '@/lib/journeys'

export default function HomePage() {
  const destinationPoints = journeys.map((j, i) => ({
    id: j.slug,
    label: j.destination,
    sublabel: `${j.region} · ${j.nights ? `${j.nights} nights · ` : ''}${statusLabel[j.status]}`,
    marker: String(i + 1).padStart(2, '0'),
    coordinates: j.coordinates,
    href: j.href,
  }))

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Intro />
        <FeaturedJourney />

        <section id="schedule" aria-labelledby="schedule-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
          <SectionHeading
            id="schedule-title"
            index="01"
            eyebrow="Sailing schedule"
            title="Upcoming journeys"
            description="A deliberately short list. Details are published as they are confirmed — anything not yet final is marked TBA."
          />
          <div className="mt-14">
            <ScheduleGrid />
          </div>
        </section>

        <section id="destinations" aria-labelledby="destinations-title" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
          <SectionHeading
            id="destinations-title"
            index="02"
            eyebrow="Destinations"
            title="Where we sail"
            description="Select a destination to chart it. The Caribbean is our signature voyage; further waters are in preparation."
          />
          <div className="reveal mt-14">
            <SailingMapLoader points={destinationPoints} listTitle="Destinations" focusZoom={6} />
          </div>
        </section>

        <HowItWorks />

        <EnquirySection
          index="03"
          title={
            <>
              Plan your <em className="text-primary">escape.</em>
            </>
          }
          description="Tell us a little about yourself and the journey that calls to you. We reply personally to discuss availability and details."
        />
      </main>
      <SiteFooter />
    </>
  )
}
