'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'
import { TravelCard } from '@/components/site/travel-card'
import { cn } from '@/lib/utils'

const DRAG_THRESHOLD = 6
const MOMENTUM_MS = 180

/**
 * Horizontal journey strip: native scroll-snap for touch and trackpad, mouse drag with a short
 * momentum glide on desktop, arrows and a progress line. Scroll state is written straight to the
 * DOM; React state only changes when the arrows' availability does.
 */
export function JourneyCarousel({ journeys, locale, dict }: { journeys: Journey[]; locale: Locale; dict: Dictionary }) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [nav, setNav] = useState({ prev: false, next: false, overflow: false })

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Snap positions: each card's left edge, clamped to the scrollable range.
  const snapPoints = (scroller: HTMLUListElement) => {
    const padding = parseFloat(getComputedStyle(scroller).paddingLeft) || 0
    const max = scroller.scrollWidth - scroller.clientWidth
    return Array.from(scroller.children, (child) => Math.min(Math.max((child as HTMLElement).offsetLeft - padding, 0), max))
  }

  const goTo = (left: number) => {
    scrollerRef.current?.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const step = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const points = snapPoints(scroller)
    const current = scroller.scrollLeft
    const target =
      direction > 0 ? points.find((p) => p > current + 2) : [...points].reverse().find((p) => p < current - 2)
    goTo(target ?? (direction > 0 ? scroller.scrollWidth : 0))
  }

  // Progress line and arrow availability follow the scroll position.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    let frame = 0

    const update = () => {
      frame = 0
      const { scrollLeft, scrollWidth, clientWidth } = scroller
      const max = scrollWidth - clientWidth
      const overflow = max > 2
      const thumb = thumbRef.current
      if (thumb) {
        const size = overflow ? clientWidth / scrollWidth : 1
        thumb.style.width = `${size * 100}%`
        thumb.style.transform = `translateX(${overflow ? (scrollLeft / max) * ((1 - size) / size) * 100 : 0}%)`
      }
      const next = { prev: overflow && scrollLeft > 2, next: overflow && scrollLeft < max - 2, overflow }
      setNav((prev) => (prev.prev === next.prev && prev.next === next.next && prev.overflow === next.overflow ? prev : next))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    scroller.scrollLeft = 0
    update()
    scroller.addEventListener('scroll', schedule, { passive: true })
    const resize = new ResizeObserver(schedule)
    resize.observe(scroller)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', schedule)
      resize.disconnect()
    }
  }, [journeys])

  // Mouse drag (touch and trackpads use native scrolling).
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    let pointerId: number | null = null
    let startX = 0
    let startLeft = 0
    let lastX = 0
    let lastTime = 0
    let velocity = 0
    let dragged = false
    let settleTimer = 0

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      pointerId = event.pointerId
      startX = lastX = event.clientX
      startLeft = scroller.scrollLeft
      lastTime = performance.now()
      velocity = 0
      dragged = false
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      const dx = event.clientX - startX
      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return
      if (!dragged) {
        dragged = true
        scroller.setPointerCapture(event.pointerId)
        scroller.dataset.dragging = 'true'
      }
      const now = performance.now()
      velocity = (event.clientX - lastX) / Math.max(now - lastTime, 1)
      lastX = event.clientX
      lastTime = now
      scroller.scrollLeft = startLeft - dx
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      if (!dragged) return
      const projected = scroller.scrollLeft - velocity * MOMENTUM_MS
      const points = snapPoints(scroller)
      const nearest = points.reduce((best, p) => (Math.abs(p - projected) < Math.abs(best - projected) ? p : best), 0)
      goTo(nearest)
      // Re-enable snapping only once the glide has settled, so the browser does not re-snap mid-way.
      const settle = () => {
        window.clearTimeout(settleTimer)
        scroller.removeEventListener('scrollend', settle)
        delete scroller.dataset.dragging
      }
      scroller.addEventListener('scrollend', settle)
      settleTimer = window.setTimeout(settle, 700)
    }
    // A drag must not also follow the link under the cursor.
    const onClick = (event: MouseEvent) => {
      if (!dragged) return
      event.preventDefault()
      event.stopPropagation()
      dragged = false
    }
    const preventNativeDrag = (event: DragEvent) => event.preventDefault()

    scroller.addEventListener('pointerdown', onDown)
    scroller.addEventListener('pointermove', onMove)
    scroller.addEventListener('pointerup', onUp)
    scroller.addEventListener('pointercancel', onUp)
    scroller.addEventListener('click', onClick, true)
    scroller.addEventListener('dragstart', preventNativeDrag)
    return () => {
      scroller.removeEventListener('pointerdown', onDown)
      scroller.removeEventListener('pointermove', onMove)
      scroller.removeEventListener('pointerup', onUp)
      scroller.removeEventListener('pointercancel', onUp)
      scroller.removeEventListener('click', onClick, true)
      scroller.removeEventListener('dragstart', preventNativeDrag)
      window.clearTimeout(settleTimer)
    }
  }, [])

  const arrowClass =
    'flex size-11 items-center justify-center border border-border text-foreground/80 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30'

  return (
    <div className="flex flex-col gap-8">
      <ul
        ref={scrollerRef}
        aria-label={dict.schedule.carouselLabel}
        className="journey-scroller no-scrollbar relative -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-px-6 px-6 lg:-mx-10 lg:scroll-px-10 lg:px-10"
      >
        {journeys.map((journey) => (
          <li
            key={journey.slug}
            className="flex w-[86%] shrink-0 snap-start *:w-full sm:w-[58%] md:w-[44%] lg:w-[38%] xl:w-[34%]"
          >
            <TravelCard journey={journey} locale={locale} dict={dict} reveal={false} />
          </li>
        ))}
      </ul>

      <div className={cn('flex items-center gap-8', !nav.overflow && 'hidden')}>
        <div className="relative h-px flex-1 overflow-hidden bg-[#9db3ae]/25" aria-hidden="true">
          <div ref={thumbRef} className="absolute inset-y-0 left-0 bg-[#d5be95]" />
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" className={arrowClass} onClick={() => step(-1)} disabled={!nav.prev} aria-label={dict.schedule.previous}>
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" className={arrowClass} onClick={() => step(1)} disabled={!nav.next} aria-label={dict.schedule.next}>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
