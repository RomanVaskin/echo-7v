import { SectionHeading } from './section-heading'

const steps = [
  {
    number: '01',
    title: 'Explore Your Journey',
    description: 'Discover our carefully curated sailing experiences.',
  },
  {
    number: '02',
    title: 'Plan Your Escape',
    description: 'Connect with our team to discuss availability, accommodation and travel details.',
  },
  {
    number: '03',
    title: 'Set Sail',
    description: 'Prepare for an unforgettable journey at sea.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading
        id="how-it-works-title"
        eyebrow="How it works"
        title={
          <>
            From first glance <em className="text-primary">to open water.</em>
          </>
        }
        description="Every Seasemates journey is arranged personally. There is no checkout — only a conversation with our team."
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
