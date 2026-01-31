-- VERSION COLUMN SYNC (REPAIR)
-- Run this in Supabase SQL Editor to fix the "column version_number does not exist" error

DO $$ 
BEGIN
    -- 1. Rename 'content' to 'snapshot_data' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resume_versions' AND column_name='content') THEN
        ALTER TABLE public.resume_versions RENAME COLUMN "content" TO "snapshot_data";
    END IF;

    -- 2. Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resume_versions' AND column_name='version_number') THEN
        ALTER TABLE public.resume_versions ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resume_versions' AND column_name='title') THEN
        ALTER TABLE public.resume_versions ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Version';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resume_versions' AND column_name='change_summary') THEN
        ALTER TABLE public.resume_versions ADD COLUMN change_summary TEXT;
    END IF;

    -- 3. Correct created_by default (should not be random, but we'll leave it for now and fix logic in code)
    -- Actually, let's make it nullable or remove default if it's currently problematic
    ALTER TABLE public.resume_versions ALTER COLUMN created_by DROP DEFAULT;
END $$;

-- 4. Re-create the RPC function to ensure it uses the correct columns
CREATE OR REPLACE FUNCTION public.get_next_version_number(p_resume_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_number
  FROM public.resume_versions
  WHERE resume_id = p_resume_id;
  
  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_next_version_number TO anon, authenticated, service_role;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
