'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { submitBooking, type BookingState } from '@/app/actions/booking'
import { LiquidGlassAction } from '@/components/site/liquid-glass-button'
import type { Dictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'
import { cabinOptionImages, formatUsd, type CabinOptionId } from '@/lib/booking/voyage'
import { cn } from '@/lib/utils'

export type OptionView = {
  id: CabinOptionId
  title: string
  description: string
  guests: string
  berths: string
  guestCount: 1 | 2
  listCents: number
  totalCents: number
  savingCents: number
  depositCents: number
  balanceCents: number
  available: boolean
}

type Dict = Dictionary['booking']

const inputClass =
  'w-full border-0 border-b border-input bg-transparent px-0 py-2.5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none focus:ring-0 transition-colors aria-[invalid=true]:border-destructive'

function Steps({ dict, current }: { dict: Dict; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {dict.steps.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? 'step' : undefined}
          className={cn('eyebrow flex items-center gap-2', i === current ? 'text-foreground' : 'text-muted-foreground/70')}
        >
          <span className={i <= current ? 'text-primary' : undefined}>0{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}

/** Order summary: updates with the chosen accommodation. Amounts are display only; the server recomputes them. */
function Summary({ dict, option, dueDate, compact = false }: { dict: Dict; option: OptionView; dueDate: string; compact?: boolean }) {
  const s = dict.summary
  const row = 'flex items-baseline justify-between gap-4 border-b border-border py-3'
  return (
    <div className={cn('rounded-2xl border border-border bg-white/40', compact ? 'p-5' : 'p-6 md:p-7')}>
      {!compact && <p className="eyebrow mb-3">{s.title}</p>}
      <dl className="text-sm">
        <div className={row}>
          <dt className="text-muted-foreground">{s.accommodation}</dt>
          <dd className="text-right">{option.title}</dd>
        </div>
        <div className={row}>
          <dt className="text-muted-foreground">{s.guests}</dt>
          <dd>{option.guests}</dd>
        </div>
        <div className={cn(row, 'py-4')}>
          <dt className="text-muted-foreground">{s.total}</dt>
          <dd className="font-display text-3xl font-semibold tracking-[-0.02em] text-primary">{formatUsd(option.totalCents)}</dd>
        </div>
        <div className={row}>
          <dt>{s.deposit}</dt>
          <dd className="text-base">{formatUsd(option.depositCents)}</dd>
        </div>
        <div className={cn(row, 'border-b-0')}>
          <dt className="text-muted-foreground">{s.balance}</dt>
          <dd className="text-muted-foreground">{formatUsd(option.balanceCents)}</dd>
        </div>
      </dl>
      {!compact && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{s.balanceNote.replace('{date}', dueDate)}</p>}
    </div>
  )
}

function OptionCard({ dict, option, selected, onSelect }: { dict: Dict; option: OptionView; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!option.available}
      onClick={onSelect}
      className={cn(
        'group flex w-full flex-col gap-5 rounded-2xl border p-6 text-left transition-colors md:flex-row md:items-center md:justify-between md:gap-8 md:p-7',
        selected ? 'border-primary bg-white/70' : 'border-border bg-white/40 hover:border-foreground/35',
        !option.available && 'cursor-not-allowed opacity-50 hover:border-border',
      )}
    >
      {/* Phones: radio and photo on top, text below; wider screens: one row */}
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-4 gap-y-4 md:grid-cols-[1.25rem_auto_minmax(0,1fr)] md:items-start">
        <span
          aria-hidden="true"
          className={cn(
            'mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/40',
          )}
        >
          {selected && <Check className="size-3" strokeWidth={2.5} />}
        </span>
        {/* Cabin photo */}
        <span className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-border md:h-24 md:w-28">
          <Image src={cabinOptionImages[option.id]} alt="" fill sizes="128px" className="object-cover" />
        </span>
        <span className="col-start-2 flex min-w-0 flex-col gap-2 md:col-start-3">
          <span className="font-display text-2xl tracking-[-0.02em] md:text-[1.75rem]">{option.title}</span>
          <span className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">{option.description}</span>
          <span className="eyebrow mt-1">
            {option.guests} · {option.berths}
            {!option.available && <span className="ml-3 text-destructive">{dict.soldOut}</span>}
          </span>
        </span>
      </div>
      <span className="flex shrink-0 flex-col items-start gap-1.5 pl-9 md:items-end md:pl-0">
        {option.savingCents > 0 && (
          <span className="flex items-center gap-3">
            <span className="rounded-full border border-primary px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
              {dict.save}
            </span>
            <s className="text-sm text-muted-foreground">{formatUsd(option.listCents)}</s>
          </span>
        )}
        <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-primary md:text-4xl">
          {formatUsd(option.totalCents)}
        </span>
        {option.savingCents > 0 && (
          <span className="text-xs text-muted-foreground">{dict.youSave.replace('{amount}', formatUsd(option.savingCents))}</span>
        )}
      </span>
    </button>
  )
}

function Field({
  name,
  label,
  error,
  defaultValue,
  ...props
}: { name: string; label: string; error?: string; defaultValue?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass}
        {...props}
      />
      {error && (
        <span id={`${name}-error`} className="text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  )
}

const initialState: BookingState = { status: 'idle' }

export function BookingFlow({
  locale,
  dict,
  options,
  freeCabins,
  dueDate,
  notice,
}: {
  locale: Locale
  dict: Dict
  options: OptionView[]
  /** null while availability is unknown (no database). */
  freeCabins: number | null
  dueDate: string
  /** Shown instead of payment when online booking is not possible. */
  notice?: string
}) {
  const router = useRouter()
  const top = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<0 | 1>(0)
  const [optionId, setOptionId] = useState<CabinOptionId>(() => (options.find((o) => o.available) ?? options[0]).id)
  const [state, formAction, pending] = useActionState(submitBooking, initialState)
  const option = options.find((o) => o.id === optionId)!
  const f = dict.form

  // Sold out while the guest was filling the form: refresh availability and go back to the choice
  useEffect(() => {
    if (state.unavailable) {
      router.refresh()
      setStep(0)
    }
  }, [state, router])

  const go = (next: 0 | 1) => {
    setStep(next)
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const v = state.values ?? {}
  const e = state.errors ?? {}

  return (
    <div ref={top} className="scroll-mt-28">
      <Steps dict={dict} current={step} />

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        {step === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl md:text-4xl">{dict.chooseTitle}</h2>
              {freeCabins !== null && <p className="eyebrow">{dict.cabinsLeft.replace('{free}', String(freeCabins))}</p>}
            </div>
            {state.unavailable && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}
            <div role="radiogroup" aria-label={dict.chooseLabel} className="flex flex-col gap-4">
              {options.map((o) => (
                <OptionCard key={o.id} dict={dict} option={o} selected={o.id === optionId} onSelect={() => setOptionId(o.id)} />
              ))}
            </div>
          </div>
        ) : (
          <form key={JSON.stringify(state.values ?? {})} action={formAction} className="flex flex-col gap-8" noValidate>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="option" value={option.id} />
            <button
              type="button"
              onClick={() => go(0)}
              className="flex w-fit items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              {dict.back}
            </button>
            <h2 className="font-display text-3xl md:text-4xl">{dict.detailsTitle}</h2>

            <fieldset className="flex flex-col gap-6">
              {option.guestCount === 2 && <legend className="eyebrow mb-6 text-foreground">{f.lead}</legend>}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field name="firstName" label={f.firstName} autoComplete="given-name" required maxLength={60} defaultValue={v.firstName} error={e.firstName} />
                <Field name="lastName" label={f.lastName} autoComplete="family-name" required maxLength={60} defaultValue={v.lastName} error={e.lastName} />
                <Field name="email" label={f.email} type="email" autoComplete="email" required maxLength={120} defaultValue={v.email} error={e.email} />
                <Field name="phone" label={f.phone} type="tel" autoComplete="tel" required maxLength={30} defaultValue={v.phone} error={e.phone} />
                <Field name="country" label={f.country} autoComplete="country-name" required maxLength={60} defaultValue={v.country} error={e.country} />
              </div>
            </fieldset>

            {option.guestCount === 2 && (
              <fieldset className="flex flex-col gap-6 border-t border-border pt-8">
                <legend className="eyebrow mb-6 text-foreground">{f.second}</legend>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field name="guest2FirstName" label={f.firstName} required maxLength={60} defaultValue={v.guest2FirstName} error={e.guest2FirstName} />
                  <Field name="guest2LastName" label={f.lastName} required maxLength={60} defaultValue={v.guest2LastName} error={e.guest2LastName} />
                  <Field name="guest2Email" label={f.emailOptional} type="email" maxLength={120} defaultValue={v.guest2Email} error={e.guest2Email} />
                </div>
              </fieldset>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{f.requests}</span>
              <textarea name="requests" rows={3} maxLength={1000} defaultValue={v.requests} className={cn(inputClass, 'resize-y')} />
            </label>

            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                name="consent"
                required
                aria-invalid={Boolean(e.consent)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                {f.consent}
                {e.consent && <span className="mt-1 block text-xs text-destructive">{e.consent}</span>}
              </span>
            </label>

            {/* Phones: a compact summary right above the payment button */}
            <div className="lg:hidden">
              <Summary dict={dict} option={option} dueDate={dueDate} compact />
            </div>

            {state.status === 'error' && !state.unavailable && state.message && (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            )}

            {notice && (
              <p role="status" className="rounded-xl border border-primary/50 px-4 py-3 text-sm leading-relaxed text-primary">
                {notice}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <LiquidGlassAction type="submit" disabled={pending || Boolean(notice)} className="liquid-glass--block sm:max-w-sm">
                {pending ? f.paying : f.pay.replace('{amount}', formatUsd(option.depositCents))}
              </LiquidGlassAction>
              <p className="text-xs text-muted-foreground">{f.secure}</p>
            </div>
          </form>
        )}

        <aside className={cn('flex flex-col gap-5 self-start lg:sticky lg:top-28', step === 1 && 'hidden lg:flex')}>
          <Summary dict={dict} option={option} dueDate={dueDate} />
          {step === 0 && (
            <LiquidGlassAction type="button" onClick={() => go(1)} disabled={!option.available} className="liquid-glass--block">
              {dict.continue}
            </LiquidGlassAction>
          )}
        </aside>
      </div>
    </div>
  )
}
