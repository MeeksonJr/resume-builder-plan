-- Safe migration: Only creates missing portfolio features
-- Run this in Supabase SQL Editor

-- 1. Create portfolio_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS for messages
ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Portfolio owners can view their messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Anyone can send a message" ON public.portfolio_messages;

-- 4. Create policies for messages
CREATE POLICY "Portfolio owners can view their messages"
    ON public.portfolio_messages
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.portfolios
        WHERE portfolios.id = portfolio_messages.portfolio_id
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can send a message"
    ON public.portfolio_messages
    FOR INSERT
    WITH CHECK (true);

-- 5. Add Phase 34 fields to portfolios table
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resume_download_count INTEGER DEFAULT 0;

-- 6. Create portfolio_skills junction table
CREATE TABLE IF NOT EXISTS public.portfolio_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, skill_name)
);

-- 7. Enable RLS for portfolio_skills
ALTER TABLE public.portfolio_skills ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing portfolio_skills policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all portfolio skills" ON public.portfolio_skills;
DROP POLICY IF EXISTS "Users can manage their own portfolio skills" ON public.portfolio_skills;

-- 9. Create policies for portfolio_skills
CREATE POLICY "Users can view all portfolio skills"
    ON public.portfolio_skills FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own portfolio skills"
    ON public.portfolio_skills FOR ALL
    USING (
        portfolio_id IN (
            SELECT id FROM public.portfolios WHERE user_id = auth.uid()
        )
    );

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_featured ON public.portfolios(featured, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_view_count ON public.portfolios(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_template ON public.portfolios(template);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_name ON public.portfolio_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_portfolio ON public.portfolio_skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_messages_portfolio ON public.portfolio_messages(portfolio_id);

-- 11. Create function to increment view count
CREATE OR REPLACE FUNCTION increment_portfolio_views(portfolio_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.portfolios
    SET view_count = view_count + 1
    WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to increment resume download count
CREATE OR REPLACE FUNCTION increment_portfolio_downloads(portfolio_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.portfolios
    SET resume_download_count = resume_download_count + 1
    WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration complete!
-- Test by checking if portfolio_messages table exists:
-- SELECT * FROM public.portfolio_messages LIMIT 1;
