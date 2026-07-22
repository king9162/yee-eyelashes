-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  category text NOT NULL,
  vendor text,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'bank',
  notes text,
  created_at timestamptz DEFAULT now()
);
