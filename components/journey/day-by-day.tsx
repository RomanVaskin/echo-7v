import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'

/** One text card per day ("Day 01"…), in one horizontal row. */
export function DayByDay({ dict }: { dict: Dictionary['caribbean']['days'] }) {
  return (
    <section aria-labelledby="days-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <Carousel
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        itemClassName="w-[78%] sm:w-[44%] md:w-[34%] lg:w-[27%] xl:w-[23%]"
        toolbar={
          <div className="flex flex-col gap-5">
            <p className="eyebrow flex items-center gap-4">
              <span className="text-primary">04</span>
              <span>{dict.eyebrow}</span>
            </p>
            <h2 id="days-title" className="font-display text-balance text-4xl md:text-6xl">
              {dict.title}
            </h2>
          </div>
        }
        items={dict.items.map((item, i) => ({
          key: `day-${i + 1}`,
          node: (
            <article className="flex flex-col gap-4 rounded-2xl border border-border bg-foreground/[0.04] p-6 md:p-7">
              <p className="eyebrow text-primary">
                {dict.day} {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display text-3xl tracking-[-0.03em]">{item.place}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</p>
              {item.activity && (
                <p className="mt-auto border-t border-border pt-4 text-xs uppercase tracking-[0.14em] text-foreground/70">
                  {item.activity}
                </p>
              )}
            </article>
          ),
        }))}
      />
    </section>
  )
}
