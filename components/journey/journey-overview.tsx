import { SectionHeading } from '@/components/site/section-heading'

export function JourneyOverview() {
  return (
    <section aria-labelledby="overview-title" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <SectionHeading
        id="overview-title"
        index="01"
        eyebrow="Journey overview"
        title={
          <>
            Nine nights, <em className="text-primary">one unhurried horizon.</em>
          </>
        }
      />
      <div className="reveal mt-14 grid gap-10 md:grid-cols-2 lg:pl-[33%]">
        <p className="text-lg leading-relaxed text-foreground/85">
          Our signature voyage moves slowly through the islands — a short sail each day, long swims, sheltered
          anchorages at dusk. It is designed for travellers who want the sea itself to be the destination.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Days are loosely shaped by wind and light. Snorkel reefs, step ashore in small harbour towns or simply
          stay on deck with a book. Your professional crew handles the sailing; you are welcome to take the helm
          whenever you like.
        </p>
      </div>
    </section>
  )
}
