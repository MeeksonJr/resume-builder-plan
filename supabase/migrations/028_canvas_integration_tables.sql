-- Migration: 028_canvas_integration_tables.sql
-- Configure profiles for Canvas integration and create courses, assignments, and grades tables

-- 1. Alter profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS canvas_instance_url TEXT,
  ADD COLUMN IF NOT EXISTS canvas_access_token TEXT,
  ADD COLUMN IF NOT EXISTS canvas_sync_settings JSONB DEFAULT '{"sync_courses": true, "sync_assignments": true, "sync_grades": true}'::jsonb;

-- 2. Create canvas_courses table
CREATE TABLE IF NOT EXISTS public.canvas_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  course_code TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, canvas_course_id)
);

-- Enable RLS for canvas_courses
ALTER TABLE public.canvas_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own canvas courses"
  ON public.canvas_courses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create canvas_assignments table
CREATE TABLE IF NOT EXISTS public.canvas_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_course_id TEXT NOT NULL,
  canvas_assignment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  points_possible NUMERIC,
  submission_status TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, canvas_assignment_id)
);

-- Enable RLS for canvas_assignments
ALTER TABLE public.canvas_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own canvas assignments"
  ON public.canvas_assignments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create canvas_grades table
CREATE TABLE IF NOT EXISTS public.canvas_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canvas_course_id TEXT NOT NULL,
  current_grade TEXT,
  current_score NUMERIC,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, canvas_course_id)
);

-- Enable RLS for canvas_grades
ALTER TABLE public.canvas_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own canvas grades"
  ON public.canvas_grades
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
