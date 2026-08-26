-- Migration: 026_funding_deduplication.sql
-- Clean up duplicate funding opportunities and add a unique constraint to prevent future duplication

-- 1. Clean up existing duplicates, keeping the newest record
DELETE FROM public.funding_opportunities a
USING public.funding_opportunities b
WHERE a.created_at < b.created_at
  AND a.title = b.title
  AND a.provider = b.provider;

-- 2. Add unique constraint on title and provider
ALTER TABLE public.funding_opportunities
  ADD CONSTRAINT unique_title_provider UNIQUE (title, provider);
