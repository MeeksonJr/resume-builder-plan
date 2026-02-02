-- Add missing columns to interview_feedback
ALTER TABLE interview_feedback ADD COLUMN IF NOT EXISTS star_breakdown JSONB;
ALTER TABLE interview_feedback ADD COLUMN IF NOT EXISTS star_scores JSONB;

-- Function to sync answer insertion to interview_questions
CREATE OR REPLACE FUNCTION sync_interview_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update interview_questions text and answered_at
  UPDATE interview_questions
  SET 
    user_answer = NEW.answer_text,
    answered_at = COALESCE(NEW.created_at, NOW())
  WHERE id = NEW.question_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for answers
DROP TRIGGER IF EXISTS sync_interview_answer_trigger ON interview_answers;
CREATE TRIGGER sync_interview_answer_trigger
  AFTER INSERT ON interview_answers
  FOR EACH ROW
  EXECUTE FUNCTION sync_interview_answer();

-- Function to sync feedback insertion to interview_questions (ai_feedback jsonb)
CREATE OR REPLACE FUNCTION sync_interview_feedback()
RETURNS TRIGGER AS $$
DECLARE
  q_id UUID;
  feedback_json JSONB;
BEGIN
  -- Get question_id from the answer
  SELECT question_id INTO q_id
  FROM interview_answers
  WHERE id = NEW.answer_id;

  -- Construct JSONB to match the structure expected by frontend and legacy logic
  feedback_json = jsonb_build_object(
    'score', NEW.score,
    'overallScore', NEW.score,
    'strengths', NEW.strengths,
    'weaknesses', NEW.weaknesses,
    'improvements', NEW.improvements,
    'overall_feedback', NEW.overall_feedback,
    'star_breakdown', NEW.star_breakdown,
    'scores', NEW.star_scores
  );

  -- Update interview_questions
  UPDATE interview_questions
  SET ai_feedback = feedback_json
  WHERE id = q_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for feedback
DROP TRIGGER IF EXISTS sync_interview_feedback_trigger ON interview_feedback;
CREATE TRIGGER sync_interview_feedback_trigger
  AFTER INSERT ON interview_feedback
  FOR EACH ROW
  EXECUTE FUNCTION sync_interview_feedback();

-- Backfill logic for existing data
DO $$
DECLARE
  ans RECORD;
  fb RECORD;
BEGIN
  -- Backfill answers (Updates interview_questions.user_answer)
  FOR ans IN SELECT * FROM interview_answers LOOP
    UPDATE interview_questions
    SET 
      user_answer = ans.answer_text,
      answered_at = ans.created_at
    WHERE id = ans.question_id AND user_answer IS NULL;
  END LOOP;

  -- Backfill feedback (Updates interview_questions.ai_feedback)
  -- Note: Existing feedback won't have star_breakdown/star_scores, so they will be null in the JSON
  FOR fb IN SELECT f.*, a.question_id 
             FROM interview_feedback f 
             JOIN interview_answers a ON f.answer_id = a.id 
  LOOP
    UPDATE interview_questions
    SET ai_feedback = jsonb_build_object(
      'score', fb.score,
      'overallScore', fb.score,
      'strengths', fb.strengths,
      'weaknesses', fb.weaknesses,
      'improvements', fb.improvements,
      'overall_feedback', fb.overall_feedback,
      'star_breakdown', fb.star_breakdown,
      'scores', fb.star_scores
    )
    WHERE id = fb.question_id AND ai_feedback IS NULL;
  END LOOP;
END;
$$;
