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
 * Photos of the day cards, in day order (`caribbean.days.items`). Temporary shots from the site
 * matched to each stop's mood (the same place keeps the same photo); `null` shows a neutral slot
 * until a photo of that location is added. Replace a path here: the component does not change.
 */
export const dayPhotos: (string | null)[] = [
  '/images/caribbean-hero.png', // 1 Martinique · Le Marin
  null, // 2 Saint Lucia · Rodney Bay and The Pitons
  '/images/hero-sailing.png', // 3 Saint Vincent · Wallilabou Bay (the passage)
  '/images/gallery-deck.png', // 4 Mustique · New Year's Eve
  '/images/gallery-helm.png', // 5 Mustique → Tobago Cays (the passage)
  '/images/gallery-reef.png', // 6 Tobago Cays
  '/images/hero-sailing.png', // 7 Saint Vincent · Wallilabou Bay
  null, // 8 Saint Lucia · The Pitons
  '/images/caribbean-hero.png', // 9 Martinique · Le Marin
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

