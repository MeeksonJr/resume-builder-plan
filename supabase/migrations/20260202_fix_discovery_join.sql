-- Ensure portfolios.user_id has a foreign key to public.profiles.id
-- This helps Postgrest understand the relationship for nested selects
ALTER TABLE public.portfolios
DROP CONSTRAINT IF EXISTS portfolios_user_id_profiles_fkey;

ALTER TABLE public.portfolios
ADD CONSTRAINT portfolios_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Also ensure profiles has RLS that allows public viewing for discovery
-- (Already handled by 020_security_hardening probably, but let's be sure)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);
