-- Complete admin login fix script
-- Run this in Supabase SQL Editor to fix both role and password

-- Step 1: Check current admin user state
SELECT 'Current admin user in auth.users:' as step;
SELECT id, email, email_confirmed_at, encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 's.admin@tropicalrealtors.com';

SELECT 'Current admin profile:' as step;
SELECT id, email, role, display_name
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 2: Update the role to admin (in case it wasn't done yet)
UPDATE public.profiles 
SET role = 'admin',
    updated_at = now()
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 3: Update the password hash to match 'SuperSecure2025!'
UPDATE auth.users 
SET encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
    updated_at = now()
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 4: Verify the updates
SELECT 'Updated admin user:' as step;
SELECT id, email, email_confirmed_at, encrypted_password IS NOT NULL as has_password, updated_at
FROM auth.users 
WHERE email = 's.admin@tropicalrealtors.com';

SELECT 'Updated admin profile:' as step;
SELECT id, email, role, display_name, updated_at
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 5: Test the admin credentials function
SELECT 'Testing admin login credentials:' as step;
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as credential_test;
