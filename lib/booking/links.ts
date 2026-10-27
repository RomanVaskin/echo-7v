import { localePath, type Locale } from '@/lib/i18n'

/** Path of the guest's booking page (secret token in the query). */
export const bookingPagePath = (locale: Locale, id: string, token: string) =>
  `${localePath(locale, '/journeys/caribbean/book/order')}?id=${id}&t=${token}`

/** A YYYY-MM-DD date in words, e.g. "28 November 2026" / "28 ноября 2026 г.". */
export const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
