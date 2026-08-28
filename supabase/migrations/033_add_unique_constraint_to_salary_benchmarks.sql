-- Add unique constraint to salary_benchmarks for upserting
ALTER TABLE salary_benchmarks ADD CONSTRAINT unique_role_location UNIQUE (role, location);
