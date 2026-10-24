'use client'

import { useActionState } from 'react'
import { ArrowRight } from 'lucide-react'
import { submitEnquiry, type EnquiryState } from '@/app/actions/enquiry'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

const initialState: EnquiryState = { status: 'idle' }

const inputClass =
  'w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none focus:ring-0 transition-colors'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  )
}

type EnquiryFormProps = {
  /** Journey the enquiry is about, sent along for context; "general" on the home page. */
  journey?: string
  locale: Locale
  dict: Dictionary['form']
}

export function EnquiryForm({ journey = 'general', locale, dict }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState)

  if (state.status === 'success') {
    return (
      <div role="status" className="flex flex-col gap-3 py-2">
        <p className="eyebrow">{dict.received}</p>
        <p className="font-display text-3xl text-balance">{state.message}</p>
      </div>
    )
  }

  return (
    // The key remounts the fields after a failed attempt so they show the values sent back by the server.
    <form key={state.values ? JSON.stringify(state.values) : 'empty'} action={formAction} className="flex w-full flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="journey" value={journey} />

      <div className="flex flex-col gap-1">
        <input
          name="name"
          placeholder={dict.name}
          aria-label={dict.name}
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={state.values?.name}
          className={inputClass}
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby="name-error"
        />
        <FieldError id="name-error" message={state.errors?.name} />
      </div>

      <div className="flex flex-col gap-1">
        <input
          name="contact"
          placeholder={dict.contact}
          aria-label={dict.contact}
          autoComplete="tel"
          required
          maxLength={100}
          defaultValue={state.values?.contact}
          className={inputClass}
          aria-invalid={Boolean(state.errors?.contact)}
          aria-describedby="contact-error"
        />
        <FieldError id="contact-error" message={state.errors?.contact} />
      </div>

      {state.status === 'error' && state.message && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="enquiry-submit group mt-2 flex w-full items-center justify-center gap-3 px-8 py-4 text-xs uppercase tracking-[0.14em] disabled:opacity-60"
      >
        {pending ? dict.sending : dict.send}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </form>
  )
}
