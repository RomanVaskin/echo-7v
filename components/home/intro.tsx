export function Intro() {
  return (
    <section aria-label="About Seasemates" className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
      <div className="reveal grid gap-12 lg:grid-cols-[1fr_2fr]">
        <p className="eyebrow">The club</p>
        <div className="flex flex-col gap-10">
          <p className="font-display text-balance text-4xl leading-tight md:text-5xl lg:text-6xl">
            Not a charter marketplace. A small club of travellers who share a horizon —{' '}
            <em className="text-muted-foreground">and a handful of journeys chosen with care.</em>
          </p>
          <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
            {[
              { title: 'Small crews', text: 'Intimate groups, so every anchorage still feels like a discovery.' },
              { title: 'Curated routes', text: 'Each voyage is planned around calm water, light and local life.' },
              { title: 'Skippered', text: 'Professional crews sail — you decide how involved you want to be.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <h3 className="text-sm uppercase tracking-[0.18em] text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
