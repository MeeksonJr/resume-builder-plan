-- Add is_archived column to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

COMMENT ON COLUMN resumes.is_archived IS 'Whether the resume is archived and hidden from the main list';
