import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'

export type AvailabilityStatus = 'enquiries-open' | 'limited' | 'coming-soon' | 'fully-booked'

export type Region = 'Caribbean' | 'Mediterranean' | 'Indian Ocean'

/**
 * Only confirmed details are filled in. Leave a field as `null`
 * and the UI will render it as "TBA".
 * Translatable text (destination, area, summary) lives in the dictionaries.
 */
type JourneyBase = {
  slug: string
  region: Region
  image: string
  nights: number | null
  dates: string | null
  vessel: string | null
  guests: string | null
  pricePerPerson: string | null
  status: AvailabilityStatus
  href: string | null
  featured?: boolean
  coordinates: [number, number]
}

export type Journey = JourneyBase & {
  destination: string
  regionLabel: string
  area: string
  summary: string
  /** Card title when it differs from the destination name. */
  cardTitle?: string
  /** Short headline above the card's description. */
  cardLead?: string
  /** Short description shown on the journey card; only set for journeys with a confirmed programme. */
  tagline?: string
}

const journeysBase: JourneyBase[] = [
  {
    slug: 'caribbean',
    region: 'Caribbean',
    image: '/images/caribbean-hero.png',
    nights: 10,
    // Localised dates live in the dictionaries (journeys.<slug>.dates).
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: '$4,200',
    status: 'enquiries-open',
    href: '/journeys/caribbean',
    featured: true,
    coordinates: [12.85, -61.3],
  },
  {
    slug: 'bahamas',
    region: 'Caribbean',
    // Temporary: the site's turquoise-lagoon shot until a photo of the Exumas is added
    image: '/images/gallery-reef.png',
    nights: null,
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: null,
    status: 'coming-soon',
    href: null,
    coordinates: [24.2, -76.4],
  },
  {
    slug: 'dalmatia',
    region: 'Mediterranean',
    image: '/images/adriatic.png',
    nights: null,
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: null,
    status: 'coming-soon',
    href: null,
    coordinates: [43.3, 16.4],
  },
  {
    slug: 'seychelles',
    region: 'Indian Ocean',
    image: '/images/indian-ocean.png',
    nights: null,
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: null,
    status: 'coming-soon',
    href: null,
    coordinates: [-4.4, 55.6],
  },
]

export const regions: Region[] = ['Caribbean', 'Mediterranean', 'Indian Ocean']

export const journeySlugs = journeysBase.map((j) => j.slug)

export function getJourneys(locale: Locale, dict: Dictionary): Journey[] {
  return journeysBase.map((journey) => ({
    ...journey,
    ...dict.journeys[journey.slug],
    regionLabel: dict.regions[journey.region],
    href: journey.href ? localePath(locale, journey.href) : null,
  }))
}

export function getFeaturedJourney(journeys: Journey[]) {
  return journeys.find((j) => j.featured) ?? journeys[0]
}
