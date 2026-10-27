import { caribbeanVoyage, cabinOptions, type CabinOptionId } from './voyage'

/** A cabin's berths held or sold. Only active reservations (held and unexpired, or confirmed) count. */
export type CabinReservation = { cabinId: string; berths: 1 | 2; privateCabin: boolean }

export type CabinState = { id: string; usedBerths: number; privateCabin: boolean }

export function cabinStates(reservations: CabinReservation[]): CabinState[] {
  return caribbeanVoyage.cabins.map((id) => {
    const inCabin = reservations.filter((r) => r.cabinId === id)
    return {
      id,
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
  const capacity = caribbeanVoyage.berthsPerCabin
  if (option.privateCabin) return states.find((c) => c.usedBerths === 0)?.id ?? null
  const halfFull = states.find((c) => !c.privateCabin && c.usedBerths > 0 && c.usedBerths + option.berths <= capacity)
  return halfFull?.id ?? states.find((c) => c.usedBerths === 0)?.id ?? null
}

export type AvailabilitySummary = {
  freeCabins: number
  /** Berths still bookable as "shared": free berths in cabins that are not private. */
  sharedBerths: number
  options: Record<CabinOptionId, boolean>
}

export function summarize(states: CabinState[]): AvailabilitySummary {
  const capacity = caribbeanVoyage.berthsPerCabin
  return {
    freeCabins: states.filter((c) => c.usedBerths === 0).length,
    sharedBerths: states.filter((c) => !c.privateCabin).reduce((sum, c) => sum + (capacity - c.usedBerths), 0),
    options: {
      shared: pickCabin(states, 'shared') !== null,
      'private-solo': pickCabin(states, 'private-solo') !== null,
      'private-two': pickCabin(states, 'private-two') !== null,
    },
  }
}
