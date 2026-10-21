import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { type Journey } from '@/lib/journeys'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function Detail({ label, value, tba }: { label: string; value: string | null; tba: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('text-right', value ? 'text-foreground' : 'text-muted-foreground/70 tracking-[0.2em] text-xs')}>
        {value ?? tba}
      </dd>
    </div>
  )
}

export function TravelCard({ journey, locale, dict }: { journey: Journey; locale: Locale; dict: Dictionary }) {
  const isAvailable = journey.status === 'enquiries-open' || journey.status === 'limited'
  const href = journey.href ?? localePath(locale, '/#enquire')

  return (
    <article className="reveal group flex flex-col bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={journey.image || '/placeholder.svg'}
          alt={`${dict.common.sailingYachtIn} ${journey.destination}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <span
          className={cn(
            'absolute left-4 top-4 flex items-center gap-2 bg-background/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] backdrop-blur',
            isAvailable ? 'text-primary' : 'text-foreground/70',
          )}
        >
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', isAvailable ? 'bg-primary' : 'bg-foreground/40')}
          />
          {dict.status[journey.status]}
        </span>
        {journey.featured && (
          <span className="absolute right-4 top-4 bg-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-primary-foreground">
            {dict.common.featured}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">
            {journey.regionLabel} · {journey.area}
          </p>
          <h3 className="font-display text-3xl">{journey.destination}</h3>
        </div>

        <dl className="flex flex-col">
          <Detail label={dict.schedule.card.dates} value={journey.dates} tba={dict.common.tba} />
          <Detail
            label={dict.schedule.card.duration}
            value={journey.nights ? formatNights(locale, journey.nights) : null}
            tba={dict.common.tba}
          />
          <Detail label={dict.schedule.card.yacht} value={journey.vessel} tba={dict.common.tba} />
          <Detail label={dict.schedule.card.guests} value={journey.guests} tba={dict.common.tba} />
          <Detail label={dict.schedule.card.price} value={journey.pricePerPerson} tba={dict.common.tba} />
        </dl>

        <Link
          href={href}
          className={cn(
            'mt-auto flex items-center justify-between border px-5 py-3.5 text-xs uppercase tracking-[0.22em] transition-colors',
            journey.href
              ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
              : 'border-border text-foreground/80 hover:border-foreground/50 hover:text-foreground',
          )}
        >
          {journey.href ? dict.common.exploreJourney : dict.common.registerInterest}
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">{` — ${journey.destination}`}</span>
        </Link>
      </div>
    </article>
  )
}
