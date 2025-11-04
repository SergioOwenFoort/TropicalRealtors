-- Comprehensive Security Fixes for Supabase
-- Run this script to fix all security warnings

-- ============================================
-- 1. ENABLE RLS ON ALL PUBLIC TABLES
-- ============================================

-- Enable RLS on profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on properties (if not already enabled)
ALTER TABLE IF EXISTS public.properties ENABLE ROW LEVEL SECURITY;

-- Enable RLS on vacation_properties (if not already enabled)
ALTER TABLE IF EXISTS public.vacation_properties ENABLE ROW LEVEL SECURITY;

-- Enable RLS on saved_searches (if not already enabled)
ALTER TABLE IF EXISTS public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Enable RLS on appointments (if not already enabled)
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FIX ALL FUNCTIONS WITH MUTABLE SEARCH_PATH
-- ============================================

-- Check and fix all functions with their complete signature
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments,
            p.oid as func_oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true -- SECURITY DEFINER functions
    LOOP
        -- Build complete function signature
        IF func_record.arguments = '' THEN
            func_signature := format('%I.%I()', 
                                    func_record.schema_name, 
                                    func_record.function_name);
        ELSE
            func_signature := format('%I.%I(%s)', 
                                    func_record.schema_name, 
                                    func_record.function_name,
                                    func_record.arguments);
        END IF;
        
        -- Alter function with complete signature
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', func_signature);
        
        RAISE NOTICE 'Fixed search_path for function: %', func_signature;
    END LOOP;
END $$;

-- ============================================
-- 3. ENABLE COMPROMISED PASSWORD PROTECTION
-- ============================================
-- This is configured in Supabase Dashboard:
-- Authentication > Settings > Password Protection
-- Enable "Check passwords against compromised password databases"

-- ============================================
-- 4. VERIFY SECURITY SETTINGS
-- ============================================

-- Check tables without RLS
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT tablename
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE c.relrowsecurity = true
);

-- Check functions with mutable search_path
SELECT n.nspname as schema_name, 
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as is_security_definer,
       p.proconfig as configuration
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true
AND (
    p.proconfig IS NULL 
    OR NOT EXISTS (
        SELECT 1 
        FROM unnest(p.proconfig) AS config
        WHERE config LIKE 'search_path=%'
    )
);

COMMENT ON SCHEMA public IS 'Security fixes applied: RLS enabled, search_path secured, password protection recommended';
