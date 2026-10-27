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
 * Photos of the day cards, in day order (`caribbean.days.items`). `position` is the CSS
 * object-position that keeps the subject in frame when the card crops the photo (square on desktop,
 * portrait on phones). Replace a file or a path here: the component does not change.
 */
export const dayPhotos: ({ src: string; position?: string } | null)[] = [
  { src: '/images/day-01-martinique-le-marin.png', position: '50% 55%' },
  { src: '/images/day-02-saint-lucia-pitons.png', position: '50% 40%' },
  { src: '/images/day-03-saint-vincent-wallilabou.png', position: '50% 60%' },
  { src: '/images/day-04-mustique-new-year.png', position: '50% 45%' },
  { src: '/images/day-05-tobago-cays.png', position: '50% 35%' },
  { src: '/images/day-06-tobago-cays-turtle.png', position: '50% 50%' },
  { src: '/images/day-07-wallilabou-bay.png', position: '50% 60%' },
  { src: '/images/day-08-saint-lucia-pitons.png', position: '50% 40%' },
  { src: '/images/day-09-martinique-return.png', position: '50% 55%' },
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

