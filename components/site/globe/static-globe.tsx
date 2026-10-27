'use client'

import { useEffect, useState } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { loadLand, type LandData } from './land'
import type { GlobePoint } from './globe-scene'

/**
 * Still fallback when WebGL is unavailable: the same land data drawn as an orthographic SVG, turned
 * towards the selected destination (or the Caribbean). The markers stay clickable.
 */
export function StaticGlobe({
  points,
  selectedId,
  label,
  onPick,
}: {
  points: GlobePoint[]
  selectedId: string | null
  label: string
  onPick: (id: string) => void
}) {
  const [land, setLand] = useState<LandData | null>(null)
  useEffect(() => {
    loadLand().then(setLand)
  }, [])

  const focus = points.find((p) => p.id === selectedId) ?? { lat: 20, lon: -68 }
  const center: [number, number] = [focus.lon, Math.min(Math.max(focus.lat, -50), 50)]
  const size = 600
  const projection = geoOrthographic()
    .rotate([-center[0], -center[1]])
    .scale(size / 2 - 4)
    .translate([size / 2, size / 2])
    .clipAngle(90)
  const path = geoPath(projection)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 size-full" role="img" aria-label={label}>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="#ddd5c4" />
      <path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#484b5d" strokeOpacity={0.12} strokeWidth={0.6} />
      {land && <path d={path(land.land) ?? ''} fill="#f0eada" stroke="#484b5d" strokeOpacity={0.3} strokeWidth={0.6} />}
      {points.map((point) => {
        const xy = projection([point.lon, point.lat])
        // Skip points on the far side
        if (!xy || geoDistance([point.lon, point.lat], center) > Math.PI / 2) return null
        return (
          <g key={point.id} transform={`translate(${xy[0]} ${xy[1]})`} className="cursor-pointer" onClick={() => onPick(point.id)}>
            <circle r={18} fill="transparent" />
            {point.id === selectedId && <circle r={11} fill="none" stroke="#c8a26a" strokeWidth={1.2} />}
            <circle r={5} fill="#c8a26a" />
          </g>
        )
      })}
    </svg>
  )
}
