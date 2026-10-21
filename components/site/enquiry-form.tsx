'use client'

import { useActionState } from 'react'
import { ArrowRight } from 'lucide-react'
import { submitEnquiry, type EnquiryState } from '@/app/actions/enquiry'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const initialState: EnquiryState = { status: 'idle' }

const inputClass =
  'w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-0 transition-colors'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  )
}

type EnquiryFormProps = {
  defaultJourney?: string
  locale: Locale
  dict: Dictionary['form']
  journeyOptions: { slug: string; label: string }[]
}

export function EnquiryForm({ defaultJourney = 'caribbean', locale, dict, journeyOptions }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState)

  if (state.status === 'success') {
    return (
      <div role="status" className="flex flex-col gap-4 border border-primary/40 p-10">
        <p className="eyebrow text-primary">{dict.received}</p>
        <p className="font-display text-3xl text-balance">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="grid gap-8 md:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="eyebrow">
          {dict.name}
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          className={inputClass}
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby="name-error"
        />
        <FieldError id="name-error" message={state.errors?.name} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="eyebrow">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby="email-error"
        />
        <FieldError id="email-error" message={state.errors?.email} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="journey" className="eyebrow">
          {dict.journey}
        </label>
        <select
          id="journey"
          name="journey"
          defaultValue={defaultJourney}
          className={cn(inputClass, 'appearance-none [&>option]:bg-background')}
          aria-invalid={Boolean(state.errors?.journey)}
          aria-describedby="journey-error"
        >
          {journeyOptions.map((j) => (
            <option key={j.slug} value={j.slug}>
              {j.label}
            </option>
          ))}
          <option value="general">{dict.general}</option>
        </select>
        <FieldError id="journey-error" message={state.errors?.journey} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="guests" className="eyebrow">
          {dict.guests}
        </label>
        <input
          id="guests"
          name="guests"
          type="number"
          min={1}
          max={12}
          defaultValue={2}
          inputMode="numeric"
          className={inputClass}
          aria-invalid={Boolean(state.errors?.guests)}
          aria-describedby="guests-error"
        />
        <FieldError id="guests-error" message={state.errors?.guests} />
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <label htmlFor="timing" className="eyebrow">
          {dict.timing}
        </label>
        <input id="timing" name="timing" placeholder={dict.timingPlaceholder} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <label htmlFor="message" className="eyebrow">
          {dict.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={dict.messagePlaceholder}
          className={cn(inputClass, 'resize-none')}
          aria-invalid={Boolean(state.errors?.message)}
          aria-describedby="message-error"
        />
        <FieldError id="message-error" message={state.errors?.message} />
      </div>

      <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {state.status === 'error' ? state.message : dict.reassurance}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="group flex items-center justify-center gap-3 bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? dict.sending : dict.send}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
