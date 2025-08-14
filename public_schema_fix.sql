-- This SQL script focuses on fixing issues in public schema only
-- For use with Supabase SQL Editor when you get "permission denied for schema auth" errors

-- 1. First, check if we can access user information without modifying it
SELECT COUNT(*) AS total_users FROM auth.users;
SELECT COUNT(*) AS admin_users FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';

-- 2. Check the profiles table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
) AS profiles_table_exists;

-- 3. Make sure profiles table is properly set up
-- If profiles table doesn't exist, we'll create it
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

-- 4. Fix RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Update profiles policies
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

-- 6. Make sure admin profile exists in the profiles table
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', display_name = 'Admin User';

-- 7. Check if any other admin users exist and make sure they have admin role
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email LIKE '%admin%'
  AND email != 's.admin@bonairemakelaars.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', display_name = 'Admin User';

-- 8. Grant appropriate permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

-- 9. Check the results
SELECT id, email, role, display_name FROM public.profiles WHERE role = 'admin';
