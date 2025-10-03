-- Get admin user ID
SELECT id, email 
FROM auth.users 
WHERE email = 's.foort@tropicalrealtors.com';

-- Check if properties were actually inserted
SELECT COUNT(*) FROM public.properties;

-- Verify RLS policies are correct
SELECT * FROM pg_policies WHERE tablename = 'properties';

-- Add missing RLS policy for admin access if needed
DROP POLICY IF EXISTS "Admins can do anything" ON public.properties;

CREATE POLICY "Admins can do anything" 
ON public.properties 
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
