import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'

export function Intro({ dict, index }: { dict: Dictionary['intro']; index?: string }) {
  return (
    <section aria-label={dict.aria} className="theme-light grid border-t border-border lg:grid-cols-2">
      {/* Left padding lines the text up with the max-w-7xl container used by other sections */}
      <div className="reveal flex flex-col justify-center gap-10 px-6 py-16 md:py-20 lg:py-24 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-16">
        <div className="flex max-w-xl flex-col gap-7">
          <p className="eyebrow">
            {index && <span className="text-foreground">{index} / </span>}
            {dict.eyebrow}
          </p>
          {/* Inter Display Light (font-display) with open tracking: the utility's -0.045em made long words run together here */}
          <p className="font-display text-pretty text-[2rem] leading-[1.17] tracking-[0.015em] [font-kerning:normal] text-foreground md:text-[2.5rem] xl:text-5xl">
            {dict.lead}
          </p>
        </div>
        <div className="grid max-w-xl gap-6 border-t border-border pt-8 sm:grid-cols-3">
          {dict.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-[0.14em] text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative min-h-[360px] md:min-h-[480px] lg:min-h-[600px]">
        <Image src="/images/gallery-deck.png" alt={dict.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    </section>
  )
}
