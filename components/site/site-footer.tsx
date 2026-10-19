import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr] lg:px-10">
        <div className="flex flex-col gap-4">
          <p className="font-display text-4xl">Seasemates</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A boutique international sailing club. Carefully selected journeys for small crews who prefer to travel
            by sea.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Journeys</p>
          <Link href="/journeys/caribbean" className="text-sm text-foreground/80 hover:text-foreground">
            The Caribbean — 9 nights
          </Link>
          <Link href="/#schedule" className="text-sm text-foreground/80 hover:text-foreground">
            Sailing schedule
          </Link>
          <Link href="/#destinations" className="text-sm text-foreground/80 hover:text-foreground">
            Destinations
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Club</p>
          <Link href="/#how-it-works" className="text-sm text-foreground/80 hover:text-foreground">
            How it works
          </Link>
          <Link href="/#enquire" className="text-sm text-foreground/80 hover:text-foreground">
            Enquire
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 border-t border-border px-6 py-6 text-xs text-muted-foreground sm:flex-row lg:px-10">
        <p>{`© ${new Date().getFullYear()} Seasemates. All rights reserved.`}</p>
        <p>Details marked TBA are subject to confirmation.</p>
      </div>
    </footer>
  )
}
