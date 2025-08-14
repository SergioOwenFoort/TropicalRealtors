-- Reset password stored procedures for admin users
-- This file contains SQL functions to reset user passwords in Supabase

-- Function to reset password using user_id and new password
CREATE OR REPLACE FUNCTION public.admin_reset_password_sql(user_id UUID, password TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(password, gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL,
    recovery_token = NULL,
    recovery_sent_at = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function to reset password using email
CREATE OR REPLACE FUNCTION public.reset_password_direct(email TEXT, new_password TEXT)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now(), 
    confirmation_token = NULL,
    confirmation_sent_at = NULL,
    recovery_token = NULL,
    recovery_sent_at = NULL
  WHERE email = email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_reset_password_sql TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_password_direct TO service_role;
