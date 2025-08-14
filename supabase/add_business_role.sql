-- -----------------------------------------------------------------------------
-- ADD BUSINESS ROLE SCRIPT
-- -----------------------------------------------------------------------------
-- This script adds the 'business' role to the profiles table constraint and
-- creates the necessary RLS policies for business users.
--
-- USAGE:
-- 1. Open SQL Editor in Supabase or a PostgreSQL client
-- 2. Run this entire script
-- 3. Check the output for any errors or notices
--
-- If you get a 500 server error after running the script, try running the
-- troubleshoot_business_role.sql script to diagnose the issue. You can also
-- use the Database Maintenance component in the Admin Dashboard to fix issues.
--
-- For more information, see TROUBLESHOOTING.md in the project root.
-- -----------------------------------------------------------------------------

-- Add business role to allowed roles
-- First identify if we're using a check constraint by name or an inline constraint
DO $$
DECLARE
  constraint_name TEXT;
  constraint_found BOOLEAN := FALSE;
  constraint_modified BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE 'Beginning constraint update process...';
  
  -- Try to find the constraint name for the role column
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
  AND pg_get_constraintdef(oid) LIKE '%role%''user''%';
  
  IF constraint_name IS NOT NULL THEN
    -- Found a constraint
    constraint_found := TRUE;
    RAISE NOTICE 'Found constraint: %', constraint_name;
    
    -- Check if it already includes 'business'
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
      AND conname = constraint_name
      AND pg_get_constraintdef(oid) LIKE '%''business''%'
    ) THEN
      RAISE NOTICE 'Constraint already includes business role. No changes needed.';
    ELSE
      -- Drop the constraint by name if found
      RAISE NOTICE 'Dropping constraint: %', constraint_name;
      EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
      constraint_modified := TRUE;
    END IF;
  ELSE
    RAISE NOTICE 'No constraint found matching specific pattern. Trying fallback names...';
    
    -- Try to drop by common expected names as fallback
    BEGIN
      ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
      GET DIAGNOSTICS constraint_modified = ROW_COUNT;
      IF constraint_modified > 0 THEN
        RAISE NOTICE 'Dropped constraint: profiles_role_check';
        constraint_found := TRUE;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop profiles_role_check: %', SQLERRM;
    END;
    
    IF NOT constraint_found THEN
      BEGIN
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS role_check;
        GET DIAGNOSTICS constraint_modified = ROW_COUNT;
        IF constraint_modified > 0 THEN
          RAISE NOTICE 'Dropped constraint: role_check';
          constraint_found := TRUE;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop role_check: %', SQLERRM;
      END;
    END IF;
  END IF;
  
  -- Add the new constraint if an old one was dropped or none was found
  IF constraint_modified OR NOT constraint_found THEN
    RAISE NOTICE 'Adding new constraint with business role included...';
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));
    RAISE NOTICE 'New constraint added successfully.';
  END IF;
  
  -- Verify the constraint was successfully added
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND pg_get_constraintdef(oid) LIKE '%''business''%'
  ) THEN
    RAISE NOTICE 'Verification successful: business role is now allowed in the profiles table.';
  ELSE
    RAISE WARNING 'Verification failed: business role may not be allowed in the profiles table.';
  END IF;
END $$;

-- Create business role policies
-- This policy allows business users to read their own properties
DO $$
BEGIN
  RAISE NOTICE 'Setting up business role policies...';
  
  -- Check if the policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Business users can read their own properties'
  ) THEN
    -- Create the policy
    EXECUTE '
      CREATE POLICY "Business users can read their own properties" 
      ON public.properties 
      FOR SELECT 
      TO authenticated
      USING (
        (auth.uid() = owner_id) AND EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''business''
        )
      )
    ';
    RAISE NOTICE 'Created policy: Business users can read their own properties';
  ELSE
    RAISE NOTICE 'Policy already exists: Business users can read their own properties';
  END IF;
  
  -- Check if the update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Business users can update their own properties'
  ) THEN
    -- Create the update policy
    EXECUTE '
      CREATE POLICY "Business users can update their own properties" 
      ON public.properties 
      FOR UPDATE
      TO authenticated
      USING (
        (auth.uid() = owner_id) AND EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''business''
        )
      )
    ';
    RAISE NOTICE 'Created policy: Business users can update their own properties';
  ELSE
    RAISE NOTICE 'Policy already exists: Business users can update their own properties';
  END IF;
  
  -- Check if the insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Business users can insert properties'
  ) THEN
    -- Create the insert policy
    EXECUTE '
      CREATE POLICY "Business users can insert properties" 
      ON public.properties 
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''business''
        )
      )
    ';
    RAISE NOTICE 'Created policy: Business users can insert properties';
  ELSE
    RAISE NOTICE 'Policy already exists: Business users can insert properties';
  END IF;
  
  -- Check if the delete policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Business users can delete their own properties'
  ) THEN
    -- Create the delete policy
    EXECUTE '
      CREATE POLICY "Business users can delete their own properties" 
      ON public.properties 
      FOR DELETE
      TO authenticated
      USING (
        (auth.uid() = owner_id) AND EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role = ''business''
        )
      )
    ';
    RAISE NOTICE 'Created policy: Business users can delete their own properties';
  ELSE
    RAISE NOTICE 'Policy already exists: Business users can delete their own properties';
  END IF;
  
  RAISE NOTICE 'All business role policies have been set up.';
END $$;

-- Check if we need to add the favorites column
DO $$
DECLARE
  column_added BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE 'Checking for favorites column...';
  
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='favorites'
  ) THEN
    RAISE NOTICE 'favorites column does not exist. Adding it now...';
    ALTER TABLE profiles ADD COLUMN favorites UUID[] DEFAULT ARRAY[]::UUID[];
    column_added := TRUE;
    RAISE NOTICE 'favorites column added successfully.';
  ELSE
    RAISE NOTICE 'favorites column already exists. No changes needed.';
  END IF;
  
  -- Final confirmation
  IF column_added OR EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND pg_get_constraintdef(oid) LIKE '%''business''%'
  ) THEN
    RAISE NOTICE 'Script completed successfully. The business role is now supported.';
  ELSE
    RAISE WARNING 'Script completed with potential issues. Please verify manually.';
  END IF;
END $$;
