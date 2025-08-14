-- SQL Password Reset Script for s.admin@bonairemakelaars.com
-- Run this script in your Supabase SQL Editor

-- Ensure we have proper error handling
DO $$
DECLARE
  admin_id UUID;
  rows_updated INTEGER;
  admin_exists BOOLEAN;
  profile_exists BOOLEAN;
BEGIN
  -- Check if the user exists in auth.users
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 's.admin@bonairemakelaars.com') INTO admin_exists;
  
  IF NOT admin_exists THEN
    RAISE NOTICE 'Admin user s.admin@bonairemakelaars.com not found in auth.users';
    RETURN;
  END IF;
  
  -- Get the admin user ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  RAISE NOTICE 'Found admin user with ID: %', admin_id;
  
  -- Reset the password to SuperSecure2025!
  UPDATE auth.users
  SET 
    encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL,
    recovery_token = NULL,
    recovery_sent_at = NULL
  WHERE id = admin_id;
  
  -- Check if update was successful
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  IF rows_updated > 0 THEN
    RAISE NOTICE 'Password successfully reset for s.admin@bonairemakelaars.com';
  ELSE
    RAISE NOTICE 'Failed to update password for s.admin@bonairemakelaars.com';
    RETURN;
  END IF;
  
  -- Check if the user exists in public.profiles
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) INTO profile_exists;
  
  -- Update the profile if it exists, or create it if it doesn't
  IF profile_exists THEN
    UPDATE public.profiles
    SET 
      role = 'admin',
      display_name = 'Admin User'
    WHERE id = admin_id;
    RAISE NOTICE 'Updated existing profile to ensure admin role';
  ELSE
    -- Create the profile if it doesn't exist
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, 's.admin@bonairemakelaars.com', 'admin', 'Admin User');
    RAISE NOTICE 'Created new profile for admin user';
  END IF;
  
  -- Confirm completion
  RAISE NOTICE 'Password reset completed successfully';
  RAISE NOTICE 'Login with email: s.admin@bonairemakelaars.com and password: SuperSecure2025!';
END $$;
