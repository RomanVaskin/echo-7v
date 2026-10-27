import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Transparent "liquid glass" capsule: the video stays visible through it, with a layered optical rim
 * (specular highlight, cool lower edge, faint iridescence on the rounded ends). Styles live in
 * globals.css under `.liquid-glass`; the rim and highlights are pseudo-elements, so the markup stays simple.
 */
export function LiquidGlassButton({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link href={href} className={cn('liquid-glass', className)}>
      <span className="liquid-glass__label">{children}</span>
      <Arrow />
    </Link>
  )
}

/** The same glass capsule as a button (forms, booking steps). */
export function LiquidGlassAction({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={cn('liquid-glass', className)}>
      <span className="liquid-glass__label">{children}</span>
      <Arrow />
    </button>
  )
}

function Arrow() {
  return (
    <svg
      className="liquid-glass__arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
  )
}
