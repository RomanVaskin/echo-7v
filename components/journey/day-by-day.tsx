'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { ArrowRight, ImageIcon, MapPin } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { routeDays } from '@/lib/caribbean'
import { cn } from '@/lib/utils'
import { useRouteDay } from './route-day-context'

const dayKey = (dayId: number) => `day-${dayId}`

/**
 * One tall card per day ("Day 01"…), styled as a page of a travel journal: a narrow left strip with
 * four punched holes, then the photo and the day's text. Two and a half cards on desktop, about 1.6
 * on tablets, one card and the edge of the next on phones; the shared carousel scrolls them.
 *
 * Linked to the route map through the shared selected day (route-day-context): the selected card is
 * slightly enlarged, choosing a marker brings its card into view, and a card, the arrows or a
 * settled swipe select a day for the map. Each card's «View on map» button also takes the page to
 * the map and its marker.
 */
export function DayByDay({ dict }: { dict: Dictionary['caribbean']['days'] }) {
  const route = useRouteDay()
  const strip = useRef<HTMLDivElement>(null)
  const activeDayId = route?.activeDayId ?? null
  const selection = route?.selection

  // A marker chosen on the map: bring the cards into view if they are off screen (explicit click only)
  useEffect(() => {
    if (selection?.source !== 'map' || !strip.current) return
    const box = strip.current.getBoundingClientRect()
    if (box.top >= 0 && box.bottom <= window.innerHeight) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    strip.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }, [selection])

  const select = (dayId: number) => route?.setActiveDayId(dayId, 'card')

  // A swipe or drag came to rest: the leading card becomes the selected day, unless the selected
  // card is still fully in view (e.g. the strip only moved to show a card that was just chosen)
  const settle = (key: string) => {
    const strip_ = strip.current?.querySelector('ul')
    const selected = strip_?.querySelector(`li[data-key="${dayKey(activeDayId ?? 0)}"]`)
    if (strip_ && selected) {
      const s = strip_.getBoundingClientRect()
      const c = selected.getBoundingClientRect()
      if (c.left >= s.left - 1 && c.right <= Math.min(s.right, window.innerWidth) + 1) return
    }
    route?.setActiveDayId(Number(key.replace('day-', '')), 'carousel')
  }
  const last = routeDays.length

  return (
    <section aria-labelledby="days-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <div ref={strip}>
      <Carousel
        // Room above and below the strip so the enlarged card is never clipped (layout unchanged)
        stripClassName="-my-6 py-6"
        scrollTo={selection && selection.source !== 'card' && selection.source !== 'card-map' ? { key: dayKey(selection.dayId), nonce: selection.nonce } : null}
        onSettle={route ? (key) => settle(key) : undefined}
        onStep={route && activeDayId ? (direction) => route.setActiveDayId(Math.min(Math.max(activeDayId + direction, 1), last), 'arrow') : undefined}
        stepState={route && activeDayId ? { prev: activeDayId > 1, next: activeDayId < last } : undefined}
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        /* Phones: one card and ~15% of the next; tablets: about 1.6 cards; desktop: two and a half up to the
           strip's right edge (its 2.5rem end padding included, hence 100% - 0.5rem) */
        itemClassName="w-[88%] min-[360px]:w-[85%] sm:w-[calc((100%-1.5rem)/1.6)] lg:w-[calc((100%-0.5rem)/2.5)]"
        toolbar={
          <div className="flex flex-col gap-5">
            <p className="eyebrow flex items-center gap-4">
              <span className="text-primary">04</span>
              <span>{dict.eyebrow}</span>
            </p>
            <h2 id="days-title" className="font-display text-balance text-4xl md:text-6xl">
              {dict.title}
            </h2>
          </div>
        }
        items={routeDays.map(({ dayId, photo }, i) => {
          const item = dict.items[i]
          const active = dayId === activeDayId
          return {
            key: dayKey(dayId),
            node: (
              <article
                // A group, not a button: it holds the «View on map» button. A click (or Enter/Space on the
                // focused card) selects the day for the map without scrolling the page
                role={route ? 'group' : undefined}
                tabIndex={route ? 0 : undefined}
                aria-current={route && active ? 'true' : undefined}
                aria-label={route ? `${dict.day} ${String(dayId).padStart(2, '0')}, ${item.date}: ${item.place}` : undefined}
                onClick={(event) => {
                  if (!(event.target as Element).closest('button')) select(dayId)
                }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
                  event.preventDefault()
                  select(dayId)
                }}
                className={cn(
                  'journal-page relative flex rounded-2xl border border-border transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--button-primary)]',
                  route && 'cursor-pointer',
                  // Selected day: slightly larger (transform only, so neighbours do not move) with a deeper shadow
                  active ? 'z-10 scale-[1.035] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] motion-reduce:scale-100' : 'shadow-[0_8px_24px_-16px_rgb(0_0_0/0.4)]',
                )}
              >
                {/* Binding strip: four evenly spaced punched holes and a faint fold line */}
                <div
                  aria-hidden="true"
                  className="flex w-9 shrink-0 flex-col items-center justify-evenly border-r border-foreground/[0.07] py-8 md:w-10"
                >
                  {[0, 1, 2, 3].map((hole) => (
                    <span key={hole} className="journal-hole" />
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4 pl-3 sm:p-5 sm:pl-4 md:p-6 md:pl-5">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-foreground/[0.04] sm:aspect-[5/6] lg:aspect-square">
                    {photo ? (
                      <Image
                        src={photo.src}
                        alt={item.place}
                        fill
                        draggable={false}
                        sizes="(min-width: 1280px) 400px, (min-width: 1024px) 34vw, (min-width: 640px) 55vw, 75vw"
                        className="object-cover"
                        style={{ objectPosition: photo.position }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <ImageIcon className="size-6 stroke-1" aria-hidden="true" />
                        {dict.photoPlaceholder}
                      </div>
                    )}
                  </div>
                  {/* Day, date, place and programme; the reserved height keeps the photo at roughly 55–60% of the page */}
                  <div className="mt-6 flex flex-1 flex-col sm:min-h-[15rem]">
                    <p className="eyebrow flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-primary">
                        {dict.day} {String(dayId).padStart(2, '0')}
                      </span>
                      <span>{item.date}</span>
                    </p>
                    <h3 className="mt-3 text-balance hyphens-auto break-words font-display text-[1.75rem] leading-[1.12] tracking-[-0.03em] md:text-[2rem]">
                      {item.place}
                    </h3>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</p>
                    {/* Pinned to the bottom, so all nine buttons sit on one line whatever the text length */}
                    {route && (
                      <div className="mt-auto pt-6">
                      <button
                        type="button"
                        className="day-map-button"
                        aria-label={dict.showOnMapLabel.replace('{day}', String(dayId))}
                        onClick={() => route.setActiveDayId(dayId, 'card-map')}
                      >
                        <MapPin aria-hidden="true" className="day-map-button__icon" strokeWidth={1.25} />
                        <span>{dict.showOnMap}</span>
                        <ArrowRight aria-hidden="true" className="day-map-button__arrow" strokeWidth={1.25} />
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ),
          }
        })}
      />
      </div>
      {/* One note for the whole programme: shore activities are planned, not guaranteed */}
      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">{dict.programmeNote}</p>
    </section>
  )
}
