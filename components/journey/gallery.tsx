import Image from 'next/image'
import type { Dictionary } from '@/lib/dictionaries'

const images = [
  { src: '/images/gallery-deck.png', className: 'md:col-span-2 md:row-span-2' },
  { src: '/images/gallery-reef.png', className: '' },
  { src: '/images/gallery-helm.png', className: '' },
]

export function Gallery({ dict }: { dict: Dictionary['caribbean']['gallery'] }) {
  return (
    <section aria-labelledby="gallery-title" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
      <div className="reveal mb-10 flex items-end justify-between border-t border-border pt-8">
        <p className="eyebrow flex items-center gap-4">
          <span className="text-primary">06</span>
          <span id="gallery-title">{dict.eyebrow}</span>
        </p>
      </div>
      <div className="grid auto-rows-[260px] gap-4 md:grid-cols-3 md:auto-rows-[300px]">
        {images.map((image, i) => (
          <figure key={image.src} className={`reveal group relative overflow-hidden ${image.className}`}>
            <Image
              src={image.src || '/placeholder.svg'}
              alt={dict.images[i]}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
