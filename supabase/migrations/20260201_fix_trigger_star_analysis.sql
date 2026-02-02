-- Fix the sync_interview_feedback function to stop using removed star_analysis column
-- and use step_breakdown/scores instead.

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

-- Notifying schema reload just in case
NOTIFY pgrst, 'reload schema';
