import { existsSync } from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'
import { HeroScene, type HeroVideoSource } from './hero-scene'

const HERO_POSTER = '/images/hero-sailing.png'

/**
 * Drop sea / yacht footage into `public/videos/` under these names and rebuild — no code change needed.
 * Missing files are skipped, and with none present the hero shows the poster image only.
 */
const HERO_VIDEO_CANDIDATES: HeroVideoSource[] = [
  { src: '/videos/hero.webm', type: 'video/webm' },
  { src: '/videos/hero.mp4', type: 'video/mp4' },
]

const heroVideoSources = HERO_VIDEO_CANDIDATES.filter((source) =>
  existsSync(path.join(process.cwd(), 'public', source.src)),
)

export function Hero({ locale, dict, featuredJourney }: { locale: Locale; dict: Dictionary['hero']; featuredJourney: Journey }) {
  return (
    <HeroScene sources={heroVideoSources} poster={HERO_POSTER} posterAlt={dict.imageAlt}>
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 lg:px-10 lg:pt-28">
        <div className="hero-fade flex flex-col gap-1.5">
          <p className="eyebrow text-foreground/80">{dict.motto}</p>
          {dict.mottoTranslation && (
            <p className="text-[0.6875rem] tracking-[0.14em] text-foreground/60">{dict.mottoTranslation}</p>
          )}
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 lg:px-10">
        <div className="hero-title origin-left">
          <h1 className="hero-rise hero-wordmark -ml-[0.04em] whitespace-nowrap text-foreground">seasmates</h1>
        </div>
        <p className="hero-subtitle mt-5 md:mt-7">
          <span
            className="hero-fade block font-display text-xl leading-snug text-foreground/90 md:text-3xl"
            style={{ animationDelay: '0.35s' }}
          >
            {dict.titleLead}
            <br className="md:hidden" /> <em className="text-primary">{dict.titleAccent}</em>
          </span>
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-10 lg:px-10 lg:pb-14">
        <div className="hero-fade flex flex-col gap-5 border-t border-foreground/20 pt-6 md:flex-row md:items-end md:justify-between">
          <Link href={featuredJourney.href ?? localePath(locale, '/#schedule')} className="group flex flex-col gap-2">
            <span className="eyebrow">{dict.featuredLabel}</span>
            <span className="flex items-center gap-4 font-display text-2xl md:text-4xl">
              {featuredJourney.destination} · {formatNights(locale, featuredJourney.nights ?? 0)}
              <ArrowRight
                className="size-6 text-primary transition-transform group-hover:translate-x-2"
                aria-hidden="true"
              />
            </span>
          </Link>
          <Link
            href={localePath(locale, '/#schedule')}
            className="text-xs uppercase tracking-[0.14em] text-foreground/70 underline-offset-8 hover:text-foreground hover:underline"
          >
            {dict.viewSchedule}
          </Link>
        </div>
      </div>
    </HeroScene>
  )
}
