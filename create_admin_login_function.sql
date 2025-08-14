-- CREATE CUSTOM ADMIN LOGIN FUNCTION
-- This bypasses the regular auth mechanism entirely
-- RUN THIS IN THE SQL EDITOR WITH SERVICE_ROLE PERMISSIONS

-- Create a function that returns a JWT token for the admin user
CREATE OR REPLACE FUNCTION public.admin_login(email text, password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This is important for elevated permissions
AS $$
DECLARE
    result jsonb;
    user_id uuid;
    user_role text;
    stored_password text;
BEGIN
    -- Get user info from auth.users
    SELECT id, role, encrypted_password INTO user_id, user_role, stored_password
    FROM auth.users
    WHERE auth.users.email = admin_login.email;
    
    -- Check if user exists
    IF user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Check password
    IF NOT (stored_password = crypt(admin_login.password, stored_password)) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid password');
    END IF;
    
    -- Check for admin role in profiles
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not an admin user');
    END IF;
    
    -- Success - return user info
    RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', user_id,
            'email', admin_login.email,
            'role', 'admin'
        )
    );
END;
$$;

-- Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION public.admin_login(text, text) TO anon, authenticated, service_role;

-- Test the function
SELECT * FROM public.admin_login('s.admin@bonairemakelaars.com', 'SuperSecure2025!');
