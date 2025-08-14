-- Troubleshooting script for business role integration
-- This script provides detailed diagnostics about the current state of the profiles table,
-- its constraints, and any potential issues preventing the business role from working

-- First, let's check the current schema of the profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'profiles';

-- Check for all constraints on the profiles table
SELECT 
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition,
  c.contype AS constraint_type
FROM 
  pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE 
  t.relname = 'profiles' 
  AND n.nspname = 'public';

-- Check for any existing rows with role 'business'
SELECT 
  id, 
  role 
FROM 
  profiles 
WHERE 
  role = 'business';

-- Check for existing RLS policies for business role
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
WHERE 
  tablename = 'properties' 
  AND policyname LIKE '%business%';

-- Check for any existing constraints that might conflict
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM 
  information_schema.table_constraints
WHERE 
  table_name = 'profiles';

-- Try to manually add a profile with business role to test constraint
DO $$
BEGIN
  -- First, check if there's already a profile with this ID to avoid duplicates
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_business_user@example.com') THEN
    -- Create a test user in auth.users if possible (this may fail without proper permissions)
    BEGIN
      INSERT INTO auth.users (email, raw_user_meta_data)
      VALUES ('test_business_user@example.com', '{"provider": "email"}')
      RETURNING id;
      RAISE NOTICE 'Created test user in auth.users';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create auth user: %. This is normal if you don''t have admin permissions.', SQLERRM;
    END;
  END IF;
  
  -- Try to insert with a random UUID - this is just for testing the constraint
  BEGIN
    INSERT INTO profiles (id, role, email)
    VALUES (gen_random_uuid(), 'business', 'test_business_user@example.com');
    RAISE NOTICE 'Successfully inserted a test business user. Constraint is working correctly.';
    DELETE FROM profiles WHERE email = 'test_business_user@example.com';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting test business user: %. Constraint may be blocking ''business'' role.', SQLERRM;
  END;
END $$;

-- Provide a fix function that can be run with elevated permissions
CREATE OR REPLACE FUNCTION public.fix_business_role_constraint()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  constraint_name TEXT;
  result TEXT := 'No action needed.';
BEGIN
  -- Try to find the constraint name for the role column
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
  AND pg_get_constraintdef(oid) LIKE '%check%role%';
  
  IF constraint_name IS NOT NULL THEN
    -- Found a constraint, check if it has the business role
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
      AND conname = constraint_name
      AND pg_get_constraintdef(oid) LIKE '%''business''%'
    ) THEN
      result := 'Constraint already includes business role. No changes needed.';
    ELSE
      -- Drop the constraint by name if found
      EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
      
      -- Add the new constraint with business role included
      ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));
      
      result := 'Updated constraint to include business role: ' || constraint_name;
    END IF;
  ELSE
    -- No constraint found, add a new one
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));
    
    result := 'Added new constraint profiles_role_check with business role included';
  END IF;
  
  -- Also check if the favorites column exists
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='favorites'
  ) THEN
    ALTER TABLE profiles ADD COLUMN favorites UUID[] DEFAULT ARRAY[]::UUID[];
    result := result || '. Added missing favorites column.';
  END IF;
  
  RETURN result;
END;
$$;

-- Show instructions
SELECT 'INSTRUCTIONS: To fix the business role constraint, run: SELECT public.fix_business_role_constraint();';

-- Final diagnostic info
SELECT 
  current_user AS current_user,
  current_setting('role') AS current_role,
  version() AS postgres_version;
