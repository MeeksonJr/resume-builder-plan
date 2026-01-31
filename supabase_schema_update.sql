-- Add slug and is_public columns to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Enable RLS on resumes if not already enabled (it should be, but good to ensure)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy for Public Access to Resumes
CREATE POLICY "Public resumes are viewable by everyone" 
ON resumes FOR SELECT 
USING (is_public = true);

-- Enable RLS on related tables (ensure they are enabled)
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- Policy for Public Access to Related Tables
-- Everyone can see items if the parent resume is public

CREATE POLICY "Public resume items are viewable by everyone" ON work_experiences
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));

CREATE POLICY "Public resume items are viewable by everyone" ON education
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));

CREATE POLICY "Public resume items are viewable by everyone" ON skills
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));

CREATE POLICY "Public resume items are viewable by everyone" ON projects
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));

CREATE POLICY "Public resume items are viewable by everyone" ON certifications
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));

CREATE POLICY "Public resume items are viewable by everyone" ON languages
FOR SELECT USING (resume_id IN (SELECT id FROM resumes WHERE is_public = true));
