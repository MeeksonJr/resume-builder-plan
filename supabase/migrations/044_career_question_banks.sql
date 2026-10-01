-- Migration: 044_career_question_banks.sql
-- Master Question Bank Cache and Practice Drills for RapidAPI Quick Assess and AI assessments

CREATE TABLE IF NOT EXISTS public.career_question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_field TEXT NOT NULL,
    career_slug TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    difficulty_numeric INT DEFAULT 5,
    source TEXT NOT NULL, -- 'rapidapi_quick_assess', 'jobcannon', 'gemini_ai', 'curated'
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    usage_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_career_topic_diff UNIQUE (career_slug, topic, difficulty)
);

CREATE INDEX IF NOT EXISTS idx_career_banks_slug ON public.career_question_banks(career_slug);
CREATE INDEX IF NOT EXISTS idx_career_banks_diff ON public.career_question_banks(difficulty);

ALTER TABLE public.career_question_banks ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated or public can read question banks (shared global knowledge base)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'career_question_banks' 
      AND policyname = 'Anyone can view career question banks'
  ) THEN
    CREATE POLICY "Anyone can view career question banks"
      ON public.career_question_banks
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Service role and authenticated users can insert/update question banks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'career_question_banks' 
      AND policyname = 'Authenticated users can insert into question banks'
  ) THEN
    CREATE POLICY "Authenticated users can insert into question banks"
      ON public.career_question_banks
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'career_question_banks' 
      AND policyname = 'Authenticated users can update question banks'
  ) THEN
    CREATE POLICY "Authenticated users can update question banks"
      ON public.career_question_banks
      FOR UPDATE
      USING (true);
  END IF;
END $$;

-- 2. User Skill Drill Results
CREATE TABLE IF NOT EXISTS public.user_skill_drills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    career_field TEXT NOT NULL,
    topic TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    score_percentage INT NOT NULL,
    time_spent_seconds INT NOT NULL DEFAULT 0,
    answers_review JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_skill_drills_user ON public.user_skill_drills(user_id);

ALTER TABLE public.user_skill_drills ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_skill_drills' 
      AND policyname = 'Users can view their own skill drills'
  ) THEN
    CREATE POLICY "Users can view their own skill drills"
      ON public.user_skill_drills
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_skill_drills' 
      AND policyname = 'Users can insert their own skill drills'
  ) THEN
    CREATE POLICY "Users can insert their own skill drills"
      ON public.user_skill_drills
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
