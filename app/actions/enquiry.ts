'use server'

import { getDictionary } from '@/lib/dictionaries'
import { deliverEnquiry } from '@/lib/enquiry-delivery'
import { defaultLocale, isLocale } from '@/lib/i18n'
import { journeySlugs } from '@/lib/journeys'

type Field = 'name' | 'contact'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
  /** Echoed back on error so the visitor does not have to retype. */
  values?: Partial<Record<Field, string>>
}

/** A phone number for WhatsApp: 7–15 digits, optional +, spaces, dashes and brackets. */
function isPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return /^\+?[\d\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15
}

/** A Telegram username (@name, name or t.me/name): 5–32 letters, digits or underscores. */
function isTelegram(value: string) {
  return /^(?:@|(?:https?:\/\/)?t\.me\/)?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value)
}

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const localeRaw = String(formData.get('locale') ?? '')
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale
  const form = getDictionary(locale).form
  const name = String(formData.get('name') ?? '').trim()
  const contact = String(formData.get('contact') ?? '').trim()
  const journeyRaw = String(formData.get('journey') ?? '').trim()
  const journey = journeySlugs.includes(journeyRaw) ? journeyRaw : 'general'

  const values = { name, contact }
  const errors: EnquiryState['errors'] = {}
  if (name.length < 2 || name.length > 100) errors.name = form.errors.name
  if (contact.length > 100 || !(isPhone(contact) || isTelegram(contact))) errors.contact = form.errors.contact

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: form.errors.review, errors, values }
  }

  // Only report success once the enquiry has actually reached the team.
  const delivered = await deliverEnquiry({ name, contact, journey, locale })
  if (!delivered) {
    return { status: 'error', message: form.errors.delivery, values }
  }

  return {
    status: 'success',
    message: form.success.replace('{name}', name.split(' ')[0]),
  }
}
