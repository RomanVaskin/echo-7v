import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { formatNights, type Locale } from '@/lib/i18n'
import type { Journey } from '@/lib/journeys'

export function Pricing({ journey, locale, dict, common, status }: { journey: Journey; locale: Locale; dict: Dictionary['caribbean']['pricing']; common: Dictionary['common']; status: Dictionary['status'] }) {
  const rows = [
    { label: dict.price, value: journey.pricePerPerson },
    { label: dict.departures, value: journey.dates },
    { label: dict.duration, value: journey.nights ? formatNights(locale, journey.nights) : null },
    { label: dict.availability, value: status[journey.status] },
  ]

  return (
    <section aria-labelledby="pricing-title" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
      <div className="reveal grid gap-12 border border-border p-8 md:p-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <p className="eyebrow flex items-center gap-4">
            <span className="text-primary">07</span>
            <span>{dict.eyebrow}</span>
          </p>
          <h2 id="pricing-title" className="font-display text-balance text-5xl md:text-6xl">
            {dict.titleLead} <em className="text-primary">{dict.titleAccent}</em>
          </h2>
          <p className="max-w-sm leading-relaxed text-muted-foreground">
            {dict.description}
          </p>
          <Link
            href="#enquire"
            /* Oval, in the PANTONE 437 C used by the filled buttons on the other pages */
            className="enquiry-submit group mt-2 flex w-fit items-center gap-3 rounded-full px-8 py-4 text-xs uppercase tracking-[0.14em]"
          >
            {common.registerInterest}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <dl className="flex flex-col justify-center">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-border py-5">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className={row.value ? 'font-display text-2xl md:text-3xl' : 'text-sm tracking-[0.14em] text-muted-foreground'}>
                {row.value ?? common.tba}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
