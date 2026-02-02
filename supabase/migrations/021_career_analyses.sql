-- Career Analyses table to store AI-generated career coach results
CREATE TABLE IF NOT EXISTS public.career_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT,
    target_industry TEXT,
    match_percentage INTEGER,
    strengths JSONB DEFAULT '[]',
    gaps JSONB DEFAULT '[]',
    roadmap JSONB DEFAULT '[]',
    project_ideas JSONB DEFAULT '[]',
    market_trend TEXT,
    hiring_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.career_analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "career_analyses_select_own" ON public.career_analyses 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "career_analyses_insert_own" ON public.career_analyses 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "career_analyses_delete_own" ON public.career_analyses 
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_career_analyses_user_id ON public.career_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_career_analyses_created_at ON public.career_analyses(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_career_analyses_updated_at 
    BEFORE UPDATE ON public.career_analyses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
