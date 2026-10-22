import type { Dictionary } from '@/lib/dictionaries'

export function Intro({ dict }: { dict: Dictionary['intro'] }) {
  return (
    <section aria-label={dict.aria} className="mx-auto max-w-7xl px-6 pb-12 pt-12 lg:px-10 lg:pb-16 lg:pt-16">
      <div className="reveal flex flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-8">
          <p className="eyebrow">{dict.eyebrow}</p>
          <p className="font-display text-pretty text-left text-[1.8rem] leading-tight md:text-[2.4rem] lg:text-5xl">
            {dict.lead}
          </p>
        </div>
        <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          {dict.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h3 className="text-sm uppercase tracking-[0.18em] text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
