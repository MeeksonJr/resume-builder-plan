-- Migration: 038_interview_star_and_company_context.sql
-- Add target_company to interview_sessions and star_tip, expected_competencies to interview_questions

ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS target_company TEXT;

ALTER TABLE public.interview_questions
  ADD COLUMN IF NOT EXISTS star_tip TEXT,
  ADD COLUMN IF NOT EXISTS expected_competencies TEXT[] DEFAULT '{}'::text[];
