-- ============================================================
-- Yee Eyelashes Member System — Phase 0 Schema
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- One row per member, linked to Supabase auth.users
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  member_id             text unique not null,           -- e.g. YEE-00001
  first_name            text not null default '',
  last_name             text not null default '',
  email                 text,
  phone                 text,
  birthday              date,
  birthday_set_at       timestamptz,                    -- prevent frequent changes
  birthday_verified     boolean not null default false,

  -- Square / booking linkage
  square_customer_id    text,

  -- VIP
  vip_tier              text not null default 'member'  -- member | silver | gold | diamond
                        check (vip_tier in ('member','silver','gold','diamond')),
  vip_tier_updated_at   timestamptz,
  vip_manual_override   boolean not null default false,
  vip_override_reason   text,

  -- Cached stats (updated via trigger / cron)
  points_balance        integer not null default 0,
  total_spend_all_time  numeric(10,2) not null default 0,
  total_visits_all_time integer not null default 0,
  last_visit_date       date,

  -- Referral
  referral_code         text unique,
  referred_by           uuid references public.profiles(id),

  -- Notification preferences
  notif_refill          boolean not null default true,
  notif_birthday        boolean not null default true,
  notif_points          boolean not null default true,
  notif_marketing       boolean not null default false,

  -- Photo consent
  photo_consent_internal boolean not null default false,
  photo_consent_brand    boolean not null default false,

  -- Timestamps
  joined_at             timestamptz not null default now(),
  deleted_at            timestamptz
);

-- Auto-generate member_id: YEE-00001, YEE-00002, ...
create sequence if not exists member_id_seq start 1;

create or replace function generate_member_id()
returns trigger language plpgsql as $$
begin
  new.member_id := 'YEE-' || lpad(nextval('member_id_seq')::text, 5, '0');
  return new;
end;
$$;

create trigger trg_member_id
  before insert on public.profiles
  for each row
  when (new.member_id is null or new.member_id = '')
  execute function generate_member_id();

-- Auto-generate referral_code
create or replace function generate_referral_code()
returns trigger language plpgsql as $$
begin
  new.referral_code := upper(substring(md5(new.id::text) from 1 for 8));
  return new;
end;
$$;

create trigger trg_referral_code
  before insert on public.profiles
  for each row
  when (new.referral_code is null)
  execute function generate_referral_code();


-- ── 2. POINTS_TRANSACTIONS ──────────────────────────────────
-- Full ledger — never delete rows, always append
create table if not exists public.points_transactions (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references public.profiles(id) on delete restrict,
  type              text not null check (type in (
                      'purchase_earned',
                      'referral_reward',
                      'birthday_bonus',
                      'promotion_bonus',
                      'manual_adjustment',
                      'redemption',
                      'refund_adjustment',
                      'expired'
                    )),
  amount            integer not null,                   -- positive = earn, negative = spend
  balance_after     integer not null,
  booking_id        uuid,                               -- nullable ref to bookings
  revenue_entry_id  uuid,                               -- nullable ref to revenue_entries
  notes             text,
  created_by        text not null default 'system',     -- 'system' | admin name
  created_at        timestamptz not null default now()
);


-- ── 3. COUPONS (templates) ──────────────────────────────────
create table if not exists public.coupons (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  type                text not null check (type in (
                        'fixed_amount','percentage','free_product',
                        'free_addon','double_points',
                        'birthday','referral','winback','app_exclusive'
                      )),
  discount_type       text not null check (discount_type in ('fixed','percentage')),
  discount_value      numeric(10,2) not null,           -- $ amount or % (0-100)
  minimum_spend       numeric(10,2) not null default 0,
  applicable_services text[],                           -- null = all services
  excluded_services   text[],
  valid_days          integer,                          -- days from issue date (null = use valid_until)
  valid_until         date,                             -- fixed expiry (null = use valid_days)
  max_uses_total      integer,                          -- null = unlimited
  max_uses_per_member integer not null default 1,
  stackable           boolean not null default false,
  new_client_only     boolean not null default false,
  app_only            boolean not null default false,
  active              boolean not null default true,
  created_by          text not null default 'admin',
  created_at          timestamptz not null default now()
);


-- ── 4. MEMBER_COUPONS ───────────────────────────────────────
-- Each coupon issued to a specific member
create table if not exists public.member_coupons (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.profiles(id) on delete restrict,
  coupon_id   uuid not null references public.coupons(id) on delete restrict,
  status      text not null default 'available'
              check (status in ('available','reserved','used','expired','cancelled')),
  issued_at   timestamptz not null default now(),
  expires_at  timestamptz,
  used_at     timestamptz,
  used_by     text,                                     -- admin who redeemed
  booking_id  uuid,
  issued_by   text not null default 'system',
  notes       text
);


-- ── 5. LASH_RECORDS (Lash Passport) ────────────────────────
create table if not exists public.lash_records (
  id                  uuid primary key default gen_random_uuid(),
  member_id           uuid not null references public.profiles(id) on delete restrict,
  booking_id          uuid,
  service_date        date not null,
  technician_name     text,
  service_type        text,                             -- 'New Full Set' | 'Refill' | etc.
  material            text,                             -- 'Classic' | 'Volume' | 'Cashmere' | etc.
  lash_count          integer,
  style               text,                             -- 'Cat Eye' | 'Doll Eye' | etc.
  left_eye_design     text,
  right_eye_design    text,
  length              text,                             -- e.g. '10-13mm'
  curl                text,                             -- 'C' | 'D' | 'L' | etc.
  thickness           text,                             -- '0.07' | '0.10' | etc.
  glue                text,
  eye_mapping         jsonb,
  before_photo_url    text,
  after_photo_url     text,
  client_requests     text,
  allergy_notes       text,
  retention_days      integer,                          -- filled on next visit
  next_refill_date    date,
  technician_notes    text,
  is_favorite         boolean not null default false,
  photo_consent       text not null default 'private'
                      check (photo_consent in ('private','internal','brand')),
  created_by          text not null default 'system',
  created_at          timestamptz not null default now()
);


-- ── 6. REFERRALS ────────────────────────────────────────────
create table if not exists public.referrals (
  id                       uuid primary key default gen_random_uuid(),
  referrer_id              uuid not null references public.profiles(id) on delete restrict,
  referee_id               uuid not null references public.profiles(id) on delete restrict,
  status                   text not null default 'pending'
                           check (status in ('pending','completed','rewarded','cancelled')),
  referee_first_booking_id uuid,
  referrer_rewarded_at     timestamptz,
  referee_rewarded_at      timestamptz,
  created_at               timestamptz not null default now(),
  unique (referrer_id, referee_id)
);


-- ── 7. NOTIFICATIONS ────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in (
               'booking_confirmation','booking_reminder',
               'refill_reminder','coupon_expiry','points_expiry',
               'birthday_reward','referral_success','marketing','winback'
             )),
  channel    text not null check (channel in ('push','sms','email')),
  title      text not null,
  body       text not null,
  action_url text,
  sent_at    timestamptz not null default now(),
  read_at    timestamptz
);


-- ── 8. MEMBER_AUDIT_LOG ─────────────────────────────────────
-- Track every admin action on a member account
create table if not exists public.member_audit_log (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid references public.profiles(id) on delete set null,
  action       text not null,
  performed_by text not null,
  details      jsonb,
  created_at   timestamptz not null default now()
);


-- ── 9. LINK EXISTING DATA ───────────────────────────────────
-- Add member_id column to existing bookings table for linkage
alter table public.bookings
  add column if not exists member_id uuid references public.profiles(id) on delete set null;

-- Add member_id to revenue_entries for point calculation
alter table public.revenue_entries
  add column if not exists member_id uuid references public.profiles(id) on delete set null,
  add column if not exists points_awarded integer,
  add column if not exists points_awarded_at timestamptz;


-- ── 10. ROW LEVEL SECURITY ──────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.points_transactions enable row level security;
alter table public.coupons           enable row level security;
alter table public.member_coupons    enable row level security;
alter table public.lash_records      enable row level security;
alter table public.referrals         enable row level security;
alter table public.notifications     enable row level security;
alter table public.member_audit_log  enable row level security;

-- Members can only read their own data
create policy "members read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "members update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "members read own points"
  on public.points_transactions for select
  using (auth.uid() = member_id);

create policy "members read own coupons"
  on public.member_coupons for select
  using (auth.uid() = member_id);

create policy "members read coupon templates"
  on public.coupons for select
  using (active = true);

create policy "members read own lash records"
  on public.lash_records for select
  using (auth.uid() = member_id);

create policy "members read own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "members read own notifications"
  on public.notifications for select
  using (auth.uid() = member_id);

create policy "members update own notifications"
  on public.notifications for update
  using (auth.uid() = member_id);


-- ── 11. INDEXES ─────────────────────────────────────────────
create index if not exists idx_profiles_phone       on public.profiles(phone);
create index if not exists idx_profiles_email       on public.profiles(email);
create index if not exists idx_profiles_referral    on public.profiles(referral_code);
create index if not exists idx_points_member        on public.points_transactions(member_id);
create index if not exists idx_points_created       on public.points_transactions(created_at desc);
create index if not exists idx_member_coupons_mem   on public.member_coupons(member_id, status);
create index if not exists idx_lash_member          on public.lash_records(member_id, service_date desc);
create index if not exists idx_bookings_member      on public.bookings(member_id);
create index if not exists idx_revenue_member       on public.revenue_entries(member_id);
create index if not exists idx_notifications_member on public.notifications(member_id, sent_at desc);
