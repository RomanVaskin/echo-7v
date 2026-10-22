'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import { regions, type Journey, type Region } from '@/lib/journeys'
import { TravelCard } from '@/components/site/travel-card'
import { JourneyCarousel } from './journey-carousel'
import { cn } from '@/lib/utils'

type Filter = 'All' | Region

export function ScheduleGrid({
  locale,
  dict,
  journeys,
  layout = 'grid',
  heading,
}: {
  locale: Locale
  dict: Dictionary
  journeys: Journey[]
  layout?: 'grid' | 'carousel'
  heading?: React.ReactNode
}) {
  const [filter, setFilter] = useState<Filter>('All')
  const filters: Filter[] = ['All', ...regions]
  const visible = filter === 'All' ? journeys : journeys.filter((j) => j.region === filter)

  const filterButtons = (
    <div role="group" aria-label={dict.schedule.filterLabel} className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={filter === f}
          onClick={() => setFilter(f)}
          className={cn(
            'border px-5 py-2 text-xs uppercase tracking-[0.14em] transition-colors',
            filter === f
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground',
          )}
        >
          {f === 'All' ? dict.schedule.all : dict.regions[f]}
        </button>
      ))}
    </div>
  )

  if (layout === 'carousel') {
    return (
      <JourneyCarousel
        journeys={visible}
        locale={locale}
        dict={dict}
        toolbar={
          <>
            {heading}
            {filterButtons}
          </>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {heading}
      {filterButtons}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((journey) => (
          <TravelCard key={journey.slug} journey={journey} locale={locale} dict={dict} />
        ))}
      </div>
    </div>
  )
}
