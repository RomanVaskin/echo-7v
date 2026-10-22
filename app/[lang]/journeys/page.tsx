import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { ScheduleGrid } from '@/components/home/schedule'
import { getDictionary } from '@/lib/dictionaries'
import { alternates, isLocale } from '@/lib/i18n'
import { getJourneys } from '@/lib/journeys'

const PATH = '/journeys'

export async function generateMetadata({ params }: PageProps<'/[lang]/journeys'>): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const dict = getDictionary(lang)

  return {
    title: dict.meta.journeysTitle,
    description: dict.meta.journeysDescription,
    alternates: alternates(lang, PATH),
  }
}

export default async function JourneysPage({ params }: PageProps<'/[lang]/journeys'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const journeys = getJourneys(locale, dict)

  return (
    <>
      <SiteHeader locale={locale} path={PATH} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-36 lg:px-10 lg:pb-36 lg:pt-44">
        <div className="hero-fade flex flex-col gap-6 border-t border-border pt-8">
          <p className="eyebrow">{dict.allJourneys.eyebrow}</p>
          <h1 className="font-display text-balance text-5xl md:text-7xl">{dict.allJourneys.title}</h1>
        </div>
        <div className="mt-12">
          <ScheduleGrid locale={locale} dict={dict} journeys={journeys} />
        </div>
      </main>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
