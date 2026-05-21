-- ============================================================
-- Migration 002: Fix RLS policies & ensure trigger is active
-- Run this in Supabase SQL Editor if users are getting
-- redirected to /unauthorized after login.
-- ============================================================

-- Drop and re-create the recursive admin policy to avoid
-- potential infinite-loop issues in some Postgres versions.
DROP POLICY IF EXISTS "profiles: admin reads all"    ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin updates all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: user reads own"     ON public.profiles;
DROP POLICY IF EXISTS "profiles: user updates own"   ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow each user to read their own profile row
CREATE POLICY "profiles: user reads own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow each user to update their own profile
CREATE POLICY "profiles: user updates own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read ALL profiles (uses SECURITY DEFINER function to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "profiles: admin reads all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles: admin updates all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Admins can insert new profiles (needed for manual user creation)
CREATE POLICY "profiles: admin inserts"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = id);

-- ============================================================
-- Ensure the handle_new_user trigger is in place
-- (auto-creates a profile row when a Supabase Auth user signs up)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Diagnostic: check if auth users have matching profile rows
-- Run this SELECT to find users without profiles:
-- ============================================================
-- SELECT au.id, au.email, p.id AS profile_id, p.role
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON p.id = au.id
-- WHERE p.id IS NULL;
