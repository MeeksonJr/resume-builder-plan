-- Migration 039: Add target_role and target_company to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS target_company TEXT;
