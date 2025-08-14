-- Post-Authentication Diagnosis Script
-- Run this if your admin can authenticate but still can't log in
-- Run in the SQL Editor using service_role key

-- 1. First confirm authentication is working for the admin
DO $$
DECLARE
  admin_id uuid;
  last_sign_in timestamp;
BEGIN
  -- Get admin authentication info
  SELECT id, last_sign_in_at INTO admin_id, last_sign_in
  FROM auth.users
  WHERE email = 's.admin@bonairemakelaars.com';
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found in auth.users table!';
  ELSE
    RAISE NOTICE 'Admin user exists with ID: %', admin_id;
    
    IF last_sign_in IS NOT NULL THEN
      RAISE NOTICE 'Admin has previously signed in. Last sign in: %', last_sign_in;
    ELSE
      RAISE NOTICE 'Admin has never signed in successfully.';
    END IF;
  END IF;
END $$;

-- 2. Check if admin profile is properly linked
DO $$
DECLARE
  admin_id uuid;
  profile_id uuid;
  profile_role text;
BEGIN
  -- Get admin ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  
  -- Check if profile exists with matching ID
  SELECT id, role INTO profile_id, profile_role FROM public.profiles WHERE id = admin_id;
  
  IF profile_id IS NULL THEN
    RAISE NOTICE 'CRITICAL: Admin profile does not exist or ID does not match auth.users!';
    RAISE NOTICE 'This will prevent successful login even if authentication works.';
    
    -- Fix the issue
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin', display_name = 'Admin User';
    
    RAISE NOTICE 'Created/fixed admin profile with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Admin profile exists with correct ID: %', profile_id;
    
    IF profile_role = 'admin' THEN
      RAISE NOTICE 'Admin profile has correct role: %', profile_role;
    ELSE
      RAISE NOTICE 'ISSUE: Admin profile has incorrect role: %', profile_role;
      
      -- Fix the role
      UPDATE public.profiles SET role = 'admin' WHERE id = admin_id;
      RAISE NOTICE 'Fixed admin profile role to "admin"';
    END IF;
  END IF;
  
  -- Check for duplicate profiles
  PERFORM id, email FROM public.profiles 
  WHERE email = 's.admin@bonairemakelaars.com' AND id != admin_id;
  
  IF FOUND THEN
    RAISE NOTICE 'ISSUE: Found duplicate admin profiles with different IDs!';
    DELETE FROM public.profiles 
    WHERE email = 's.admin@bonairemakelaars.com' AND id != admin_id;
    RAISE NOTICE 'Removed duplicate profiles.';
  END IF;
END $$;

-- 3. Verify RLS policies aren't blocking login
DO $$
DECLARE
  profiles_rls_enabled boolean;
  admin_policy_exists boolean;
BEGIN
  -- Check if RLS is enabled on profiles
  SELECT relrowsecurity INTO profiles_rls_enabled
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'profiles';
  
  IF profiles_rls_enabled THEN
    RAISE NOTICE 'RLS is enabled on profiles table.';
    
    -- Check if admin policy exists
    SELECT EXISTS (
      SELECT 1 FROM pg_catalog.pg_policy p
      JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'profiles'
      AND p.polname ILIKE '%admin%'
    ) INTO admin_policy_exists;
    
    IF admin_policy_exists THEN
      RAISE NOTICE 'Admin policy exists on profiles table.';
    ELSE
      RAISE NOTICE 'ISSUE: No admin policy found on profiles table!';
      
      -- Create admin policy
      DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
      CREATE POLICY "Admin full access to profiles" ON public.profiles
        USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
      
      RAISE NOTICE 'Created admin policy on profiles table.';
    END IF;
  ELSE
    RAISE NOTICE 'RLS is NOT enabled on profiles table.';
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on profiles table.';
    
    -- Create basic policies
    DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
    CREATE POLICY "Anyone can view profiles" ON public.profiles
      FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
    CREATE POLICY "Admin full access to profiles" ON public.profiles
      USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    
    RAISE NOTICE 'Created basic policies on profiles table.';
  END IF;
END $$;

-- 4. Check permissions
DO $$
BEGIN
  -- Grant necessary permissions
  GRANT ALL ON public.profiles TO postgres, service_role;
  GRANT SELECT ON public.profiles TO anon, authenticated;
  GRANT UPDATE, DELETE ON public.profiles TO authenticated;
  
  RAISE NOTICE 'Granted necessary permissions on profiles table.';
END $$;

-- 5. Check initial query after login
-- This simulates what your app might query right after login
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get admin ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  
  -- Set up a fake JWT claim (simulating being logged in as admin)
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', admin_id, 'role', 'authenticated', 'email', 's.admin@bonairemakelaars.com')::text,
    false
  );
  
  -- Now try to query as if we're the logged in admin
  RAISE NOTICE 'Testing query as logged in admin user...';
  
  PERFORM id, email, role FROM public.profiles WHERE id = auth.uid();
  RAISE NOTICE 'Successfully queried own profile as admin';
  
  PERFORM id, email, role FROM public.profiles;
  RAISE NOTICE 'Successfully queried all profiles as admin';
  
  -- Test if admin check works
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE NOTICE 'Admin role check successful';
  ELSE
    RAISE NOTICE 'ISSUE: Admin role check failed!';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during admin query test: %', SQLERRM;
END $$;

-- 6. Verify final setup and provide debugging info for client-side
SELECT
  au.id AS auth_id,
  au.email AS auth_email,
  au.raw_app_meta_data->>'role' AS auth_app_role,
  p.id AS profile_id,
  p.email AS profile_email,
  p.role AS profile_role
FROM
  auth.users au
JOIN
  public.profiles p ON au.id = p.id
WHERE
  au.email = 's.admin@bonairemakelaars.com';

/*
CLIENT-SIDE DEBUGGING TIPS:

If you're still having issues after running this script:

1. Browser Console Checks:
   - Check for any JavaScript errors in the browser console
   - Verify localStorage has a Supabase session stored
   - Verify the JWT token is being sent in API requests

2. Application Logic Checks:
   - Does your app correctly redirect after login?
   - Are you checking for role='admin' in both the JWT token AND the profiles table?
   - Are you properly handling session persistence?

3. Try this in the browser console to check authentication:
   ```javascript
   const { data } = await supabase.auth.getSession();
   console.log('Current session:', data.session);
   
   // If session exists, check profile
   if (data.session) {
     const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
     console.log('Profile:', profile);
   }
   ```
*/
