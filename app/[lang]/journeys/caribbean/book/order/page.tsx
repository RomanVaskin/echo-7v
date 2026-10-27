import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { payBooking } from '@/app/actions/booking'
import { BookingShell } from '@/components/booking/booking-shell'
import { LiquidGlassAction } from '@/components/site/liquid-glass-button'
import { getDictionary } from '@/lib/dictionaries'
import { isLocale, localePath } from '@/lib/i18n'
import { getBookingDetails } from '@/lib/booking/bookings'
import { formatDate } from '@/lib/booking/links'
import { formatUsd } from '@/lib/booking/voyage'
import { hasDatabase } from '@/lib/db'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { robots: { index: false, follow: false } }

/** The guest's booking: status, the result of a PayPal payment, amounts paid and due, the balance payment and emails. */
export default async function BookingStatusPage({ params, searchParams }: PageProps<'/[lang]/journeys/caribbean/book/order'>) {
  const { lang: locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const b = dict.booking
  const o = b.order
  const { id, t, result } = await searchParams
  const details = hasDatabase() && typeof id === 'string' && typeof t === 'string' ? await getBookingDetails(id, t) : null

  if (!details) {
    return (
      <BookingShell locale={locale} dict={dict} path="/journeys/caribbean/book/order">
        <p>{o.notFound}</p>
      </BookingShell>
    )
  }

  const { booking, guests, payments, emails } = details
  const option = b.options[booking.option]
  const due = Math.max(booking.totalCents - booking.paidCents, 0)
  const holdUntil = booking.holdExpiresAt
    ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(booking.holdExpiresAt)
    : ''
  const awaitingPayPal = payments.some((p) => p.kind === 'deposit' && p.status === 'pending')
  const canPayDeposit = booking.status === 'pending_payment' && booking.holdsBerths && !awaitingPayPal
  const canPayBalance = booking.status === 'confirmed' && due > 0
  const row = 'flex items-baseline justify-between gap-4 border-b border-border py-3'
  const resultText = typeof result === 'string' ? o.result[result] : undefined

  return (
    <BookingShell locale={locale} dict={dict} path="/journeys/caribbean/book/order">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">
            {o.reference}: <span className="text-foreground">{booking.id}</span>
          </p>
          {resultText && (
            <p role="status" className="rounded-xl border border-primary/50 px-4 py-3 text-sm leading-relaxed text-primary">
              {resultText}
            </p>
          )}
          <h2 className={cn('font-display text-4xl md:text-5xl', ['confirmed', 'paid_in_full'].includes(booking.status) ? 'text-foreground' : 'text-primary')}>
            {o.status[booking.status]}
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">{o.text[booking.status].replace('{time}', holdUntil)}</p>

          {(canPayDeposit || canPayBalance) && (
            <form action={payBooking} className="mt-2 flex flex-col gap-3">
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="t" value={booking.token} />
              <input type="hidden" name="kind" value={canPayBalance ? 'balance' : 'deposit'} />
              <LiquidGlassAction type="submit" className="liquid-glass--block sm:max-w-sm">
                {canPayBalance ? o.payBalance.replace('{amount}', formatUsd(due)) : o.payDeposit.replace('{amount}', formatUsd(booking.depositCents))}
              </LiquidGlassAction>
              <p className="text-xs text-muted-foreground">
                {canPayBalance && `${o.dueBy.replace('{date}', formatDate(booking.balanceDueDate, locale))}. `}
                {o.paypalNote}
              </p>
            </form>
          )}
          {booking.status === 'expired' && (
            <Link href={localePath(locale, '/journeys/caribbean/book')} className="text-sm underline underline-offset-4">
              {o.newBooking}
            </Link>
          )}

          {payments.length > 0 && (
            <section className="mt-4 border-t border-border pt-6">
              <h3 className="eyebrow mb-3">{o.payments}</h3>
              <ul className="flex flex-col text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-3">
                    <span>
                      {o.kinds[p.kind]} · {formatUsd(p.amountCents)}
                    </span>
                    <span className={p.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}>
                      {o.paymentStatus[p.status]}
                      {p.paypalCaptureId && <span className="ml-2 text-xs text-muted-foreground">PayPal {p.paypalCaptureId}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {emails.length > 0 && (
            <section className="border-t border-border pt-6">
              <h3 className="eyebrow mb-3">{o.emails}</h3>
              <div className="flex flex-col gap-3">
                {emails.map((email) => (
                  <details key={email.subject + email.sent_at.toISOString()} className="rounded-xl border border-border p-4 text-sm">
                    <summary className="cursor-pointer">{email.subject}</summary>
                    {email.transport === 'log' && <p className="mt-3 text-xs text-muted-foreground">{o.emailLogged}</p>}
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-muted-foreground">{email.body}</pre>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="self-start rounded-2xl border border-border bg-white/40 p-6 md:p-7">
          <p className="eyebrow mb-3">{b.summary.title}</p>
          <dl className="text-sm">
            <div className={row}>
              <dt className="text-muted-foreground">{b.summary.accommodation}</dt>
              <dd className="text-right">{option.title}</dd>
            </div>
            <div className={row}>
              <dt className="text-muted-foreground">{b.summary.guests}</dt>
              <dd className="text-right">{guests.map((g) => `${g.firstName} ${g.lastName}`).join(', ')}</dd>
            </div>
            <div className={cn(row, 'py-4')}>
              <dt className="text-muted-foreground">{b.summary.total}</dt>
              <dd className="font-display text-3xl font-semibold tracking-[-0.02em] text-primary">{formatUsd(booking.totalCents)}</dd>
            </div>
            <div className={row}>
              <dt>{o.paid}</dt>
              <dd>{formatUsd(booking.paidCents)}</dd>
            </div>
            <div className={cn(row, 'border-b-0')}>
              <dt className="text-muted-foreground">{o.balance}</dt>
              <dd className="text-right text-muted-foreground">
                {formatUsd(due)}
                {due > 0 && booking.status !== 'pending_payment' && (
                  <span className="block text-xs">{o.dueBy.replace('{date}', formatDate(booking.balanceDueDate, locale))}</span>
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </BookingShell>
  )
}
