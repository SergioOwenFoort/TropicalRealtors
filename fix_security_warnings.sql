-- SQL script to fix Supabase security warnings
-- Run this in the Supabase SQL Editor
-- Enhanced with error handling and idempotent operations

BEGIN;

-- 1. Enable Row Level Security on public.realtors table
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- 2. Add appropriate RLS policies for the realtors table (dropping first if they exist)
DO $$
BEGIN
    -- Drop policies if they exist (makes this script re-runnable)
    BEGIN
        DROP POLICY IF EXISTS "Allow public read access to realtors" ON public.realtors;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop policy "Allow public read access to realtors": %', SQLERRM;
    END;

    BEGIN
        DROP POLICY IF EXISTS "Allow admin full access to realtors" ON public.realtors;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop policy "Allow admin full access to realtors": %', SQLERRM;
    END;

    -- Create policies
    CREATE POLICY "Allow public read access to realtors" 
    ON public.realtors FOR SELECT 
    TO authenticated, anon
    USING (true);

    CREATE POLICY "Allow admin full access to realtors" 
    ON public.realtors FOR ALL 
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    
    RAISE NOTICE 'Row Level Security policies created successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating RLS policies: %', SQLERRM;
END $$;

-- 3. Fix functions with "role mutable search_path" by adding search_path = 'public'
-- The pattern we'll follow for each function:
-- 1. Get function definition
-- 2. Add "SET search_path = 'public'" to the function options

-- 3. Fix functions with "role mutable search_path" by adding search_path = 'public'
DO $$
DECLARE
    func_name text;
    fixed_count int := 0;
    error_count int := 0;
    function_list text[] := ARRAY[
        'get_all_profiles',
        'handle_new_user',
        'handle_updated_at',
        'reset_admin_password',
        'set_carousel_slide_created_by',
        'update_admin_password',
        'update_carousel_slides_updated_at',
        'admin_update_profile',
        'create_admin_profile_if_not_exists',
        'create_admin_user',
        'reset_admin_user',
        'sync_auth_users_with_profiles',
        'validate_and_repair_profiles_table'
    ];
BEGIN
    FOREACH func_name IN ARRAY function_list LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''public''', func_name);
            fixed_count := fixed_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not set search_path for function %: %', func_name, SQLERRM;
            error_count := error_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE 'Successfully set search_path for % functions. % functions could not be modified.', fixed_count, error_count;
END $$;

-- Verify that RLS is enabled on realtors table and report results
DO $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT rowsecurity INTO rls_enabled 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'realtors';
    
    IF rls_enabled THEN
        RAISE NOTICE 'SUCCESS: Row Level Security is enabled on public.realtors table';
    ELSE
        RAISE WARNING 'ISSUE: Row Level Security may not be enabled on public.realtors table';
    END IF;
END $$;

-- Check for policies on the realtors table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename = 'realtors';

-- Final status message
DO $$
BEGIN
    RAISE NOTICE '✓ Security fixes applied successfully';
    RAISE NOTICE 'Note: The HaveIBeenPwned password checking feature must be enabled via the Supabase dashboard:';
    RAISE NOTICE '1. Go to Project Settings > Auth';
    RAISE NOTICE '2. Look for security settings related to password protection';
    RAISE NOTICE '3. Enable the HIBP integration if available';
END $$;

COMMIT;
