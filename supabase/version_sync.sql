-- VERSION CONTROL SYNC
-- Run this if Save Version is failing with 400 errors

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  template TEXT,
  snapshot_data JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID NOT NULL,
  UNIQUE(resume_id, version_number)
);

-- 2. Ensure Metrics Table Exists
CREATE TABLE IF NOT EXISTS public.version_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID REFERENCES public.resume_versions(id) ON DELETE CASCADE NOT NULL,
  applications_sent INTEGER DEFAULT 0,
  interviews_received INTEGER DEFAULT 0,
  offers_received INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(version_id)
);

-- 3. Ensure the RPC function exists with correct signature
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

-- 4. Set Permissions
GRANT EXECUTE ON FUNCTION public.get_next_version_number TO anon, authenticated, service_role;

-- 5. RLS Policies
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own resume versions" ON public.resume_versions;
CREATE POLICY "Users can view their own resume versions"
  ON public.resume_versions FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create versions for their resumes" ON public.resume_versions;
CREATE POLICY "Users can create versions for their resumes"
  ON public.resume_versions FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
