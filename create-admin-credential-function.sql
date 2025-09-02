-- Create the check_admin_credentials function
-- This function validates admin login credentials using direct database access

CREATE OR REPLACE FUNCTION check_admin_credentials(
    user_email text,
    user_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_record public.profiles%ROWTYPE;
    result jsonb;
BEGIN
    -- Find user by email
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email
    AND email_confirmed_at IS NOT NULL;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found or email not confirmed'
        );
    END IF;
    
    -- Verify password (using crypt function to compare with stored hash)
    IF user_record.encrypted_password != crypt(user_password, user_record.encrypted_password) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid password'
        );
    END IF;
    
    -- Get user profile to check admin role
    SELECT * INTO profile_record
    FROM public.profiles
    WHERE id = user_record.id;
    
    -- Check if user has admin role
    IF profile_record.role != 'admin' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not an admin'
        );
    END IF;
    
    -- Success - return user info
    RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', user_record.id,
            'email', user_record.email,
            'role', profile_record.role,
            'display_name', profile_record.display_name
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_credentials(text, text) TO service_role;
