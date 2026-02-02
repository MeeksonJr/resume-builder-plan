-- Update increment_portfolio_views to record detailed analytics
CREATE OR REPLACE FUNCTION public.increment_portfolio_views(
    portfolio_id_param UUID,
    referrer_param TEXT DEFAULT NULL,
    path_param TEXT DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL,
    visitor_id_param UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- 1. Increment the simple counter for fast list views
    UPDATE public.portfolios
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = portfolio_id_param;

    -- 2. Insert detailed record for the Insights dashboard
    INSERT INTO public.portfolio_analytics (
        portfolio_id,
        referrer,
        path,
        user_agent,
        visitor_id,
        created_at
    )
    VALUES (
        portfolio_id_param,
        COALESCE(referrer_param, 'direct'),
        COALESCE(path_param, '/'),
        user_agent_param,
        visitor_id_param,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
