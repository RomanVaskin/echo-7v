import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SectionHeading } from '@/components/site/section-heading'
import { HowItWorks } from '@/components/site/how-it-works'
import { EnquirySection } from '@/components/site/enquiry-section'
import { AllJourneysLink } from '@/components/site/all-journeys-link'
import { Hero } from '@/components/home/hero'
import { Intro } from '@/components/home/intro'
import { ScheduleGrid } from '@/components/home/schedule'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, formatNights, isLocale, localePath } from '@/lib/i18n'
import { getFeaturedJourney, getJourneys } from '@/lib/journeys'

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: { absolute: dict.meta.siteTitle },
    description: dict.meta.siteDescription,
    alternates: alternates(lang, '/'),
  }
}

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const journeys = getJourneys(locale, dict)
  const featured = getFeaturedJourney(journeys)

  const journeyOptions = journeys.map((j) => ({
    slug: j.slug,
    label: `${j.destination}${j.nights ? ` — ${formatNights(locale, j.nights)}` : ''}`,
  }))

  return (
    <>
      <SiteHeader locale={locale} path="/" dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <Hero locale={locale} dict={dict.hero} featuredJourney={featured} />
        <Intro dict={dict.intro} />

        <section id="schedule" aria-labelledby="schedule-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
          <SectionHeading
            id="schedule-title"
            index="01"
            eyebrow={dict.schedule.eyebrow}
            title={dict.schedule.title}
          />
          <div className="mt-12">
            <ScheduleGrid locale={locale} dict={dict} journeys={journeys} />
          </div>
        </section>

        <HowItWorks dict={dict.howItWorks} showSteps={false} />
        <AllJourneysLink href={localePath(locale, '/journeys')} label={dict.allJourneys.cta} />

        <EnquirySection
          index="02"
          locale={locale}
          eyebrow={dict.enquirySection.eyebrow}
          form={dict.form}
          journeyOptions={journeyOptions}
          title={
            <>
              {dict.enquirySection.home.titleLead} <em className="text-primary">{dict.enquirySection.home.titleAccent}</em>
            </>
          }
          description={dict.enquirySection.home.description}
        />
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
