import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'
import { routeMapImage } from '@/lib/caribbean'
import { RouteMapMarkers } from './route-map-markers'

/**
 * Full-width route map section. Shows the route map image from lib/caribbean.ts; without one it
 * falls back to a caption. An interactive map can later replace the image: pass it as children,
 * e.g. `<SailingMapLoader points={...} showRoute ... />` from components/site/sailing-map-loader.tsx.
 */
export function RouteMap({
  dict,
  days,
  children,
}: {
  dict: Dictionary['caribbean']['map']
  /** Day texts for the clickable day markers over the map image. */
  days?: Dictionary['caribbean']['days']
  children?: React.ReactNode
}) {
  const content =
    children ??
    (routeMapImage ? (
      <div className="relative">
        <Image
          src={routeMapImage.src}
          alt={dict.alt}
          width={routeMapImage.width}
          height={routeMapImage.height}
          sizes="(min-width: 1280px) 1200px, calc(100vw - 3rem)"
          className="h-auto w-full rounded-2xl"
        />
        {days && <RouteMapMarkers days={days} label={dict.label} />}
      </div>
    ) : (
      <div className="flex h-[420px] items-center justify-center md:h-[520px] lg:h-[620px]">
        <p className="font-display text-4xl tracking-[-0.02em] md:text-5xl">{dict.placeholder}</p>
      </div>
    ))

  return (
    <section aria-labelledby="map-title" className="theme-light">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <h2 id="map-title" className="eyebrow mb-8 flex items-center gap-4">
          <span className="text-foreground">03</span>
          <span>{dict.label}</span>
        </h2>
        {content}
      </div>
    </section>
  )
}
