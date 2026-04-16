-- ── Bookings table ────────────────────────────────────────────
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  phone         text not null,
  email         text not null,
  service       text not null,
  service_label text not null,
  date          date not null,
  time          text not null,
  notes         text,
  status        text not null default 'pending',  -- pending | confirmed | cancelled
  calendar_event_id text
);

-- Allow API to insert
alter table bookings enable row level security;

create policy "service role full access"
  on bookings for all
  using (true)
  with check (true);

-- ── Admin users (Betty) ───────────────────────────────────────
-- Uses Supabase Auth — just create user via Supabase dashboard
-- Authentication → Users → Invite user → betty@yeeeyelashes.com
