'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Phones only: a slim bar with the price and "Book now", shown once the first screen has scrolled
 * away and hidden again when the contact form at the end comes into view.
 */
export function MobileBookBar({ href, price, perPerson, from, label }: { href: string; price: string; perPerson: string; from: string; label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const contact = document.getElementById('enquire')
      const pastHero = window.scrollY > window.innerHeight * 0.85
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight : false
      setVisible(pastHero && !atContact)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-500 md:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="whitespace-nowrap font-display text-xl">
          <span className="text-sm text-muted-foreground">{from} </span>
          <span className="font-semibold tracking-[-0.02em] text-brand-light">{price}</span>{' '}
          <span className="text-xs text-muted-foreground">{perPerson}</span>
        </p>
        <Link href={href} tabIndex={visible ? 0 : -1} className="enquiry-submit rounded-full px-6 py-3 text-xs uppercase tracking-[0.14em]">
          {label}
        </Link>
      </div>
    </div>
  )
}
