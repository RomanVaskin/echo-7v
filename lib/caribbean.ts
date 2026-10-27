/**
 * Editable media and data for the Caribbean New Year journey page. Texts live in the dictionaries
 * (`caribbean.*`); this file holds what is the same in both languages.
 */

/** Photos of the five highlight cards, in the order of `caribbean.highlights.items`. Temporary themed shots. */
export const highlightImages = [
  '/images/gallery-deck.png',
  '/images/caribbean-hero.png',
  '/images/gallery-reef.png',
  '/images/gallery-helm.png',
  '/images/hero-sailing.png',
]

/** The route map shown in the map section (section 03). Set to `null` to show the text placeholder. */
export const routeMapImage: { src: string; width: number; height: number } | null = {
  src: '/images/caribbean-route-map.jpg',
  width: 1341,
  height: 971,
}

/**
 * Anchorages drawn on the route map image (public/images/caribbean-route-map.jpg), as the centre of
 * each printed dot in % of the image. Only the ones the day cards point to are listed; the image
 * keeps all of its stops.
 */
export const routeMapPoints = {
  'le-marin': { x: 24.27, y: 19.36 },
  pitons: { x: 42.15, y: 43.25 },
  wallilabou: { x: 49.94, y: 60.1 },
  mustique: { x: 54.65, y: 73.8 },
  'tobago-cays': { x: 48.79, y: 84.2 },
} as const

export type RouteDay = {
  /** 1–9: links a day card to its marker on the map. */
  dayId: number
  /** Where the day ends; a day with a passage (e.g. Mustique → Tobago Cays) points to its destination. */
  mapPoint: keyof typeof routeMapPoints
  /** `position` is the CSS object-position that keeps the subject in frame when the card crops the photo. */
  photo: { src: string; position?: string } | null
}

/**
 * The nine days of the route, in order: the single source for the day cards and the map markers.
 * Texts (place, date, description) are in the dictionaries, `caribbean.days.items`, in the same order.
 */
export const routeDays: RouteDay[] = [
  { dayId: 1, mapPoint: 'le-marin', photo: { src: '/images/day-01-martinique-le-marin.png', position: '50% 55%' } },
  { dayId: 2, mapPoint: 'pitons', photo: { src: '/images/day-02-saint-lucia-pitons.png', position: '50% 40%' } },
  { dayId: 3, mapPoint: 'wallilabou', photo: { src: '/images/day-03-saint-vincent-wallilabou.png', position: '50% 60%' } },
  { dayId: 4, mapPoint: 'mustique', photo: { src: '/images/day-04-mustique-new-year.png', position: '50% 45%' } },
  { dayId: 5, mapPoint: 'tobago-cays', photo: { src: '/images/day-05-tobago-cays.png', position: '50% 35%' } },
  { dayId: 6, mapPoint: 'tobago-cays', photo: { src: '/images/day-06-tobago-cays-turtle.png', position: '50% 50%' } },
  { dayId: 7, mapPoint: 'wallilabou', photo: { src: '/images/day-07-wallilabou-bay.png', position: '50% 60%' } },
  { dayId: 8, mapPoint: 'pitons', photo: { src: '/images/day-08-saint-lucia-pitons.png', position: '50% 40%' } },
  { dayId: 9, mapPoint: 'le-marin', photo: { src: '/images/day-09-martinique-return.png', position: '50% 55%' } },
]

/**
 * The yacht, as named by the client. Photo slots stay empty (neutral placeholders) until confirmed
 * photos of this very yacht are added: put a `/images/...` path in place of `null`.
 */
export const caribbeanYacht = {
  name: 'Lagoon 450 SporTop Toja',
  year: '2018',
  exteriorPhotos: [null, null, null, null] as (string | null)[],
  cabinPhotos: [null, null, null] as (string | null)[],
}

