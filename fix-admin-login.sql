-- Quick fix for admin login after rebranding
-- This script updates the existing admin user to use the new email address

-- Step 1: Check current admin records
SELECT 'Current admin users in auth.users:' as info;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%admin%' OR email LIKE '%bonaire%' OR email LIKE '%tropical%'
ORDER BY created_at DESC;

SELECT 'Current admin profiles:' as info;
SELECT id, email, role, display_name, created_at
FROM public.profiles 
WHERE role = 'admin' OR email LIKE '%admin%' OR email LIKE '%bonaire%' OR email LIKE '%tropical%'
ORDER BY created_at DESC;

-- Step 2: Update existing admin user email (if exists)
UPDATE auth.users 
SET email = 's.admin@tropicalrealtors.com',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 's.admin@bonairemakelaars.com';

-- Step 3: Update existing admin profile email (if exists)
UPDATE public.profiles 
SET email = 's.admin@tropicalrealtors.com',
    updated_at = now()
WHERE email = 's.admin@bonairemakelaars.com';

-- Step 4: If no admin exists, create new one
-- (This will only insert if no admin with the new email exists)
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
) 
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    's.admin@tropicalrealtors.com',
    crypt('SuperSecure2025!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"role":"admin"}'
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 's.admin@tropicalrealtors.com'
);

-- Step 5: Create profile if it doesn't exist
INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'admin',
    'Sergio Foort',
    now(),
    now()
FROM auth.users u 
WHERE u.email = 's.admin@tropicalrealtors.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 's.admin@tropicalrealtors.com'
);

-- Step 6: Verify the fix
SELECT 'VERIFICATION - Updated admin users:' as result;
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 's.admin@tropicalrealtors.com';

SELECT 'VERIFICATION - Updated admin profiles:' as result;
SELECT id, email, role, display_name, created_at
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 7: Test the admin credentials function
SELECT 'TESTING - Admin credentials check:' as result;
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as test_result;
