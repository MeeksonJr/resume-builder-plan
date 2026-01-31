-- Add branding columns to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update the existing records with data from profiles if available
UPDATE public.portfolios p
SET full_name = pr.full_name
FROM public.profiles pr
WHERE p.user_id = pr.id
AND p.full_name IS NULL;
