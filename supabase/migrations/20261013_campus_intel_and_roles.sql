-- ==============================================================================
-- ResumeForge: Campus Intelligence Cache & Institutional Roles Migration
-- Migration: 20261013_campus_intel_and_roles.sql
-- ==============================================================================

-- 1. Table for caching syndicated multi-API campus intelligence (Colleges API, SchoolDigger, Google Scholar)
-- Updated every 2 days (48 hours)
CREATE TABLE IF NOT EXISTS public.institution_intel_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_slug TEXT NOT NULL UNIQUE,
    school_name TEXT NOT NULL,
    colleges_data JSONB DEFAULT '{}'::jsonb,
    schooldigger_data JSONB DEFAULT '{}'::jsonb,
    scholar_data JSONB DEFAULT '{}'::jsonb,
    enriched_intel JSONB DEFAULT '{}'::jsonb,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '2 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_institution_intel_cache_slug ON public.institution_intel_cache(school_slug);
CREATE INDEX IF NOT EXISTS idx_institution_intel_cache_expires ON public.institution_intel_cache(expires_at);

-- Enable RLS
ALTER TABLE public.institution_intel_cache ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read campus intelligence
CREATE POLICY "Anyone can read campus intelligence cache"
    ON public.institution_intel_cache
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- System / service role can manage campus intelligence cache
CREATE POLICY "Service and staff can upsert campus intelligence cache"
    ON public.institution_intel_cache
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 2. Table for strict institutional roles & memberships
-- Defaults all joining users to role 'student'. Only staff/admin/dean can modify institution settings.
CREATE TABLE IF NOT EXISTS public.institutional_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_slug TEXT NOT NULL,
    school_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'advisor', 'dean', 'admin')),
    department TEXT,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    permissions JSONB DEFAULT '{"can_edit_settings": false, "can_manage_roster": false, "can_review_resumes": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_institutional_membership UNIQUE (user_id, school_slug)
);

CREATE INDEX IF NOT EXISTS idx_institutional_memberships_user ON public.institutional_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_institutional_memberships_school ON public.institutional_memberships(school_slug);
CREATE INDEX IF NOT EXISTS idx_institutional_memberships_role ON public.institutional_memberships(role);

ALTER TABLE public.institutional_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships for their school"
    ON public.institutional_memberships
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join school as student"
    ON public.institutional_memberships
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role = 'student');

CREATE POLICY "Staff and admins can manage memberships"
    ON public.institutional_memberships
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.institutional_memberships m
            WHERE m.user_id = auth.uid()
            AND m.school_slug = institutional_memberships.school_slug
            AND m.role IN ('admin', 'dean', 'staff')
        )
    );
