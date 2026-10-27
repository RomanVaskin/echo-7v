/**
 * Destinations on the home page globe. Add a journey here (and its texts under `globe.destinations`
 * in the dictionaries) and it appears on the globe, in the list and in "Surprise Me" — the globe's
 * logic does not change. `journey` is the slug in lib/journeys.ts: the card takes its photo,
 * duration and page from there.
 */
export type GlobeDestination = {
  id: string
  index: string
  journey: string
  lat: number
  lon: number
}

export const globeDestinations: GlobeDestination[] = [
  { id: 'exuma', index: '01', journey: 'bahamas', lat: 24.2, lon: -76.45 },
  { id: 'martinique', index: '02', journey: 'caribbean', lat: 14.64, lon: -61.02 },
]
