-- Script to identify and fix common Supabase authentication schema issues
-- Based on the "Database error querying schema" error

-- 1. Check if the basic auth functions exist and have proper search paths
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_functiondef(p.oid) as function_def
FROM 
  pg_proc p
JOIN 
  pg_namespace n ON p.pronamespace = n.oid
WHERE 
  n.nspname = 'auth' AND
  p.proname IN ('uid', 'role', 'email');

-- 2. Fix the core auth functions that often cause this error
-- These are commonly corrupted and cause "Database error querying schema"
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

-- 3. Check for specific misconfigured auth functions
SELECT 
  routine_schema, 
  routine_name,
  routine_definition,
  external_language
FROM 
  information_schema.routines 
WHERE 
  routine_schema = 'auth' AND 
  routine_name IN ('uid', 'role', 'email', 'jwt');

-- 4. Verify user and profile linking
-- Check if the admin user exists and has a profile
SELECT 
  a.id as auth_id, 
  a.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role as profile_role
FROM 
  auth.users a
LEFT JOIN 
  public.profiles p ON a.id = p.id
WHERE 
  a.email = 's.admin@bonairemakelaars.com';

-- 5. Try a manual auth token generation
-- Sometimes the JWT functions need to be fixed
DO $$ 
BEGIN
  -- Try to create a JWT manually for troubleshooting
  PERFORM auth.uid();
  PERFORM auth.role();
  PERFORM auth.email();
  RAISE NOTICE 'Auth functions executed successfully.';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error executing auth functions: %', SQLERRM;
END $$;
