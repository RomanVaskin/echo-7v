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

/**
 * Photos of the day cards, in day order (`caribbean.days.items`). Temporary Caribbean shots from the
 * site; `null` shows a neutral slot. Replace with photos of each day's location when available.
 */
export const dayPhotos: (string | null)[] = [
  '/images/caribbean-hero.png',
  '/images/gallery-reef.png',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
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

