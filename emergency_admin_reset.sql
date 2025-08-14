-- EMERGENCY ADMIN RESET SCRIPT
-- Simplest possible approach to reset admin password

-- Get admin user id first
SELECT id, email FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';

-- Update password directly
UPDATE auth.users 
SET 
  encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 's.admin@bonairemakelaars.com';

-- Check if it worked (will show 1 row if successful)
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE 
  email = 's.admin@bonairemakelaars.com' AND 
  updated_at > (now() - interval '5 minutes');
