'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'
import { localePath, type Locale } from '@/lib/i18n'
import { LanguageSwitcher } from './language-switcher'

export function SiteHeader({
  locale,
  path,
  dict,
  enquireLabel,
}: {
  locale: Locale
  path: string
  dict: Dictionary['header']
  enquireLabel: string
}) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: localePath(locale, '/journeys/caribbean'), label: dict.nav.caribbean },
    { href: localePath(locale, '/#schedule'), label: dict.nav.schedule },
    { href: localePath(locale, '/#destinations'), label: dict.nav.destinations },
    { href: localePath(locale, '/#how-it-works'), label: dict.nav.howItWorks },
  ]
  const enquireHref = localePath(locale, '/#enquire')

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href={localePath(locale, '/')} className="font-display text-2xl tracking-wide text-foreground" aria-label={dict.homeLabel}>
          Seasemates
        </Link>

        <nav aria-label={dict.mainNav} className="hidden items-center gap-6 lg:flex xl:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} path={path} label={dict.languageLabel} />
          <Link
            href={enquireHref}
            className="border border-foreground/40 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {enquireLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-5 lg:hidden">
          <LanguageSwitcher locale={locale} path={path} label={dict.languageLabel} />
          <button
            type="button"
            className="text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
            <span className="sr-only">{open ? dict.closeMenu : dict.openMenu}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={dict.mobileNav}
          className="mx-6 flex flex-col gap-1 border border-border bg-background/95 p-6 backdrop-blur lg:hidden"
        >
          {[...navItems, { href: enquireHref, label: enquireLabel }].map((item) => (
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
