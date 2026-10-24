import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import { reviews } from '@/lib/reviews'

/**
 * Guest reviews. Renders nothing until real reviews are added to lib/reviews.ts;
 * the final layout should follow the approved sketch.
 */
export function Reviews({ locale, dict }: { locale: Locale; dict: Dictionary['reviews'] }) {
  const items = reviews[locale]
  if (items.length === 0) return null

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <h2 id="reviews-title" className="eyebrow">
        {dict.title}
      </h2>
      <ul className="mt-12 grid gap-12 md:grid-cols-2">
        {items.map((review, i) => (
          <li key={i}>
            <figure className="flex flex-col gap-6">
              <blockquote className="font-display text-2xl leading-snug md:text-3xl">{review.quote}</blockquote>
              <figcaption className="text-sm text-muted-foreground">
                {review.author}
                {review.journey && ` · ${review.journey}`}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
