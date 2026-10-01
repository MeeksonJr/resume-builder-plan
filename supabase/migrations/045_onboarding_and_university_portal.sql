-- Migration 045: Onboarding, School Verification, University Portal Cache, and Reverse Job Board Marketplace

-- 1. Extend profiles for onboarding, student status, and reverse job board
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS university_name TEXT,
  ADD COLUMN IF NOT EXISTS university_slug TEXT,
  ADD COLUMN IF NOT EXISTS school_email TEXT,
  ADD COLUMN IF NOT EXISTS school_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS desired_salary_min NUMERIC,
  ADD COLUMN IF NOT EXISTS desired_salary_max NUMERIC,
  ADD COLUMN IF NOT EXISTS marketplace_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketplace_headline TEXT,
  ADD COLUMN IF NOT EXISTS marketplace_anonymous BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketplace_skills TEXT[] DEFAULT '{}';

-- 2. School verification codes table
CREATE TABLE IF NOT EXISTS public.school_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_email TEXT NOT NULL,
  university_slug TEXT NOT NULL,
  university_name TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.school_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own verification codes"
  ON public.school_verification_codes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. University Insights and Portal Cache (to preserve 20 req/mo RapidAPI limit)
CREATE TABLE IF NOT EXISTS public.university_insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_slug TEXT NOT NULL UNIQUE,
  school_name TEXT NOT NULL,
  overview TEXT,
  location TEXT,
  website TEXT,
  career_center_name TEXT,
  top_majors TEXT[] DEFAULT '{}',
  key_stats JSONB DEFAULT '{}'::jsonb,
  news_and_events JSONB DEFAULT '[]'::jsonb,
  raw_search_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.university_insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read university cache"
  ON public.university_insights_cache
  FOR SELECT
  USING (true);

-- 4. Marketplace Intro Requests Table
CREATE TABLE IF NOT EXISTS public.marketplace_intro_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruiter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recruiter_name TEXT NOT NULL,
  recruiter_company TEXT NOT NULL,
  recruiter_email TEXT NOT NULL,
  job_role TEXT NOT NULL,
  salary_offered TEXT,
  custom_pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

ALTER TABLE public.marketplace_intro_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates and recruiters can view their intro requests"
  ON public.marketplace_intro_requests
  FOR SELECT
  USING (auth.uid() = candidate_user_id OR auth.uid() = recruiter_user_id);

CREATE POLICY "Authenticated users can create intro requests"
  ON public.marketplace_intro_requests
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Candidates can update intro requests sent to them"
  ON public.marketplace_intro_requests
  FOR UPDATE
  USING (auth.uid() = candidate_user_id);
