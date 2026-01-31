-- Resume Version Control System
-- Tracks all changes to resumes over time

-- Resume versions table
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  template TEXT,
  snapshot_data JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID NOT NULL,
  UNIQUE(resume_id, version_number)
);

-- Version performance metrics
CREATE TABLE IF NOT EXISTS version_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_id UUID REFERENCES resume_versions(id) ON DELETE CASCADE NOT NULL,
  applications_sent INTEGER DEFAULT 0,
  interviews_received INTEGER DEFAULT 0,
  offers_received INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(version_id)
);

-- Add version tracking to applications
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS resume_version_id UUID REFERENCES resume_versions(id);

-- Ensure created_by column exists (in case table was created without it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resume_versions' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE resume_versions ADD COLUMN created_by UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created_at ON resume_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_version_metrics_version_id ON version_metrics(version_id);
CREATE INDEX IF NOT EXISTS idx_applications_version_id ON applications(resume_version_id);

-- RLS Policies
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own resume versions" ON resume_versions;
DROP POLICY IF EXISTS "Users can create versions for their resumes" ON resume_versions;
DROP POLICY IF EXISTS "Users can view metrics for their versions" ON version_metrics;
DROP POLICY IF EXISTS "Users can update metrics for their versions" ON version_metrics;

-- Resume versions policies
CREATE POLICY "Users can view their own resume versions"
  ON resume_versions FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create versions for their resumes"
  ON resume_versions FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Version metrics policies
CREATE POLICY "Users can view metrics for their versions"
  ON version_metrics FOR SELECT
  USING (version_id IN (SELECT id FROM resume_versions WHERE created_by = auth.uid()));

CREATE POLICY "Users can update metrics for their versions"
  ON version_metrics FOR UPDATE
  USING (version_id IN (SELECT id FROM resume_versions WHERE created_by = auth.uid()));

CREATE POLICY "Users can insert metrics for their versions"
  ON version_metrics FOR INSERT
  WITH CHECK (version_id IN (SELECT id FROM resume_versions WHERE created_by = auth.uid()));

-- Function to auto-increment version numbers
CREATE OR REPLACE FUNCTION get_next_version_number(p_resume_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_number
  FROM resume_versions
  WHERE resume_id = p_resume_id;
  
  RETURN v_next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update version metrics when application status changes
CREATE OR REPLACE FUNCTION update_version_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resume_version_id IS NOT NULL THEN
    -- Insert or update metrics
    INSERT INTO version_metrics (version_id, applications_sent, interviews_received, offers_received)
    VALUES (
      NEW.resume_version_id,
      1,
      CASE WHEN NEW.status IN ('interviewing', 'offer', 'accepted') THEN 1 ELSE 0 END,
      CASE WHEN NEW.status IN ('offer', 'accepted') THEN 1 ELSE 0 END
    )
    ON CONFLICT (version_id) DO UPDATE
    SET
      applications_sent = version_metrics.applications_sent + 1,
      interviews_received = version_metrics.interviews_received + 
        CASE WHEN NEW.status IN ('interviewing', 'offer', 'accepted') THEN 1 ELSE 0 END,
      offers_received = version_metrics.offers_received + 
        CASE WHEN NEW.status IN ('offer', 'accepted') THEN 1 ELSE 0 END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_version_metrics ON applications;
CREATE TRIGGER track_version_metrics
  AFTER INSERT OR UPDATE OF status ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_version_metrics();
