-- Script to fix infinite recursion in profiles table policies

-- First, drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Realtors can view specific profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Now recreate the policies without recursion
-- 1. Enable RLS on profiles table (in case it's not enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for users to view their own profile (no recursion)
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Create policy for users to update their own profile (no recursion)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Create policy for admins to view all profiles
-- Using a direct check instead of potentially recursive function
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Create policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Create policy for realtors to view specific profiles
CREATE POLICY "Realtors can view specific profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'realtor'
  )
);

-- 7. Allow public profile viewing when a profile is marked as public
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (public_profile = TRUE);

-- 8. Create policy for insertion (might be missing)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create a helper function for admins that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    JOIN profiles ON auth.users.id = profiles.id
    WHERE auth.users.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to verify and fix admin policies
CREATE OR REPLACE FUNCTION verify_admin_policies()
RETURNS VOID AS $$
BEGIN
  -- Ensure the admin user has the admin role
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 's.admin@bonairemakelaars.com' AND role IS DISTINCT FROM 'admin';
  
  -- Ensure admin has a profile
  INSERT INTO profiles (id, email, role, display_name)
  SELECT id, email, 'admin', 'Admin User'
  FROM auth.users
  WHERE email = 's.admin@bonairemakelaars.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = 's.admin@bonairemakelaars.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
