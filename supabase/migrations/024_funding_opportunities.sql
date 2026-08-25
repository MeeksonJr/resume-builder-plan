-- Global funding opportunity catalog populated by approved provider adapters.
CREATE TABLE IF NOT EXISTS public.funding_opportunities (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('scholarship', 'grant', 'fellowship', 'aid')),
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount_min NUMERIC,
  amount_max NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  deadline DATE,
  application_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  education_levels TEXT[] NOT NULL DEFAULT '{}',
  majors TEXT[] NOT NULL DEFAULT '{}',
  careers TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  year INTEGER,
  eligibility TEXT[] NOT NULL DEFAULT '{}',
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.funding_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funding_opportunities_public_read" ON public.funding_opportunities;
CREATE POLICY "funding_opportunities_public_read"
  ON public.funding_opportunities FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "funding_opportunities_auth_insert" ON public.funding_opportunities;
CREATE POLICY "funding_opportunities_auth_insert"
  ON public.funding_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "funding_opportunities_auth_update" ON public.funding_opportunities;
CREATE POLICY "funding_opportunities_auth_update"
  ON public.funding_opportunities FOR UPDATE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS funding_opportunities_kind_idx
  ON public.funding_opportunities(kind);
CREATE INDEX IF NOT EXISTS funding_opportunities_deadline_idx
  ON public.funding_opportunities(deadline);
CREATE INDEX IF NOT EXISTS funding_opportunities_keywords_idx
  ON public.funding_opportunities USING GIN(keywords);
CREATE INDEX IF NOT EXISTS funding_opportunities_majors_idx
  ON public.funding_opportunities USING GIN(majors);
CREATE INDEX IF NOT EXISTS funding_opportunities_education_levels_idx
  ON public.funding_opportunities USING GIN(education_levels);

CREATE OR REPLACE FUNCTION public.touch_funding_opportunity_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS funding_opportunities_updated_at ON public.funding_opportunities;
CREATE TRIGGER funding_opportunities_updated_at
  BEFORE UPDATE ON public.funding_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.touch_funding_opportunity_updated_at();

NOTIFY pgrst, 'reload schema';
