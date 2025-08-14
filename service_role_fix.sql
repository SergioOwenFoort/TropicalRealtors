-- Service Role Approach Implementation Script
-- This script prepares your database for the service role approach
-- Run this in the SQL Editor using your service_role key

-- 1. First check if we have sufficient privileges
DO $$
BEGIN
  -- Attempt to access auth schema to confirm we have service role access
  PERFORM count(*) FROM auth.users LIMIT 1;
  RAISE NOTICE 'Success! You are running this script with service role access.';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE EXCEPTION 'This script must be run with service role privileges. Please use the service role key in the SQL Editor.';
END $$;

-- 2. Fix admin user in auth.users if needed
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 's.admin@bonairemakelaars.com';
BEGIN
  -- Check if admin exists
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found in auth.users, you may need to create one';
  ELSE
    RAISE NOTICE 'Found admin user with ID: %', admin_id;
    
    -- Reset admin password and confirm email
    UPDATE auth.users
    SET 
      encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
      email_confirmed_at = now(),
      confirmation_token = NULL,
      recovery_token = NULL,
      aud = 'authenticated',
      updated_at = now()
    WHERE id = admin_id;
    
    -- Make sure admin has correct metadata
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
    WHERE id = admin_id;
    
    RAISE NOTICE 'Admin user updated successfully';
  END IF;
END $$;

-- 3. Fix profiles table and ensure it's linked correctly
DO $$
DECLARE
  admin_id uuid;
  profile_exists boolean;
BEGIN
  -- Get admin ID from auth.users
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Cannot find admin user in auth.users table';
    RETURN;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = admin_id
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create profile with matching ID
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User');
    RAISE NOTICE 'Created new profile with matching ID for admin user';
  ELSE
    -- Update existing profile
    UPDATE public.profiles
    SET role = 'admin', display_name = 'Admin User'
    WHERE id = admin_id;
    RAISE NOTICE 'Updated existing admin profile';
  END IF;
  
  -- Check for any duplicate profiles with same email but different IDs
  PERFORM
    id, email, role
  FROM
    public.profiles
  WHERE
    email = 's.admin@bonairemakelaars.com' AND
    id != admin_id;
    
  IF FOUND THEN
    RAISE NOTICE 'Found duplicate profiles with admin email but different IDs. These should be removed:';
    DELETE FROM public.profiles
    WHERE email = 's.admin@bonairemakelaars.com' AND id != admin_id;
    RAISE NOTICE 'Deleted duplicate profiles';
  END IF;
END $$;

-- 4. Set up proper RLS policies
-- We can now use auth schema functions since we're using service role

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Admin can do anything
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
CREATE POLICY "Admin full access to profiles" ON public.profiles
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Set up RLS for realtors table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'realtors'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
    
    -- Everyone can view realtors
    DROP POLICY IF EXISTS "Anyone can view realtors" ON public.realtors;
    CREATE POLICY "Anyone can view realtors" ON public.realtors
      FOR SELECT USING (true);
    
    -- Only admins can manage realtors
    DROP POLICY IF EXISTS "Admin can manage realtors" ON public.realtors;
    CREATE POLICY "Admin can manage realtors" ON public.realtors
      USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    
    RAISE NOTICE 'Applied proper RLS policies to realtors table';
  ELSE
    RAISE NOTICE 'Realtors table not found, skipping';
  END IF;
END $$;

-- 6. Grant necessary permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

-- 7. Verify that everything is set up correctly
SELECT
  au.id AS auth_id,
  au.email AS auth_email,
  au.role AS auth_role,
  au.raw_app_meta_data->>'role' AS auth_app_role,
  p.id AS profile_id,
  p.email AS profile_email,
  p.role AS profile_role
FROM
  auth.users au
LEFT JOIN
  public.profiles p ON au.id = p.id
WHERE
  au.email = 's.admin@bonairemakelaars.com';
