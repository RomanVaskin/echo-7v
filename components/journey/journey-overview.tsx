import type { Dictionary } from '@/lib/dictionaries'
import { SectionHeading } from '@/components/site/section-heading'

export function JourneyOverview({ dict }: { dict: Dictionary['caribbean']['overview'] }) {
  return (
    <section aria-labelledby="overview-title" className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-10 lg:pb-20 lg:pt-36">
      <SectionHeading
        id="overview-title"
        index="01"
        eyebrow={dict.eyebrow}
        title={
          <>
            {dict.titleLead} <em className="text-primary">{dict.titleAccent}</em>
          </>
        }
      />
      <p className="reveal mt-8 max-w-2xl text-lg leading-relaxed text-foreground/85 lg:ml-[33%]">{dict.primary}</p>
    </section>
  )
}
