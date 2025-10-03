-- Fix admin role for s.admin@tropicalrealtors.com
-- Run this in Supabase SQL Editor

-- Step 1: Check current role
SELECT 'Current role before update:' as step;
SELECT id, email, role, display_name, created_at, updated_at
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 2: Update the role to admin
UPDATE public.profiles 
SET role = 'admin',
    updated_at = now()
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 3: Verify the update
SELECT 'Role after update:' as step;
SELECT id, email, role, display_name, created_at, updated_at
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 4: Test the admin credentials function
SELECT 'Testing admin credentials:' as step;
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as test_result;
