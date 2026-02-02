-- Create cover_letters table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
    content TEXT NOT NULL,
    recipient_name TEXT,
    company_name TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own cover letters"
    ON public.cover_letters FOR ALL
    USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cover_letters_updated_at
    BEFORE UPDATE ON public.cover_letters
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
