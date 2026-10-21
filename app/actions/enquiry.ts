'use server'

import { getDictionary } from '@/lib/dictionaries'
import { defaultLocale, isLocale } from '@/lib/i18n'
import { journeySlugs } from '@/lib/journeys'

type Field = 'name' | 'email' | 'journey' | 'guests' | 'message'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const localeRaw = String(formData.get('locale') ?? '')
  const form = getDictionary(isLocale(localeRaw) ? localeRaw : defaultLocale).form
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const journey = String(formData.get('journey') ?? '').trim()
  const guestsRaw = String(formData.get('guests') ?? '').trim()
  const timing = String(formData.get('timing') ?? '').trim().slice(0, 120)
  const message = String(formData.get('message') ?? '').trim()

  const errors: EnquiryState['errors'] = {}
  if (name.length < 2 || name.length > 100) errors.name = form.errors.name
  if (!EMAIL_PATTERN.test(email) || email.length > 200) errors.email = form.errors.email
  if (!journeySlugs.includes(journey) && journey !== 'general') errors.journey = form.errors.journey
  const guests = Number(guestsRaw)
  if (!Number.isInteger(guests) || guests < 1 || guests > 12) errors.guests = form.errors.guests
  if (message.length > 2000) errors.message = form.errors.message

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: form.errors.review, errors }
  }

  // Enquiries are validated here; connect a database or email provider to store and deliver them.
  console.log('[seasemates] enquiry received', { journey, guests, timing, hasMessage: message.length > 0 })

  return {
    status: 'success',
    message: form.success.replace('{name}', name.split(' ')[0]),
  }
}
