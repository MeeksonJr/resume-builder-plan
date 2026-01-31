-- Phase 34: Portfolio Enhancements

-- 1. Add template and analytics fields to portfolios table
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resume_download_count INTEGER DEFAULT 0;

-- 2. Create portfolio_skills junction table for better filtering
CREATE TABLE IF NOT EXISTS portfolio_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, skill_name)
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_featured ON portfolios(featured, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_view_count ON portfolios(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_template ON portfolios(template);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_name ON portfolio_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_portfolio ON portfolio_skills(portfolio_id);

-- 4. Update RLS policies for portfolio_skills
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all portfolio skills"
ON portfolio_skills FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own portfolio skills"
ON portfolio_skills FOR ALL
USING (
  portfolio_id IN (
    SELECT id FROM portfolios WHERE user_id = auth.uid()
  )
);

-- 5. Create function to increment view count
CREATE OR REPLACE FUNCTION increment_portfolio_views(portfolio_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolios
  SET view_count = view_count + 1
  WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to increment resume download count
CREATE OR REPLACE FUNCTION increment_portfolio_downloads(portfolio_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolios
  SET resume_download_count = resume_download_count + 1
  WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
