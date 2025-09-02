-- SAFE Admin Setup Script
-- This script will update existing admin user or create new one without deleting data
-- Run this in Supabase Dashboard SQL Editor

-- Step 1: Create the check_admin_credentials function if it doesn't exist
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO authenticated;

SELECT 'Admin credential function created successfully!' as status;

-- Step 2: Check if admin user already exists
-- REPLACE 's.admin@bonairemakelaars.com' with your VITE_ADMIN_EMAIL
DO $$
DECLARE
    admin_email TEXT := 's.admin@bonairemakelaars.com'; -- REPLACE with your VITE_ADMIN_EMAIL
    admin_password TEXT := 'SuperSecure2025!'; -- REPLACE with your VITE_ADMIN_PASSWORD
    user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF existing_user_id IS NOT NULL THEN
        -- User exists, update password and metadata
        UPDATE auth.users 
        SET 
            encrypted_password = crypt(admin_password, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            updated_at = now(),
            raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
            raw_user_meta_data = '{"role":"admin"}'
        WHERE id = existing_user_id;
        
        -- Update or create profile
        INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
        VALUES (existing_user_id, admin_email, 'admin', 'Admin User', now(), now())
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = admin_email,
            updated_at = now();
            
        RAISE NOTICE 'Updated existing admin user: %', admin_email;
    ELSE
        -- Create new user
        user_id := gen_random_uuid();
        
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
            user_id,
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"],"role":"admin"}',
            '{"role":"admin"}'
        );
        
        -- Create profile
        INSERT INTO public.profiles (id, email, role, display_name, created_at, updated_at)
        VALUES (user_id, admin_email, 'admin', 'Admin User', now(), now());
        
        RAISE NOTICE 'Created new admin user: %', admin_email;
    END IF;
END $$;

-- Step 3: Test the setup
SELECT 'Testing admin credential function:' as test_info;
-- REPLACE email and password with your actual credentials
SELECT check_admin_credentials('s.admin@bonairemakelaars.com', 'SuperSecure2025!') as test_result;

-- Step 4: Verify the setup
SELECT 'SETUP VERIFICATION:' as result;

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

SELECT 'SAFE ADMIN SETUP COMPLETE!' as final_status;
