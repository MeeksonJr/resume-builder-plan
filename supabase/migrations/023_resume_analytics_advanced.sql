-- Create resume_views table for granular tracking
CREATE TABLE IF NOT EXISTS public.resume_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    viewer_ip_hash TEXT,
    device_type TEXT,
    country_code TEXT,
    city TEXT,
    referrer TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast querying by resume
CREATE INDEX IF NOT EXISTS idx_resume_views_resume_id ON public.resume_views(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_views_viewed_at ON public.resume_views(viewed_at);

-- Enable RLS
ALTER TABLE public.resume_views ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Resume Owners can view their analytics
CREATE POLICY "Users can view analytics for their resumes"
    ON public.resume_views FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_views.resume_id
            AND public.resumes.user_id = auth.uid()
        )
    );

-- 2. Service role can manage everything (default, but good to be explicit if needed, though usually implicit)
-- No public insert policy needed because we will use the API route with Service Role to track.

-- RPC to get aggregated stats (faster than selecting all rows on the client)
CREATE OR REPLACE FUNCTION get_resume_stats(resume_id_param UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_visitors BIGINT,
    last_7_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT viewer_ip_hash) as unique_visitors,
        COUNT(*) FILTER (WHERE viewed_at > NOW() - INTERVAL '7 days') as last_7_days
    FROM public.resume_views
    WHERE resume_id = resume_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
