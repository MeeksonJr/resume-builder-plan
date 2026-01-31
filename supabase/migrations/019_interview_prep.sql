-- Interview Preparation System
-- Tracks practice sessions and provides progress analytics

-- Interview practice sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('junior', 'mid', 'senior')),
  question_count INTEGER DEFAULT 0,
  answered_count INTEGER DEFAULT 0,
  average_score DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Individual questions and answers
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('behavioral', 'technical', 'situational')),
  question_text TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback JSONB,
  answered_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created ON interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session ON interview_questions(session_id);

-- RLS Policies
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can view questions for their sessions" ON interview_questions;
DROP POLICY IF EXISTS "Users can update their answers" ON interview_questions;

-- Interview sessions policies
CREATE POLICY "Users can view their own sessions"
  ON interview_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their sessions"
  ON interview_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Interview questions policies
CREATE POLICY "Users can view questions for their sessions"
  ON interview_questions FOR SELECT
  USING (session_id IN (SELECT id FROM interview_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert questions for their sessions"
  ON interview_questions FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM interview_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their answers"
  ON interview_questions FOR UPDATE
  USING (session_id IN (SELECT id FROM interview_sessions WHERE user_id = auth.uid()));

-- Function to update session statistics
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE interview_sessions
  SET 
    answered_count = (
      SELECT COUNT(*) 
      FROM interview_questions 
      WHERE session_id = NEW.session_id 
      AND user_answer IS NOT NULL
    ),
    average_score = (
      SELECT COALESCE(AVG((ai_feedback->>'overallScore')::decimal), 0)
      FROM interview_questions 
      WHERE session_id = NEW.session_id 
      AND ai_feedback IS NOT NULL
    ),
    completed_at = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM interview_questions 
        WHERE session_id = NEW.session_id 
        AND user_answer IS NOT NULL
      ) = (
        SELECT question_count 
        FROM interview_sessions 
        WHERE id = NEW.session_id
      ) THEN NOW()
      ELSE completed_at
    END
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_session_stats_trigger ON interview_questions;
CREATE TRIGGER update_session_stats_trigger
  AFTER INSERT OR UPDATE OF user_answer, ai_feedback ON interview_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_stats();
