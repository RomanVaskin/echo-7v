import type { Dictionary } from '@/lib/dictionaries'
import { SectionHeading } from './section-heading'

/**
 * `stacked`: heading above a full-width list of steps (journey pages).
 * `split`: heading on the left, a compact list of steps on the right (home page).
 */
export function HowItWorks({
  dict,
  variant = 'stacked',
  index,
}: {
  dict: Dictionary['howItWorks']
  variant?: 'stacked' | 'split'
  index?: string
}) {
  const steps = dict.steps.map((step, i) => ({ ...step, number: String(i + 1).padStart(2, '0') }))
  const title = (
    <>
      {dict.titleLead} <em className="text-primary">{dict.titleAccent}</em>
    </>
  )

  if (variant === 'split') {
    return (
      <section id="how-it-works" aria-labelledby="how-it-works-title" className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-10 lg:pt-28">
        <div className="reveal grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <p className="eyebrow">
              {index && <span className="text-foreground">{index} / </span>}
              {dict.eyebrow}
            </p>
            <h2 id="how-it-works-title" className="font-display text-balance text-5xl md:text-6xl">
              {title}
            </h2>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">{dict.description}</p>
          </div>
          <ol className="flex flex-col">
            {steps.map((step) => (
              <li
                key={step.number}
                className="grid grid-cols-[4.5rem_1fr] items-baseline gap-6 border-b border-border py-7 first:pt-0 last:border-b-0 md:grid-cols-[5.5rem_1fr]"
              >
                <span className="font-display text-5xl md:text-6xl">{step.number}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading id="how-it-works-title" index={index} eyebrow={dict.eyebrow} title={title} description={dict.description} />
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
