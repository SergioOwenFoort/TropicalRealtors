-- SQL script to check and fix RLS policies for authentication
-- Since you can see realtors but can't log in, this is likely an RLS issue

-- 1. Check existing policies on auth-related tables
SELECT
  n.nspname as schema,
  c.relname as table,
  p.polname as policy_name,
  p.polpermissive as permissive,
  p.polcmd as command,
  p.polroles as roles,
  pg_catalog.pg_get_expr(p.polqual, p.polrelid) as expression,
  pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid) as with_check
FROM
  pg_catalog.pg_policy p
  JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE
  n.nspname = 'public'
  AND (
    c.relname = 'profiles' OR 
    c.relname = 'realtors'
  )
ORDER BY
  schema, table, policy_name;

-- 2. Fix RLS on profiles table (critical for authentication)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Make sure profiles table has basic policies
-- This policy allows anyone to see profiles (needed for authentication)
DROP POLICY IF EXISTS "Allow read access to all profiles" ON public.profiles;
CREATE POLICY "Allow read access to all profiles" ON public.profiles
  FOR SELECT USING (true);

-- This policy allows users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- This policy allows service_role to do anything (needed for admin functions)
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" ON public.profiles
  USING (auth.role() = 'service_role');

-- 4. Also check realtors table RLS
-- Make sure RLS is enabled
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Add basic policies if they don't exist
DROP POLICY IF EXISTS "Allow read access to all realtors" ON public.realtors;
CREATE POLICY "Allow read access to all realtors" ON public.realtors
  FOR SELECT USING (true);

-- 5. Fix any UUID reference issues
-- Make sure the admin profile correctly references the auth.users table
-- First, check if admin exists
DO $$
DECLARE
  admin_id UUID;
  profile_id UUID;
BEGIN
  -- Get admin ID from auth.users
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  
  -- Get profile ID if it exists
  SELECT id INTO profile_id FROM public.profiles WHERE email = 's.admin@bonairemakelaars.com';
  
  -- If admin exists in auth.users
  IF admin_id IS NOT NULL THEN
    -- Check if profile exists and matches
    IF profile_id IS NOT NULL AND profile_id != admin_id THEN
      -- Fix mismatched IDs
      UPDATE public.profiles 
      SET id = admin_id 
      WHERE email = 's.admin@bonairemakelaars.com';
      RAISE NOTICE 'Fixed mismatched profile ID for admin';
    ELSIF profile_id IS NULL THEN
      -- Create missing profile
      INSERT INTO public.profiles (id, email, role, display_name)
      VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User');
      RAISE NOTICE 'Created missing admin profile';
    ELSE
      RAISE NOTICE 'Admin profile exists and matches auth.users ID';
    END IF;
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users table';
  END IF;
END $$;

-- 6. Grant proper permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

GRANT ALL ON public.realtors TO postgres, service_role;
GRANT SELECT ON public.realtors TO anon, authenticated;

-- 7. Verify profiles and permissions
SELECT 
  p.id, 
  p.email, 
  p.role, 
  au.id AS auth_id, 
  au.role AS auth_role
FROM 
  public.profiles p
LEFT JOIN 
  auth.users au ON p.id = au.id
WHERE 
  p.email = 's.admin@bonairemakelaars.com';
