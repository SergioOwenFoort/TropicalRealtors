-- Use default service_role permissions
-- No need to switch roles as we'll use the default service_role

-- Set the correct search path
SET search_path TO auth, public;

DO $$
DECLARE
  v_email TEXT := 's.foort@bonairemakelaars.com';
  v_password TEXT := 'Admin@BonaireMakelaars2025!';
  v_user_id uuid;
BEGIN
  -- Delete existing user if exists
  DELETE FROM auth.users WHERE email = v_email;
  DELETE FROM public.profiles WHERE email = v_email;
  
  -- Create new user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']::text[],
      'email_confirmed', true
    ),
    jsonb_build_object(
      'is_admin', true,
      'name', 'Admin User',
      'email', v_email
    )
  )
  RETURNING id INTO v_user_id;

  -- Create identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true
    ),
    'email',
    v_email
  );

  -- Create profile
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
  );

  RAISE NOTICE 'Created new admin user with ID: %. Try logging in with email: % and password: %', v_user_id, v_email, v_password;
END $$;

-- No need to reset role as we didn't change it
