import type { Dictionary } from '@/lib/dictionaries'
import { SectionHeading } from '@/components/site/section-heading'

export function JourneyOverview({ dict }: { dict: Dictionary['caribbean']['overview'] }) {
  return (
    <section aria-labelledby="overview-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
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
      <div className="reveal mt-14 grid gap-10 md:grid-cols-2 lg:pl-[33%]">
        <p className="text-lg leading-relaxed text-foreground/85">
          {dict.primary}
        </p>
        <p className="leading-relaxed text-muted-foreground">
          {dict.secondary}
        </p>
      </div>
    </section>
  )
}
