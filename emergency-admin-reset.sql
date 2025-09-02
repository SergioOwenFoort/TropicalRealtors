-- EMERGENCY ADMIN RESET - Bypass auth.admin functions
-- Run this in Supabase Dashboard SQL Editor
-- This approach creates the admin user directly in the database
-- 
-- IMPORTANT: Before running this script, update the email and password below
-- to match your VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD environment variables

-- Step 1: Check current state
SELECT 'Current auth users with admin emails:' as info;
SELECT id, email, email_confirmed_at, created_at, raw_app_meta_data
FROM auth.users 
WHERE email IN ('s.admin@bonairemakelaars.com', 's.foort@bonairemakelaars.com')
ORDER BY created_at DESC;

SELECT 'Current admin profiles:' as info;
SELECT id, email, role, display_name, created_at
FROM public.profiles 
WHERE role = 'admin' OR email IN ('s.admin@bonairemakelaars.com', 's.foort@bonairemakelaars.com')
ORDER BY created_at DESC;

-- Step 2: Create admin user directly in auth.users table
-- This bypasses the auth.admin functions that might be blocked

-- First, delete all related data to avoid foreign key constraint violations
-- Delete in correct order: properties → saved_searches → favorites → profiles → users

-- 1. Delete properties created by this user
DELETE FROM public.properties WHERE created_by IN (
    SELECT id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com'
);

-- 2. Delete saved searches by this user
DELETE FROM public.saved_searches WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com'
);

-- 3. Delete favorites by this user
DELETE FROM public.favorites WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com'
);

-- 4. Delete the profile (child table)
DELETE FROM public.profiles WHERE email = 's.admin@bonairemakelaars.com';

-- 5. Finally delete the user (parent table)
DELETE FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';

-- Then insert the new admin user
-- REPLACE 's.admin@bonairemakelaars.com' and 'SuperSecure2025!' with your actual admin credentials
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
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    's.admin@bonairemakelaars.com', -- REPLACE with your VITE_ADMIN_EMAIL
    crypt('SuperSecure2025!', gen_salt('bf')), -- REPLACE with your VITE_ADMIN_PASSWORD
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"role":"admin"}'
);

-- Step 3: Create corresponding profile
-- Profile was already deleted in Step 2, now insert the new one
INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'admin',
    'Sergio Foort',
    now(),
    now()
FROM auth.users u 
WHERE u.email = 's.admin@bonairemakelaars.com';

-- Step 4: Verify the admin user was created/updated
SELECT 'FINAL VERIFICATION:' as result;

-- Check auth user
SELECT 'Auth User:' as info, 
       email, 
       email_confirmed_at,
       CASE WHEN encrypted_password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status,
       raw_app_meta_data
FROM auth.users 
WHERE email = 's.admin@bonairemakelaars.com'; -- REPLACE with your VITE_ADMIN_EMAIL

-- Check profile
SELECT 'Profile:' as info,
       email,
       created_at,
       role,
       display_name
FROM public.profiles 
WHERE email = 's.admin@bonairemakelaars.com'; -- REPLACE with your VITE_ADMIN_EMAIL

-- Step 5: Success message
SELECT 
    'ADMIN RESET COMPLETE!' as status,
    's.admin@bonairemakelaars.com' as email, -- REPLACE with your VITE_ADMIN_EMAIL
    'SuperSecure2025!' as password, -- REPLACE with your VITE_ADMIN_PASSWORD
    'Try logging in at: http://localhost:5174/auth/login' as next_step;
