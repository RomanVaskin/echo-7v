/**
 * Caribbean New Year Escape: the voyage on sale and its three ways to book. All prices are in US cents
 * and are computed here, on the server; the browser only ever sends the option's id.
 */
export const caribbeanVoyage = {
  /** The trip's row in the database (db/migrations/001_booking.sql): prices and dates are read from there. */
  tripId: 'caribbean-new-year-2026',
  journey: 'caribbean',
  title: 'Caribbean New Year Escape',
  startDate: '2026-12-28',
  endDate: '2027-01-07',
  nights: 10,
  currency: 'USD',
  /** An unpaid booking holds its berths this long, then they are released. */
  holdMinutes: 30,
  /** A payment PayPal reports as pending (e.g. an eCheck) keeps the berths this long. */
  pendingHoldHours: 72,
} as const

/**
 * Mirror of the trip row seeded in the database, used only to show prices while the database is not
 * connected (online payment is then switched off). Prices charged always come from the database.
 */
export const displayPricing = { seatPriceCents: 4_200_00, depositPercent: 30, balanceDueDate: '2026-11-28' } as const

/**
 * Bookings made after the balance due date (30 days before departure) do not get the 30/70 split
 * automatically. Until the owner approves a rule, online booking then closes and guests are asked
 * to get in touch ('contact'). 'full_payment' (pay 100% at once) is prepared but needs approval.
 */
export type LateBookingRule = 'contact' | 'full_payment'
export const lateBookingRule: LateBookingRule = 'contact'

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

export type Pricing = { seatPriceCents: number; depositPercent: number }

export function quote(optionId: CabinOptionId, pricing: Pricing): Quote {
  const option = cabinOptions[optionId]
  const listCents = pricing.seatPriceCents * option.berths
  const totalCents = Math.round(listCents * (1 - option.discountRate))
  const depositCents = Math.round((totalCents * pricing.depositPercent) / 100)
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
