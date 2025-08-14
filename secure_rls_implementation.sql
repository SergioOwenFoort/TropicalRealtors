-- Secure RLS Implementation Script (Run AFTER fixing login)
-- This script implements a more secure RLS setup while avoiding auth schema access

-- 1. First verify our helper functions exist
SELECT 
  proname as function_name, 
  prorettype::regtype as return_type
FROM pg_proc 
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
WHERE nspname = 'public' AND proname IN ('get_current_user_id', 'is_admin');

-- 2. Update helper functions to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_id() 
RETURNS uuid 
LANGUAGE sql STABLE 
AS $$
  -- Try to get from JWT claims safely
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_email() 
RETURNS text 
LANGUAGE sql STABLE 
AS $$
  -- Get email from JWT claims
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'email', '')::text;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role() 
RETURNS text 
LANGUAGE sql STABLE 
AS $$
  -- Try first from JWT claims
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->>'role', ''),
    -- If not in JWT, try to get from profiles table
    (SELECT role FROM public.profiles WHERE id = public.get_current_user_id()),
    -- Default role
    'authenticated'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE sql STABLE 
AS $$
  -- Check if user is admin in profiles table
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = public.get_current_user_id() AND role = 'admin'
  );
$$;

-- 3. Now implement secure policies using our helper functions

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (public.get_current_user_id() = id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (public.get_current_user_id() = id);

-- Admin can do anything
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Admin full access" ON public.profiles
  USING (public.is_admin());

-- 4. Secure the realtors table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'realtors'
  ) THEN
    -- Apply RLS
    ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
    
    -- Everyone can view realtors
    DROP POLICY IF EXISTS "Anyone can view realtors" ON public.realtors;
    CREATE POLICY "Anyone can view realtors" ON public.realtors
      FOR SELECT USING (true);
    
    -- Only admins can modify realtors
    DROP POLICY IF EXISTS "Admin can manage realtors" ON public.realtors;
    CREATE POLICY "Admin can manage realtors" ON public.realtors
      FOR ALL USING (public.is_admin());
      
    RAISE NOTICE 'Applied secure policies to realtors table';
  ELSE
    RAISE NOTICE 'Realtors table not found, skipping';
  END IF;
END $$;

-- 5. Grant appropriate permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE, DELETE ON public.profiles TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_current_user_id TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_email TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon, authenticated;

-- 6. Verify admin profile exists and has proper role
SELECT id, email, role, display_name 
FROM public.profiles 
WHERE email = 's.admin@bonairemakelaars.com';

-- 7. Instructions for further securing your application
/*
NEXT STEPS FOR SECURE IMPLEMENTATION:

1. In your application code, modify admin operations to use the service role key
2. Create a separate admin API that uses the service role key for operations
3. Implement proper authentication checks in your frontend

Example backend code:

```javascript
// Regular client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for administrative operations
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

// Use adminClient for operations that need auth schema access
async function adminOperation(userId) {
  // First verify the requesting user is actually an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  
  // Then perform the admin operation with service role
  return await adminClient.from('realtors').select('*');
}
```
*/
