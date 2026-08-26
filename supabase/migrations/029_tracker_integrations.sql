-- Migration: 029_tracker_integrations.sql
-- Add linked opportunities to applications for unified job and aid tracking

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS linked_opportunities TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS linked_documents UUID[] DEFAULT '{}'::uuid[];
