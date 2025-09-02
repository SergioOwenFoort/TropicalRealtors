-- MANUAL FIX for missing user profile
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Step 1: Create the function to handle missing profiles
CREATE OR REPLACE FUNCTION public.create_missing_profile_for_email(user_email TEXT)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    profile_exists BOOLEAN;
    result JSON;
BEGIN
    -- Get user from auth.users
    SELECT id, email, created_at, email_confirmed_at
    INTO user_record
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_record.id IS NULL THEN
        result := json_build_object(
            'success', false,
            'message', 'User not found in auth.users',
            'user_email', user_email
        );
        RETURN result;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = user_record.id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        result := json_build_object(
            'success', true,
            'message', 'Profile already exists',
            'user_id', user_record.id,
            'user_email', user_record.email
        );
        RETURN result;
    END IF;
    
    -- Create profile
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
        split_part(user_record.email, '@', 1),
        'user',
        NOW(),
        NOW()
    );
    
    result := json_build_object(
        'success', true,
        'message', 'Profile created successfully',
        'user_id', user_record.id,
        'user_email', user_record.email,
        'display_name', split_part(user_record.email, '@', 1),
        'role', 'user'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
        'success', false,
        'message', 'Error: ' || SQLERRM,
        'user_email', user_email
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Call the function to create the missing profile
SELECT public.create_missing_profile_for_email('sergioytpremium@gmail.com');

-- Step 3: Verify the profile was created
SELECT * FROM public.profiles WHERE email = 'sergioytpremium@gmail.com';

-- Step 4: Create a trigger to prevent this issue in the future
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (new.id, new.email, split_part(new.email, '@', 1), 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (this will fire whenever a new user is created in auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Final verification - show all profiles
SELECT email, display_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;
