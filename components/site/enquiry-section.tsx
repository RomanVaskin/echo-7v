import { EnquiryForm } from './enquiry-form'

type EnquirySectionProps = {
  index?: string
  title: React.ReactNode
  description: string
  defaultJourney?: string
}

export function EnquirySection({ index, title, description, defaultJourney }: EnquirySectionProps) {
  return (
    <section id="enquire" aria-labelledby="enquire-title" className="bg-card">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[1fr_1.4fr] lg:px-10 lg:py-32">
        <div className="reveal flex flex-col gap-6">
          <p className="eyebrow flex items-center gap-4">
            {index && <span className="text-primary">{index}</span>}
            <span>Enquire</span>
          </p>
          <h2 id="enquire-title" className="font-display text-balance text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="max-w-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <EnquiryForm defaultJourney={defaultJourney} />
      </div>
    </section>
  )
}
