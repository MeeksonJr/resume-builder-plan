-- Cache for dashboard AI insights to prevent rate limiting
CREATE TABLE IF NOT EXISTS public.dashboard_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insights JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_insights UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.dashboard_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "dashboard_insights_select_own" ON public.dashboard_insights 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "dashboard_insights_insert_own" ON public.dashboard_insights 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dashboard_insights_update_own" ON public.dashboard_insights 
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_user_id ON public.dashboard_insights(user_id);

-- Updated at trigger
CREATE TRIGGER update_dashboard_insights_updated_at 
    BEFORE UPDATE ON public.dashboard_insights 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
