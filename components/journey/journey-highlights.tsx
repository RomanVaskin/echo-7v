import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { highlightImages } from '@/lib/caribbean'

/** Five themed photo cards in one horizontal row, text over the photo; texts in the dictionaries, photos in lib/caribbean.ts. */
export function JourneyHighlights({ dict }: { dict: Dictionary['caribbean']['highlights'] }) {
  return (
    <section aria-labelledby="highlights-title" className="mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-24">
      <Carousel
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        // Half the usual gap between cards; the cards take the freed space
        stripClassName="gap-3"
        itemClassName="w-[calc(80%+0.75rem)] sm:w-[calc(46%+0.75rem)] md:w-[calc(38%+0.75rem)] lg:w-[calc(30%+0.75rem)] xl:w-[calc(26%+0.75rem)]"
        toolbar={
          <h2 id="highlights-title" className="eyebrow flex items-center gap-4">
            <span className="text-primary">02</span>
            <span>{dict.eyebrow}</span>
          </h2>
        }
        items={dict.items.map((item, i) => ({
          key: item.title,
          node: (
            // Tall photo card (taller on phones, so the text always fits); the title and text sit over a dark fade at the bottom
            <article className="relative aspect-[2/3] overflow-hidden sm:aspect-[4/5] rounded-2xl border border-border">
              <Image
                src={highlightImages[i] ?? '/placeholder.svg'}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 80vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 via-55% to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-4 pb-4 [text-shadow:0_1px_8px_rgb(0_0_0/0.35)] sm:px-6 sm:pb-5 md:px-7">
                <h3 className="font-display text-[1.625rem] tracking-[-0.03em] text-white sm:text-3xl">{item.title}</h3>
                <p className="hyphens-auto text-justify text-[0.9375rem] leading-relaxed text-white/85 sm:hyphens-manual sm:text-left">{item.text}</p>
              </div>
            </article>
          ),
        }))}
      />
    </section>
  )
}
