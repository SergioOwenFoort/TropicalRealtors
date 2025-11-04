-- ==========================================
-- COMPREHENSIVE RLS FIX SCRIPT
-- Fixes: Performance warnings, duplicate policies, slow queries
-- ==========================================

-- ==========================================
-- PART 1: PROFILES TABLE
-- Fix duplicate policy and optimize auth calls
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_access" ON public.profiles;

-- Create optimized policies with (select auth.uid())
-- Use single unified policy to avoid multiple permissive policies
CREATE POLICY "profiles_access" 
    ON public.profiles 
    FOR ALL 
    TO authenticated
    USING (
        id = (select auth.uid()) OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = (select auth.uid()) 
            AND p.role = 'admin'
        )
    )
    WITH CHECK (
        id = (select auth.uid()) OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = (select auth.uid()) 
            AND p.role = 'admin'
        )
    );

-- ==========================================
-- PART 2: VACATION_PROPERTIES TABLE
-- Consolidate multiple permissive policies and optimize
-- ==========================================

-- Drop ALL existing policies (including duplicates)
DROP POLICY IF EXISTS "vacation_properties_select_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_insert_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_update_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_delete_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_select" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_insert" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_update" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_delete" ON public.vacation_properties;
DROP POLICY IF EXISTS "Allow anyone to view vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Allow users with valid profiles to insert vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Allow users to update their own vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Allow users to delete their own vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Anon users can view vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Authenticated users can view vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Authenticated users can insert vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Users can update their own vacation properties" ON public.vacation_properties;
DROP POLICY IF EXISTS "Users can delete their own vacation properties" ON public.vacation_properties;

-- Create single set of optimized policies
-- SELECT: Allow everyone to view properties (public listing)
CREATE POLICY "vacation_properties_select" 
    ON public.vacation_properties 
    FOR SELECT 
    TO authenticated, anon
    USING (true);

-- INSERT: Allow authenticated users to create their own properties
CREATE POLICY "vacation_properties_insert" 
    ON public.vacation_properties 
    FOR INSERT 
    TO authenticated
    WITH CHECK (horo_id = (select auth.uid()));

-- UPDATE: Allow users to update only their own properties
CREATE POLICY "vacation_properties_update" 
    ON public.vacation_properties 
    FOR UPDATE 
    TO authenticated
    USING (horo_id = (select auth.uid()));

-- DELETE: Allow users to delete only their own properties
CREATE POLICY "vacation_properties_delete" 
    ON public.vacation_properties 
    FOR DELETE 
    TO authenticated
    USING (horo_id = (select auth.uid()));

-- ==========================================
-- PART 3: MESSAGES TABLE
-- Consolidate conflicting policies and optimize
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "messages_unified" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_full_access" ON public.messages;
DROP POLICY IF EXISTS "messages_user_access" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_access" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create single unified policy combining user and admin access
CREATE POLICY "messages_access" 
    ON public.messages 
    FOR ALL 
    TO authenticated
    USING (
        sender_id = (select auth.uid()) OR 
        recipient_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        sender_id = (select auth.uid()) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    );

-- ==========================================
-- PART 4: PERFORMANCE OPTIMIZATION
-- Add indexes for slow queries on properties table
-- ==========================================

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_country ON public.properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_date_posted ON public.properties(date_posted);

-- Composite index for the most common query pattern (status + country + featured + date_posted)
CREATE INDEX IF NOT EXISTS idx_properties_common_query 
    ON public.properties(status, country, featured, date_posted DESC);

-- Indexes for owner/creator queries
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_id ON public.properties(listing_id);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Verify profiles policies
SELECT 'Profiles policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verify vacation_properties policies
SELECT 'Vacation properties policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'vacation_properties'
ORDER BY policyname;

-- Verify messages policies
SELECT 'Messages policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- Verify indexes on properties
SELECT 'Properties indexes:' as info;
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'properties'
ORDER BY indexname;

SELECT '✅ All RLS policies have been fixed and optimized!' as status;
