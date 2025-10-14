-- Add 'horo' role to the profiles table role constraint
-- This script updates the database to accept 'horo' as a valid role value

-- First, check if there's a constraint on the role column
-- If there is, we need to drop it and recreate it with 'horo' included

-- Drop the existing role constraint if it exists
DO $$ 
BEGIN
    -- Check if constraint exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%role%' 
        AND table_name = 'profiles'
        AND table_schema = 'public'
    ) THEN
        -- Find and drop the role constraint
        EXECUTE (
            SELECT 'ALTER TABLE public.profiles DROP CONSTRAINT ' || constraint_name
            FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%role%' 
            AND table_name = 'profiles'
            AND table_schema = 'public'
            LIMIT 1
        );
    END IF;
END $$;

-- Add the new constraint that includes 'horo'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'realtor', 'horo', 'owner', 'admin'));

-- Update any existing role constraints in other tables if they exist
-- (This is preventive in case role constraints exist elsewhere)

-- Verify the change worked
SELECT 
    constraint_name, 
    check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'profiles_role_check';

-- Show some example queries to test
-- Example 1: Create a test horo user (you can run this to test)
-- INSERT INTO public.profiles (id, email, display_name, role) 
-- VALUES (gen_random_uuid(), 'test-horo@example.com', 'Test Horo User', 'horo');

-- Example 2: Update an existing user to horo role
-- UPDATE public.profiles 
-- SET role = 'horo' 
-- WHERE email = 'some-existing-user@example.com';

COMMIT;