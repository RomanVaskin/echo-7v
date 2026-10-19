import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { type Journey, statusLabel } from '@/lib/journeys'

export function Pricing({ journey }: { journey: Journey }) {
  const rows = [
    { label: 'Price per person', value: journey.pricePerPerson },
    { label: 'Departure dates', value: journey.dates },
    { label: 'Duration', value: journey.nights ? `${journey.nights} nights` : null },
    { label: 'Availability', value: statusLabel[journey.status] },
  ]

  return (
    <section aria-labelledby="pricing-title" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-36">
      <div className="reveal grid gap-12 border border-border p-8 md:p-14 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-6">
          <p className="eyebrow flex items-center gap-4">
            <span className="text-primary">07</span>
            <span>Price & availability</span>
          </p>
          <h2 id="pricing-title" className="font-display text-balance text-5xl md:text-6xl">
            Reserve your <em className="text-primary">place on board.</em>
          </h2>
          <p className="max-w-sm leading-relaxed text-muted-foreground">
            Pricing and departure dates will be announced shortly. Register your interest now to be among the first
            to hear.
          </p>
          <Link
            href="#enquire"
            className="group mt-2 flex w-fit items-center gap-3 bg-primary px-8 py-4 text-xs uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Register interest
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <dl className="flex flex-col justify-center">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-border py-5">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className={row.value ? 'font-display text-2xl md:text-3xl' : 'text-sm tracking-[0.2em] text-muted-foreground'}>
                {row.value ?? 'TBA'}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
