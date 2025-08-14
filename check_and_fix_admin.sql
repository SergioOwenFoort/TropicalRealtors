-- Check if email exists and create if not
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 's.admin@bonairemakelaars.com') 
  INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'User s.admin@bonairemakelaars.com exists in auth.users';
  ELSE
    RAISE NOTICE 'User s.admin@bonairemakelaars.com does not exist, checking alternate email';
    
    -- Check if there's a similar email that might be the admin
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email LIKE '%admin%bonairemakelaars%') 
    INTO user_exists;
    
    IF user_exists THEN
      RAISE NOTICE 'Found similar admin email, updating it';
      
      -- Update to correct email
      UPDATE auth.users 
      SET email = 's.admin@bonairemakelaars.com' 
      WHERE email LIKE '%admin%bonairemakelaars%';
      
      -- Reset password
      UPDATE auth.users 
      SET 
        encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
      WHERE email = 's.admin@bonairemakelaars.com';
      
      RAISE NOTICE 'Updated admin email and reset password';
    ELSE
      RAISE NOTICE 'No admin user found, need to create one';
      
      -- Create new admin user
      INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        updated_at,
        created_at
      ) VALUES (
        gen_random_uuid(),
        's.admin@bonairemakelaars.com',
        crypt('SuperSecure2025!', gen_salt('bf')),
        now(),
        'authenticated',
        now(),
        now()
      );
      
      RAISE NOTICE 'Created new admin user';
    END IF;
  END IF;
END $$;
