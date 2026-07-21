-- Run these in Supabase SQL Editor

ALTER TABLE revenue_entries ADD COLUMN IF NOT EXISTS recorded_by text;

CREATE TABLE IF NOT EXISTS revenue_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id text,
  action text NOT NULL,
  changed_by text,
  changed_at timestamptz DEFAULT now(),
  details jsonb
);
