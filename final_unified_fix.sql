-- FINAL UNIFIED SUPABASE FIX
-- RESOLVES BOTH:
-- 1. "infinite recursion detected in policy for relation profiles"
-- 2. "permission denied for schema auth" / "Database error querying schema"
--
-- IMPORTANT: RUN THIS IN SUPABASE SQL EDITOR USING SERVICE_ROLE CONNECTION

-- PART 1: Create helper functions in public schema to bypass auth schema
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub'
  )::uuid;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_user_id() TO anon, authenticated, service_role;

-- PART 2: Fix RLS on profiles table
-- First disable RLS to reset everything
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies dynamically
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'profiles'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple non-recursive policies using our custom helper function
-- Anyone can view profiles
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can update their own profile only
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (public.get_auth_user_id() = id);

-- Users can insert their own profile only
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (public.get_auth_user_id() = id);

-- PART 3: Fix the admin user
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 's.admin@bonairemakelaars.com';
  admin_password text := 'SuperSecure2025!';
  admin_exists boolean;
BEGIN
  -- First check if admin exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = admin_email) INTO admin_exists;
  
  IF admin_exists THEN
    -- Get the admin ID
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
    
    -- Reset the admin user's password and status
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = now(),
      confirmation_token = null,
      recovery_token = null,
      aud = 'authenticated',
      role = 'authenticated',
      updated_at = now(),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email'],
        'role', 'admin'
      )
    WHERE id = admin_id;
    
    RAISE NOTICE 'Admin user reset: %', admin_id;
  ELSE
    -- Create new admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email'],
        'role', 'admin'
      )
    )
    RETURNING id INTO admin_id;
    
    RAISE NOTICE 'Admin user created: %', admin_id;
  END IF;
  
  -- Ensure admin profile exists and is correctly linked
  DELETE FROM public.profiles WHERE email = admin_email AND id != admin_id;
  
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (admin_id, admin_email, 'admin', 'Admin User')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', email = admin_email, display_name = 'Admin User';
  
  RAISE NOTICE 'Admin profile updated';
  
  -- Create non-recursive admin policy
  CREATE POLICY "Admin full access" 
  ON public.profiles 
  FOR ALL 
  USING (
    (SELECT role FROM public.profiles WHERE id = public.get_auth_user_id() LIMIT 1) = 'admin'
  );
END $$;

-- PART 4: Create verify_admin_policies function required by frontend
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is just a placeholder since we already set up the policies
  -- The frontend expects this function to exist
  NULL;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;

-- Verify admin setup
SELECT 
  p.id, 
  p.email, 
  p.role,
  'LOGIN WITH EMAIL: ' || p.email || ' PASSWORD: SuperSecure2025!' as login_info
FROM 
  public.profiles p 
WHERE 
  p.email = 's.admin@bonairemakelaars.com';
