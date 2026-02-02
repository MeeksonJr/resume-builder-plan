-- Add analytics columns to resumes table
ALTER TABLE resumes 
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create an RPC to increment view count securely
CREATE OR REPLACE FUNCTION increment_resume_view(resume_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE resumes
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE id = resume_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
