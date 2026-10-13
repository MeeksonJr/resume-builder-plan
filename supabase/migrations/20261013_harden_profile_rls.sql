-- Migration: 20261013_harden_profile_rls.sql
-- Hardens public.profiles Row Level Security to prevent unauthenticated data leakage
-- Revokes broad `USING (true)` and scopes public access only to public discovery candidates

-- 1. Remove dangerous blanket policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Authenticated user can select their own profile (including private tokens/settings)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Public / Discovery users can only see candidate profiles that have an active public presence
DROP POLICY IF EXISTS "Public discovery of active profiles" ON public.profiles;
CREATE POLICY "Public discovery of active profiles"
ON public.profiles FOR SELECT
USING (
  marketplace_active = true
  OR school_verified = true
  OR EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.user_id = profiles.id 
    AND portfolios.is_public = true
  )
);

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
