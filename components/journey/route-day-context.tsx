'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * One selected day for the route map and the day cards (`activeDayId`, 1–9). Where a selection
 * came from decides what moves: a map marker scrolls the cards (and the page) to the day, the
 * arrows scroll the cards, a card's «View on the map» button scrolls the page to the map, a card
 * click or a settled swipe only changes the selection, so scrolling and selecting never trigger
 * each other in a loop.
 */
export type DaySource = 'map' | 'card' | 'card-map' | 'arrow' | 'carousel'
type Selection = { dayId: number; source: DaySource; nonce: number }

type RouteDayState = {
  activeDayId: number
  selection: Selection
  setActiveDayId: (dayId: number, source: DaySource) => void
}

const RouteDayContext = createContext<RouteDayState | null>(null)

export function RouteDayProvider({ children, initialDayId = 1 }: { children: React.ReactNode; initialDayId?: number }) {
  const [selection, setSelection] = useState<Selection>({ dayId: initialDayId, source: 'carousel', nonce: 0 })
  const setActiveDayId = useCallback((dayId: number, source: DaySource) => {
    setSelection((current) => (current.dayId === dayId && source === 'carousel' ? current : { dayId, source, nonce: current.nonce + 1 }))
  }, [])
  const value = useMemo(() => ({ activeDayId: selection.dayId, selection, setActiveDayId }), [selection, setActiveDayId])
  return <RouteDayContext.Provider value={value}>{children}</RouteDayContext.Provider>
}

/** The shared selection; outside a provider (no map) the cards work on their own. */
export function useRouteDay() {
  return useContext(RouteDayContext)
}
