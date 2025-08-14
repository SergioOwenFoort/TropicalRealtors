-- COMPREHENSIVE AUTH SCHEMA FIX
-- This script directly addresses the "Database error querying schema" during login
-- Run this in SQL Editor with SERVICE ROLE permissions

-- 1. Fix the core auth schema functions that are critical for JWT validation
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT
      coalesce(
          nullif(current_setting('request.jwt.claim', true), ''),
          nullif(current_setting('request.jwt.claims', true), '')
      )::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif((nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'), ''),
    'authenticated'
  )::text
$$;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif((nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'), '')
  )::uuid
$$;

-- 2. Reset admin user completely
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 's.admin@bonairemakelaars.com';
BEGIN
  -- Get current admin ID if exists
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No admin user found, creating new admin user';
    
    -- Create new admin user with known password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_token,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',  -- instance_id
      gen_random_uuid(),  -- id (generate new)
      'authenticated',    -- aud
      'authenticated',    -- role
      admin_email,        -- email
      crypt('SuperSecure2025!', gen_salt('bf')), -- encrypted_password
      now(),              -- email_confirmed_at
      null,               -- recovery_token
      null,               -- last_sign_in_at
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb, -- raw_app_meta_data
      '{}'::jsonb,        -- raw_user_meta_data
      now(),              -- created_at
      now()               -- updated_at
    )
    RETURNING id INTO admin_id;
    
    RAISE NOTICE 'Created new admin user with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Updating existing admin user with ID: %', admin_id;
    
    -- Reset the admin user completely
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
      email_confirmed_at = now(),
      recovery_token = null,
      confirmation_token = null,
      aud = 'authenticated',
      role = 'authenticated',
      updated_at = now(),
      last_sign_in_at = null,
      raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      raw_user_meta_data = '{}'::jsonb
    WHERE id = admin_id;
  END IF;
  
  -- Ensure admin has a valid profile
  DELETE FROM public.profiles WHERE email = admin_email AND id != admin_id;
  
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (admin_id, admin_email, 'admin', 'Admin User')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', display_name = 'Admin User';
  
  RAISE NOTICE 'Admin profile updated with ID: %', admin_id;
END $$;

-- 3. Create or update the verify_admin_policies function for proper permissions
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Check if RLS is enabled on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create basic policies
  -- Everyone can view profiles
  DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
  CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);
  
  -- Users can update their own profile
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
    
  -- Admin full access
  DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
  CREATE POLICY "Admin full access to profiles" ON public.profiles
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

-- 5. Run the verify_admin_policies function to ensure RLS is set up correctly
SELECT public.verify_admin_policies();

-- 6. Verify final setup
SELECT
  au.id AS auth_id,
  au.email AS auth_email,
  au.role AS auth_role,
  au.raw_app_meta_data->>'role' AS app_role,
  p.id AS profile_id,
  p.email AS profile_email,
  p.role AS profile_role
FROM
  auth.users au
JOIN
  public.profiles p ON au.id = p.id
WHERE
  au.email = 's.admin@bonairemakelaars.com';
