import { existsSync } from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'
import { HeroScene, type HeroVideoSource } from './hero-scene'

const HERO_POSTER = '/images/hero-sailing.png'

const WORDMARK = 'seasmates'
// Letter-by-letter 3D flip, right to left: starts after the background fades in, one letter every 70ms.
const LETTERS_START_S = 0.3
const LETTER_STAGGER_S = 0.07

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

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary['hero'] }) {
  return (
    <HeroScene sources={heroVideoSources} poster={HERO_POSTER} posterAlt={dict.imageAlt}>
      {/* Sits right under the header logo, left-aligned with it */}
      <div className="hero-motto relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="hero-fade flex flex-col gap-1" style={{ animationDelay: '1.7s' }}>
          {dict.motto && <p className="text-[0.625rem] uppercase tracking-[0.3em] text-foreground/80">{dict.motto}</p>}
          {dict.mottoTranslation && (
            <p className="text-[0.625rem] tracking-[0.16em] text-foreground/60">{dict.mottoTranslation}</p>
          )}
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 lg:px-10">
        <div className="hero-title origin-left">
          <h1 className="hero-wordmark -ml-[0.04em] whitespace-nowrap text-foreground">
            <span className="sr-only">{WORDMARK}</span>
            <span aria-hidden="true" className="hero-letters">
              {[...WORDMARK].map((letter, i) => (
                <span key={i} className="hero-letter">
                  <span style={{ animationDelay: `${LETTERS_START_S + (WORDMARK.length - 1 - i) * LETTER_STAGGER_S}s` }}>
                    {letter}
                  </span>
                </span>
              ))}
            </span>
          </h1>
        </div>
        <p className="hero-subtitle mt-5 md:mt-7">
          <span
            className="hero-fade block font-display text-xl leading-snug text-foreground/90 md:text-3xl"
            style={{ animationDelay: '2s' }}
          >
            {dict.titleLead}
            <br className="md:hidden" /> <em className="text-primary">{dict.titleAccent}</em>
          </span>
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-10 lg:px-10 lg:pb-14">
        <div className="hero-fade flex items-end">
          {/* Scrolls to "01 / Upcoming journeys" on the home page */}
          <Link href={localePath(locale, '/#schedule')} className="hero-cta">
            {dict.exploreJourneys}
          </Link>
        </div>
      </div>
    </HeroScene>
  )
}
