'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '/journeys/caribbean', label: 'The Caribbean' },
  { href: '/#schedule', label: 'Schedule' },
  { href: '/#destinations', label: 'Destinations' },
  { href: '/#how-it-works', label: 'How it works' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-display text-2xl tracking-wide text-foreground" aria-label="Seasemates home">
          Seasemates
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#enquire"
            className="border border-foreground/40 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Enquire
          </Link>
        </nav>

        <button
          type="button"
          className="text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="mx-6 flex flex-col gap-1 border border-border bg-background/95 p-6 backdrop-blur md:hidden"
        >
          {[...navItems, { href: '/#enquire', label: 'Enquire' }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-3 text-sm uppercase tracking-[0.2em] text-foreground/90 last:border-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
