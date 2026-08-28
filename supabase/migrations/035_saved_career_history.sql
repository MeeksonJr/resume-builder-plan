-- Create saved_salary_insights table
CREATE TABLE IF NOT EXISTS public.saved_salary_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    location TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    low NUMERIC NOT NULL,
    median NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    market_demand TEXT DEFAULT 'Steady',
    location_multiplier NUMERIC DEFAULT 1.0,
    skills_valuation JSONB DEFAULT '[]',
    negotiation_points JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create saved_skills_gaps table
CREATE TABLE IF NOT EXISTS public.saved_skills_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    target_role TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    matching_skills JSONB DEFAULT '[]',
    missing_hard_skills JSONB DEFAULT '[]',
    missing_soft_skills JSONB DEFAULT '[]',
    recommended_certifications JSONB DEFAULT '[]',
    action_steps JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_salary_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_skills_gaps ENABLE ROW LEVEL SECURITY;

-- Policies for saved_salary_insights
CREATE POLICY "Users can manage their own saved salary insights" 
    ON public.saved_salary_insights FOR ALL
    USING (auth.uid() = user_id);

-- Policies for saved_skills_gaps
CREATE POLICY "Users can manage their own saved skills gaps" 
    ON public.saved_skills_gaps FOR ALL
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_salary_insights_user_id ON public.saved_salary_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_salary_insights_created_at ON public.saved_salary_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_skills_gaps_user_id ON public.saved_skills_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_skills_gaps_created_at ON public.saved_skills_gaps(created_at DESC);

-- Updated at triggers
CREATE TRIGGER update_saved_salary_insights_updated_at 
    BEFORE UPDATE ON public.saved_salary_insights 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_skills_gaps_updated_at 
    BEFORE UPDATE ON public.saved_skills_gaps 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Database-level check trigger to enforce plan-wise save limits
CREATE OR REPLACE FUNCTION check_save_limits() RETURNS TRIGGER AS $$
DECLARE
    is_pro_user BOOLEAN;
    saved_count INTEGER;
BEGIN
    -- Get is_pro status from profiles
    SELECT (is_pro = true OR subscription_status = 'active' OR subscription_status = 'trialing')
    INTO is_pro_user
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NOT COALESCE(is_pro_user, false) THEN
        -- Check count depending on table name
        IF TG_TABLE_NAME = 'career_analyses' THEN
            SELECT COUNT(*) INTO saved_count FROM public.career_analyses WHERE user_id = NEW.user_id;
            IF saved_count >= 1 THEN
                RAISE EXCEPTION 'Free plan limit reached. Free users can only save 1 Career Roadmap. Please upgrade to Pro.';
            END IF;
        ELSIF TG_TABLE_NAME = 'saved_skills_gaps' THEN
            SELECT COUNT(*) INTO saved_count FROM public.saved_skills_gaps WHERE user_id = NEW.user_id;
            IF saved_count >= 1 THEN
                RAISE EXCEPTION 'Free plan limit reached. Free users can only save 1 Skills Gap Audit. Please upgrade to Pro.';
            END IF;
        ELSIF TG_TABLE_NAME = 'saved_salary_insights' THEN
            SELECT COUNT(*) INTO saved_count FROM public.saved_salary_insights WHERE user_id = NEW.user_id;
            IF saved_count >= 1 THEN
                RAISE EXCEPTION 'Free plan limit reached. Free users can only save 1 Salary Insight. Please upgrade to Pro.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind limit check triggers
DROP TRIGGER IF EXISTS trigger_career_analyses_save_limit ON public.career_analyses;
CREATE TRIGGER trigger_career_analyses_save_limit
    BEFORE INSERT ON public.career_analyses
    FOR EACH ROW EXECUTE FUNCTION check_save_limits();

DROP TRIGGER IF EXISTS trigger_saved_skills_gaps_save_limit ON public.saved_skills_gaps;
CREATE TRIGGER trigger_saved_skills_gaps_save_limit
    BEFORE INSERT ON public.saved_skills_gaps
    FOR EACH ROW EXECUTE FUNCTION check_save_limits();

DROP TRIGGER IF EXISTS trigger_saved_salary_insights_save_limit ON public.saved_salary_insights;
CREATE TRIGGER trigger_saved_salary_insights_save_limit
    BEFORE INSERT ON public.saved_salary_insights
    FOR EACH ROW EXECUTE FUNCTION check_save_limits();
