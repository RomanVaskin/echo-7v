import type { Locale } from '@/lib/i18n'

export type Review = {
  quote: string
  author: string
  /** e.g. "The Caribbean, 2026" */
  journey?: string
}

/**
 * Real guest reviews only. The reviews section stays hidden while a locale has none.
 */
export const reviews: Record<Locale, Review[]> = {
  en: [],
  ru: [],
}
