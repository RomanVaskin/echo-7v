import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary['footer'] }) {
  const linkClass = 'text-sm text-foreground/80 hover:text-foreground'

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr] lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="font-display text-4xl">seasmates</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{dict.tagline}</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{dict.journeys}</p>
          <Link href={localePath(locale, '/journeys/caribbean')} className={linkClass}>
            {dict.caribbeanLink}
          </Link>
          <Link href={localePath(locale, '/#schedule')} className={linkClass}>
            {dict.schedule}
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{dict.club}</p>
          <Link href={localePath(locale, '/#how-it-works')} className={linkClass}>
            {dict.howItWorks}
          </Link>
          <Link href={localePath(locale, '/#enquire')} className={linkClass}>
            {dict.enquire}
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 border-t border-border px-6 py-6 text-xs text-muted-foreground sm:flex-row lg:px-10">
        <p>{`© ${new Date().getFullYear()} seasmates. ${dict.rights}`}</p>
        <p>{dict.tbaNote}</p>
      </div>
    </footer>
  )
}
