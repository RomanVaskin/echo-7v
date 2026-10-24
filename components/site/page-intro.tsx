/** Opening block of the inner pages (Journal, Contacts): eyebrow, H1 and a short lead, below the absolute header. */
export function PageIntro({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-36 lg:px-10 lg:pb-24 lg:pt-44">
      <div className="hero-fade flex flex-col gap-6 border-t border-border pt-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display text-balance text-5xl md:text-7xl">{title}</h1>
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">{lead}</p>
      </div>
    </section>
  )
}
