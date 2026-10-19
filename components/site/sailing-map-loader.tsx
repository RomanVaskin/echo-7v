'use client'

import dynamic from 'next/dynamic'

export const SailingMapLoader = dynamic(() => import('./sailing-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center border border-border md:h-[560px]">
      <p className="eyebrow">Loading chart…</p>
    </div>
  ),
})
