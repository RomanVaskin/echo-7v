import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { highlightImages } from '@/lib/caribbean'

/** Five themed cards in one horizontal row; texts in the dictionaries, photos in lib/caribbean.ts. */
export function JourneyHighlights({ dict }: { dict: Dictionary['caribbean']['highlights'] }) {
  return (
    <section aria-labelledby="highlights-title" className="mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-24">
      <Carousel
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        itemClassName="w-[80%] sm:w-[46%] md:w-[38%] lg:w-[30%] xl:w-[26%]"
        toolbar={
          <h2 id="highlights-title" className="eyebrow flex items-center gap-4">
            <span className="text-primary">02</span>
            <span>{dict.eyebrow}</span>
          </h2>
        }
        items={dict.items.map((item, i) => ({
          key: item.title,
          node: (
            <article className="flex flex-col overflow-hidden rounded-2xl border border-border">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={highlightImages[i] ?? '/placeholder.svg'}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 80vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
                <h3 className="font-display text-3xl tracking-[-0.03em]">{item.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </article>
          ),
        }))}
      />
    </section>
  )
}
