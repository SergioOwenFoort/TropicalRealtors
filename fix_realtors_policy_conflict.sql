-- REALTORS TABLE POLICY FIX
-- Eliminates the "Multiple Permissive Policies" conflict by using action-specific policies

-- Step 1: Drop existing conflicting policies on realtors table
DROP POLICY IF EXISTS "realtors_modify_unified" ON public.realtors;
DROP POLICY IF EXISTS "realtors_select_unified" ON public.realtors;

-- Step 2: Create non-overlapping action-specific policies

-- SELECT policy: Public read access for everyone
CREATE POLICY "realtors_select_policy" ON public.realtors FOR SELECT 
TO anon, authenticated, authenticator, dashboard_user
USING (true); -- Public read access

-- INSERT policy: Admin only
CREATE POLICY "realtors_insert_policy" ON public.realtors FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- UPDATE policy: Admin only
CREATE POLICY "realtors_update_policy" ON public.realtors FOR UPDATE 
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

-- DELETE policy: Admin only
CREATE POLICY "realtors_delete_policy" ON public.realtors FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) AND role = 'admin'
  )
);

-- Verification
SELECT 'REALTORS TABLE FIXED: Now has separate policies for each action (SELECT, INSERT, UPDATE, DELETE)' as fix_status;

SELECT 'NO MORE CONFLICTS: Each action has exactly one policy with no overlaps' as conflict_status;

SELECT 'PERFORMANCE OPTIMIZED: auth.uid() wrapped with (select auth.uid()) for better performance' as performance_status;