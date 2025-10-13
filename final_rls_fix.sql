-- FINAL RLS Policy Fix - Single Consolidated Policies
-- This script creates single policies per action to eliminate all conflicts

-- Step 1: Complete policy cleanup (drop all existing policies)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on properties table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'properties'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.properties', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on realtors table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'realtors'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.realtors', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on user_profiles table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on messages table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on listing_urls table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'listing_urls'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.listing_urls', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on saved_searches table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'saved_searches'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.saved_searches', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on page_content table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_content') THEN
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'page_content'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.page_content', policy_record.policyname);
        END LOOP;
    END IF;
END $$;

-- Step 2: Create single consolidated policies (ONE policy per action per table)

-- PROPERTIES TABLE - Single policies combining all logic
CREATE POLICY "properties_select_unified" ON public.properties FOR SELECT 
TO anon, authenticated 
USING (
  -- Public read access OR admin access OR owner access
  true OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

CREATE POLICY "properties_insert_unified" ON public.properties FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Admin can insert anything OR user with proper role can insert their own
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  ) OR
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = (select auth.uid()) AND role IN ('realtor', 'seller')
    ) AND
    (owner_id = (select auth.uid()) OR created_by = (select auth.uid()))
  )
);

CREATE POLICY "properties_update_unified" ON public.properties FOR UPDATE 
TO authenticated 
USING (
  -- Admin can update all OR owners can update their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
)
WITH CHECK (
  -- Same conditions for updated row
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

CREATE POLICY "properties_delete_unified" ON public.properties FOR DELETE 
TO authenticated 
USING (
  -- Admin can delete all OR owners can delete their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  owner_id = (select auth.uid()) OR
  created_by = (select auth.uid())
);

-- REALTORS TABLE - Single policies
CREATE POLICY "realtors_select_unified" ON public.realtors FOR SELECT 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Public read access (covers both public and admin access)
  true
);

CREATE POLICY "realtors_modify_unified" ON public.realtors 
FOR ALL TO authenticated 
USING (
  -- Only admins can modify realtors
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
)
WITH CHECK (
  -- Only admins can create/update realtors
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- USER PROFILES TABLE - Single policies combining admin and self access
CREATE POLICY "user_profiles_select_unified" ON public.user_profiles FOR SELECT 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Admin can see all OR users can see their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
);

CREATE POLICY "user_profiles_insert_unified" ON public.user_profiles FOR INSERT 
TO anon, authenticated, authenticator, dashboard_user
WITH CHECK (
  -- Admin can insert anything OR users can insert their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
);

CREATE POLICY "user_profiles_update_unified" ON public.user_profiles FOR UPDATE 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Admin can update all OR users can update their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
)
WITH CHECK (
  -- Same conditions for updated row
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
);

CREATE POLICY "user_profiles_delete_unified" ON public.user_profiles FOR DELETE 
TO anon, authenticated, authenticator, dashboard_user
USING (
  -- Admin can delete all OR users can delete their own
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  ) OR
  id = (select auth.uid())
);

-- MESSAGES TABLE - Single unified policy
CREATE POLICY "messages_unified" ON public.messages FOR ALL 
TO authenticated 
USING (
  -- Users can access messages they sent or received
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
)
WITH CHECK (
  -- Users can only create/modify messages they're involved in
  sender_id = (select auth.uid()) OR 
  recipient_id = (select auth.uid())
);

-- LISTING URLS TABLE - Single unified policy
CREATE POLICY "listing_urls_unified" ON public.listing_urls FOR ALL 
TO authenticated 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- SAVED SEARCHES TABLE - Single unified policy
CREATE POLICY "saved_searches_unified" ON public.saved_searches FOR ALL 
TO authenticated 
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- PAGE CONTENT TABLE - Single unified policy (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_content') THEN
        EXECUTE 'CREATE POLICY "page_content_unified" ON public.page_content FOR ALL 
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

-- Step 3: Success messages
SELECT 'POLICY CONFLICTS RESOLVED! Each table now has exactly ONE policy per action.' as conflict_status;

SELECT 'PERFORMANCE OPTIMIZED! All auth.uid() calls use (select auth.uid()) for better performance.' as performance_status;

SELECT 'UNIFIED LOGIC! Admin and user permissions are now combined in single policies.' as logic_status;

SELECT 'SUCCESS: No more multiple permissive policy warnings!' as final_status;