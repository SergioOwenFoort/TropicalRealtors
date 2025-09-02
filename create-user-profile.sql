-- Create missing profile for sergioytpremium@gmail.com
-- This script will create the profile for a user that exists in auth.users but is missing from profiles

-- First, let's check if the user exists in auth.users and get their ID
DO $$
DECLARE
    user_record RECORD;
    profile_exists BOOLEAN;
BEGIN
    -- Check if user exists in auth.users
    SELECT id, email, created_at, email_confirmed_at
    INTO user_record
    FROM auth.users 
    WHERE email = 'sergioytpremium@gmail.com';
    
    IF user_record.id IS NULL THEN
        RAISE NOTICE 'User sergioytpremium@gmail.com not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user in auth.users:';
    RAISE NOTICE 'ID: %', user_record.id;
    RAISE NOTICE 'Email: %', user_record.email;
    RAISE NOTICE 'Created: %', user_record.created_at;
    RAISE NOTICE 'Email confirmed: %', user_record.email_confirmed_at;
    
    -- Check if profile already exists
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = user_record.id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE 'Profile already exists for this user';
        RETURN;
    END IF;
    
    -- Create the missing profile
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_record.id,
        user_record.email,
        'sergioytpremium',
        'user',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Profile created successfully for sergioytpremium@gmail.com';
    
    -- Verify the profile was created
    IF EXISTS(SELECT 1 FROM public.profiles WHERE id = user_record.id) THEN
        RAISE NOTICE 'Profile verification: SUCCESS';
    ELSE
        RAISE NOTICE 'Profile verification: FAILED';
    END IF;
    
END $$;
