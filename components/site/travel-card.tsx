import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { type Journey } from '@/lib/journeys'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function TravelCard({
  journey,
  locale,
  dict,
  reveal = true,
}: {
  journey: Journey
  locale: Locale
  dict: Dictionary
  /** Scroll-in animation; off inside the carousel, where it would track the horizontal scroller. */
  reveal?: boolean
}) {
  const isAvailable = journey.status === 'enquiries-open' || journey.status === 'limited'
  const href = journey.href ?? localePath(locale, '/#enquire')

  return (
    <article className={cn('theme-dark group flex flex-col overflow-hidden rounded-2xl bg-card', reveal && 'reveal')}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={journey.image || '/placeholder.svg'}
          alt={`${dict.common.sailingYachtIn} ${journey.destination}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2">
          {/* Open journeys need no status badge; the others show theirs ("Coming soon"…) */}
          {journey.status !== 'enquiries-open' && (
            <span
              className={cn(
                'flex items-center gap-2 bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] backdrop-blur',
                isAvailable ? 'text-foreground' : 'text-foreground/70',
              )}
            >
              <span
                aria-hidden="true"
                className={cn('size-1.5 rounded-full', isAvailable ? 'bg-primary' : 'bg-foreground/40')}
              />
              {dict.status[journey.status]}
            </span>
          )}
          {journey.featured && (
            <span className="ml-auto whitespace-nowrap bg-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
              {dict.common.featured}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-4xl">{journey.destination}</h3>
        {/* Only confirmed details; the status badge on the photo covers journeys still in preparation */}
        {(journey.dates || journey.nights) && (
          <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
            {journey.dates && <p>{journey.dates}</p>}
            {journey.nights && <p>{formatNights(locale, journey.nights)}</p>}
          </div>
        )}
        {journey.tagline && <p className="mt-8 font-display text-xl leading-snug">{journey.tagline}</p>}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-10">
          <p className="whitespace-nowrap font-display text-xl lg:text-2xl">
            {journey.pricePerPerson && (
              <>
                {journey.pricePerPerson} <span className="text-sm text-muted-foreground lg:text-base">{dict.common.perPerson}</span>
              </>
            )}
          </p>
          <Link
            href={href}
            className="flex shrink-0 items-center gap-2 rounded-[8px] border border-foreground/60 px-3 py-2.5 lg:px-4 text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {journey.href ? dict.common.more : dict.common.registerInterest}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{` — ${journey.destination}`}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
