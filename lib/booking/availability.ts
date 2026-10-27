import { cabinOptions, type CabinOptionId } from './voyage'

/** A cabin's berths held or sold. Only active reservations (held and unexpired, or confirmed) count. */
export type CabinReservation = { cabinId: string; berths: 1 | 2; privateCabin: boolean }

export type CabinState = { id: string; berths: number; usedBerths: number; privateCabin: boolean }

export function cabinStates(cabins: { id: string; berths: number }[], reservations: CabinReservation[]): CabinState[] {
  return cabins.map(({ id, berths }) => {
    const inCabin = reservations.filter((r) => r.cabinId === id)
    return {
      id,
      berths,
      usedBerths: inCabin.reduce((sum, r) => sum + r.berths, 0),
      privateCabin: inCabin.some((r) => r.privateCabin),
    }
  })
}

/**
 * The cabin for a new booking, or null when none fits. Cabins are tracked one by one, not as a pool
 * of eight seats:
 * - a shared berth goes into a shared cabin that already has one guest, else into an empty cabin;
 * - a private cabin (solo or two guests) needs a completely empty cabin.
 */
export function pickCabin(states: CabinState[], optionId: CabinOptionId): string | null {
  const option = cabinOptions[optionId]
  if (option.privateCabin) return states.find((c) => c.usedBerths === 0)?.id ?? null
  const halfFull = states.find((c) => !c.privateCabin && c.usedBerths > 0 && c.usedBerths + option.berths <= c.berths)
  return halfFull?.id ?? states.find((c) => c.usedBerths === 0)?.id ?? null
}

export type AvailabilitySummary = {
  totalCabins: number
  freeCabins: number
  /** Berths still bookable as "shared": free berths in cabins that are not private. */
  sharedBerths: number
  options: Record<CabinOptionId, boolean>
}

export function summarize(states: CabinState[]): AvailabilitySummary {
  return {
    totalCabins: states.length,
    freeCabins: states.filter((c) => c.usedBerths === 0).length,
    sharedBerths: states.filter((c) => !c.privateCabin).reduce((sum, c) => sum + (c.berths - c.usedBerths), 0),
    options: {
      shared: pickCabin(states, 'shared') !== null,
      'private-solo': pickCabin(states, 'private-solo') !== null,
      'private-two': pickCabin(states, 'private-two') !== null,
    },
  }
}
