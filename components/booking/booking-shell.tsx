import Link from 'next/link'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'
import { caribbeanVoyage } from '@/lib/booking/voyage'

/** Common frame of the booking pages: header, journey title with its key facts, footer. Header and
 * content sit on the light paper theme; the footer stays as on the rest of the site. */
export function BookingShell({
  locale,
  dict,
  path,
  children,
}: {
  locale: Locale
  dict: Dictionary
  path: string
  children: React.ReactNode
}) {
  const b = dict.booking
  return (
    <>
      <div className="theme-paper relative">
      <SiteHeader locale={locale} path={path} dict={dict.header} enquireLabel={dict.common.enquire} />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10 lg:pb-32 lg:pt-40">
        <div className="flex flex-col gap-5 border-t border-border pt-8">
          <p className="eyebrow flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>{b.eyebrow}</span>
            <Link href={localePath(locale, '/journeys/caribbean')} className="underline-offset-4 hover:text-foreground hover:underline">
              {b.journeyLink}
            </Link>
          </p>
          <h1 className="font-display text-balance text-4xl md:text-6xl">{caribbeanVoyage.title}</h1>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>{b.facts.dates}</span>
            <span>{b.facts.nights}</span>
            <span>{b.facts.cabins}</span>
          </p>
        </div>
        <div className="mt-12 lg:mt-16">{children}</div>
      </main>
      </div>
      <SiteFooter locale={locale} dict={dict.footer} />
    </>
  )
}
