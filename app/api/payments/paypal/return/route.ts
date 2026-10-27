import { NextResponse, type NextRequest } from 'next/server'
import { getBookingDetails } from '@/lib/booking/bookings'
import { bookingPagePath } from '@/lib/booking/links'
import { captureApproved } from '@/lib/booking/payment-flow'

/** PayPal sends the payer back here after approval (?payment=<ours>&token=<PayPal order id>): capture on the server. */
export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get('payment') ?? ''
  const orderId = request.nextUrl.searchParams.get('token') ?? ''
  const { booking, outcome } = await captureApproved(paymentId, orderId)
  const details = booking && (await getBookingDetails(booking.id))
  if (!details) return NextResponse.redirect(new URL('/', request.url))
  const target = `${bookingPagePath(details.booking.locale, details.booking.id, details.booking.token)}&result=${outcome}`
  return NextResponse.redirect(new URL(target, request.url), 303)
}
