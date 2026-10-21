'use client'

import { lazy, Suspense, useEffect, useState, type ComponentProps } from 'react'

const SailingMap = lazy(() => import('./sailing-map'))

type LoaderProps = ComponentProps<typeof SailingMap> & { loadingLabel: string }

export function SailingMapLoader({ loadingLabel, ...props }: LoaderProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const placeholder = (
    <div className="flex h-[420px] items-center justify-center border border-border md:h-[560px]">
      <p className="eyebrow">{loadingLabel}</p>
    </div>
  )

  if (!mounted) return placeholder
  return (
    <Suspense fallback={placeholder}>
      <SailingMap {...props} />
    </Suspense>
  )
}
