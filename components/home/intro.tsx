import type { Dictionary } from '@/lib/dictionaries'

export function Intro({ dict }: { dict: Dictionary['intro'] }) {
  return (
    <section aria-label={dict.aria} className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <div className="reveal grid gap-12 lg:grid-cols-[1fr_2fr]">
        <p className="eyebrow">{dict.eyebrow}</p>
        <div className="flex flex-col gap-10">
          <p className="font-display text-balance text-4xl leading-tight md:text-5xl lg:text-6xl">
            {dict.lead}{' '}
            <em className="text-muted-foreground">{dict.accent}</em>
          </p>
          <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
            {dict.items.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <h3 className="text-sm uppercase tracking-[0.18em] text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
