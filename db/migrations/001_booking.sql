-- Seasmates bookings: trips, cabins, bookings, guests, payments, PayPal events and sent emails.
-- Money is stored in integer cents (USD).

CREATE TABLE trips (
  id               text PRIMARY KEY,
  journey          text NOT NULL,                 -- site slug, e.g. 'caribbean'
  title            text NOT NULL,
  start_date       date NOT NULL,
  end_date         date NOT NULL,
  nights           integer NOT NULL,
  currency         char(3) NOT NULL DEFAULT 'USD',
  seat_price_cents integer NOT NULL CHECK (seat_price_cents > 0),
  deposit_percent  integer NOT NULL CHECK (deposit_percent BETWEEN 1 AND 100),
  balance_due_date date NOT NULL,                 -- 30 calendar days before the start
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cabins (
  id      text PRIMARY KEY,
  trip_id text NOT NULL REFERENCES trips(id),
  name    text NOT NULL,
  berths  integer NOT NULL DEFAULT 2 CHECK (berths > 0),
  UNIQUE (trip_id, name)
);

CREATE TABLE bookings (
  id               text PRIMARY KEY,              -- reference shown to the guest, SM-XXXXXXXX
  token            text NOT NULL,                 -- secret part of the booking page link
  trip_id          text NOT NULL REFERENCES trips(id),
  cabin_id         text NOT NULL REFERENCES cabins(id),
  option           text NOT NULL CHECK (option IN ('shared', 'private-solo', 'private-two')),
  berths           integer NOT NULL CHECK (berths IN (1, 2)),
  private_cabin    boolean NOT NULL,
  status           text NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'paid_in_full', 'expired', 'cancelled', 'needs_review')),
  holds_berths     boolean NOT NULL DEFAULT true, -- false once released (expired / cancelled)
  hold_expires_at  timestamptz,                   -- null once the deposit is paid
  list_cents       integer NOT NULL,
  total_cents      integer NOT NULL,
  deposit_cents    integer NOT NULL,
  balance_cents    integer NOT NULL,
  paid_cents       integer NOT NULL DEFAULT 0,
  balance_due_date date NOT NULL,
  locale           text NOT NULL,
  requests         text NOT NULL DEFAULT '',
  review_reason    text,                          -- why a person must look at it (refund, reversal, mismatch…)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_active_by_cabin ON bookings (cabin_id) WHERE holds_berths;
CREATE INDEX bookings_pending_holds ON bookings (hold_expires_at) WHERE status = 'pending_payment';

CREATE TABLE guests (
  id         bigserial PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  position   integer NOT NULL,                    -- 1 = lead traveller
  first_name text NOT NULL,
  last_name  text NOT NULL,
  email      text,
  phone      text,
  country    text,
  UNIQUE (booking_id, position)
);

CREATE TABLE payments (
  id                text PRIMARY KEY,             -- our id, sent to PayPal as custom_id
  booking_id        text NOT NULL REFERENCES bookings(id),
  kind              text NOT NULL CHECK (kind IN ('deposit', 'balance')),
  amount_cents      integer NOT NULL CHECK (amount_cents > 0),
  currency          char(3) NOT NULL DEFAULT 'USD',
  status            text NOT NULL CHECK (status IN ('created', 'pending', 'completed', 'declined', 'cancelled', 'refunded', 'partially_refunded', 'reversed')),
  provider          text NOT NULL DEFAULT 'paypal',
  paypal_order_id   text UNIQUE,
  paypal_capture_id text UNIQUE,
  refunded_cents    integer NOT NULL DEFAULT 0,
  failure_reason    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz
);
CREATE INDEX payments_by_booking ON payments (booking_id);

-- Every PayPal webhook event once: the primary key stops a repeated delivery from being applied twice
CREATE TABLE payment_events (
  id           text PRIMARY KEY,                  -- PayPal event id
  event_type   text NOT NULL,
  resource_id  text,
  payload      jsonb NOT NULL,
  received_at  timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  outcome      text
);

-- Emails sent (or queued while no mail service is chosen); dedupe_key stops duplicates
CREATE TABLE email_log (
  id         bigserial PRIMARY KEY,
  booking_id text REFERENCES bookings(id),
  template   text NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  to_address text NOT NULL,
  subject    text NOT NULL,
  body       text NOT NULL,
  transport  text NOT NULL,
  sent_at    timestamptz NOT NULL DEFAULT now()
);

-- Last line of defence against double sales: a cabin never holds more berths than it has, and a
-- private cabin never shares. The application also locks the trip row while it allocates.
CREATE FUNCTION check_cabin_capacity() RETURNS trigger AS $$
DECLARE
  used integer;
  capacity integer;
  holders integer;
  has_private boolean;
BEGIN
  IF NOT NEW.holds_berths THEN
    RETURN NEW;
  END IF;
  SELECT berths INTO capacity FROM cabins WHERE id = NEW.cabin_id;
  SELECT coalesce(sum(berths), 0), count(*), coalesce(bool_or(private_cabin), false)
    INTO used, holders, has_private
    FROM bookings WHERE cabin_id = NEW.cabin_id AND holds_berths AND id <> NEW.id;
  IF used + NEW.berths > capacity THEN
    RAISE EXCEPTION 'cabin % is full', NEW.cabin_id USING ERRCODE = 'check_violation';
  END IF;
  IF holders > 0 AND (has_private OR NEW.private_cabin) THEN
    RAISE EXCEPTION 'cabin % is not available privately', NEW.cabin_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_cabin_capacity
  BEFORE INSERT OR UPDATE OF cabin_id, berths, private_cabin, holds_berths ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_cabin_capacity();

-- The voyage on sale and its four double cabins
INSERT INTO trips (id, journey, title, start_date, end_date, nights, currency, seat_price_cents, deposit_percent, balance_due_date)
VALUES ('caribbean-new-year-2026', 'caribbean', 'Caribbean New Year Escape', '2026-12-28', '2027-01-07', 10, 'USD', 420000, 30, '2026-11-28');

INSERT INTO cabins (id, trip_id, name, berths) VALUES
  ('caribbean-new-year-2026-1', 'caribbean-new-year-2026', 'Cabin 1', 2),
  ('caribbean-new-year-2026-2', 'caribbean-new-year-2026', 'Cabin 2', 2),
  ('caribbean-new-year-2026-3', 'caribbean-new-year-2026', 'Cabin 3', 2),
  ('caribbean-new-year-2026-4', 'caribbean-new-year-2026', 'Cabin 4', 2);
