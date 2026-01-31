-- Add section_order column to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '["experience", "education", "skills", "projects", "certifications", "languages"]'::jsonb;

COMMENT ON COLUMN resumes.section_order IS 'Array of section identifiers in the desired display order';
