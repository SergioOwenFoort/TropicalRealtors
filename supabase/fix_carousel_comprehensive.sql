-- COMPREHENSIVE CAROUSEL DIAGNOSIS AND FIX
-- This will check and fix all carousel-related issues

-- ==========================================
-- STEP 1: Check current table state
-- ==========================================

SELECT 'CURRENT CAROUSEL_SLIDES STATE' as section;

-- Check if table exists and basic structure
SELECT 
  'table_structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'carousel_slides' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current data
SELECT 
  'current_slides' as check_type,
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
-- STEP 2: Check and fix RLS policies
-- ==========================================

SELECT 'CHECKING RLS POLICIES' as section;

-- Check current policies
SELECT 
  'current_policies' as check_type,
  pol.polname as policy_name,
  pol.polcmd as command_type,
  pol.polpermissive as is_permissive
FROM pg_policy pol 
JOIN pg_class cls ON pol.polrelid = cls.oid 
WHERE cls.relname = 'carousel_slides'
AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Drop all existing policies to ensure clean slate
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'carousel_slides'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY %I ON public.carousel_slides', policy_name);
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors
        NULL;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies that definitely work
CREATE POLICY "carousel_public_read" 
ON public.carousel_slides FOR SELECT 
USING (true);

CREATE POLICY "carousel_auth_insert" 
ON public.carousel_slides FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "carousel_auth_update" 
ON public.carousel_slides FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "carousel_auth_delete" 
ON public.carousel_slides FOR DELETE 
TO authenticated
USING (true);

-- ==========================================
-- STEP 3: Fix data integrity issues
-- ==========================================

SELECT 'FIXING DATA INTEGRITY' as section;

-- Fix any NULL or problematic display_order values
UPDATE public.carousel_slides 
SET display_order = COALESCE(display_order, 1)
WHERE display_order IS NULL OR display_order < 1;

-- Fix any NULL island values
UPDATE public.carousel_slides 
SET island = 'bonaire'
WHERE island IS NULL;

-- Fix any NULL year values
UPDATE public.carousel_slides 
SET year = EXTRACT(YEAR FROM NOW())
WHERE year IS NULL;

-- Fix any NULL is_active values
UPDATE public.carousel_slides 
SET is_active = true
WHERE is_active IS NULL;

-- Fix any NULL always_visible values
UPDATE public.carousel_slides 
SET always_visible = false
WHERE always_visible IS NULL;

-- ==========================================
-- STEP 4: Test all operations
-- ==========================================

SELECT 'TESTING OPERATIONS' as section;

-- Test SELECT operation
SELECT 'select_test' as test_type, COUNT(*) as total_slides 
FROM public.carousel_slides;

-- Test INSERT operation (will be rolled back)
BEGIN;
INSERT INTO public.carousel_slides (
  title, 
  image_url, 
  island, 
  period_number, 
  year,
  display_order
) VALUES (
  'TEST_OPERATION', 
  'https://test.com/test.jpg', 
  'bonaire', 
  1, 
  2025,
  999
);

-- Test if the insert worked
SELECT 'insert_test' as test_type, 
       CASE WHEN EXISTS (SELECT 1 FROM public.carousel_slides WHERE title = 'TEST_OPERATION') 
            THEN 'SUCCESS' 
            ELSE 'FAILED' 
       END as result;

-- Test DELETE operation
DELETE FROM public.carousel_slides WHERE title = 'TEST_OPERATION';

-- Test if the delete worked
SELECT 'delete_test' as test_type,
       CASE WHEN NOT EXISTS (SELECT 1 FROM public.carousel_slides WHERE title = 'TEST_OPERATION') 
            THEN 'SUCCESS' 
            ELSE 'FAILED' 
       END as result;

ROLLBACK; -- Don't actually save the test data

-- ==========================================
-- STEP 5: Check storage buckets
-- ==========================================

SELECT 'STORAGE BUCKETS CHECK' as section;

-- Check if carousel-ads bucket exists
SELECT 
  'storage_buckets' as check_type,
  name as bucket_name,
  public as is_public
FROM storage.buckets 
WHERE name IN ('carousel-ads', 'images')
ORDER BY name;

-- ==========================================
-- FINAL STATUS
-- ==========================================

SELECT 'CAROUSEL DIAGNOSIS COMPLETE' as final_status,
       'All operations tested and policies reset' as message;
