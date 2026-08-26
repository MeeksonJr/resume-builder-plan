-- Migration: 027_add_ai_analysis_column.sql
-- Add ai_analysis JSONB column to user_funding_opportunities to persist AI compatibility reports

ALTER TABLE public.user_funding_opportunities
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
