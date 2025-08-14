-- Comprehensive Database Repair Script
-- Fixes: "Database error querying schema" and admin login issues
-- Run this in your Supabase SQL Editor

-- SECTION 1: Fix Database Schema Issues
-- =====================================

-- Fix auth function that might be causing schema errors
DROP FUNCTION IF EXISTS auth.email();
CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql STABLE
SET search_path = 'auth'
AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$;

-- Fix auth.uid() function (commonly causes schema issues)
DROP FUNCTION IF EXISTS auth.uid();
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
SET search_path = 'auth'
AS $$
  SELECT 
    COALESCE(
      (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid
    );
$$;

-- Fix role() function
DROP FUNCTION IF EXISTS auth.role();
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
SET search_path = 'auth'
AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::json->>'role', 'anon')::text;
$$;

-- Fix auth.jwt() function
DROP FUNCTION IF EXISTS auth.jwt();
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
SET search_path = 'auth'
AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

-- SECTION 2: Fix Admin User Account
-- ================================

-- 2.1: Direct admin password reset
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_id UUID;
  rows_updated INTEGER;
BEGIN
  -- Check if admin exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 's.admin@bonairemakelaars.com')
  INTO admin_exists;
  
  IF admin_exists THEN
    -- Get admin ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
    RAISE NOTICE 'Admin user exists with ID: %', admin_id;
    
    -- Update the user directly
    UPDATE auth.users
    SET 
      encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
      email_confirmed_at = now(),
      updated_at = now(),
      is_sso_user = false,
      confirmation_token = NULL,
      recovery_token = NULL
    WHERE id = admin_id;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    IF rows_updated > 0 THEN
      RAISE NOTICE 'Admin password reset successful';
    ELSE
      RAISE NOTICE 'Failed to update admin password';
    END IF;
  ELSE
    RAISE NOTICE 'Admin user does not exist. Will create.';
    
    -- Create new admin user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      's.admin@bonairemakelaars.com',
      crypt('SuperSecure2025!', gen_salt('bf')),
      now(),
      'authenticated',
      '{"isAdmin": true}'::jsonb,
      now(),
      now()
    )
    RETURNING id INTO admin_id;
    
    RAISE NOTICE 'Created new admin user with ID: %', admin_id;
  END IF;
  
  -- 2.2: Update or create the admin profile
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      role = 'admin',
      email = 's.admin@bonairemakelaars.com',
      display_name = 'Admin User'
    WHERE id = admin_id;
    RAISE NOTICE 'Updated existing admin profile';
  ELSE
    -- Create new profile
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User');
    RAISE NOTICE 'Created new admin profile';
  END IF;
END $$;

-- SECTION 3: Fix Row Level Security Issues
-- =======================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Reset policies on profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create standard policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

-- SECTION 4: Fix Table Permissions
-- ===============================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Final check
SELECT 
  auth_users.id, 
  auth_users.email, 
  auth_users.email_confirmed_at, 
  profiles.role
FROM auth.users AS auth_users
LEFT JOIN public.profiles AS profiles ON auth_users.id = profiles.id
WHERE auth_users.email = 's.admin@bonairemakelaars.com';

-- Final message
DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Database repair completed.';
  RAISE NOTICE 'You can now try to log in with:';
  RAISE NOTICE 'Email: s.admin@bonairemakelaars.com';
  RAISE NOTICE 'Password: SuperSecure2025!';
  RAISE NOTICE '=========================================';
END $$;
