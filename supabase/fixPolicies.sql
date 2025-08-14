-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;

-- Create a more permissive select policy
CREATE POLICY "Anyone can view properties"
ON public.properties
FOR SELECT
USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'properties' AND operation = 'SELECT';
