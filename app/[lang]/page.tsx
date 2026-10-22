import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { HowItWorks } from '@/components/site/how-it-works'
import { EnquirySection } from '@/components/site/enquiry-section'
import { AllJourneysLink } from '@/components/site/all-journeys-link'
import { Hero } from '@/components/home/hero'
import { Intro } from '@/components/home/intro'
import { ScheduleGrid } from '@/components/home/schedule'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, formatNights, isLocale, localePath } from '@/lib/i18n'
import { getJourneys } from '@/lib/journeys'

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

  const journeyOptions = journeys.map((j) => ({
    slug: j.slug,
    label: `${j.destination}${j.nights ? ` — ${formatNights(locale, j.nights)}` : ''}`,
  }))

  return (
    <>
      <SiteHeader locale={locale} path="/" dict={dict.header} enquireLabel={dict.common.enquire} />
      <main>
        <Hero locale={locale} dict={dict.hero} />
        <section id="schedule" aria-labelledby="schedule-title" className="theme-light">
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-10 lg:pb-20 lg:pt-20">
            <ScheduleGrid
              locale={locale}
              dict={dict}
              journeys={journeys}
              layout="carousel"
              heading={
                <h2 id="schedule-title" className="eyebrow">
                  <span className="text-foreground">01 / </span>
                  {dict.schedule.title}
                </h2>
              }
            />
          </div>
        </section>

        <Intro dict={dict.intro} index="02" />

        <HowItWorks dict={dict.howItWorks} variant="split" index="03" />
        <AllJourneysLink href={localePath(locale, '/journeys')} label={dict.allJourneys.cta} />

        <EnquirySection
          index="04"
          tone="light"
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
