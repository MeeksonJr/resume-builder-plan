-- Migration for User Settings and Storage
-- 1. Ensure settings column exists with improved defaults
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "defaultTemplate": "modern",
  "aiTone": "professional",
  "autoSave": true,
  "theme": "dark",
  "jobSearch": {
    "targetRole": "",
    "industry": "",
    "salaryExpectation": ""
  }
}'::jsonb;

-- 2. Create storage bucket for avatars if it doesn't exist
-- Note: This is an SQL-only migration. Storage buckets usually need to be created via API or Dashboard,
-- but we can attempt to insert into the storage.buckets table if we have permissions.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for storage.objects
-- Allow users to upload their own avatars
CREATE POLICY "Avatar upload for owner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow owner to update their own avatar
CREATE POLICY "Avatar update for owner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Avatar public view"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow owner to delete their own avatar
CREATE POLICY "Avatar delete for owner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Function to delete a user and their data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
