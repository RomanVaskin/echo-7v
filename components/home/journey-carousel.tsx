import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'
import { Carousel } from '@/components/site/carousel'
import { TravelCard } from '@/components/site/travel-card'

/** The home page's journey strip: travel cards in the shared carousel. */
export function JourneyCarousel({
  journeys,
  locale,
  dict,
  toolbar,
}: {
  journeys: Journey[]
  locale: Locale
  dict: Dictionary
  /** Rendered in one row with the arrows, above the strip (heading and filters). */
  toolbar?: React.ReactNode
}) {
  return (
    <Carousel
      items={journeys.map((journey) => ({
        key: journey.slug,
        node: <TravelCard journey={journey} locale={locale} dict={dict} reveal={false} />,
      }))}
      label={dict.schedule.carouselLabel}
      previousLabel={dict.schedule.previous}
      nextLabel={dict.schedule.next}
      toolbar={toolbar}
    />
  )
}
