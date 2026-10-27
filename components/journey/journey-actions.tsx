import Link from 'next/link'
import type { Dictionary } from '@/lib/dictionaries'

/** "Join!" opens online booking; "Ask a question" scrolls to the contact form at the end of the page. */
export function JourneyActions({ dict, bookingHref }: { dict: Dictionary['caribbean']['actions']; bookingHref: string | null }) {
  const base =
    'flex min-h-[3.25rem] items-center justify-center rounded-full px-10 py-4 text-xs uppercase tracking-[0.14em] sm:min-w-[14rem]'
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-8 pt-14 sm:flex-row lg:px-10 lg:pt-16">
      {/* Primary: the pink PANTONE 437 C fill used by the filled buttons across the site */}
      {bookingHref && (
        <Link href={bookingHref} className={`enquiry-submit ${base}`}>
          {dict.join}
        </Link>
      )}
      <Link
        href="#enquire"
        className={`${base} border border-foreground/60 text-foreground transition-colors hover:bg-foreground hover:text-background`}
      >
        {dict.ask}
      </Link>
    </div>
  )
}
