-- Migration 041: Resume Peer Review & Collaborative Comments (Phase 43)

CREATE TABLE IF NOT EXISTS public.resume_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional if authenticated
    author_name TEXT NOT NULL DEFAULT 'Mentor Reviewer',
    author_email TEXT,
    author_role TEXT NOT NULL DEFAULT 'mentor', -- 'mentor' | 'recruiter' | 'peer' | 'career_coach'
    section_target TEXT NOT NULL DEFAULT 'general', -- 'summary' | 'experience' | 'education' | 'skills' | 'general'
    content TEXT NOT NULL,
    suggested_text TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'resolved' | 'applied'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid query by resume
CREATE INDEX IF NOT EXISTS idx_resume_comments_resume_id ON public.resume_comments(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_comments_status ON public.resume_comments(status);

-- Enable RLS
ALTER TABLE public.resume_comments ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Anyone can view comments on public resumes or their own resumes
CREATE POLICY "Public or owner can read resume comments"
    ON public.resume_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_comments.resume_id
            AND (resumes.is_public = TRUE OR resumes.user_id = auth.uid())
        )
    );

-- 2. Anyone can submit feedback on public resumes, or authenticated users on their resumes
CREATE POLICY "Anyone can insert comments on public resumes"
    ON public.resume_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_comments.resume_id
            AND (resumes.is_public = TRUE OR resumes.user_id = auth.uid())
        )
    );

-- 3. Resume owners can update comment status (resolve/apply)
CREATE POLICY "Resume owner can update comment status"
    ON public.resume_comments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_comments.resume_id
            AND resumes.user_id = auth.uid()
        )
    );

-- 4. Resume owners can delete comments on their resumes
CREATE POLICY "Resume owner can delete comments"
    ON public.resume_comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE resumes.id = resume_comments.resume_id
            AND resumes.user_id = auth.uid()
        )
    );
