-- Migration: 037_tracker_canvas_and_resume_sync.sql
-- Adds interview milestones, salary target, priority, and linked Canvas coursework to applications table

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS linked_canvas_courses TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS salary_target TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
