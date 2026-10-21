export const locales = ['en', 'ru'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seasmates.com'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * English is served without a prefix (`/journeys/caribbean`), Russian lives under `/ru`.
 * `path` may carry a hash, e.g. `/#schedule` -> `/ru#schedule`.
 */
export function localePath(locale: Locale, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return normalized
  return normalized === '/' ? '/ru' : normalized.startsWith('/#') ? `/ru${normalized.slice(1)}` : `/ru${normalized}`
}

export function alternates(locale: Locale, path = '/') {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath('en', path),
      ru: localePath('ru', path),
      'x-default': localePath('en', path),
    },
  }
}

const nightForms: Record<Locale, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  en: { one: 'night', other: 'nights' },
  ru: { one: 'ночь', few: 'ночи', many: 'ночей', other: 'ночи' },
}

export function formatNights(locale: Locale, count: number) {
  const form = new Intl.PluralRules(locale).select(count)
  return `${count} ${nightForms[locale][form] ?? nightForms[locale].other}`
}
