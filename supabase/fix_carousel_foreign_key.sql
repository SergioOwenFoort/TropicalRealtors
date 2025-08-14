-- Fix foreign key constraint to reference profiles table instead of auth.users
ALTER TABLE carousel_slides 
DROP CONSTRAINT IF EXISTS carousel_slides_created_by_fkey;

-- Add proper foreign key constraint to profiles table
ALTER TABLE carousel_slides 
ADD CONSTRAINT carousel_slides_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id);

-- Update the Supabase query to work properly
-- Test the join to make sure it works
SELECT cs.id, cs.title, cs.unique_id, p.display_name, p.email 
FROM carousel_slides cs 
LEFT JOIN profiles p ON cs.created_by = p.id 
LIMIT 5;
