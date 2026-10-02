-- Migration 046: Rich University Portal & Campus Directory
-- Expands university_insights_cache with departments, clubs, faculty professors, campus links, and career fairs

ALTER TABLE public.university_insights_cache 
  ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS clubs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS professors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_fairs JSONB DEFAULT '[]'::jsonb;

-- Index on school_slug for high performance reads
CREATE INDEX IF NOT EXISTS idx_university_insights_slug 
  ON public.university_insights_cache (school_slug);
