import Link from 'next/link'
import { locales, localePath, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({
  locale,
  path,
  label,
  className,
}: {
  locale: Locale
  path: string
  label: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={cn('flex items-center gap-2 text-xs uppercase tracking-[0.14em]', className)}>
      {locales.map((code, index) => (
        <span key={code} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-foreground/30">
              |
            </span>
          )}
          <Link
            href={localePath(code, path)}
            lang={code}
            hrefLang={code}
            prefetch={false}
            aria-current={code === locale ? 'true' : undefined}
            className={cn(
              'py-1 transition-colors',
              code === locale
                ? 'border-b border-primary text-primary'
                : 'border-b border-transparent text-foreground/60 hover:text-foreground',
            )}
          >
            {code}
          </Link>
        </span>
      ))}
    </nav>
  )
}
