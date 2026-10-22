import Image from 'next/image'
import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'

export function JourneyHero({ journey, locale, dict }: { journey: Journey; locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <Image
        src={journey.image || '/placeholder.svg'}
        alt={dict.featuredJourney.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/10 to-background" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-12 pt-40 lg:px-10 lg:pb-16">
        <nav aria-label={dict.caribbean.breadcrumbLabel} className="hero-fade">
          <ol className="eyebrow flex items-center gap-3">
            <li>
              <Link href={localePath(locale, '/')} className="hover:text-foreground">
                {dict.caribbean.breadcrumb}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground/80">
              {journey.destination}
            </li>
          </ol>
        </nav>
        <div className="hero-fade flex flex-col gap-6">
          <p className="eyebrow text-primary">{formatNights(locale, journey.nights ?? 0)} {dict.common.atSea}</p>
          <h1 className="font-display text-7xl md:text-9xl lg:text-[11rem]">{journey.destination}</h1>
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-foreground/20 pt-6 md:grid-cols-4">
          {[
            { label: dict.common.duration, value: formatNights(locale, journey.nights ?? 0) },
            { label: dict.common.dates, value: journey.dates },
            { label: dict.common.yacht, value: journey.vessel },
            { label: dict.caribbean.heroStatus, value: dict.status[journey.status] },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="eyebrow">{item.label}</span>
              <span className={item.value ? 'text-foreground' : 'text-sm tracking-[0.14em] text-muted-foreground'}>
                {item.value ?? dict.common.tba}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
