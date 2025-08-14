-- Simple SQL Script to fix Supabase auth issues
-- Fix "Database error querying schema" during login

-- Fix core auth functions
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role() 
RETURNS text 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::text;
$$;

CREATE OR REPLACE FUNCTION auth.email() 
RETURNS text 
LANGUAGE sql STABLE 
SET search_path = 'public' 
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$;

-- Fix auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Reset admin password directly
UPDATE auth.users 
SET 
  encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now(),
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 's.admin@bonairemakelaars.com';

-- Update or create admin profile
INSERT INTO public.profiles (id, email, role, display_name)
SELECT 
  id,
  email,
  'admin',
  'Admin User'
FROM auth.users
WHERE email = 's.admin@bonairemakelaars.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email, display_name = 'Admin User';

-- Fix RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
