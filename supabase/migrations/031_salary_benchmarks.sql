-- Create salary_benchmarks table
CREATE TABLE IF NOT EXISTS salary_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    low NUMERIC NOT NULL,
    median NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    market_demand TEXT NOT NULL DEFAULT 'Steady',
    location_multiplier NUMERIC NOT NULL DEFAULT 1.0,
    raw_data JSONB,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_role_location UNIQUE (role, location)
);

-- Enable Row Level Security (RLS)
ALTER TABLE salary_benchmarks ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access to salary benchmarks for authenticated users"
    ON salary_benchmarks FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update access for service role (backend API)
CREATE POLICY "Allow insert/update for service role"
    ON salary_benchmarks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create unique index to allow easy upserting based on role and location
CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_benchmarks_role_location ON salary_benchmarks (LOWER(role), LOWER(location));

-- Seed accurate salary benchmark for Software Engineer in VA (Virginia)
INSERT INTO salary_benchmarks (role, location, currency, low, median, high, market_demand, location_multiplier)
VALUES (
    'software engineer',
    'va',
    'USD',
    83000,
    128000,
    190000,
    'High',
    1.00
) ON CONFLICT (role, location) DO UPDATE
SET low = EXCLUDED.low,
    median = EXCLUDED.median,
    high = EXCLUDED.high,
    market_demand = EXCLUDED.market_demand,
    location_multiplier = EXCLUDED.location_multiplier,
    scraped_at = timezone('utc'::text, now());

-- Seed variations like 'virginia' as location
INSERT INTO salary_benchmarks (role, location, currency, low, median, high, market_demand, location_multiplier)
VALUES (
    'software engineer',
    'virginia',
    'USD',
    83000,
    128000,
    190000,
    'High',
    1.00
) ON CONFLICT (role, location) DO UPDATE
SET low = EXCLUDED.low,
    median = EXCLUDED.median,
    high = EXCLUDED.high,
    market_demand = EXCLUDED.market_demand,
    location_multiplier = EXCLUDED.location_multiplier,
    scraped_at = timezone('utc'::text, now());
