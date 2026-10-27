'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Compass, Move, X } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import type { GlobeDestination } from '@/lib/globe-destinations'
import { cn } from '@/lib/utils'
import type { GlobeRequest } from './globe-scene'
import { StaticGlobe } from './static-globe'

// three.js and the land data load only when the section approaches the viewport
const GlobeScene = dynamic(() => import('./globe-scene'), { ssr: false })

export type WorldDestination = GlobeDestination & {
  name: string
  region: string
  description: string
  image: string
  duration: string | null
  href: string
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function ExploreWorldClient({
  destinations,
  dict,
  durationLabel,
}: {
  destinations: WorldDestination[]
  dict: Dictionary['globe']
  durationLabel: string
}) {
  const section = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)
  const [request, setRequest] = useState<GlobeRequest | null>(null)
  const surprise = useRef<string | null>(null)

  useEffect(() => {
    setWebgl(hasWebGL())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Mount the scene a little before it scrolls into view; render frames only while visible
  useEffect(() => {
    const el = section.current
    if (!el) return
    const nearObserver = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '600px 0px' })
    const visibleObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    nearObserver.observe(el)
    visibleObserver.observe(el)
    return () => {
      nearObserver.disconnect()
      visibleObserver.disconnect()
    }
  }, [])

  const select = useCallback((id: string) => {
    surprise.current = null
    setSelectedId(id)
    setCardId(id)
    setRequest((r) => ({ id, spin: false, nonce: (r?.nonce ?? 0) + 1 }))
  }, [])

  const surpriseMe = () => {
    const pool = destinations.filter((d) => d.id !== cardId)
    const pick = (pool.length ? pool : destinations)[Math.floor(Math.random() * (pool.length || destinations.length))]
    if (!pick) return
    setSelectedId(pick.id)
    if (webgl === false) {
      setCardId(pick.id)
      return
    }
    // The card opens once the globe has come to rest on the destination
    surprise.current = pick.id
    setCardId(null)
    setRequest((r) => ({ id: pick.id, spin: true, nonce: (r?.nonce ?? 0) + 1 }))
  }

  const onArrive = useCallback((id: string) => {
    if (surprise.current === id) {
      surprise.current = null
      setCardId(id)
    }
  }, [])

  const close = useCallback(() => {
    surprise.current = null
    setSelectedId(null)
    setCardId(null)
  }, [])

  useEffect(() => {
    if (!cardId) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cardId, close])

  const card = destinations.find((d) => d.id === cardId)
  const points = destinations.map((d) => ({ id: d.id, lat: d.lat, lon: d.lon, label: d.name }))

  return (
    <section ref={section} aria-labelledby="world-title" className="overflow-hidden border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:px-10 lg:py-28 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_minmax(0,0.9fr)] xl:items-center xl:gap-10">
        {/* Heading, the accessible list of destinations and "Surprise Me" */}
        <div className="flex flex-col gap-6">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2 id="world-title" className="font-display text-balance text-5xl md:text-6xl">
            {dict.title}
          </h2>
          <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{dict.subtitle}</p>
          <ol aria-label={dict.listLabel} className="mt-2 flex flex-col border-t border-border">
            {destinations.map((d) => (
              <li key={d.id} className="border-b border-border">
                <button
                  type="button"
                  aria-pressed={d.id === selectedId}
                  onClick={() => select(d.id)}
                  className="group flex min-h-12 w-full items-baseline gap-4 py-3 text-left transition-colors hover:text-primary"
                >
                  <span className="eyebrow text-primary">{d.index}</span>
                  <span className="flex flex-col">
                    <span className={cn('font-display text-xl', d.id === selectedId && 'text-primary')}>{d.name}</span>
                    <span className="text-xs text-muted-foreground">{d.region}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={surpriseMe}
            className="flex min-h-11 w-fit items-center gap-2.5 rounded-full border border-foreground/40 px-5 text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Compass className="size-4" strokeWidth={1.4} aria-hidden="true" />
            {dict.surprise}
          </button>
        </div>

        {/* The globe */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative aspect-square w-full max-w-[620px]">
            {/* Light pooling under the glass sphere */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[14%] bottom-[-2%] h-[12%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(170,215,255,0.32),rgba(170,215,255,0))] blur-md"
            />
            {/* Placeholder until the scene is ready */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-[5.5%] rounded-full border border-white/25 bg-white/[0.03] transition-opacity duration-700',
                ready || webgl === false ? 'opacity-0' : 'opacity-100',
              )}
            />
            {webgl === false ? (
              <StaticGlobe points={points} selectedId={selectedId} label={dict.fallbackLabel} onPick={select} />
            ) : (
              near &&
              webgl && (
                <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
                  <GlobeScene
                    points={points}
                    selectedId={selectedId}
                    request={request}
                    reducedMotion={reducedMotion}
                    active={visible}
                    label={dict.globeLabel}
                    onPick={select}
                    onArrive={onArrive}
                    onReady={() => setReady(true)}
                  />
                </div>
              )
            )}
          </div>
          {webgl !== false && (
            <p className="eyebrow flex items-center gap-2" aria-hidden="true">
              <Move className="size-3.5" strokeWidth={1.4} />
              {dict.hint}
            </p>
          )}
        </div>

        {/* The selected journey: right of the globe on desktop, under it on phones */}
        <div className="min-h-0 xl:min-h-[34rem]" aria-live="polite">
          {card && (
            <article
              key={card.id}
              className="relative mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-foreground/[0.04] animate-in fade-in slide-in-from-bottom-3 duration-700 motion-reduce:animate-none xl:mx-0"
            >
              <div className="relative aspect-[5/4]">
                <Image src={card.image} alt={card.name} fill sizes="(min-width: 1024px) 24rem, 90vw" className="object-cover" />
                <button
                  type="button"
                  onClick={close}
                  aria-label={dict.close}
                  className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition-colors hover:bg-background"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-col gap-3 p-6">
                <p className="eyebrow">
                  <span className="text-primary">{card.index}</span> · {card.region}
                </p>
                <h3 className="font-display text-3xl tracking-[-0.03em]">{card.name}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{card.description}</p>
                {card.duration && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">{durationLabel}:</span> {card.duration}
                  </p>
                )}
                <Link
                  href={card.href}
                  className="mt-3 flex w-fit items-center gap-2 rounded-[8px] border border-foreground/60 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {dict.explore}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}
