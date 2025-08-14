-- Comprehensive fix for "Database error querying schema" during login
-- This script addresses auth functions, RLS policies, and user/profile synchronization

------------------------------------------
-- PART 1: FIX AUTH SCHEMA FUNCTIONS
------------------------------------------

-- Re-create the core auth functions that often cause the schema error
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

-- Also fix the JWT function if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
    WHERE proname = 'jwt' AND nspname = 'auth'
  ) THEN
    CREATE OR REPLACE FUNCTION auth.jwt() 
    RETURNS jsonb 
    LANGUAGE sql STABLE 
    SET search_path = 'public' 
    AS $$
      SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
    $$;
  END IF;
END $$;

------------------------------------------
-- PART 2: FIX ADMIN USER AND PROFILE
------------------------------------------

-- 1. First check if admin user exists in auth.users
DO $$
DECLARE 
  admin_exists integer;
  admin_id uuid;
BEGIN
  SELECT COUNT(*), MAX(id) INTO admin_exists, admin_id FROM auth.users 
  WHERE email = 's.admin@bonairemakelaars.com';
  
  IF admin_exists > 0 THEN
    RAISE NOTICE 'Admin user exists with ID: %', admin_id;
    
    -- Reset admin password directly
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now(),
      confirmation_token = NULL,
      recovery_token = NULL,
      aud = 'authenticated'
    WHERE email = 's.admin@bonairemakelaars.com';
    
    -- Make sure the admin has the correct role
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    WHERE email = 's.admin@bonairemakelaars.com';

    -- Sync profile with auth user
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin', display_name = 'Admin User';
    
    -- Also try inserting by email if there's a mismatch
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User')
    ON CONFLICT (email) DO UPDATE 
    SET id = admin_id, role = 'admin', display_name = 'Admin User';
    
  ELSE
    RAISE NOTICE 'Admin user does not exist in auth.users!';
  END IF;
END $$;

------------------------------------------
-- PART 3: FIX PUBLIC SCHEMA AND RLS
------------------------------------------

-- Make sure the profiles table is set up correctly
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'Profiles table already exists';
  END IF;
END $$;

-- Make sure all necessary columns exist in the profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    RAISE NOTICE 'Added role column to profiles table';
  END IF;
END $$;

-- Enable RLS on critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Fix RLS policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" 
ON public.profiles
USING (auth.role() = 'service_role');

-- Fix RLS policies on realtors
DROP POLICY IF EXISTS "Allow read access to all realtors" ON public.realtors;
CREATE POLICY "Allow read access to all realtors" 
ON public.realtors FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admin users can manage realtors" ON public.realtors;
CREATE POLICY "Admin users can manage realtors" 
ON public.realtors
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

GRANT ALL ON public.realtors TO postgres, service_role;
GRANT SELECT ON public.realtors TO anon, authenticated;
GRANT ALL ON public.realtors TO authenticated;

------------------------------------------
-- PART 4: VERIFY AND REPORT STATUS
------------------------------------------

-- Verify auth functions exist
SELECT 
  n.nspname as schema,
  p.proname as function,
  pg_get_function_result(p.oid) as result_type
FROM 
  pg_proc p
JOIN 
  pg_namespace n ON p.pronamespace = n.oid
WHERE 
  n.nspname = 'auth' AND 
  p.proname IN ('uid', 'role', 'email', 'jwt');

-- Verify admin user exists and is properly set up
SELECT 
  a.id as auth_id,
  a.email as auth_email,
  a.role as auth_role,
  p.id as profile_id,
  p.email as profile_email,
  p.role as profile_role
FROM 
  auth.users a
LEFT JOIN 
  public.profiles p ON a.id = p.id
WHERE 
  a.email = 's.admin@bonairemakelaars.com';

-- Check RLS policies
SELECT
  n.nspname as schema,
  c.relname as table,
  p.polname as policy_name,
  p.polpermissive as permissive,
  p.polcmd as command
FROM
  pg_catalog.pg_policy p
  JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND (c.relname = 'profiles' OR c.relname = 'realtors')
ORDER BY
  schema, table, policy_name;
