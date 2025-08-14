-- DIAGNOSTIC: Check current state of all tables and policies
-- Run this to see what might still be causing issues

-- ==========================================
-- Check profiles table
-- ==========================================
SELECT 'PROFILES TABLE STATUS' as section;

-- Check if profiles table exists and has data
SELECT 
  'profiles_table_check' as check_name,
  COUNT(*) as record_count,
  COUNT(DISTINCT role) as unique_roles
FROM public.profiles;

-- Check current policies on profiles
SELECT 
  'profiles_policies' as check_name,
  pol.polname as policy_name,
  pol.polcmd as command_type
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'profiles'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ==========================================
-- Check carousel_slides table
-- ==========================================
SELECT 'CAROUSEL_SLIDES TABLE STATUS' as section;

-- Check if carousel_slides table exists and has data
SELECT 
  'carousel_slides_table_check' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'carousel_slides' AND table_schema = 'public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as table_status,
  COALESCE((SELECT COUNT(*) FROM public.carousel_slides), 0) as record_count;

-- Check carousel_slides table structure
SELECT 
  'carousel_slides_structure' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carousel_slides' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current policies on carousel_slides
SELECT 
  'carousel_slides_policies' as check_name,
  COALESCE(pol.polname, 'NO_POLICIES') as policy_name,
  COALESCE(pol.polcmd, 'N/A') as command_type
FROM pg_class cls
LEFT JOIN pg_policy pol ON pol.polrelid = cls.oid 
WHERE cls.relname = 'carousel_slides'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ==========================================
-- Check storage buckets
-- ==========================================
SELECT 'STORAGE BUCKETS STATUS' as section;

-- Check if storage buckets exist
SELECT 
  'storage_buckets_check' as check_name,
  name as bucket_name,
  public as is_public,
  created_at
FROM storage.buckets 
WHERE name IN ('carousel-ads', 'property-images', 'realtor-images', 'images')
ORDER BY name;

-- ==========================================
-- Test queries that the app uses
-- ==========================================
SELECT 'APPLICATION QUERIES TEST' as section;

-- Test the carousel query that was in the logs
SELECT 
  'carousel_query_test' as check_name,
  COUNT(*) as matching_records
FROM public.carousel_slides 
WHERE is_active = true 
AND island = 'curacao' 
AND (always_visible = true OR period_number = 7)
AND year = 2025;

-- Check if any sample data exists
SELECT 
  'sample_data_check' as check_name,
  island,
  COUNT(*) as count_per_island
FROM public.carousel_slides
GROUP BY island
ORDER BY island;

SELECT 'DIAGNOSTIC COMPLETE' as final_status;
