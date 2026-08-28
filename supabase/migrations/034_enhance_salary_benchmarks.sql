-- Enhance salary_benchmarks table with scrape provenance tracking

-- Add source column to track where data came from
ALTER TABLE salary_benchmarks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ai';

-- Add scrape_count to track how many APIs contributed
ALTER TABLE salary_benchmarks ADD COLUMN IF NOT EXISTS scrape_count INTEGER DEFAULT 0;

-- Add cache expiration (30 days from scrape)
ALTER TABLE salary_benchmarks ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update existing rows to set source and expiration
UPDATE salary_benchmarks 
SET source = 'seed', 
    scrape_count = 0,
    expires_at = scraped_at + INTERVAL '30 days'
WHERE source IS NULL OR source = 'ai';
