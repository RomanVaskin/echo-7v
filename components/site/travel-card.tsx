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

      <div className="flex flex-1 flex-col p-6 max-[359px]:px-4 md:p-7">
        <h3 className="font-display text-4xl tracking-[-0.03em]">{journey.cardTitle ?? journey.destination}</h3>
        {/* Only confirmed details; the status badge on the photo covers journeys still in preparation */}
        {(journey.dates || journey.nights) && (
          <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
            {/* The long English range ends on its own line ("Dec 28, 2026 –" / "Jan 7, 2027"); the short Russian one fits on one */}
            {journey.dates && (
              <p>
                {journey.dates.split(' – ').map((part, i, parts) => (
                  <span key={part} className={locale === 'en' ? 'block' : undefined}>
                    {i < parts.length - 1 ? `${part} – ` : part}
                  </span>
                ))}
              </p>
            )}
            {journey.nights && <p>{formatNights(locale, journey.nights)}</p>}
          </div>
        )}
        {journey.cardLead && <p className="mt-6 font-display text-xl leading-snug tracking-[-0.01em]">{journey.cardLead}</p>}
        {journey.tagline && (
          <p className={cn('text-[0.9375rem] leading-relaxed text-foreground/85', journey.cardLead ? 'mt-3' : 'mt-6')}>{journey.tagline}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2.5 pt-10 max-[359px]:gap-1.5 sm:gap-3">
          {/* Price in the palette's warm sand (PANTONE 4087 C), bold; the "/ person" note stays light */}
          <p className="shrink-0 whitespace-nowrap font-display text-xl lg:text-2xl">
            {journey.pricePerPerson && (
              <>
                <span className="font-semibold tracking-[-0.02em] text-brand-light">{journey.pricePerPerson}</span>{' '}
                <span className="text-sm text-muted-foreground max-[359px]:text-xs lg:text-base">{dict.common.perPerson}</span>
              </>
            )}
          </p>
          <Link
            href={href}
            /* From sm up: same width on every card, growing into the free space up to 13.5rem. On phones it
               shrinks to its label (tighter padding and tracking) so it stays on one line beside the price. */
            className="ml-auto flex shrink-0 items-center justify-between gap-1.5 whitespace-nowrap rounded-[8px] border border-foreground/60 px-2.5 py-2.5 text-[10px] uppercase tracking-[0.1em] max-[359px]:gap-1 max-[359px]:px-2 max-[359px]:tracking-[0.06em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:min-w-[8rem] sm:max-w-[13.5rem] sm:flex-1 sm:shrink sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.14em]"
          >
            {journey.href ? dict.common.more : dict.common.registerInterest}
            <ArrowUpRight className="size-3 sm:size-3.5" aria-hidden="true" />
            <span className="sr-only">{` — ${journey.destination}`}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
