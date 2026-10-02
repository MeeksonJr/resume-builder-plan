-- Migration 047: Demo Trial Access Control
-- Adds columns to track instant demo usage and enforce 24-hour trial limit

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS demo_trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo_user BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Index for quick lookup of expired demo users
CREATE INDEX IF NOT EXISTS idx_profiles_demo_trial
  ON public.profiles (demo_trial_started_at)
  WHERE demo_trial_started_at IS NOT NULL;

-- Helper function: returns true if user's demo trial is still valid (within 24 hours)
CREATE OR REPLACE FUNCTION public.is_demo_trial_active(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_demo_started TIMESTAMPTZ;
  v_email_verified BOOLEAN;
BEGIN
  SELECT demo_trial_started_at, email_verified
  INTO v_demo_started, v_email_verified
  FROM public.profiles
  WHERE id = p_user_id;

  -- If email is verified, no trial restriction
  IF v_email_verified = true THEN
    RETURN true;
  END IF;

  -- If demo trial started and within 24 hours, still active
  IF v_demo_started IS NOT NULL AND v_demo_started > NOW() - INTERVAL '24 hours' THEN
    RETURN true;
  END IF;

  -- Otherwise trial expired or never started
  RETURN false;
END;
$$;
