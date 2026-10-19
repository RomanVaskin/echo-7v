import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { featuredJourney } from '@/lib/journeys'

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <Image
        src="/images/hero-sailing.png"
        alt="A sailing yacht crossing deep open ocean at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 pb-12 pt-40 lg:px-10 lg:pb-16">
        <div className="hero-fade flex max-w-4xl flex-col gap-8">
          <p className="eyebrow text-foreground/80">A boutique international sailing club</p>
          <h1 className="font-display text-balance text-6xl md:text-8xl lg:text-[8.5rem]">
            Travel by sea, <em className="text-primary">in good company.</em>
          </h1>
          <p className="max-w-lg text-pretty text-lg leading-relaxed text-foreground/80">
            Carefully selected journeys for small crews — quiet anchorages, long passages and the people you meet
            along the way.
          </p>
        </div>

        <div className="flex flex-col gap-6 border-t border-foreground/20 pt-6 md:flex-row md:items-end md:justify-between">
          <Link href={featuredJourney.href ?? '/#schedule'} className="group flex flex-col gap-2">
            <span className="eyebrow">Featured journey</span>
            <span className="flex items-center gap-4 font-display text-3xl md:text-4xl">
              {featuredJourney.destination} · {featuredJourney.nights} nights
              <ArrowRight
                className="size-6 text-primary transition-transform group-hover:translate-x-2"
                aria-hidden="true"
              />
            </span>
          </Link>
          <Link
            href="/#schedule"
            className="text-xs uppercase tracking-[0.22em] text-foreground/70 underline-offset-8 hover:text-foreground hover:underline"
          >
            View sailing schedule
          </Link>
        </div>
      </div>
    </section>
  )
}
