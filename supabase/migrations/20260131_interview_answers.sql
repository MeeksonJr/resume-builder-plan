-- Phase 20: Interview Answer Evaluation Schema

-- Interview answers table
CREATE TABLE IF NOT EXISTS interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  answer_text TEXT NOT NULL,
  answer_duration INTEGER, -- Duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Interview feedback table
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES interview_answers(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  strengths TEXT[],
  weaknesses TEXT[],
  improvements TEXT[],
  overall_feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_answers_user_id ON interview_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id ON interview_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_answer_id ON interview_feedback(answer_id);

-- RLS Policies for interview_answers
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interview answers"
  ON interview_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview answers"
  ON interview_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview answers"
  ON interview_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview answers"
  ON interview_answers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for interview_feedback
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for their answers"
  ON interview_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interview_answers
      WHERE interview_answers.id = interview_feedback.answer_id
      AND interview_answers.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert feedback"
  ON interview_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interview_answers
      WHERE interview_answers.id = interview_feedback.answer_id
      AND interview_answers.user_id = auth.uid()
    )
  );
