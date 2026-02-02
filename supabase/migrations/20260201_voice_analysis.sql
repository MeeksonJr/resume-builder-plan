-- Add transcript and voice_analysis to interview_sessions

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS transcript JSONB,
ADD COLUMN IF NOT EXISTS voice_analysis JSONB;

COMMENT ON COLUMN interview_sessions.transcript IS 'Full session transcript (JSON array of role/text)';
COMMENT ON COLUMN interview_sessions.voice_analysis IS 'AI-generated analysis of the voice session (JSON)';
