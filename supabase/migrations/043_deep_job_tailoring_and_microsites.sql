-- Migration: 043_deep_job_tailoring_and_microsites.sql
-- Enables deep job tailoring with complete from-scratch resumes, cover letters, and dedicated job portfolio pages

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS job_description TEXT,
  ADD COLUMN IF NOT EXISTS tailored_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dedicated_portfolio_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dedicated_portfolio_data JSONB DEFAULT '{}'::jsonb;

-- Public can view applications that have dedicated job portfolio pages enabled (if owner's portfolio is public)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'applications' 
      AND policyname = 'Public can view dedicated job portfolios'
  ) THEN
    CREATE POLICY "Public can view dedicated job portfolios"
      ON public.applications
      FOR SELECT
      USING (
        dedicated_portfolio_enabled = true
        AND EXISTS (
          SELECT 1 FROM public.portfolios
          WHERE portfolios.user_id = applications.user_id
            AND portfolios.is_public = true
        )
      );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
