import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { completeDemoPayment } from '@/app/actions/booking'
import { BookingShell } from '@/components/booking/booking-shell'
import { LiquidGlassAction } from '@/components/site/liquid-glass-button'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, localePath } from '@/lib/i18n'
import { getPayment } from '@/lib/booking/service'
import { formatUsd } from '@/lib/booking/voyage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

/**
 * Demo stand-in for the payment provider's secure page. Nothing is charged: "Simulate successful
 * payment" sends the signed notice a real provider would send to the webhook.
 */
export default async function DemoCheckoutPage({ params, searchParams }: PageProps<'/[lang]/journeys/caribbean/book/checkout'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const c = dict.booking.checkout
  const { payment: paymentId } = await searchParams
  const found = typeof paymentId === 'string' ? getPayment(paymentId) : null
  const orderHref = found && `${localePath(locale, '/journeys/caribbean/book/order')}?id=${found.order.id}&t=${found.order.token}`

  return (
    <BookingShell locale={locale} dict={dict} path="/journeys/caribbean/book/checkout">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-8">
          <p className="eyebrow flex items-center gap-2">
            <ShieldCheck className="size-4" strokeWidth={1.4} aria-hidden="true" />
            {c.title}
          </p>
          <p className="mt-4 rounded-xl border border-brand-light/50 px-4 py-3 text-sm leading-relaxed text-brand-light">{c.demoNotice}</p>

          {found && found.payment.status === 'pending' ? (
            <>
              <dl className="mt-6 text-sm">
                <div className="flex justify-between gap-4 border-b border-white/10 py-3">
                  <dt className="text-muted-foreground">{c.reference}</dt>
                  <dd>{found.order.id}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-muted-foreground">{found.payment.kind === 'deposit' ? c.deposit : c.balance}</dt>
                  <dd className="font-display text-4xl font-semibold tracking-[-0.02em] text-brand-light">{formatUsd(found.payment.amountCents)}</dd>
                </div>
              </dl>
              <form action={completeDemoPayment} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="payment" value={found.payment.id} />
                <LiquidGlassAction type="submit" name="outcome" value="succeeded" className="liquid-glass--block">
                  {c.succeed}
                </LiquidGlassAction>
                <button
                  type="submit"
                  name="outcome"
                  value="failed"
                  className="py-3 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.cancel}
                </button>
              </form>
            </>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <p>{c.unavailable}</p>
              {orderHref && (
                <Link href={orderHref} className="text-sm underline underline-offset-4">
                  {dict.booking.order.reference}: {found.order.id}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </BookingShell>
  )
}
