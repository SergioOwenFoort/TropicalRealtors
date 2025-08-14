-- Direct admin password reset script
-- For use with "Database error querying schema" errors
-- Run this in the SQL Editor of your Supabase project

-- APPROACH 1: Direct SQL password update (most reliable)
UPDATE auth.users
SET 
  encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  is_sso_user = false,
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{isAdmin}', 
    'true'::jsonb
  ),
  raw_app_meta_data = raw_app_meta_data - 'mfa_enabled',
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 's.admin@bonairemakelaars.com';

-- APPROACH 2: Delete and recreate the admin user (if update fails)
-- Uncomment this block only if the above approach fails
/*
-- First back up the admin profile if it exists
CREATE TABLE IF NOT EXISTS public.backup_admin_profile AS
SELECT * FROM public.profiles WHERE email = 's.admin@bonairemakelaars.com';

-- Delete the admin user to recreate it
DELETE FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';

-- Create a new admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),                  -- Generate a new UUID
  '00000000-0000-0000-0000-000000000000',  -- Default instance_id
  's.admin@bonairemakelaars.com',      -- Admin email
  crypt('SuperSecure2025!', gen_salt('bf')),  -- Encrypted password
  now(),                               -- Email confirmed
  'authenticated',                     -- Role
  '{"isAdmin": true}'::jsonb,          -- User metadata
  now(),                               -- Created at
  now(),                               -- Updated at
  NULL,                                -- No confirmation token
  NULL                                 -- No recovery token
);

-- Get the new admin ID
DO $$
DECLARE
  new_admin_id UUID;
BEGIN
  -- Get the new admin ID
  SELECT id INTO new_admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
  
  -- Create or update the profile
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    new_admin_id,
    's.admin@bonairemakelaars.com',
    'admin',
    'Admin User'
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    role = 'admin',
    display_name = 'Admin User';
END $$;
*/

-- Update the profiles table regardless of which approach was used
UPDATE public.profiles 
SET 
  role = 'admin',
  display_name = 'Admin User'
WHERE email = 's.admin@bonairemakelaars.com';

-- Insert if doesn't exist
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE email = 's.admin@bonairemakelaars.com'
);

-- Check result of operations
SELECT 
  a.id AS auth_id, 
  a.email AS auth_email, 
  a.last_sign_in_at,
  p.id AS profile_id, 
  p.email AS profile_email, 
  p.role
FROM auth.users a
LEFT JOIN public.profiles p ON p.id = a.id
WHERE a.email = 's.admin@bonairemakelaars.com';

-- Show confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Admin password reset completed.';
  RAISE NOTICE 'Login with: s.admin@bonairemakelaars.com / SuperSecure2025!';
END $$;
