-- =====================================================
-- Fix RLS Performance Issues - Optimize auth.uid() calls
-- =====================================================
-- This migration optimizes Row Level Security policies by:
-- 1. Wrapping auth.uid() in SELECT to evaluate once per query instead of per row
-- 2. Removing duplicate policies that cause conflicts
-- 3. Consolidating policies for better performance

-- =====================================================
-- 1. FIX PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- 2. FIX MESSAGES TABLE POLICIES
-- =====================================================

-- Drop duplicate policies (keeping the unified one)
DROP POLICY IF EXISTS "messages_admin_full_access" ON public.messages;

-- Recreate messages_unified with optimized auth.uid()
DROP POLICY IF EXISTS "messages_unified" ON public.messages;

CREATE POLICY "messages_unified"
ON public.messages
FOR ALL
USING (
  -- User can see messages they sent or received
  (select auth.uid()) = sender_id 
  OR (select auth.uid()) = recipient_id
  -- OR admin check if you have admin role in profiles
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  )
);

-- =====================================================
-- 3. FIX VACATION_PROPERTIES TABLE POLICIES
-- =====================================================

-- Drop old named policies (keeping the descriptive ones)
DROP POLICY IF EXISTS "vacation_properties_select_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_insert_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_update_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_delete_policy" ON public.vacation_properties;

-- Recreate with optimized auth.uid() calls and better names
CREATE POLICY "Allow anyone to view vacation properties"
ON public.vacation_properties
FOR SELECT
USING (true); -- Public read access

CREATE POLICY "Allow users with valid profiles to insert vacation properties"
ON public.vacation_properties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid())
  )
);

CREATE POLICY "Allow users to update their own vacation properties"
ON public.vacation_properties
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow users to delete their own vacation properties"
ON public.vacation_properties
FOR DELETE
USING ((select auth.uid()) = user_id);

-- =====================================================
-- 4. VERIFY NO DUPLICATE POLICIES REMAIN
-- =====================================================

-- Query to check for any remaining duplicate policies
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO duplicate_count
  FROM (
    SELECT schemaname, tablename, policyname, COUNT(*)
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, policyname, cmd, roles
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate policies. Please review pg_policies table.', duplicate_count;
  ELSE
    RAISE NOTICE 'No duplicate policies found. All policies are unique.';
  END IF;
END $$;

-- =====================================================
-- 5. PERFORMANCE VERIFICATION
-- =====================================================

COMMENT ON POLICY "Users can view their own profile" ON public.profiles 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

COMMENT ON POLICY "Users can update their own profile" ON public.profiles 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

COMMENT ON POLICY "Users can insert their own profile" ON public.profiles 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

COMMENT ON POLICY "messages_unified" ON public.messages 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance. Handles sender, recipient, and admin access.';

COMMENT ON POLICY "Allow anyone to view vacation properties" ON public.vacation_properties 
IS 'Public read access - no auth required';

COMMENT ON POLICY "Allow users with valid profiles to insert vacation properties" ON public.vacation_properties 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

COMMENT ON POLICY "Allow users to update their own vacation properties" ON public.vacation_properties 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

COMMENT ON POLICY "Allow users to delete their own vacation properties" ON public.vacation_properties 
IS 'Optimized: auth.uid() wrapped in SELECT for better performance';

-- =====================================================
-- DONE: All RLS policies optimized for performance
-- =====================================================
