-- Phase 14: Discovery & Professional Networking

-- 1. Add professional status and booking to portfolios
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_url TEXT;

-- 2. Create portfolio_testimonials table
CREATE TABLE IF NOT EXISTS public.portfolio_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for testimonials
ALTER TABLE public.portfolio_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own testimonials"
    ON public.portfolio_testimonials
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.portfolios 
        WHERE portfolios.id = portfolio_testimonials.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Public can view active testimonials"
    ON public.portfolio_testimonials
    FOR SELECT
    USING (is_active = true);

-- Add updated_at trigger for testimonials
CREATE TRIGGER handle_updated_at_testimonials
    BEFORE UPDATE ON public.portfolio_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);

-- 3. Create portfolio_analytics table for tracking visits
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    visitor_id UUID, -- Optional: for tracking unique visitors if they are logged in or via cookie
    referrer TEXT,
    path TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for analytics
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio owners can view their analytics"
    ON public.portfolio_analytics
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.portfolios 
        WHERE portfolios.id = portfolio_analytics.portfolio_id 
        AND portfolios.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can record a visit"
    ON public.portfolio_analytics
    FOR INSERT
    WITH CHECK (true);

-- Index for analytics performance
CREATE INDEX IF NOT EXISTS portfolio_analytics_portfolio_id_idx ON public.portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS portfolio_analytics_created_at_idx ON public.portfolio_analytics(created_at);
