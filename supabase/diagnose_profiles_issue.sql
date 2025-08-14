-- DIAGNOSTIC: Check current policies and table structure
-- Run this first to see what's causing the infinite recursion

-- Check if profiles table exists
SELECT 
    'profiles table exists' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
         THEN 'YES' 
         ELSE 'NO' 
    END as result;

-- Check current policies on profiles table
SELECT 
    'Current policies on profiles' as check_type,
    pol.polname as policy_name,
    pol.polcmd as command_type,
    pol.polwithcheck as with_check
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'profiles'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check profiles table structure
SELECT 
    'profiles table columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled on profiles
SELECT 
    'RLS status on profiles' as check_type,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class 
WHERE relname = 'profiles' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check for circular references in policies
SELECT 
    'Potential circular policy references' as check_type,
    pol.polname as policy_name,
    pg_get_expr(pol.polqual, pol.polrelid) as policy_expression
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'profiles'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND pg_get_expr(pol.polqual, pol.polrelid) LIKE '%profiles%';
