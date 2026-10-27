import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { payRemaining } from '@/app/actions/booking'
import { BookingShell } from '@/components/booking/booking-shell'
import { LiquidGlassAction } from '@/components/site/liquid-glass-button'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, localePath } from '@/lib/i18n'
import { getOrder } from '@/lib/booking/service'
import { formatUsd } from '@/lib/booking/voyage'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

/** The guest's booking: status, amounts paid and due, the balance payment and (demo) the confirmation email. */
export default async function OrderPage({ params, searchParams }: PageProps<'/[lang]/journeys/caribbean/book/order'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const b = dict.booking
  const o = b.order
  const { id, t } = await searchParams
  const found = typeof id === 'string' && typeof t === 'string' ? getOrder(id, t) : null

  if (!found) {
    return (
      <BookingShell locale={locale} dict={dict} path="/journeys/caribbean/book/order">
        <p>{o.notFound}</p>
      </BookingShell>
    )
  }

  const { order } = found
  const option = b.options[order.option]
  const due = Math.max(order.quote.totalCents - order.paidCents, 0)
  const holdUntil = order.reservation.holdExpiresAt
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(order.reservation.holdExpiresAt)
    : ''
  const row = 'flex items-baseline justify-between gap-4 border-b border-white/10 py-3'
  const lead = order.guests[0]

  return (
    <BookingShell locale={locale} dict={dict} path="/journeys/caribbean/book/order">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">
            {o.reference}: <span className="text-foreground">{order.id}</span>
          </p>
          <h2 className={cn('font-display text-4xl md:text-5xl', order.status === 'confirmed' || order.status === 'paid_in_full' ? 'text-foreground' : 'text-brand-light')}>
            {o.status[order.status]}
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">{o.text[order.status].replace('{time}', holdUntil)}</p>

          {(order.status === 'pending_payment' || (order.status === 'confirmed' && due > 0)) && (
            <form action={payRemaining} className="mt-2">
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="t" value={order.token} />
              <LiquidGlassAction type="submit" className="liquid-glass--block sm:max-w-sm">
                {order.status === 'pending_payment'
                  ? o.payDeposit.replace('{amount}', formatUsd(order.quote.depositCents))
                  : o.payBalance.replace('{amount}', formatUsd(due))}
              </LiquidGlassAction>
            </form>
          )}
          {order.status === 'expired' && (
            <Link href={localePath(locale, '/journeys/caribbean/book')} className="text-sm underline underline-offset-4">
              {o.newBooking}
            </Link>
          )}

          {order.emails.map((email) => (
            <div key={email.sentAt + email.subject} className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-6">
              <p className="text-sm">{o.emailSent.replace('{email}', email.to)}</p>
              {email.via === 'outbox' && (
                <details className="rounded-xl border border-white/10 p-4 text-sm">
                  <summary className="cursor-pointer text-muted-foreground">{o.emailPreview}</summary>
                  <p className="mt-3 font-medium">{email.subject}</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-muted-foreground">{email.text}</pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <aside className="self-start rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7">
          <p className="eyebrow mb-3">{b.summary.title}</p>
          <dl className="text-sm">
            <div className={row}>
              <dt className="text-muted-foreground">{b.summary.accommodation}</dt>
              <dd className="text-right">{option.title}</dd>
            </div>
            <div className={row}>
              <dt className="text-muted-foreground">{b.summary.guests}</dt>
              <dd className="text-right">{order.guests.map((g) => `${g.firstName} ${g.lastName}`).join(', ')}</dd>
            </div>
            <div className={cn(row, 'py-4')}>
              <dt className="text-muted-foreground">{b.summary.total}</dt>
              <dd className="font-display text-3xl font-semibold tracking-[-0.02em] text-brand-light">{formatUsd(order.quote.totalCents)}</dd>
            </div>
            <div className={row}>
              <dt>{o.paid}</dt>
              <dd>{formatUsd(order.paidCents)}</dd>
            </div>
            <div className={cn(row, 'border-b-0')}>
              <dt className="text-muted-foreground">{o.balance}</dt>
              <dd className="text-muted-foreground">{formatUsd(due)}</dd>
            </div>
          </dl>
          {lead?.email && <p className="mt-3 text-xs text-muted-foreground">{lead.email}</p>}
        </aside>
      </div>
    </BookingShell>
  )
}
