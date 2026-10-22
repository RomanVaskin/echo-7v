import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function AllJourneysLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mx-auto flex max-w-7xl justify-center px-6 pb-24 lg:px-10 lg:pb-36">
      <Link
        href={href}
        className="group reveal flex items-center gap-4 border border-primary px-10 py-5 text-xs uppercase tracking-[0.22em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
      >
        {label}
        <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
