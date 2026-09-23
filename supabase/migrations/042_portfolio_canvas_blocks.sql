-- Migration 042: Add custom_blocks and active_layout to portfolios table for Canvas Studio
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS custom_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active_layout VARCHAR(50) DEFAULT 'template';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
