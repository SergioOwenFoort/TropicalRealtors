-- SQL script to diagnose and fix RLS issues with admin login
-- This script focuses on identifying exactly what's causing the login issues

-- First, check if the admin user exists
SELECT 
  id, 
  email, 
  role, 
  CASE WHEN last_sign_in_at IS NOT NULL THEN 'Yes' ELSE 'No' END as has_signed_in_before
FROM auth.users 
WHERE email = 's.admin@bonairemakelaars.com';

-- Check if auth functions exist and are working
DO $$
BEGIN
  -- Test auth.uid() function
  BEGIN
    PERFORM auth.uid();
    RAISE NOTICE 'auth.uid() function exists and does not error';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'auth.uid() error: %', SQLERRM;
  END;
  
  -- Test auth.role() function
  BEGIN
    PERFORM auth.role();
    RAISE NOTICE 'auth.role() function exists and does not error';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'auth.role() error: %', SQLERRM;
  END;
  
  -- Test auth.email() function
  BEGIN
    PERFORM auth.email();
    RAISE NOTICE 'auth.email() function exists and does not error';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'auth.email() error: %', SQLERRM;
  END;
END $$;

-- Check RLS policies on profiles table
SELECT
  c.relname as table_name,
  p.polname as policy_name,
  p.polpermissive as is_permissive,
  p.polcmd as command,
  pg_catalog.pg_get_expr(p.polqual, p.polrelid) as using_expression,
  pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression
FROM pg_catalog.pg_policy p
JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';

-- Check if RLS is enabled on critical tables
SELECT
  n.nspname as schema,
  c.relname as table_name,
  CASE WHEN c.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_enabled
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('profiles', 'realtors')
ORDER BY schema, table_name;

-- Check permissions on profiles table
SELECT
  n.nspname as schema,
  c.relname as table_name,
  r.rolname as role_name,
  pg_catalog.array_to_string(c.relacl, E'\n') as privileges
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN pg_catalog.pg_roles r
WHERE n.nspname = 'public' 
  AND c.relname = 'profiles' 
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY schema, table_name, role_name;

-- Check if profiles table has all necessary columns
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- Fix auth functions if they're broken
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role() 
RETURNS text 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text;
$$;

CREATE OR REPLACE FUNCTION auth.email() 
RETURNS text 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$;

-- Ensure profiles table has necessary RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate basic policies
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access" ON public.profiles
  FOR SELECT USING (true);
  
DROP POLICY IF EXISTS "Allow individual update" ON public.profiles;
CREATE POLICY "Allow individual update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual delete" ON public.profiles;
CREATE POLICY "Allow individual delete" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Most importantly, make sure admin can log in
DROP POLICY IF EXISTS "Allow admin full access" ON public.profiles;
CREATE POLICY "Allow admin full access" ON public.profiles
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Grant permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;
