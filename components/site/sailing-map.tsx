'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'

export type MapPoint = {
  id: string
  label: string
  sublabel?: string
  marker: string
  coordinates: [number, number]
  href?: string | null
}

type SailingMapProps = {
  points: MapPoint[]
  showRoute?: boolean
  focusZoom?: number
  listTitle: string
  className?: string
}

function FlyToPoint({ point, zoom }: { point: MapPoint | undefined; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo(point.coordinates, zoom, { duration: 1.4 })
  }, [point, zoom, map])
  return null
}

function markerIcon(label: string, active: boolean) {
  return L.divIcon({
    className: '',
    html: `<span class="sea-marker" data-active="${active}">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function SailingMap({ points, showRoute, focusZoom = 11, listTitle, className }: SailingMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activePoint = points.find((p) => p.id === activeId)
  const bounds = useMemo(() => L.latLngBounds(points.map((p) => p.coordinates)), [points])

  return (
    <div className={cn('grid border border-border lg:grid-cols-[1fr_340px]', className)}>
      <div className="relative h-[420px] md:h-[560px]">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [60, 60] }}
          scrollWheelZoom={false}
          className="size-full"
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {showRoute && (
            <Polyline
              positions={points.map((p) => p.coordinates)}
              pathOptions={{ color: '#d4b98c', weight: 1.5, dashArray: '4 6', opacity: 0.9 }}
            />
          )}
          {points.map((point) => (
            <Marker
              key={point.id}
              position={point.coordinates}
              icon={markerIcon(point.marker, point.id === activeId)}
              eventHandlers={{ click: () => setActiveId(point.id) }}
              title={point.label}
            >
              <Tooltip direction="top" offset={[0, -16]} className="sea-tooltip">
                {point.label}
              </Tooltip>
            </Marker>
          ))}
          <FlyToPoint point={activePoint} zoom={focusZoom} />
        </MapContainer>
      </div>

      <div className="flex max-h-[560px] flex-col border-t border-border lg:border-l lg:border-t-0">
        <p className="eyebrow border-b border-border px-6 py-4">{listTitle}</p>
        <ol className="flex-1 overflow-y-auto">
          {points.map((point) => {
            const active = point.id === activeId
            return (
              <li key={point.id} className="border-b border-border last:border-none">
                <button
                  type="button"
                  onClick={() => setActiveId(point.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-secondary/60',
                    active && 'bg-secondary',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px]',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/60 text-primary',
                    )}
                  >
                    {point.marker}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm text-foreground">{point.label}</span>
                    {point.sublabel && <span className="text-xs text-muted-foreground">{point.sublabel}</span>}
                  </span>
                </button>
                {active && point.href && (
                  <Link
                    href={point.href}
                    className="mx-6 mb-4 inline-block text-xs uppercase tracking-[0.22em] text-primary underline-offset-4 hover:underline"
                  >
                    Explore Journey
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
