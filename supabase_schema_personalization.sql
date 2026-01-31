-- Add visual_config JSONB column to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS visual_config JSONB DEFAULT '{
  "accentColor": "#0070f3",
  "fontFamily": "Inter",
  "fontSize": "standard",
  "lineHeight": "relaxed"
}'::jsonb;

-- Add settings JSONB column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "defaultTemplate": "modern",
  "aiTone": "professional",
  "autoSave": true
}'::jsonb;

COMMENT ON COLUMN resumes.visual_config IS 'Visual preferences like colors and fonts for this specific resume';
COMMENT ON COLUMN profiles.settings IS 'Global user preferences and settings';
