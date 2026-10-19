'use client'

import { useState } from 'react'
import { journeys, regions, type Region } from '@/lib/journeys'
import { TravelCard } from '@/components/site/travel-card'
import { cn } from '@/lib/utils'

type Filter = 'All' | Region

export function ScheduleGrid() {
  const [filter, setFilter] = useState<Filter>('All')
  const filters: Filter[] = ['All', ...regions]
  const visible = filter === 'All' ? journeys : journeys.filter((j) => j.region === filter)

  return (
    <div className="flex flex-col gap-10">
      <div role="group" aria-label="Filter journeys by region" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'border px-5 py-2 text-xs uppercase tracking-[0.2em] transition-colors',
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((journey) => (
          <TravelCard key={journey.slug} journey={journey} />
        ))}
      </div>
    </div>
  )
}
