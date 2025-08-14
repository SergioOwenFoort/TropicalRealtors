-- Switch to the supabase_admin role which has necessary permissions
SET ROLE supabase_admin;

-- Verify and fix auth schema ownership
ALTER SCHEMA auth OWNER TO supabase_auth_admin;

-- Verify and fix auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, authenticated, service_role;

-- Ensure the auth.users table has correct permissions
GRANT SELECT, INSERT, UPDATE ON auth.users TO postgres, authenticated, service_role;
GRANT SELECT ON auth.users TO anon;

-- Fix auth schema search path
ALTER ROLE authenticator SET search_path TO auth, public;
ALTER ROLE anon SET search_path TO auth, public;
ALTER ROLE authenticated SET search_path TO auth, public;

-- Verify and fix auth.users table ownership
ALTER TABLE IF EXISTS auth.users OWNER TO supabase_auth_admin;

-- Verify and fix auth.identities table
ALTER TABLE IF EXISTS auth.identities OWNER TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.identities TO authenticated, service_role;

-- Verify and fix auth.instances table
ALTER TABLE IF EXISTS auth.instances OWNER TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.instances TO service_role;

-- Verify and fix auth.refresh_tokens table
ALTER TABLE IF EXISTS auth.refresh_tokens OWNER TO supabase_auth_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens TO authenticated, service_role;

-- Reset role to default
RESET ROLE;

-- Verify the auth schema setup
DO $$
BEGIN
  -- Check if we can query auth.users
  PERFORM COUNT(*) FROM auth.users;
  RAISE NOTICE 'Auth schema verification successful';
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Auth schema verification failed: %', SQLERRM;
END $$;
