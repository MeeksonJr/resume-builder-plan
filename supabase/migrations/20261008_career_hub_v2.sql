-- ==============================================================================
-- ResumeForge Career Hub v2: Multi-School Verification & Enterprise Features
-- Migration: 20261008_career_hub_v2.sql
-- ==============================================================================

-- 1. Multi-School Verified Institutions Table
CREATE TABLE IF NOT EXISTS public.user_verified_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_slug TEXT NOT NULL,
    school_name TEXT NOT NULL,
    school_email TEXT NOT NULL,
    verification_method TEXT NOT NULL DEFAULT 'EMAIL_OTP', -- 'EMAIL_OTP' | 'CANVAS_OAUTH' | 'ADMIN_OVERRIDE'
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_school_slug UNIQUE (user_id, school_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_verified_schools_user_id ON public.user_verified_schools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verified_schools_slug ON public.user_verified_schools(school_slug);

-- Enable RLS
ALTER TABLE public.user_verified_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verified schools"
    ON public.user_verified_schools
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verified schools"
    ON public.user_verified_schools
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Alumni Mentorship Requests Table
CREATE TABLE IF NOT EXISTS public.alumni_mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_name TEXT NOT NULL,
    mentor_company TEXT NOT NULL,
    topic TEXT NOT NULL,
    proposed_date TIMESTAMPTZ NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.alumni_mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and manage their mentorship requests"
    ON public.alumni_mentorship_requests
    FOR ALL
    USING (auth.uid() = student_id);

-- 3. Virtual Career Fair Resume Drops Table
CREATE TABLE IF NOT EXISTS public.career_fair_resume_drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campus_slug TEXT NOT NULL,
    employer_name TEXT NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    ats_score INTEGER,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.career_fair_resume_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and drop their resumes to career fair booths"
    ON public.career_fair_resume_drops
    FOR ALL
    USING (auth.uid() = student_id);

-- 4. Applications Kanban Table
CREATE TABLE IF NOT EXISTS public.applications_kanban (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'Applied', -- 'Saved' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Archived'
    location TEXT,
    salary TEXT,
    deadline_reminder TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.applications_kanban ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their personal application kanban pipeline"
    ON public.applications_kanban
    FOR ALL
    USING (auth.uid() = user_id);
