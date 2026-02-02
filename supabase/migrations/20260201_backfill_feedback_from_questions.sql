-- Backfill interview_feedback table from existing interview_questions.ai_feedback data
-- This ensures that sessions completed before the new feedback table was active still show results

DO $$
DECLARE
  answer_rec RECORD;
  question_rec RECORD;
  feedback_data JSONB;
  feedback_id UUID;
BEGIN
  -- Loop through all answers that DON'T have a corresponding feedback row yet
  FOR answer_rec IN 
    SELECT a.* 
    FROM interview_answers a
    LEFT JOIN interview_feedback f ON a.id = f.answer_id
    WHERE f.id IS NULL
  LOOP
    -- Get the corresponding question and its AI feedback
    SELECT * INTO question_rec
    FROM interview_questions
    WHERE id = answer_rec.question_id;

    -- If the question has ai_feedback, we extract it and create a feedback row
    IF question_rec.ai_feedback IS NOT NULL THEN
      feedback_data := question_rec.ai_feedback;

      -- Check if we have valid score data to migrate
      IF (feedback_data->>'score') IS NOT NULL OR (feedback_data->>'overallScore') IS NOT NULL THEN
        
        INSERT INTO interview_feedback (
          answer_id,
          score,
          strengths,
          weaknesses,
          improvements,
          overall_feedback,
          star_breakdown,
          star_scores,
          created_at
        ) VALUES (
          answer_rec.id,
          COALESCE((feedback_data->>'score')::int, (feedback_data->>'overallScore')::int, 0),
          -- Handle potential array or null for text arrays. Arrays in JSONB need simple casting if possible or careful extraction
          -- We use a simple strategy: if it's an array, cast it. If not, empty array.
          ARRAY(SELECT jsonb_array_elements_text(COALESCE(feedback_data->'strengths', '[]'::jsonb))),
          ARRAY(SELECT jsonb_array_elements_text(COALESCE(feedback_data->'weaknesses', '[]'::jsonb))),
          ARRAY(SELECT jsonb_array_elements_text(COALESCE(feedback_data->'improvements', '[]'::jsonb))),
          COALESCE(feedback_data->>'overall_feedback', 'Feedback migrated from previous version'),
          COALESCE(feedback_data->'star_breakdown', NULL),
          COALESCE(feedback_data->'scores', NULL),
          answer_rec.created_at -- Use the answer's timestamp
        );
        
      END IF;
    END IF;
  END LOOP;
END $$;
