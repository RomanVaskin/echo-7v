import { NextResponse, type NextRequest } from 'next/server'
import { getBookingDetails } from '@/lib/booking/bookings'
import { bookingPagePath } from '@/lib/booking/links'
import { cancelPayment } from '@/lib/booking/payment-flow'

/** The payer cancelled on PayPal's page. */
export async function GET(request: NextRequest) {
  const bookingId = await cancelPayment(request.nextUrl.searchParams.get('payment') ?? '')
  const details = bookingId && (await getBookingDetails(bookingId))
  if (!details) return NextResponse.redirect(new URL('/', request.url))
  const target = `${bookingPagePath(details.booking.locale, details.booking.id, details.booking.token)}&result=cancelled`
  return NextResponse.redirect(new URL(target, request.url), 303)
}
