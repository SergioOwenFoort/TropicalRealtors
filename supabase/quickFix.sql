-- Script to run in Supabase SQL Editor to fix the profiles table policies
-- Copy and paste this entire script into the Supabase SQL Editor

-- Turn off RLS temporarily to access the table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create the admin profile if it doesn't exist
INSERT INTO profiles (id, email, role, display_name)
SELECT id, email, 'admin', 'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 's.admin@bonairemakelaars.com'
);

-- Update existing admin user to ensure role is set
UPDATE profiles 
SET role = 'admin' 
WHERE email = 's.admin@bonairemakelaars.com';

-- Drop all existing policies on the profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Realtors can view specific profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple PUBLIC access policy for now 
-- This is a temporary measure to get the app working
-- You can add more restrictive policies later
CREATE POLICY "Enable read access for all users" ON profiles
    FOR SELECT USING (true);

-- Create a simple policy for users to update their own profiles
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create a simple policy for inserting profiles
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
