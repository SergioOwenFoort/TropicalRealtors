-- Switch to the supabase_admin role which has necessary permissions
SET ROLE supabase_admin;

-- Set the correct search path
SET search_path TO auth, public;

DO $$
DECLARE
  v_email TEXT := 's.foort@tropicalrealtors.com';
  v_password TEXT := 'Admin@BonaireMakelaars2025!';
  v_user_id uuid;
  v_hash TEXT := '$2a$10$zHFcFEeGkA6TI9XtLQJ8wePUnyCU4RvRHHZMjedoz3vCTzgW03nzy';  -- Pre-generated bcrypt hash for Admin@BonaireMakelaars2025!
BEGIN
  -- Get the user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  -- Update the user with minimal required fields for authentication
  UPDATE auth.users
  SET 
    encrypted_password = v_hash,
    email_confirmed_at = now(),
    last_sign_in_at = NULL,
    raw_app_meta_data = jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']::text[],
      'email_confirmed', true
    ),
    raw_user_meta_data = jsonb_build_object(
      'is_admin', true,
      'name', 'Admin User',
      'email', v_email
    ),
    updated_at = now(),
    aud = 'authenticated',
    role = 'authenticated'
  WHERE id = v_user_id;
  -- Ensure there's exactly one identity record
  DELETE FROM auth.identities WHERE user_id::text = v_user_id::text;
  
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'provider', 'email'
    ),
    'email',
    v_email,
    now(),
    now(),
    NULL
  );

  -- Remove any MFA factors
  DELETE FROM auth.mfa_factors WHERE user_id::text = v_user_id::text;

  -- Remove any refresh tokens to force a fresh login
  DELETE FROM auth.refresh_tokens WHERE user_id::text = v_user_id::text;
  -- Ensure profile exists in public schema with required fields
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name,
    role,
    avatar_url,
    created_at, 
    updated_at
  )
  VALUES (
    v_user_id, 
    v_email, 
    'Admin User',
    'admin',
    '',
    now(), 
    now()
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    display_name = 'Admin User',
    role = 'admin',
    updated_at = now();
  -- Ensure any properties owned by this user have the correct foreign key
  UPDATE public.properties 
  SET owner_id = v_user_id::uuid
  WHERE owner_id IS NULL AND created_by::text = v_user_id::text;

  UPDATE public.properties
  SET created_by = v_user_id::uuid
  WHERE created_by = v_user_id;

  RAISE NOTICE 'Updated admin user with ID: %. Try logging in with email: % and password: %', v_user_id, v_email, v_password;
END $$;

-- Reset role to default
RESET ROLE;
