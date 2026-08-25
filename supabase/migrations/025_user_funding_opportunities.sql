-- Migration: User funding opportunities tracking
-- Link users to global funding opportunities with saved/applied statuses and essay drafts

CREATE TABLE IF NOT EXISTS public.user_funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('saved', 'applying', 'applied', 'dismissed')),
  essay_draft TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE public.user_funding_opportunities ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage their own funding associations" ON public.user_funding_opportunities;
CREATE POLICY "Users can manage their own funding associations"
  ON public.user_funding_opportunities FOR ALL
  USING (auth.uid() = user_id);

-- Update trigger
CREATE OR REPLACE FUNCTION public.touch_user_funding_opportunity_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_funding_opportunities_updated_at ON public.user_funding_opportunities;
CREATE TRIGGER user_funding_opportunities_updated_at
  BEFORE UPDATE ON public.user_funding_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_funding_opportunity_updated_at();

NOTIFY pgrst, 'reload schema';
