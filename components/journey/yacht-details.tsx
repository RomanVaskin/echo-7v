import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { Carousel } from '@/components/site/carousel'
import { caribbeanYacht } from '@/lib/caribbean'

function PhotoStrip({
  title,
  photos,
  dict,
}: {
  title: string
  photos: (string | null)[]
  dict: Dictionary['caribbean']['yacht']
}) {
  const name = `${caribbeanYacht.name} — ${title}`
  return (
    <Carousel
      label={`${dict.carouselLabel}: ${title}`}
      previousLabel={dict.previous}
      nextLabel={dict.next}
      itemClassName="w-[84%] sm:w-[56%] md:w-[44%] lg:w-[36%]"
      toolbar={<h3 className="eyebrow">{title}</h3>}
      items={photos.map((src, i) => ({
        key: `${title}-${i}`,
        node: (
          <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-foreground/[0.04]">
            {src ? (
              <Image src={src} alt={`${name} ${i + 1}`} fill draggable={false} sizes="(min-width: 1024px) 36vw, 84vw" className="object-cover" />
            ) : (
              // Neutral slot until a confirmed photo of this yacht is added in lib/caribbean.ts
              <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <ImageIcon className="size-6 stroke-1" aria-hidden="true" />
                {dict.photoPlaceholder}
              </figcaption>
            )}
          </figure>
        ),
      }))}
    />
  )
}

/** The yacht: name, a short description and swipeable photo strips of the catamaran and its cabins. */
export function YachtDetails({ dict }: { dict: Dictionary['caribbean']['yacht'] }) {
  return (
    <section aria-labelledby="yacht-title" className="mx-auto max-w-7xl px-6 pt-24 lg:px-10 lg:pt-32">
      <div className="reveal flex flex-col gap-6 border-t border-border pt-8">
        <p className="eyebrow flex items-center gap-4">
          <span className="text-primary">06</span>
          <span>{dict.eyebrow}</span>
        </p>
        <h2 id="yacht-title" className="font-display text-balance text-5xl md:text-7xl">
          {caribbeanYacht.name} <span className="whitespace-nowrap text-primary">· {caribbeanYacht.year}</span>
        </h2>
        <p className="max-w-xl leading-relaxed text-muted-foreground">{dict.description}</p>
      </div>
      <div className="mt-14 flex flex-col gap-16">
        <PhotoStrip title={dict.exteriorTitle} photos={caribbeanYacht.exteriorPhotos} dict={dict} />
        <PhotoStrip title={dict.cabinsTitle} photos={caribbeanYacht.cabinPhotos} dict={dict} />
      </div>
    </section>
  )
}
