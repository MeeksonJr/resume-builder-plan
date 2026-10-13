-- Consolidated Missing Tables Migration
-- Safe & idempotent script to create peer reviews, question banks, skill drills, and university tables.

-- 1. Resume Peer Review Comments
CREATE TABLE IF NOT EXISTS public.resume_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Mentor Reviewer',
    author_email TEXT,
    author_role TEXT NOT NULL DEFAULT 'mentor',
    section_target TEXT NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    suggested_text TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_comments_resume_id ON public.resume_comments(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_comments_status ON public.resume_comments(status);

ALTER TABLE public.resume_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public or owner can read resume comments" ON public.resume_comments;
    CREATE POLICY "Public or owner can read resume comments"
        ON public.resume_comments FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.resumes
                WHERE resumes.id = resume_comments.resume_id
                AND (resumes.is_public = TRUE OR resumes.user_id = auth.uid())
            )
        );

    DROP POLICY IF EXISTS "Anyone can insert comments on public resumes" ON public.resume_comments;
    CREATE POLICY "Anyone can insert comments on public resumes"
        ON public.resume_comments FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.resumes
                WHERE resumes.id = resume_comments.resume_id
                AND (resumes.is_public = TRUE OR resumes.user_id = auth.uid())
            )
        );

    DROP POLICY IF EXISTS "Resume owner can update comment status" ON public.resume_comments;
    CREATE POLICY "Resume owner can update comment status"
        ON public.resume_comments FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM public.resumes
                WHERE resumes.id = resume_comments.resume_id
                AND resumes.user_id = auth.uid()
            )
        );
END $$;

-- 2. Career Question Banks
CREATE TABLE IF NOT EXISTS public.career_question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_field TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'senior',
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'situational',
    options JSONB,
    sample_answer TEXT,
    source TEXT NOT NULL DEFAULT 'rapidapi',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_qb_field ON public.career_question_banks(career_field);
CREATE INDEX IF NOT EXISTS idx_career_qb_difficulty ON public.career_question_banks(difficulty);

ALTER TABLE public.career_question_banks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can read career questions" ON public.career_question_banks;
    CREATE POLICY "Anyone can read career questions"
        ON public.career_question_banks FOR SELECT
        USING (true);
END $$;

-- 3. User Skill Drills
CREATE TABLE IF NOT EXISTS public.user_skill_drills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    drill_id TEXT NOT NULL,
    career_field TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    submission_data JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_drills_user ON public.user_skill_drills(user_id);

ALTER TABLE public.user_skill_drills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users manage their own skill drills" ON public.user_skill_drills;
    CREATE POLICY "Users manage their own skill drills"
        ON public.user_skill_drills FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
END $$;

-- 4. User Verified Schools & Institutional Memberships
CREATE TABLE IF NOT EXISTS public.user_verified_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    school_slug TEXT NOT NULL,
    school_name TEXT NOT NULL,
    edu_email TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    verification_code TEXT,
    status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_slug)
);

CREATE INDEX IF NOT EXISTS idx_verified_schools_user ON public.user_verified_schools(user_id);
CREATE INDEX IF NOT EXISTS idx_verified_schools_slug ON public.user_verified_schools(school_slug);

ALTER TABLE public.user_verified_schools ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can read own verified schools" ON public.user_verified_schools;
    CREATE POLICY "Users can read own verified schools"
        ON public.user_verified_schools FOR SELECT
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own verified schools" ON public.user_verified_schools;
    CREATE POLICY "Users can insert own verified schools"
        ON public.user_verified_schools FOR INSERT
        WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. University Insights Cache
CREATE TABLE IF NOT EXISTS public.university_insights_cache (
    school_slug TEXT PRIMARY KEY,
    school_name TEXT NOT NULL,
    overview TEXT,
    location TEXT,
    website TEXT,
    career_center_name TEXT,
    top_majors TEXT[],
    key_stats JSONB,
    news_and_events JSONB,
    departments JSONB,
    clubs JSONB,
    professors JSONB,
    key_links JSONB,
    career_fairs JSONB,
    daily_routine_date TEXT,
    last_refreshed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.university_insights_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can read university cache" ON public.university_insights_cache;
    CREATE POLICY "Public can read university cache"
        ON public.university_insights_cache FOR SELECT
        USING (true);
END $$;
