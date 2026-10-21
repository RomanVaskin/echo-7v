/**
 * Editable placeholder content for the Caribbean 9-night journey.
 * The route below is indicative and should be replaced once confirmed.
 * Day text (place, title, description), inclusions and FAQs live in the dictionaries.
 */

export type ItineraryDay = {
  day: number
  place: string
  title: string
  description: string
  coordinates: [number, number]
}

export const caribbeanCoordinates: [number, number][] = [
  [13.128, -61.196],
  [13.006, -61.243],
  [12.877, -61.188],
  [12.711, -61.33],
  [12.633, -61.355],
  [12.647, -61.389],
  [12.598, -61.414],
  [12.481, -61.476],
  [12.54, -61.384],
  [12.596, -61.42],
]
