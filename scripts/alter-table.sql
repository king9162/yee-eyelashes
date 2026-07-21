-- Step 1: Add elly column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS elly TEXT DEFAULT '';
