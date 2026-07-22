-- Run in Supabase SQL Editor
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recorded_by text;
