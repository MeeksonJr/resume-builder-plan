-- PHASE 27 SCHEMA SYNC
-- Run this in your Supabase SQL Editor to fix Save (400) errors

-- 1. Fix Resumes Table (Add missing performance and UI columns)
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["experience", "education", "skills", "projects", "certifications", "languages"]'::jsonb;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS visual_config JSONB DEFAULT '{
  "accentColor": "#0070f3",
  "fontFamily": "Inter",
  "fontSize": "standard",
  "lineHeight": "relaxed"
}'::jsonb;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS is_rtl BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 2. Ensure sub-tables have correct RLS and columns
-- Note: Sub-tables like work_experiences and education link via resume_id.
-- If you see errors about missing user_id on these tables, it's because the code was 
-- incorrectly trying to send them. We will fix the code, but ensure RLS is correct here.

-- 3. Create missing tables if they don't exist (Portfolio & Interview Prep)
CREATE TABLE IF NOT EXISTS public.resume_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, 
  browser TEXT,
  os TEXT,
  device TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Final verification: Refresh the PostgREST schema cache
-- (Supabase does this automatically when you run DDL, but good to be aware of)
