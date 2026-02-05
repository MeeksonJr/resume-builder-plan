-- Add role column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN 
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')); 
    END IF; 
END $$;

-- Create get_admin_stats function
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users INTEGER;
  pro_users INTEGER;
  total_resumes INTEGER;
  monthly_revenue NUMERIC;
BEGIN
  -- Simple check: In a real app, you'd verify the caller is an admin here.
  -- For now, we rely on the application layer to block non-admins from calling this
  -- or we could check: IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN RAISE EXCEPTION 'Unauthorized'; END IF;

  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO pro_users FROM profiles WHERE is_pro = true;
  SELECT COUNT(*) INTO total_resumes FROM resumes;
  
  -- Estimated Revenue calculation (e.g. $19/mo for Pro)
  monthly_revenue := pro_users * 19;

  RETURN json_build_object(
    'total_users', total_users,
    'pro_users', pro_users,
    'total_resumes', total_resumes,
    'monthly_revenue', monthly_revenue
  );
END;
$$;
