import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { dayPhotos } from '@/lib/caribbean'

/**
 * One tall card per day ("Day 01"…), styled as a page of a travel journal: a narrow left strip with
 * four punched holes, then the photo and the day's text. Two and a half cards on desktop, about 1.6
 * on tablets, one card and the edge of the next on phones; the shared carousel scrolls them.
 */
export function DayByDay({ dict }: { dict: Dictionary['caribbean']['days'] }) {
  return (
    <section aria-labelledby="days-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <Carousel
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        /* Phones: one card and ~15% of the next; tablets: about 1.6 cards; desktop: two and a half up to the
           strip's right edge (its 2.5rem end padding included, hence 100% - 0.5rem) */
        itemClassName="w-[85%] sm:w-[calc((100%-1.5rem)/1.6)] lg:w-[calc((100%-0.5rem)/2.5)]"
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
        items={dict.items.map((item, i) => {
          const photo = dayPhotos[i]
          return {
            key: `day-${i + 1}`,
            node: (
              <article className="journal-page flex rounded-2xl border border-border">
                {/* Binding strip: four evenly spaced punched holes and a faint fold line */}
                <div
                  aria-hidden="true"
                  className="flex w-9 shrink-0 flex-col items-center justify-evenly border-r border-foreground/[0.07] py-8 md:w-10"
                >
                  {[0, 1, 2, 3].map((hole) => (
                    <span key={hole} className="journal-hole" />
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-5 pl-4 md:p-6 md:pl-5">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-foreground/[0.04] sm:aspect-[5/6] lg:aspect-square">
                    {photo ? (
                      <Image
                        src={photo.src}
                        alt={item.place}
                        fill
                        draggable={false}
                        sizes="(min-width: 1280px) 400px, (min-width: 1024px) 34vw, (min-width: 640px) 55vw, 75vw"
                        className="object-cover"
                        style={{ objectPosition: photo.position }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <ImageIcon className="size-6 stroke-1" aria-hidden="true" />
                        {dict.photoPlaceholder}
                      </div>
                    )}
                  </div>
                  {/* Day, date, place and programme; the reserved height keeps the photo at roughly 55–60% of the page */}
                  <div className="mt-6 flex flex-col sm:min-h-[15rem]">
                    <p className="eyebrow flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-primary">
                        {dict.day} {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item.date}</span>
                    </p>
                    <h3 className="mt-3 text-balance hyphens-auto break-words font-display text-[1.75rem] leading-[1.12] tracking-[-0.03em] md:text-[2rem]">
                      {item.place}
                    </h3>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              </article>
            ),
          }
        })}
      />
    </section>
  )
}
