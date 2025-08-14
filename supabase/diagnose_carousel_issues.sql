-- COMPREHENSIVE DIAGNOSTIC: Check what's wrong with carousel functionality
-- Run this to see the current state of everything

-- ==========================================
-- 1. Check carousel_slides table structure and data
-- ==========================================
SELECT 'CAROUSEL SLIDES TABLE STATUS' as section;

-- Check if table exists
SELECT 
  'table_exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'carousel_slides' AND table_schema = 'public'
  ) THEN 'YES' ELSE 'NO' END as result;

-- Check table structure
SELECT 
  'table_structure' as check_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carousel_slides' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current data
SELECT 
  'current_data' as check_name,
  id,
  title,
  island,
  period_number,
  year,
  is_active,
  display_order,
  always_visible,
  created_at
FROM public.carousel_slides
ORDER BY island, period_number, display_order;

-- ==========================================
-- 2. Check RLS policies
-- ==========================================
SELECT 'RLS POLICIES STATUS' as section;

-- Check RLS status
SELECT 
  'rls_enabled' as check_name,
  CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class 
WHERE relname = 'carousel_slides'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check current policies
SELECT 
  'current_policies' as check_name,
  pol.polname as policy_name,
  pol.polcmd as command_type,
  pol.polpermissive as is_permissive
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'carousel_slides'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ==========================================
-- 3. Test basic operations
-- ==========================================
SELECT 'OPERATION TESTS' as section;

-- Test select operation
SELECT 
  'select_test' as check_name,
  COUNT(*) as total_slides,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_slides,
  COUNT(CASE WHEN always_visible = true THEN 1 END) as always_visible_slides
FROM public.carousel_slides;

-- Test filter operations (what the app actually uses)
SELECT 
  'filter_test_curacao' as check_name,
  COUNT(*) as matching_slides
FROM public.carousel_slides 
WHERE is_active = true 
AND island = 'curacao'
AND (always_visible = true OR period_number = 7)
AND year = 2025;

-- Check for slides with display_order issues
SELECT 
  'display_order_issues' as check_name,
  COUNT(*) as slides_with_zero_order,
  MIN(display_order) as min_order,
  MAX(display_order) as max_order
FROM public.carousel_slides
WHERE display_order = 0;

-- ==========================================
-- 4. Check storage buckets
-- ==========================================
SELECT 'STORAGE STATUS' as section;

-- Check storage buckets
SELECT 
  'storage_buckets' as check_name,
  name as bucket_name,
  public as is_public,
  created_at
FROM storage.buckets 
WHERE name IN ('carousel-ads', 'images', 'property-images', 'realtor-images')
ORDER BY name;

-- ==========================================
-- 5. Check profiles table (for role checking)
-- ==========================================
SELECT 'PROFILES STATUS' as section;

-- Check profiles table policies
SELECT 
  'profiles_policies' as check_name,
  pol.polname as policy_name,
  pol.polcmd as command_type
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'profiles'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if profiles table has data
SELECT 
  'profiles_data' as check_name,
  COUNT(*) as total_profiles,
  COUNT(DISTINCT role) as unique_roles,
  string_agg(DISTINCT role, ', ') as available_roles
FROM public.profiles;

SELECT 'DIAGNOSTIC COMPLETE - CHECK RESULTS ABOVE' as final_status;
