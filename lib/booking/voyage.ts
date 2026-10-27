/**
 * Caribbean New Year Escape: the voyage on sale and its three ways to book. All prices are in US cents
 * and are computed here, on the server; the browser only ever sends the option's id.
 */
export const caribbeanVoyage = {
  journey: 'caribbean',
  title: 'Caribbean New Year Escape',
  startDate: '2026-12-28',
  endDate: '2027-01-07',
  nights: 10,
  currency: 'USD',
  /** Four guest cabins of one category, two berths each: eight guests at most. */
  cabins: ['cabin-1', 'cabin-2', 'cabin-3', 'cabin-4'],
  berthsPerCabin: 2,
  seatPriceCents: 4_200_00,
  depositRate: 0.3,
  /** An unpaid booking holds its berths this long, then they are released. */
  holdMinutes: 30,
} as const

export const cabinOptionIds = ['shared', 'private-solo', 'private-two'] as const
export type CabinOptionId = (typeof cabinOptionIds)[number]

export type CabinOption = {
  id: CabinOptionId
  guests: 1 | 2
  /** Berths taken in the cabin: a solo traveller in a private cabin blocks both. */
  berths: 1 | 2
  /** The whole cabin is reserved: nobody else can be placed in it. */
  privateCabin: boolean
  discountRate: number
}

export const cabinOptions: Record<CabinOptionId, CabinOption> = {
  shared: { id: 'shared', guests: 1, berths: 1, privateCabin: false, discountRate: 0 },
  // The 25% discount applies to this option only
  'private-solo': { id: 'private-solo', guests: 1, berths: 2, privateCabin: true, discountRate: 0.25 },
  'private-two': { id: 'private-two', guests: 2, berths: 2, privateCabin: true, discountRate: 0 },
}

/**
 * Cabin photo on each accommodation card. Temporary: the site's cabin shot for all three until
 * photos of the yacht's own cabins are added (put a `/images/...` path per option).
 */
export const cabinOptionImages: Record<CabinOptionId, string> = {
  shared: '/images/yacht-cabin.png',
  'private-solo': '/images/yacht-cabin.png',
  'private-two': '/images/yacht-cabin.png',
}

export function isCabinOptionId(value: string): value is CabinOptionId {
  return (cabinOptionIds as readonly string[]).includes(value)
}

export type Quote = {
  option: CabinOptionId
  /** Regular price of the berths taken. */
  listCents: number
  totalCents: number
  savingCents: number
  depositCents: number
  balanceCents: number
}

export function quote(optionId: CabinOptionId): Quote {
  const option = cabinOptions[optionId]
  const listCents = caribbeanVoyage.seatPriceCents * option.berths
  const totalCents = Math.round(listCents * (1 - option.discountRate))
  const depositCents = Math.round(totalCents * caribbeanVoyage.depositRate)
  return {
    option: optionId,
    listCents,
    totalCents,
    savingCents: listCents - totalCents,
    depositCents,
    balanceCents: totalCents - depositCents,
  }
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}
