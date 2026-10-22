import { existsSync } from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'
import { HeroScene, type HeroVideoSource } from './hero-scene'

const HERO_POSTER = '/images/hero-sailing.png'

const WORDMARK = 'seasmates'
// Letter-by-letter reveal: starts after the background fades in, one letter every 80ms.
const LETTERS_START_S = 0.3
const LETTER_STAGGER_S = 0.08

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
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 lg:px-10 lg:pt-28">
        <div className="hero-fade flex flex-col gap-1.5" style={{ animationDelay: '1.45s' }}>
          <p className="eyebrow text-foreground/80">{dict.motto}</p>
          {dict.mottoTranslation && (
            <p className="text-[0.6875rem] tracking-[0.14em] text-foreground/60">{dict.mottoTranslation}</p>
          )}
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 lg:px-10">
        <div className="hero-title origin-left">
          <h1 className="hero-wordmark -ml-[0.04em] whitespace-nowrap text-foreground">
            <span className="sr-only">{WORDMARK}</span>
            <span aria-hidden="true">
              {[...WORDMARK].map((letter, i) => (
                <span key={i} className="hero-letter">
                  <span style={{ animationDelay: `${LETTERS_START_S + i * LETTER_STAGGER_S}s` }}>{letter}</span>
                </span>
              ))}
            </span>
          </h1>
        </div>
        <p className="hero-subtitle mt-5 md:mt-7">
          <span
            className="hero-fade block font-display text-xl leading-snug text-foreground/90 md:text-3xl"
            style={{ animationDelay: '1.75s' }}
          >
            {dict.titleLead}
            <br className="md:hidden" /> <em className="text-primary">{dict.titleAccent}</em>
          </span>
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-10 lg:px-10 lg:pb-14">
        <div className="hero-fade flex items-end justify-between gap-6 border-t border-foreground/20 pt-6">
          <Link href={localePath(locale, '/journeys')} className="hero-cta">
            {/* two lines: first word, then the rest */}
            <span>{dict.exploreJourneys.split(' ')[0]}</span>
            <span>{dict.exploreJourneys.split(' ').slice(1).join(' ')}</span>
          </Link>
          <Link
            href={localePath(locale, '/#schedule')}
            className="max-w-[11rem] text-right text-xs uppercase tracking-[0.14em] text-foreground/70 underline-offset-8 hover:text-foreground hover:underline md:max-w-none"
          >
            {dict.viewSchedule}
          </Link>
        </div>
      </div>
    </HeroScene>
  )
}
