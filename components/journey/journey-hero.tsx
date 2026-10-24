import Image from 'next/image'
import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'

export function JourneyHero({ journey, locale, dict }: { journey: Journey; locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <Image
        src={journey.image || '/placeholder.svg'}
        alt={dict.featuredJourney.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/10 to-background" />

      {/* Breadcrumb sits right under the header's wordmark */}
      <nav
        aria-label={dict.caribbean.breadcrumbLabel}
        className="hero-fade relative mx-auto w-full max-w-7xl px-6 pt-24 lg:px-10 lg:pt-28"
      >
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

      <div className="relative mx-auto mt-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-12 pt-24 lg:px-10 lg:pb-16">
        {/* Same title as the journey's card */}
        <h1 className="hero-fade font-display text-balance text-6xl md:text-8xl lg:text-9xl">
          {journey.cardTitle ?? journey.destination}
        </h1>
        <div className="grid grid-cols-2 gap-6 border-t border-foreground/20 pt-6 md:grid-cols-4">
          {[
            { label: dict.common.duration, value: formatNights(locale, journey.nights ?? 0) },
            { label: dict.common.dates, value: journey.dates },
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
