-- Fix RLS policies for vacation_properties table
-- The issue: INSERT policy requires auth.uid() = horo_id, but needs to allow authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "vacation_properties_select_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_insert_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_update_policy" ON public.vacation_properties;
DROP POLICY IF EXISTS "vacation_properties_delete_policy" ON public.vacation_properties;

-- Create new policies

-- Allow everyone to view vacation properties
CREATE POLICY "vacation_properties_select_policy" ON public.vacation_properties 
    FOR SELECT USING (true);

-- Allow authenticated users to insert vacation properties with their own horo_id
CREATE POLICY "vacation_properties_insert_policy" ON public.vacation_properties 
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = horo_id
    );

-- Allow users to update their own vacation properties
CREATE POLICY "vacation_properties_update_policy" ON public.vacation_properties 
    FOR UPDATE 
    USING (auth.uid() = horo_id)
    WITH CHECK (auth.uid() = horo_id);

-- Allow users to delete their own vacation properties
CREATE POLICY "vacation_properties_delete_policy" ON public.vacation_properties 
    FOR DELETE 
    USING (auth.uid() = horo_id);

-- Verify policies
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'vacation_properties'
ORDER BY policyname;
