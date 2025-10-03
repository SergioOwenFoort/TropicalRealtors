-- Debug script to check admin login issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if the admin user exists in auth.users
SELECT 'Current auth.users records:' as debug_step;
SELECT id, email, email_confirmed_at, created_at, updated_at
FROM auth.users 
WHERE email LIKE '%admin%' OR email LIKE '%tropical%' OR email LIKE '%bonaire%'
ORDER BY created_at DESC;

-- 2. Check if the admin profile exists
SELECT 'Current profiles records:' as debug_step;
SELECT id, email, role, display_name, created_at, updated_at
FROM public.profiles 
WHERE email LIKE '%admin%' OR email LIKE '%tropical%' OR email LIKE '%bonaire%' OR role = 'admin'
ORDER BY created_at DESC;

-- 3. Check if the check_admin_credentials function exists
SELECT 'Available RPC functions:' as debug_step;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%'
ORDER BY routine_name;

-- 4. Test the check_admin_credentials function directly
SELECT 'Testing check_admin_credentials function:' as debug_step;
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as credential_check_result;

-- 5. Alternative: Check if we can find the user with the old email
SELECT 'Checking for old email records:' as debug_step;
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 's.admin@bonairemakelaars.com';

-- 6. Check the encrypted password for troubleshooting
SELECT 'Current password hash check:' as debug_step;
SELECT id, email, encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email IN ('s.admin@tropicalrealtors.com', 's.admin@bonairemakelaars.com');
