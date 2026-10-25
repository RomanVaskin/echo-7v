import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { dayPhotos } from '@/lib/caribbean'

/**
 * One tall card per day ("Day 01"…), styled as a page of a travel journal: a narrow left strip with
 * four punched holes, then the photo and the day's text. Three cards on desktop, two on tablets, one
 * on phones; the shared carousel scrolls them.
 */
export function DayByDay({ dict }: { dict: Dictionary['caribbean']['days'] }) {
  return (
    <section aria-labelledby="days-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
      <Carousel
        label={dict.carouselLabel}
        previousLabel={dict.previous}
        nextLabel={dict.next}
        itemClassName="w-[88%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
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
              <article className="flex rounded-2xl border border-border bg-foreground/[0.04]">
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
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-foreground/[0.04] xl:aspect-[10/11]">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={item.place}
                        fill
                        draggable={false}
                        sizes="(min-width: 1024px) 26vw, (min-width: 640px) 42vw, 80vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <ImageIcon className="size-6 stroke-1" aria-hidden="true" />
                        {dict.photoPlaceholder}
                      </div>
                    )}
                  </div>
                  <p className="eyebrow mt-6 text-primary">
                    {dict.day} {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 font-display text-3xl tracking-[-0.03em] md:text-[2.125rem]">{item.place}</h3>
                  <p className="mb-6 mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.text}</p>
                  {item.activity && (
                    <p className="mt-auto border-t border-border pt-4 text-xs uppercase tracking-[0.14em] text-foreground/70">
                      {item.activity}
                    </p>
                  )}
                </div>
              </article>
            ),
          }
        })}
      />
    </section>
  )
}
