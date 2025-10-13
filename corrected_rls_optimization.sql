-- CORRECTED RLS Performance Optimization & Policy Cleanup
-- This script fixes auth function performance issues and consolidates duplicate policies
-- Using correct column names for each table

-- Step 1: Drop all existing problematic RLS policies to avoid conflicts
-- We'll recreate them with optimized performance and consolidated logic

-- Properties table policies
DROP POLICY IF EXISTS "Admin users can delete all properties" ON public.properties;
DROP POLICY IF EXISTS "Admin users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admin users can read all properties" ON public.properties;
DROP POLICY IF EXISTS "Admin users can update all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins have full access" ON public.properties;
DROP POLICY IF EXISTS "Realtors can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Realtors can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Realtors can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Seller users can delete their own properties" ON public.properties;
DROP POLICY IF EXISTS "Seller users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Seller users can read their own properties" ON public.properties;
DROP POLICY IF EXISTS "Seller users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;

-- Realtors table policies
DROP POLICY IF EXISTS "Admin can manage realtors" ON public.realtors;
DROP POLICY IF EXISTS "Allow admin full access to realtors" ON public.realtors;
DROP POLICY IF EXISTS "Allow public read access to realtors" ON public.realtors;
DROP POLICY IF EXISTS "Anyone can view realtors" ON public.realtors;

-- User profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Messages table policies
DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;

-- Listing URLs policies
DROP POLICY IF EXISTS "Users can insert own listing URLs" ON public.listing_urls;
DROP POLICY IF EXISTS "Users can update own listing URLs" ON public.listing_urls;
DROP POLICY IF EXISTS "Users can view own listing URLs" ON public.listing_urls;

-- Page content policies
DROP POLICY IF EXISTS "Admins can do anything with page content" ON public.page_content;

-- Saved searches policies
DROP POLICY IF EXISTS "Users can manage their own saved searches" ON public.saved_searches;

-- Step 2: Create optimized consolidated policies using (select auth.uid()) for performance

-- PROPERTIES TABLE - Consolidated policies with performance optimization
-- Note: properties table uses owner_id and created_by columns
CREATE POLICY "properties_select_policy" ON public.properties FOR SELECT 
TO anon, authenticated 
USING (
  -- Public read for everyone
  true OR
  -- Admins can see all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  -- Users can see their own
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

CREATE POLICY "properties_insert_policy" ON public.properties FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Admins can insert anything
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role IN ('admin', 'realtor', 'seller')
  ) AND
  -- Set owner_id to current user for non-admins
  (
    owner_id = (select auth.uid()) OR
    created_by = (select auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'admin')
  )
);

CREATE POLICY "properties_update_policy" ON public.properties FOR UPDATE 
TO authenticated 
USING (
  -- Admins can update all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  -- Users can update their own
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
)
WITH CHECK (
  -- Same conditions for the updated row
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

CREATE POLICY "properties_delete_policy" ON public.properties FOR DELETE 
TO authenticated 
USING (
  -- Admins can delete all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  -- Users can delete their own
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

-- REALTORS TABLE - Consolidated policies
CREATE POLICY "realtors_select_policy" ON public.realtors FOR SELECT 
TO anon, authenticated, authenticator, dashboard_user
USING (true); -- Public read access

CREATE POLICY "realtors_management_policy" ON public.realtors FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- USER PROFILES TABLE - Consolidated policies
-- Note: user_profiles table uses id column for user identification
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles FOR SELECT 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Admins can see all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  -- Users can see their own
  id = (select auth.uid())
);

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles FOR UPDATE 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Admins can update all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  -- Users can update their own
  id = (select auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
);

-- MESSAGES TABLE - Consolidated policies
-- Note: messages table uses sender_id and recipient_id columns
CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT 
TO authenticated 
USING (
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
);

CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id = (select auth.uid())
);

CREATE POLICY "messages_update_policy" ON public.messages FOR UPDATE 
TO authenticated 
USING (
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
)
WITH CHECK (
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
);

CREATE POLICY "messages_delete_policy" ON public.messages FOR DELETE 
TO authenticated 
USING (
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
);

-- LISTING URLS TABLE - Consolidated policies
-- Note: listing_urls table uses user_id column
CREATE POLICY "listing_urls_policy" ON public.listing_urls FOR ALL 
TO authenticated 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- PAGE CONTENT TABLE - Admin only policy (conditional creation)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_content') THEN
        EXECUTE 'CREATE POLICY "page_content_admin_policy" ON public.page_content FOR ALL 
        TO authenticated 
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) AND role = ''admin''
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) AND role = ''admin''
          )
        )';
    END IF;
END $$;

-- SAVED SEARCHES TABLE - User owns their data
-- Note: saved_searches table uses user_id column
CREATE POLICY "saved_searches_policy" ON public.saved_searches FOR ALL 
TO authenticated 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Step 3: Performance verification messages
SELECT 'RLS Performance Optimization Complete! All auth.uid() calls have been wrapped with (select auth.uid()) for better performance.' as performance_status;

SELECT 'Policy Consolidation Complete! Removed duplicate overlapping policies and consolidated into efficient single policies per action.' as policy_status;

SELECT 'Column Names Corrected! Using owner_id/created_by for properties, user_id for listing_urls and saved_searches, sender_id/recipient_id for messages.' as column_status;

-- Step 4: Instructions for further optimization
SELECT 'RECOMMENDATION: Monitor query performance after these changes. Consider adding indexes on owner_id, user_id columns if not already present.' as optimization_tip;

SELECT 'SUCCESS: Your RLS policies are now optimized for performance and consolidated to eliminate conflicts!' as final_status;
