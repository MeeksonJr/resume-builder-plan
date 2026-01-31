-- Enable moddatetime extension
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Create applications table for job tracking
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('applied', 'interviewing', 'offered', 'rejected', 'archived')),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    cover_letter_id UUID REFERENCES public.cover_letters(id) ON DELETE SET NULL,
    salary_range TEXT,
    location TEXT,
    url TEXT,
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own applications"
    ON public.applications
    FOR ALL
    USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_applications
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);
