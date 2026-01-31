-- PHASE 27 SCHEMA SYNC V2
-- Run this in Supabase SQL Editor to ensure all sub-tables are aligned

-- 1. Fix Languages Table
-- If it has 'language' column, rename it to 'name' or just ensure 'name' exists.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='languages' AND column_name='language') THEN
    ALTER TABLE public.languages RENAME COLUMN "language" TO "name";
  END IF;
END $$;

ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS "proficiency" TEXT;
ALTER TABLE public.languages ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0;

-- 2. Fix Education Table
-- Ensure 'achievements' exists (some might have 'highlights' or nothing)
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS "achievements" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.education ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0;

-- 3. Fix Work Experience Table
-- Ensure 'highlights' exists
ALTER TABLE public.work_experiences ADD COLUMN IF NOT EXISTS "highlights" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.work_experiences ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0;

-- 4. Fix Certifications Table
-- Ensure correct column names
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "issue_date" DATE;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "expiry_date" DATE;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "credential_id" TEXT;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "credential_url" TEXT;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0;

-- 5. Refresh the schema cache
NOTIFY pgrst, 'reload schema';
