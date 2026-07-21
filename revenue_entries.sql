-- Run this in Supabase SQL Editor
create table if not exists revenue_entries (
  id               uuid primary key default gen_random_uuid(),
  date             date not null,
  client_name      text not null default '',
  service_label    text not null default '',
  amount           numeric(10,2) not null default 0,
  tip              numeric(10,2) not null default 0,
  payment_method   text not null default 'cash',
  square_payment_id text unique,
  notes            text,
  created_at       timestamptz default now()
);

create index if not exists revenue_entries_date_idx on revenue_entries(date desc);

-- Allow admin service role full access (RLS disabled for service role)
alter table revenue_entries enable row level security;
create policy "Service role full access" on revenue_entries
  for all using (true) with check (true);
