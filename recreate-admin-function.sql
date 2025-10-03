-- Check and fix the check_admin_credentials function
-- Run this in Supabase SQL Editor

-- Step 1: Check if the function exists and what it does
SELECT 'Current check_admin_credentials function:' as step;
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_admin_credentials';

-- Step 2: Check current admin user details
SELECT 'Current admin user details:' as step;
SELECT 
    u.id as user_id,
    u.email,
    u.encrypted_password IS NOT NULL as has_password,
    p.role,
    p.display_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 's.admin@tropicalrealtors.com';

-- Step 3: Test manual password verification
SELECT 'Manual password check:' as step;
SELECT 
    email,
    encrypted_password = crypt('SuperSecure2025!', encrypted_password) as password_matches
FROM auth.users 
WHERE email = 's.admin@tropicalrealtors.com';

-- Step 4: Drop and recreate the check_admin_credentials function
DROP FUNCTION IF EXISTS check_admin_credentials(TEXT, TEXT);

-- Step 5: Create a new, more robust check_admin_credentials function
CREATE OR REPLACE FUNCTION check_admin_credentials(admin_email TEXT, admin_password TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    profile_record RECORD;
    password_valid BOOLEAN := FALSE;
    result JSON;
BEGIN
    -- Check if user exists in auth.users
    SELECT id, email, encrypted_password
    INTO user_record
    FROM auth.users
    WHERE email = admin_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'User not found',
            'user_id', NULL
        );
    END IF;
    
    -- Check if profile exists and has admin role
    SELECT id, email, role
    INTO profile_record
    FROM public.profiles
    WHERE id = user_record.id AND role = 'admin';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'User is not an admin',
            'user_id', user_record.id
        );
    END IF;
    
    -- Verify password
    SELECT (user_record.encrypted_password = crypt(admin_password, user_record.encrypted_password))
    INTO password_valid;
    
    IF NOT password_valid THEN
        RETURN json_build_object(
            'success', FALSE,
            'message', 'Invalid password',
            'user_id', user_record.id
        );
    END IF;
    
    -- All checks passed
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Admin credentials verified',
        'user_id', user_record.id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', FALSE,
        'message', 'Error: ' || SQLERRM,
        'user_id', NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Test the new function
SELECT 'Testing new check_admin_credentials function:' as step;
SELECT check_admin_credentials('s.admin@tropicalrealtors.com', 'SuperSecure2025!') as test_result;
