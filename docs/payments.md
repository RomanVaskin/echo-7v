# Bookings and PayPal payments

Caribbean New Year Escape is booked at `/journeys/caribbean/book` (`/ru/...` in Russian).
Payments go through **PayPal Checkout, server-side Orders API v2**, in the **sandbox** only.

## Payment terms
- USD. One berth $4,200; Private Cabin · Solo $6,300 (25% off two berths); Private Cabin · Two Guests $8,400.
- 30% deposit at booking, 70% balance as a **separate payment** by **28 November 2026**
  (30 calendar days before the start). Nothing is ever charged automatically: the guest pays the
  balance from the link on the booking page and in the emails.
- Bookings after the balance due date do **not** get the 30/70 split: online booking closes and
  guests are asked to get in touch (`lateBookingRule = 'contact'` in `lib/booking/voyage.ts`).
  A `'full_payment'` rule is prepared but must be approved by the owner before switching it on.

## Setup (sandbox)
1. PostgreSQL: set `DATABASE_URL`, run `pnpm db:migrate` (creates the tables and the trip with its four cabins).
2. PayPal developer dashboard → Apps & Credentials → **Sandbox** → create a REST app.
   Put its credentials in `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` (server environment only,
   never `NEXT_PUBLIC_…`). Keep `PAYPAL_ENV=sandbox`.
3. In the same app add a webhook: URL `https://<site>/api/payments/paypal/webhook`, events
   `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`,
   `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.DECLINED`, `PAYMENT.CAPTURE.REFUNDED`,
   `PAYMENT.CAPTURE.REVERSED`. Put the webhook id in `PAYPAL_WEBHOOK_ID`.
4. `SITE_URL` = the public address (PayPal return links and emails use it).
5. Scheduled jobs (cron, with `Authorization: Bearer $CRON_SECRET`):
   - `POST /api/cron/balance-reminders` daily — balance reminders 14 and 3 days before the due date, and when overdue;
   - `POST /api/bookings/release-expired` every few minutes — releases unpaid holds (also done on every booking read).
6. Test with sandbox buyer accounts (Sandbox → Accounts).

Live payments: **not enabled**. `PAYPAL_ENV=live` and the live API host are refused in
`lib/payments/paypal.ts`; switching needs a separate, explicit approval and a code change.

## How a payment works
1. The guest chooses accommodation and fills the form → a booking is created in one transaction
   (the trip row is locked; a database trigger also refuses over-full or shared-private cabins)
   and holds its berths for 30 minutes.
2. A `payments` row and a PayPal order for exactly that amount are created; the guest approves on PayPal.
3. Back on the site (`/api/payments/paypal/return`) — or via the `CHECKOUT.ORDER.APPROVED` webhook if
   the guest closed the browser — the berths are re-checked and the order is **captured on the server**.
   If the hold expired and the berths were sold meanwhile, the order is not captured (no charge).
4. The capture is verified: status, amount, currency, our payment id (`custom_id`) and the PayPal order id.
   Only a `COMPLETED` capture confirms the booking (deposit) or completes it (balance).
   A mismatch puts the booking into `needs_review`.
5. PayPal Order ID and Capture ID are stored on the payment.

| Situation | Result |
|---|---|
| Card declined (`INSTRUMENT_DECLINED`) | payment `declined`, email, the guest can retry while berths are held |
| Cancelled on PayPal | payment `cancelled`, berths stay held until the hold expires |
| Capture `PENDING` (e.g. eCheck) | berths held 72 h; `PAYMENT.CAPTURE.COMPLETED` webhook confirms |
| Repeated webhook / return | ignored (event ids in `payment_events`, idempotent updates, PayPal-Request-Id) |
| Refund / reversal (chargeback) | recorded from the webhook, booking → `needs_review` |

Webhooks are verified with PayPal (`/v1/notifications/verify-webhook-signature`); unverified ones get 400.

**Refunds** (staff): `POST /api/admin/payments/refund` with `Authorization: Bearer $ADMIN_API_TOKEN`,
body `{"paymentId":"pay_…","amountCents":126000}` (omit `amountCents` for a full refund). The booking
goes to `needs_review`; refunded amounts are recorded from PayPal's `PAYMENT.CAPTURE.REFUNDED` webhook.
Bookings in `needs_review` (refunds, reversals, mismatches, payments after berths were released) are
checked by a person in the database for now.

## Emails
Templates in `lib/email/templates.ts` (English and Russian): booking received, deposit received,
balance reminder, paid in full, payment failed. Each is sent once (`email_log.dedupe_key`).
The mail service is not chosen yet: `EMAIL_TRANSPORT=log` stores the emails in `email_log` (shown on
the booking page) and the server log. A provider is added in `lib/email/send.ts`.

## Data
`db/migrations/001_booking.sql`: `trips`, `cabins`, `bookings`, `guests`, `payments`,
`payment_events`, `email_log`. Money in integer cents.
