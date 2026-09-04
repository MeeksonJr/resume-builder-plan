-- Career Analytics Snapshots
-- Caches AI-generated career trajectory reports and periodic intelligence summaries

CREATE TABLE IF NOT EXISTS public.career_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_type TEXT NOT NULL DEFAULT 'trajectory_report',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.career_analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own analytics snapshots"
    ON public.career_analytics_snapshots FOR ALL
    USING (auth.uid() = user_id);

-- Indexes for fast latest-snapshot lookups
CREATE INDEX IF NOT EXISTS idx_career_analytics_snapshots_user_type
    ON public.career_analytics_snapshots(user_id, snapshot_type, created_at DESC);
