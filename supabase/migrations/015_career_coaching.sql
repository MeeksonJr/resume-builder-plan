-- Add career goals fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS target_industry TEXT,
ADD COLUMN IF NOT EXISTS career_goals TEXT;
