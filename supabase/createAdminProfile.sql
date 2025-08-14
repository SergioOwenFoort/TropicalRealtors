-- Create admin profile in public schema
DO $$
DECLARE
  v_email TEXT := 's.foort@bonairemakelaars.com';
  v_user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', v_email;
  END IF;

  -- Create or update profile
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role
  ) VALUES (
    v_user_id,
    v_email,
    'Admin User',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    display_name = 'Admin User',
    role = 'admin';

  RAISE NOTICE 'Created/Updated profile for user ID: %', v_user_id;
END $$;
