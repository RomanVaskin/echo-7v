import type { Dictionary } from '@/lib/dictionaries'
import { SectionHeading } from './section-heading'

export function HowItWorks({ dict }: { dict: Dictionary['howItWorks'] }) {
  const steps = dict.steps.map((step, i) => ({ ...step, number: String(i + 1).padStart(2, '0') }))

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading
        id="how-it-works-title"
        eyebrow={dict.eyebrow}
        title={
          <>
            {dict.titleLead} <em className="text-primary">{dict.titleAccent}</em>
          </>
        }
        description={dict.description}
      />
      <ol className="mt-16 flex flex-col">
        {steps.map((step) => (
          <li
            key={step.number}
            className="reveal grid gap-4 border-t border-border py-10 last:border-b md:grid-cols-[160px_1fr_1fr] md:items-baseline md:gap-10 md:py-14"
          >
            <span className="font-display text-5xl text-primary md:text-7xl">{step.number}</span>
            <h3 className="font-display text-4xl md:text-5xl">{step.title}</h3>
            <p className="max-w-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
