-- Direct admin password reset script
-- This is similar to what worked yesterday

-- This direct approach worked yesterday to reset the admin password
UPDATE auth.users 
SET 
  encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 's.admin@bonairemakelaars.com';

-- Verify the update was successful (will show 1 if successful)
SELECT COUNT(*) FROM auth.users
WHERE 
  email = 's.admin@bonairemakelaars.com' AND
  updated_at > (now() - interval '5 minutes');
n
-- Also ensure the profile is set up correctly
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', display_name = 'Admin User';

-- Verify the profile
SELECT id, email, role, display_name FROM public.profiles 
WHERE email = 's.admin@bonairemakelaars.com';
