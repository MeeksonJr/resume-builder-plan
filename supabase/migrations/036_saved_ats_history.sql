-- Create saved_ats_analyses table
CREATE TABLE IF NOT EXISTS public.saved_ats_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    target_role TEXT,
    job_description TEXT,
    score INTEGER NOT NULL,
    breakdown JSONB DEFAULT '[]',
    missing_keywords JSONB DEFAULT '[]',
    overall_feedback TEXT,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_ats_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for saved_ats_analyses
CREATE POLICY "Users can manage their own saved ats analyses" 
    ON public.saved_ats_analyses FOR ALL
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_ats_analyses_user_id ON public.saved_ats_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_ats_analyses_created_at ON public.saved_ats_analyses(created_at DESC);

-- Updated at triggers
CREATE TRIGGER update_saved_ats_analyses_updated_at 
    BEFORE UPDATE ON public.saved_ats_analyses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update check_save_limits trigger function to support saved_ats_analyses
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
        ELSIF TG_TABLE_NAME = 'saved_ats_analyses' THEN
            SELECT COUNT(*) INTO saved_count FROM public.saved_ats_analyses WHERE user_id = NEW.user_id;
            IF saved_count >= 1 THEN
                RAISE EXCEPTION 'Free plan limit reached. Free users can only save 1 ATS Report. Please upgrade to Pro.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind check trigger to saved_ats_analyses
DROP TRIGGER IF EXISTS trigger_saved_ats_analyses_save_limit ON public.saved_ats_analyses;
CREATE TRIGGER trigger_saved_ats_analyses_save_limit
    BEFORE INSERT ON public.saved_ats_analyses
    FOR EACH ROW EXECUTE FUNCTION check_save_limits();
