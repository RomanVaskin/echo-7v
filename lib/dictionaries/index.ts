import { en } from './en'
import { ru } from './ru'
import type { Locale } from '@/lib/i18n'

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T

export type Dictionary = Widen<typeof en>

const dictionaries: Record<Locale, Dictionary> = { en, ru }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
