-- EMERGENCY FIX FOR INFINITE RECURSION
-- RUN THIS IN THE SQL EDITOR WITH SERVICE_ROLE PERMISSIONS

-- STEP 1: Completely disable RLS for now
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all policies on the profiles table
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'profiles'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- STEP 3: Verify RLS is disabled and all policies are dropped
DO $$
DECLARE
    rls_enabled boolean;
    policy_count integer;
BEGIN
    -- Check if RLS is enabled
    SELECT c.relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    WHERE cls.relname = 'profiles'
    AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

    -- Output results
    RAISE NOTICE 'RLS enabled: %, Policy count: %', rls_enabled, policy_count;
END $$;

-- STEP 4: Test that we can access the profiles table
SELECT COUNT(*) FROM public.profiles;
SELECT * FROM public.profiles LIMIT 5;

-- OPTIONAL STEP 5: If you need RLS, add one simple policy that allows everything
-- Uncomment the lines below if you want to re-enable RLS with a safe policy
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow everything" ON public.profiles;
-- CREATE POLICY "Allow everything" ON public.profiles FOR ALL USING (true);
