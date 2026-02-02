-- Forcefully add missing columns if they don't exist
-- Although the previous migration had this, running it again explicitly might help if there was a versioning issue

DO $$
BEGIN
    -- Add star_breakdown if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'interview_feedback' 
        AND column_name = 'star_breakdown'
    ) THEN
        ALTER TABLE interview_feedback ADD COLUMN star_breakdown JSONB;
    END IF;

    -- Add star_scores if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'interview_feedback' 
        AND column_name = 'star_scores'
    ) THEN
        ALTER TABLE interview_feedback ADD COLUMN star_scores JSONB;
    END IF;

    -- Drop legacy star_analysis column if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'interview_feedback' 
        AND column_name = 'star_analysis'
    ) THEN
        ALTER TABLE interview_feedback DROP COLUMN star_analysis;
    END IF;
END $$;

-- Force schema reload notification
NOTIFY pgrst, 'reload schema';
