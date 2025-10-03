-- Complete Admin Setup Script
-- Run this script FIRST in Supabase Dashboard SQL Editor
-- This sets up the necessary function and creates the admin user

-- Step 1: Create the check_admin_credentials function
CREATE OR REPLACE FUNCTION check_admin_credentials(admin_email text, admin_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record record;
    is_valid boolean := false;
    result jsonb;
BEGIN
    -- Check if user exists and get their record
    SELECT id, email, encrypted_password, raw_app_meta_data
    INTO user_record
    FROM auth.users
    WHERE email = admin_email
    AND email_confirmed_at IS NOT NULL;
    
    -- If user not found, return failure
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Admin user not found',
            'user_id', null
        );
    END IF;
    
    -- Verify password using crypt function
    SELECT (user_record.encrypted_password = crypt(admin_password, user_record.encrypted_password))
    INTO is_valid;
    
    -- Check if user has admin role in metadata
    IF is_valid AND (
        user_record.raw_app_meta_data->>'role' = 'admin' OR 
        user_record.raw_app_meta_data->'roles' ? 'admin'
    ) THEN
        -- Also verify against profiles table
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = user_record.id 
            AND role = 'admin'
        ) THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'Admin credentials valid',
                'user_id', user_record.id,
                'email', user_record.email
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'message', 'User exists but is not an admin in profiles',
                'user_id', user_record.id
            );
        END IF;
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid password or insufficient privileges',
            'user_id', user_record.id
        );
    END IF;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO authenticated;

SELECT 'Admin credential function created successfully!' as status;

-- Step 2: Clean up any existing admin users and their related data
-- REPLACE THE EMAIL BELOW with your VITE_ADMIN_EMAIL value

-- Delete in correct order to avoid foreign key constraint violations:
-- 1. First delete properties created by this user
DELETE FROM public.properties WHERE created_by IN (
    SELECT id FROM auth.users WHERE email = 's.admin@tropicalrealtors.com'
);

-- 2. Delete any other related data that might reference the user
DELETE FROM public.saved_searches WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 's.admin@tropicalrealtors.com'
);

DELETE FROM public.favorites WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 's.admin@tropicalrealtors.com'
);

-- 3. Delete the profile (child table)
DELETE FROM public.profiles WHERE email = 's.admin@tropicalrealtors.com';

-- 4. Finally delete the user (parent table)
DELETE FROM auth.users WHERE email = 's.admin@tropicalrealtors.com';

-- Step 3: Create the admin user
-- REPLACE the email and password below with your actual admin credentials
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
    's.admin@tropicalrealtors.com', -- REPLACE with your VITE_ADMIN_EMAIL
    crypt('SuperSecure2025!', gen_salt('bf')), -- REPLACE with your VITE_ADMIN_PASSWORD
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"role":"admin"}'
);

-- Step 4: Create the admin profile
INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'admin',
    'Admin User',
    now(),
    now()
FROM auth.users u 
WHERE u.email = 's.admin@tropicalrealtors.com'; -- REPLACE with your VITE_ADMIN_EMAIL

-- Step 5: Test the setup
SELECT 'Testing admin credential function:' as test_info;
-- REPLACE email and password with your actual credentials
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as test_result;

-- Step 6: Verify the setup
SELECT 'SETUP VERIFICATION:' as result;

-- Check auth user
SELECT 'Auth User:' as info, 
       email, 
       email_confirmed_at,
       CASE WHEN encrypted_password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status,
       raw_app_meta_data
FROM auth.users 
WHERE email = 's.admin@tropicalrealtors.com'; -- REPLACE with your VITE_ADMIN_EMAIL

-- Check profile
SELECT 'Profile:' as info,
       email,
       created_at,
       role,
       display_name
FROM public.profiles 
WHERE email = 's.admin@tropicalrealtors.com'; -- REPLACE with your VITE_ADMIN_EMAIL

SELECT 'ADMIN SETUP COMPLETE!' as final_status;
