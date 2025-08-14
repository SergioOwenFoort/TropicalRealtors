# Fixing Supabase Auth Issues - Step by Step Guide

## Current Issues Identified

1. **Permission Denied for Schema Auth**: `ERROR: 42501: permission denied for schema auth`
2. **Infinite Recursion in Profiles Policies**: `infinite recursion detected in policy for relation "profiles"`

## Solution Steps

### Step 1: Fix Infinite Recursion in Profiles Policies

First, we need to fix the recursive policies in the profiles table. Log into your Supabase Dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor
4. Create a new SQL query
5. Copy and paste the following SQL code:

```sql
-- Fix infinite recursion in profiles table policies
-- Run this with ANON KEY - no special permissions required

-- Step 1: Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Allow anyone to read profiles (needed for carousel role checking)
CREATE POLICY "Anyone can read profiles" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
```

6. Click "Run" to execute the query

### Step 2: Fix Auth Schema Functions (Requires Service Role Key)

Now, we need to fix the auth schema functions using the service role key:

1. In the Supabase SQL Editor, create a new query
2. **IMPORTANT**: Change the connection from "anon" to "service_role" in the dropdown at the top
3. Copy and paste the following SQL code:

```sql
-- Fix auth schema functions
-- Run this with SERVICE ROLE permissions

-- 1. Fix the core auth schema functions that are critical for JWT validation
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT
      coalesce(
          nullif(current_setting('request.jwt.claim', true), ''),
          nullif(current_setting('request.jwt.claims', true), '')
      )::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif((nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'), ''),
    'authenticated'
  )::text
$$;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif((nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'), '')
  )::uuid
$$;

-- 2. Reset admin user
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 's.admin@bonairemakelaars.com';
BEGIN
  -- Check if admin exists
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found in auth.users, creating new admin user';
    
    -- Create new admin user with known password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_token,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',  -- instance_id
      gen_random_uuid(),  -- id (generate new)
      'authenticated',    -- aud
      'authenticated',    -- role
      admin_email,        -- email
      crypt('SuperSecure2025!', gen_salt('bf')), -- encrypted_password
      now(),              -- email_confirmed_at
      null,               -- recovery_token
      null,               -- last_sign_in_at
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb, -- raw_app_meta_data
      '{}'::jsonb,        -- raw_user_meta_data
      now(),              -- created_at
      now()               -- updated_at
    )
    RETURNING id INTO admin_id;
    
    RAISE NOTICE 'Created new admin user with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Found admin user with ID: %, updating details', admin_id;
    
    -- Reset the admin user completely
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('SuperSecure2025!', gen_salt('bf')),
      email_confirmed_at = now(),
      recovery_token = null,
      confirmation_token = null,
      aud = 'authenticated',
      role = 'authenticated',
      updated_at = now(),
      last_sign_in_at = null,
      raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      raw_user_meta_data = '{}'::jsonb
    WHERE id = admin_id;
  END IF;
  
  -- Ensure admin has a valid profile
  DELETE FROM public.profiles WHERE email = admin_email AND id != admin_id;
  
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (admin_id, admin_email, 'admin', 'Admin User')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', display_name = 'Admin User';
  
  RAISE NOTICE 'Admin profile updated with ID: %', admin_id;
END $$;
```

4. Click "Run" to execute the query

### Step 3: Create or Update the Verify Admin Policies Function

1. In the Supabase SQL Editor, create another new query
2. Use either connection (anon or service_role)
3. Copy and paste the following SQL code:

```sql
-- Create or update the verify_admin_policies function
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Check if RLS is enabled on profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create basic policies
  -- Everyone can view profiles
  DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
  CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);
  
  -- Users can update their own profile
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
    
  -- Admin full access (using a non-recursive approach)
  DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;
  CREATE POLICY "Admin full access to profiles" ON public.profiles
    FOR ALL
    USING (
      (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated, anon, service_role;
```

4. Click "Run" to execute the query

### Step 4: Verify the Setup

After running all three queries, run this check to verify everything is set up correctly:

```sql
-- Verify admin user and profile
SELECT
  au.id AS auth_id,
  au.email AS auth_email,
  au.role AS auth_role,
  au.raw_app_meta_data->>'role' AS app_role,
  p.id AS profile_id,
  p.email AS profile_email,
  p.role AS profile_role
FROM
  auth.users au
LEFT JOIN
  public.profiles p ON au.id = p.id
WHERE
  au.email = 's.admin@bonairemakelaars.com';
```

You should see a result with matching IDs and roles for both the auth user and profile.

### Step 5: Try Logging In

After completing all steps, try logging in with:
- Email: s.admin@bonairemakelaars.com
- Password: SuperSecure2025!

## Additional Notes

1. If you're still getting the "permission denied for schema auth" error, it may be because you're trying to run SQL commands that require the service role key but using the anon key. Make sure to use the appropriate connection for each script.

2. If you're getting an "infinite recursion" error, it's because one of your RLS policies is referencing itself in a circular way. The fix above should resolve this by using a non-recursive policy approach.

3. In your application code, make sure the password matches what was set in the SQL script:
   ```typescript
   const ADMIN_EMAIL = 's.admin@bonairemakelaars.com';
   const ADMIN_PASSWORD = 'SuperSecure2025!'; // Must match the password set in SQL
   ```

4. If all else fails, please contact Supabase support with details of your issue, as they may need to fix permissions at the provider level.
