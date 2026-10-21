import { SectionHeading } from '@/components/site/section-heading'
import type { Dictionary } from '@/lib/dictionaries'
import type { ItineraryDay } from '@/lib/caribbean'

export function Itinerary({ days, dict }: { days: ItineraryDay[]; dict: Dictionary['caribbean']['itinerary'] }) {
  return (
    <section aria-labelledby="itinerary-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading
        id="itinerary-title"
        index="03"
        eyebrow={dict.eyebrow}
        title={dict.title}
        description={dict.description}
      />
      <ol className="mt-14 flex flex-col">
        {days.map((day) => (
          <li
            key={day.day}
            className="reveal grid gap-3 border-t border-border py-8 last:border-b md:grid-cols-[120px_1fr_1.4fr] md:gap-10"
          >
            <span className="eyebrow pt-2 text-primary">{`${dict.day} ${String(day.day).padStart(2, '0')}`}</span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-3xl md:text-4xl">{day.place}</h3>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{day.title}</p>
            </div>
            <p className="max-w-lg leading-relaxed text-foreground/80 md:pt-2">{day.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
