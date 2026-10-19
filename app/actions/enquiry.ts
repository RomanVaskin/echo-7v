'use server'

import { journeys } from '@/lib/journeys'

type Field = 'name' | 'email' | 'journey' | 'guests' | 'message'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<Field, string>>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const journey = String(formData.get('journey') ?? '').trim()
  const guestsRaw = String(formData.get('guests') ?? '').trim()
  const timing = String(formData.get('timing') ?? '').trim().slice(0, 120)
  const message = String(formData.get('message') ?? '').trim()

  const errors: EnquiryState['errors'] = {}
  if (name.length < 2 || name.length > 100) errors.name = 'Please enter your full name.'
  if (!EMAIL_PATTERN.test(email) || email.length > 200) errors.email = 'Please enter a valid email address.'
  if (!journeys.some((j) => j.slug === journey) && journey !== 'general') errors.journey = 'Please choose a journey.'
  const guests = Number(guestsRaw)
  if (!Number.isInteger(guests) || guests < 1 || guests > 12) errors.guests = 'Please enter between 1 and 12 guests.'
  if (message.length > 2000) errors.message = 'Please keep your message under 2000 characters.'

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please review the highlighted fields.', errors }
  }

  // Enquiries are validated here; connect a database or email provider to store and deliver them.
  console.log('[seasemates] enquiry received', { journey, guests, timing, hasMessage: message.length > 0 })

  return {
    status: 'success',
    message: `Thank you, ${name.split(' ')[0]}. A member of our team will be in touch personally.`,
  }
}
