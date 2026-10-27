'use client'

import type { Dictionary } from '@/lib/dictionaries'
import { routeDays, routeMapPoints } from '@/lib/caribbean'
import { cn } from '@/lib/utils'
import { useRouteDay } from './route-day-context'


/**
 * Clickable day markers laid over the route map image, on its printed anchorages. Each marker
 * carries a day (dayId); the selected one is larger, in the accent colour, with a thin ring and a
 * soft pulse. Choosing a marker selects the day and brings its card into view.
 */
export function RouteMapMarkers({ days, label }: { days: Dictionary['caribbean']['days']; label: string }) {
  const route = useRouteDay()
  if (!route) return null

  return (
    <div className="route-markers absolute inset-0" role="group" aria-label={label}>
      {routeDays.map(({ dayId, mapPoint }, i) => {
        const point = routeMapPoints[mapPoint]
        const sameStop = routeDays.filter((d) => d.mapPoint === mapPoint)
        const slot = sameStop.findIndex((d) => d.dayId === dayId)
        // Days that share an anchorage sit side by side, centred on the printed dot (real positions unchanged)
        const offset = (slot - (sameStop.length - 1) / 2) * 2
        const active = route.activeDayId === dayId
        const item = days.items[i]
        return (
          <button
            key={dayId}
            type="button"
            aria-pressed={active}
            aria-label={`${days.day} ${String(dayId).padStart(2, '0')}, ${item.date}: ${item.place}`}
            onClick={() => route.setActiveDayId(dayId, 'map')}
            className={cn('route-marker group absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center', active ? 'z-20' : 'z-10')}
            style={{ left: `calc(${point.x}% + ${offset} * var(--route-spread))`, top: `${point.y}%` }}
          >
            <span
              className={cn(
                'route-marker__dot flex items-center justify-center rounded-full font-medium leading-none tabular-nums transition-[width,height,background-color,box-shadow,font-size] duration-300 motion-reduce:transition-none',
                active ? 'route-marker__dot--active' : '',
              )}
            >
              {dayId}
            </span>
          </button>
        )
      })}
    </div>
  )
}
