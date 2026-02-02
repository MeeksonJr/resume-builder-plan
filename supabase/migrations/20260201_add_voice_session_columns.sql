
-- Add session_mode and interviewer_voice to interview_sessions

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS session_mode TEXT CHECK (session_mode IN ('text', 'voice')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS interviewer_voice TEXT;

-- Comment on columns
COMMENT ON COLUMN interview_sessions.session_mode IS 'Mode of the interview: text (standard) or voice (simulated call)';
COMMENT ON COLUMN interview_sessions.interviewer_voice IS 'Selected voice ID for the AI interviewer';
