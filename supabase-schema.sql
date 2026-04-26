-- ── Bookings table ────────────────────────────────────────────
create table if not exists bookings (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  name               text not null,
  phone              text not null,
  email              text not null,
  service            text not null,
  service_label      text not null,
  date               date not null,
  time               text not null,
  notes              text,
  duration_min       integer,
  status             text not null default 'pending',  -- pending | pending_payment | confirmed | cancelled
  payment_status     text default 'pending',           -- pending | paid
  calendar_event_id  text,
  square_checkout_id text,
  square_order_id    text,
  square_payment_id  text
);

-- Allow API to insert
alter table bookings enable row level security;

create policy "service role full access"
  on bookings for all
  using (true)
  with check (true);

-- ── Migration: add Square payment columns (run if table already exists) ──
-- alter table bookings add column if not exists duration_min integer;
-- alter table bookings add column if not exists payment_status text default 'pending';
-- alter table bookings add column if not exists square_checkout_id text;
-- alter table bookings add column if not exists square_order_id text;
-- alter table bookings add column if not exists square_payment_id text;

-- ── Blocked dates table ───────────────────────────────────────
create table if not exists blocked_dates (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  reason     text,
  created_at timestamptz not null default now()
);

alter table blocked_dates enable row level security;

create policy "service role full access"
  on blocked_dates for all
  using (true)
  with check (true);

-- ── Admin users (Betty) ───────────────────────────────────────
-- Uses Supabase Auth — just create user via Supabase dashboard
-- Authentication → Users → Invite user → betty@yeeeyelashes.com
