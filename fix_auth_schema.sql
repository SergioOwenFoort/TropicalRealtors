-- SQL Script to fix auth schema issues
-- This script addresses "Database error querying schema" issues when logging in

-- First, make sure we have proper error handling
DO $$
DECLARE
  auth_schema_exists BOOLEAN;
  auth_schema_accessible BOOLEAN;
BEGIN
  -- Check if auth schema exists and is accessible
  SELECT EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
  ) INTO auth_schema_exists;
  
  IF NOT auth_schema_exists THEN
    RAISE NOTICE 'Auth schema does not exist or is not visible!';
  ELSE
    RAISE NOTICE 'Auth schema exists.';
  END IF;
  
  -- Repair common auth schema issues
  
  -- 1. Fix auth.users table ownership
  RAISE NOTICE 'Ensuring proper ownership for auth tables...';
  ALTER TABLE IF EXISTS auth.users OWNER TO supabase_auth_admin;
  ALTER TABLE IF EXISTS auth.refresh_tokens OWNER TO supabase_auth_admin;
  ALTER TABLE IF EXISTS auth.audit_log_entries OWNER TO supabase_auth_admin;
  ALTER TABLE IF EXISTS auth.instances OWNER TO supabase_auth_admin;
  ALTER TABLE IF EXISTS auth.schema_migrations OWNER TO supabase_auth_admin;
  
  -- 2. Fix auth schema search path (a common cause of "Database error querying schema")
  RAISE NOTICE 'Fixing search_path issues in auth functions...';
  
  -- Create or replace functions with explicit search_path
  BEGIN
    EXECUTE 'CREATE OR REPLACE FUNCTION auth.email_confirmed(email text)
    RETURNS boolean 
    LANGUAGE plpgsql SECURITY DEFINER 
    SET search_path = ''auth'' 
    AS $func$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE users.email = email::citext
          AND users.email_confirmed_at IS NOT NULL
      );
    END;
    $func$';
    RAISE NOTICE 'Fixed email_confirmed function.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create email_confirmed function: %', SQLERRM;
  END;

  -- 3. Grant proper permissions
  RAISE NOTICE 'Setting proper permissions on auth schema...';
  GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
  GRANT SELECT ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT ON TABLES TO postgres, service_role;
  
  -- 4. Check for and repair profiles table
  RAISE NOTICE 'Checking profiles table...';
  BEGIN
    EXECUTE 'SELECT count(*) FROM public.profiles LIMIT 1';
    RAISE NOTICE 'Profiles table exists and is accessible.';
    
    -- Make sure RLS is enabled on profiles table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create or update RLS policies for profiles
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    
    CREATE POLICY "Profiles are viewable by everyone" 
      ON public.profiles FOR SELECT 
      USING (true);
    
    CREATE POLICY "Users can insert their own profile" 
      ON public.profiles FOR INSERT 
      WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles FOR UPDATE 
      USING (auth.uid() = id);
    
    -- Grant access to profiles table
    GRANT ALL ON public.profiles TO postgres, service_role;
    GRANT SELECT ON public.profiles TO anon, authenticated;
    GRANT UPDATE, DELETE ON public.profiles TO authenticated;
    
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Profiles table does not exist.';
  END;
  
  -- 5. Fix admin user account directly
  RAISE NOTICE 'Attempting to fix admin account directly...';
  BEGIN
    -- Get the admin user id
    DECLARE
      admin_id UUID;
    BEGIN
      SELECT id INTO admin_id FROM auth.users WHERE email = 's.admin@bonairemakelaars.com';
      
      IF admin_id IS NULL THEN
        RAISE NOTICE 'Admin user not found, cannot fix.';
      ELSE
        -- Update user directly without using auth functions
        UPDATE auth.users
        SET 
          encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
          email_confirmed_at = now(),
          updated_at = now(),
          is_sso_user = FALSE,
          confirmation_token = NULL,
          recovery_token = NULL
        WHERE id = admin_id;
        
        -- Reset MFA if present
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data - 'mfa_enabled'
        WHERE id = admin_id AND raw_app_meta_data ? 'mfa_enabled';
        
        RAISE NOTICE 'Admin account reset completed.';
      END IF;
    END;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing admin account: %', SQLERRM;
  END;
  
  -- 6. Refresh materialized views if they exist (sometimes helps with auth issues)
  BEGIN
    REFRESH MATERIALIZED VIEW IF EXISTS auth.users_view;
    RAISE NOTICE 'Refreshed auth materialized views.';
  EXCEPTION WHEN undefined_object THEN
    RAISE NOTICE 'No auth materialized views to refresh.';
  END;
  
  RAISE NOTICE 'Auth schema repair completed. Try logging in again.';
END $$;
