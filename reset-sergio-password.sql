-- Reset password for Sergio's ACTUAL admin account
-- Run this in Supabase Dashboard > SQL Editor

UPDATE auth.users 
SET 
  encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 's.foort@bonairemakelaars.com';

-- Verify the update was successful
SELECT 
  email, 
  email_confirmed_at,
  updated_at,
  CASE WHEN encrypted_password IS NOT NULL THEN 'Password is set' ELSE 'No password' END as password_status
FROM auth.users
WHERE email = 's.foort@bonairemakelaars.com';

-- Also ensure the profile has admin role
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'Sergio Foort',
  updated_at = now()
WHERE email = 's.foort@bonairemakelaars.com';

-- Verify the profile
SELECT id, email, full_name, role, created_at, updated_at 
FROM public.profiles 
WHERE email = 's.foort@bonairemakelaars.com';
