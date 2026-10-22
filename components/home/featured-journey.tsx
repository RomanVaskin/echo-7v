import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'

export function FeaturedJourney({ locale, dict, journey }: { locale: Locale; dict: Dictionary; journey: Journey }) {
  const facts = [
    { label: dict.common.duration, value: journey.nights ? formatNights(locale, journey.nights) : null },
    { label: dict.common.dates, value: journey.dates },
    { label: dict.common.yacht, value: journey.vessel },
    { label: dict.common.from, value: journey.pricePerPerson },
  ]

  return (
    <section aria-labelledby="featured-title" className="relative bg-sand text-ink">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="reveal grid overflow-hidden border border-ink/15 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative min-h-[420px] lg:min-h-[640px]">
            <Image
              src={journey.image || '/placeholder.svg'}
              alt={dict.featuredJourney.imageAlt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-between gap-12 bg-sand-deep p-8 md:p-12">
            <div className="flex flex-col gap-6">
              <p className="eyebrow flex items-center gap-3 text-ink/75">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {dict.featuredJourney.eyebrow} · {dict.status[journey.status]}
              </p>
              <h2 id="featured-title" className="font-display text-6xl md:text-7xl">
                {journey.destination}
              </h2>
              <p className="max-w-sm leading-relaxed text-ink/80">{journey.summary}</p>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-ink/15">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 bg-sand-deep py-4 pr-4">
                  <dt className="eyebrow text-ink/75">{fact.label}</dt>
                  <dd className={fact.value ? 'font-display text-2xl' : 'text-sm tracking-[0.2em] text-ink/70'}>
                    {fact.value ?? dict.common.tba}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={journey.href ?? localePath(locale, '/#enquire')}
              className="flex items-center justify-between bg-primary px-6 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {dict.common.exploreJourney}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
