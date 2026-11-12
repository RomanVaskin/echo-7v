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
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={journey.image || '/placeholder.svg'}
          alt={`${dict.common.sailingYachtIn} ${journey.destination}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 via-45% to-transparent" />
        {/* Title, dates and length in white over the bottom of the photo */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.35)] max-[359px]:px-4 md:p-7">
          <h3 className="font-display text-4xl tracking-[-0.03em]">{journey.cardTitle ?? journey.destination}</h3>
          {(journey.dates || journey.nights) && (
            <div className="mt-2 flex flex-col gap-0.5 text-sm text-white/85">
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
        </div>
        <div className="absolute inset-x-4 top-4 flex flex-wrap items-start justify-between gap-2">
          {/* Open journeys need no status badge; the others show theirs ("Coming soon"…) */}
          {journey.status !== 'enquiries-open' && (
            <span
              className={cn(
                // On the right, like the "Upcoming journey" badge
                'ml-auto flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] backdrop-blur',
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
            <span className="ml-auto whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
              {dict.common.featured}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 max-[359px]:px-4 md:px-7 md:pb-7">
        {/* Lead line and description as one paragraph, same size and colour */}
        {(journey.cardLead || journey.tagline) && (
          <p className="text-[0.9375rem] leading-relaxed text-foreground/85">
            {[journey.cardLead, journey.tagline].filter(Boolean).join(' ')}
          </p>
        )}

        {journey.bookingHref ? (
          /* Journeys sold online: the price on its own line, then "Explore" and "Book now" side by side */
          <div className="mt-auto flex flex-col gap-4 pt-8">
            <p className="whitespace-nowrap font-display text-xl lg:text-2xl">
              <span className="font-semibold tracking-[-0.02em] text-brand-light">{journey.pricePerPerson}</span>{' '}
              <span className="text-sm text-muted-foreground lg:text-base">{dict.common.perPerson}</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={href}
                className="flex items-center justify-center gap-1.5 rounded-full border border-foreground/60 px-3 py-3 text-[10px] uppercase tracking-[0.12em] max-[359px]:gap-1 max-[359px]:px-1.5 max-[359px]:tracking-[0.04em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:text-[11px]"
              >
                {dict.common.more}
                <ArrowUpRight className="size-3 sm:size-3.5" aria-hidden="true" />
                <span className="sr-only">{` – ${journey.destination}`}</span>
              </Link>
              <Link
                href={journey.bookingHref}
                className="enquiry-submit enquiry-submit--ringed flex items-center justify-center rounded-full px-3 py-3 text-[10px] uppercase tracking-[0.12em] max-[359px]:px-1.5 max-[359px]:tracking-[0.04em] sm:text-[11px]"
              >
                {dict.common.book}
                <span className="sr-only">{` – ${journey.destination}`}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-2.5 pt-8 max-[359px]:gap-1.5 sm:gap-3">
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
              /* The same oval as the first card's buttons (height, type, border); half the card wide like each of them from sm up, as wide as its label on phones */
              className="ml-auto flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-foreground/60 px-5 py-3 sm:w-[calc(50%-0.3125rem)] sm:px-3 text-[10px] uppercase tracking-[0.12em] max-[359px]:gap-1 max-[359px]:px-4 max-[359px]:tracking-[0.04em] text-foreground transition-colors hover:bg-foreground hover:text-background sm:text-[11px]"
            >
              {journey.href ? dict.common.more : dict.common.registerInterest}
              <ArrowUpRight className="size-3 sm:size-3.5" aria-hidden="true" />
              <span className="sr-only">{` – ${journey.destination}`}</span>
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
