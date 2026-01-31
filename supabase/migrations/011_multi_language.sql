-- Migration for Multi-Language Support

-- 1. Add language columns to resumes table
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS is_rtl BOOLEAN DEFAULT false;

-- 2. Update existing resumes to have defaults (though they have defaults set in column definition)
UPDATE public.resumes SET language = 'en', is_rtl = false WHERE language IS NULL;

-- 3. Add index for language filtering
CREATE INDEX IF NOT EXISTS idx_resumes_language ON public.resumes(language);
