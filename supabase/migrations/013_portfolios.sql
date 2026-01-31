-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    theme_settings JSONB DEFAULT '{
        "color": "primary",
        "typography": "default",
        "style": "professional"
    }'::jsonb,
    featured_resumes UUID[] DEFAULT '{}',
    featured_projects UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own portfolio"
    ON public.portfolios
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view public portfolios"
    ON public.portfolios
    FOR SELECT
    USING (is_public = true);

-- Enable moddatetime for portfolios
CREATE TRIGGER handle_updated_at_portfolios
    BEFORE UPDATE ON public.portfolios
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS portfolios_slug_idx ON public.portfolios(slug);

-- Create portfolio_messages table for contact form
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
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
