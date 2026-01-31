-- Migration for Advanced Analytics and Event Tracking

-- 1. Create the resume_events table
CREATE TABLE IF NOT EXISTS public.resume_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the resume
  event_type TEXT NOT NULL, -- 'view', 'download'
  browser TEXT,
  os TEXT,
  device TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.resume_events ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Owners can view their own analytics
CREATE POLICY "Users can view their own resume events"
ON public.resume_events FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can insert (anonymously or logged in) when viewing/downloading a resume
-- But we need to ensure they can't spam it. 
-- For now, we allow insertions if they know the resume_id.
CREATE POLICY "Public can insert resume events"
ON public.resume_events FOR INSERT
WITH CHECK (true);

-- 4. RPC to record events
CREATE OR REPLACE FUNCTION record_resume_event(
  resume_id_param UUID,
  event_type_param TEXT,
  browser_param TEXT DEFAULT NULL,
  os_param TEXT DEFAULT NULL,
  device_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  country_param TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  resume_owner_id UUID;
BEGIN
  -- Get the owner of the resume
  SELECT user_id INTO resume_owner_id FROM public.resumes WHERE id = resume_id_param;
  
  -- Insert the event
  INSERT INTO public.resume_events (
    resume_id,
    user_id,
    event_type,
    browser,
    os,
    device,
    city,
    country
  ) VALUES (
    resume_id_param,
    resume_owner_id,
    event_type_param,
    browser_param,
    os_param,
    device_param,
    city_param,
    country_param
  );

  -- Also update the main counters for backward compatibility
  IF event_type_param = 'view' THEN
    UPDATE public.resumes
    SET view_count = view_count + 1,
        last_viewed_at = NOW()
    WHERE id = resume_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_events_resume_id ON public.resume_events(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_events_user_id ON public.resume_events(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_events_created_at ON public.resume_events(created_at);
