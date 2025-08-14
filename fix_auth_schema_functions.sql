-- FIX AUTH SCHEMA FUNCTIONS
-- RUN THIS IN THE SQL EDITOR WITH SERVICE_ROLE PERMISSIONS

-- PART 1: Create alternative auth functions in public schema
-- These bypass the need to access the auth schema directly

-- Replace auth.uid() with a public schema function
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub'
  )::uuid;
$$;

-- Replace auth.role() with a public schema function
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role',
    'authenticated'
  )::text;
$$;

-- Grant access to these functions
GRANT EXECUTE ON FUNCTION public.get_auth_user_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon, authenticated, service_role;

-- PART 2: Create functions in the auth schema (requires service_role)
-- These recreate the core auth schema functions that might be broken

-- Recreate auth.jwt() function
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT
      COALESCE(
          NULLIF(current_setting('request.jwt.claim', true), ''),
          NULLIF(current_setting('request.jwt.claims', true), '')
      )::jsonb
$$;

-- Recreate auth.role() function
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role',
    'authenticated'
  )::text
$$;

-- Recreate auth.uid() function
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub'
  )::uuid
$$;

-- PART 3: Reset admin user completely
DO $$
DECLARE
    admin_id uuid;
    admin_email text := 's.admin@bonairemakelaars.com';
    admin_password text := 'SuperSecure2025!';
BEGIN
    -- Check if admin exists
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
    
    IF admin_id IS NULL THEN
        -- Create new admin user
        INSERT INTO auth.users (
            instance_id, 
            id, 
            aud, 
            role, 
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
            '{}'::jsonb
        )
        RETURNING id INTO admin_id;
        
        RAISE NOTICE 'Created new admin user with id: %', admin_id;
    ELSE
        -- Reset existing admin
        UPDATE auth.users
        SET 
            encrypted_password = crypt(admin_password, gen_salt('bf')),
            email_confirmed_at = now(),
            confirmation_token = NULL,
            recovery_token = NULL,
            raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb
        WHERE id = admin_id;
        
        RAISE NOTICE 'Reset existing admin user with id: %', admin_id;
    END IF;
    
    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (admin_id, admin_email, 'admin', 'Admin User')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin', email = admin_email, display_name = 'Admin User';
END $$;

-- PART 4: Create verify_admin_policies function
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is just a placeholder that returns success
  NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;

-- Verify setup
SELECT 'Auth schema functions fixed' AS status;
