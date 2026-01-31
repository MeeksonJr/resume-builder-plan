-- Create resume_versions table
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- Policies for resume_versions
-- Users can view versions of their own resumes
CREATE POLICY "Users can view versions of their own resumes" ON resume_versions
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM resumes WHERE id = resume_versions.resume_id));

-- Users can insert versions for their own resumes
CREATE POLICY "Users can create versions for their own resumes" ON resume_versions
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM resumes WHERE id = resume_versions.resume_id));

-- Users can delete versions of their own resumes
CREATE POLICY "Users can delete versions of their own resumes" ON resume_versions
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM resumes WHERE id = resume_versions.resume_id));
