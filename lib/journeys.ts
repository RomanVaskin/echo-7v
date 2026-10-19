export type AvailabilityStatus = 'enquiries-open' | 'limited' | 'coming-soon' | 'fully-booked'

export type Region = 'Caribbean' | 'Mediterranean' | 'Indian Ocean'

/**
 * Only confirmed details are filled in. Leave a field as `null`
 * and the UI will render it as "TBA".
 */
export type Journey = {
  slug: string
  destination: string
  region: Region
  area: string
  image: string
  summary: string
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

export const statusLabel: Record<AvailabilityStatus, string> = {
  'enquiries-open': 'Enquiries open',
  limited: 'Limited availability',
  'coming-soon': 'Coming soon',
  'fully-booked': 'Fully booked',
}

export const journeys: Journey[] = [
  {
    slug: 'caribbean',
    destination: 'The Caribbean',
    region: 'Caribbean',
    area: 'Island-hopping voyage',
    image: '/images/caribbean-hero.png',
    summary:
      'Nine nights between quiet anchorages, turquoise lagoons and palm-fringed islands — our signature journey.',
    nights: 9,
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: null,
    status: 'enquiries-open',
    href: '/journeys/caribbean',
    featured: true,
    coordinates: [12.85, -61.3],
  },
  {
    slug: 'cyclades',
    destination: 'The Cyclades',
    region: 'Mediterranean',
    area: 'Greece',
    image: '/images/mediterranean.png',
    summary: 'Whitewashed villages, meltemi winds and long Aegean evenings.',
    nights: null,
    dates: null,
    vessel: null,
    guests: null,
    pricePerPerson: null,
    status: 'coming-soon',
    href: null,
    coordinates: [36.9, 25.2],
  },
  {
    slug: 'dalmatia',
    destination: 'Dalmatian Coast',
    region: 'Mediterranean',
    area: 'Croatia',
    image: '/images/adriatic.png',
    summary: 'Pine-scented coves and stone harbour towns along the Adriatic.',
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
    destination: 'Seychelles',
    region: 'Indian Ocean',
    area: 'Inner Islands',
    image: '/images/indian-ocean.png',
    summary: 'Granite boulders, white sand and the warm Indian Ocean.',
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

export const featuredJourney = journeys.find((j) => j.featured) ?? journeys[0]
