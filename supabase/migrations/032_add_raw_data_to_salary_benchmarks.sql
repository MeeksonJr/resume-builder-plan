-- Alter salary_benchmarks to add raw_data column
ALTER TABLE salary_benchmarks ADD COLUMN IF NOT EXISTS raw_data JSONB;
