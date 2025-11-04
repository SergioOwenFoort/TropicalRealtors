-- Drop all existing policies on profiles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_access" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_read_all_for_chat" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
END $$;

CREATE POLICY "profiles_read_all_for_chat" 
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" 
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_own" 
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- Drop all existing policies on vacation_properties
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "vacation_properties_select_policy" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_insert_policy" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_update_policy" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_delete_policy" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_select" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_insert" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_update" ON public.vacation_properties;
    DROP POLICY IF EXISTS "vacation_properties_delete" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Allow anyone to view vacation properties" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Anon users can view vacation properties" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Authenticated users can view vacation properties" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Authenticated users can insert vacation properties" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Users can update their own vacation properties" ON public.vacation_properties;
    DROP POLICY IF EXISTS "Users can delete their own vacation properties" ON public.vacation_properties;
END $$;

CREATE POLICY "vacation_properties_select" 
    ON public.vacation_properties FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "vacation_properties_insert" 
    ON public.vacation_properties FOR INSERT TO authenticated
    WITH CHECK (horo_id = auth.uid());

CREATE POLICY "vacation_properties_update" 
    ON public.vacation_properties FOR UPDATE TO authenticated
    USING (horo_id = auth.uid()) WITH CHECK (horo_id = auth.uid());

CREATE POLICY "vacation_properties_delete" 
    ON public.vacation_properties FOR DELETE TO authenticated
    USING (horo_id = auth.uid());

-- Drop all existing policies on messages
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "messages_access" ON public.messages;
    DROP POLICY IF EXISTS "messages_unified" ON public.messages;
    DROP POLICY IF EXISTS "messages_admin_full_access" ON public.messages;
    DROP POLICY IF EXISTS "messages_user_access" ON public.messages;
    DROP POLICY IF EXISTS "messages_admin_access" ON public.messages;
    DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
END $$;

CREATE POLICY "messages_access" 
    ON public.messages FOR ALL TO authenticated
    USING (sender_id = auth.uid() OR recipient_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_country ON public.properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_date_posted ON public.properties(date_posted);
CREATE INDEX IF NOT EXISTS idx_properties_common_query ON public.properties(status, country, featured, date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_id ON public.properties(listing_id);
