import type { Dictionary } from '@/lib/dictionaries'

/**
 * Full-width slot for the interactive route map. Until the confirmed route arrives it shows a
 * caption only and loads no map. To connect the map, pass it as children, e.g.
 * `<SailingMapLoader points={...} showRoute ... />` from components/site/sailing-map-loader.tsx,
 * which already draws markers and the route line.
 */
export function RouteMap({ dict, children }: { dict: Dictionary['caribbean']['map']; children?: React.ReactNode }) {
  return (
    <section aria-label={dict.label} className="theme-light">
      <div className="relative flex h-[420px] w-full items-center justify-center md:h-[520px] lg:h-[620px]">
        {children ?? (
          <p className="eyebrow flex flex-col items-center gap-4 text-center">
            <span>03 / {dict.eyebrow}</span>
            <span className="font-display text-4xl normal-case tracking-[-0.02em] md:text-5xl">{dict.placeholder}</span>
          </p>
        )}
      </div>
    </section>
  )
}
