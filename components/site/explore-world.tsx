import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, localePath, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'
import { globeDestinations } from '@/lib/globe-destinations'
import { ExploreWorldClient, type WorldDestination } from './globe/explore-world-client'

/** "Explore the World": the interactive globe section at the end of the journeys page. */
export function ExploreWorld({ locale, dict, common, journeys }: { locale: Locale; dict: Dictionary['globe']; common: Dictionary['common']; journeys: Journey[] }) {
  const destinations: WorldDestination[] = globeDestinations.flatMap((destination) => {
    const journey = journeys.find((j) => j.slug === destination.journey)
    const text = dict.destinations[destination.id]
    if (!journey || !text) return []
    return [
      {
        ...destination,
        ...text,
        image: journey.image,
        duration: journey.nights ? formatNights(locale, journey.nights) : null,
        // The journey's own page; journeys without one lead to the enquiry form, as on their cards
        href: journey.href ?? localePath(locale, '/#enquire'),
      },
    ]
  })

  return <ExploreWorldClient destinations={destinations} dict={dict} durationLabel={common.duration} />
}
