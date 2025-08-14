-- Function to validate and repair profiles table
CREATE OR REPLACE FUNCTION public.validate_and_repair_profiles_table()
RETURNS TEXT
SECURITY DEFINER
-- Only admin users can call this function
SET search_path = public
AS $$
DECLARE
  error_message TEXT := '';
  success_message TEXT := '';
  has_errors BOOLEAN := false;
BEGIN
  -- Check if the role constraint includes 'business'
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage ccu
    JOIN pg_constraint pc ON pc.conname = ccu.constraint_name
    WHERE ccu.table_name = 'profiles' 
    AND ccu.column_name = 'role'
    AND pc.consrc LIKE '%business%'
  ) THEN
    has_errors := true;
    error_message := error_message || 'Role constraint does not include business role. ';
    
    -- Fix it
    BEGIN
      ALTER TABLE profiles
      DROP CONSTRAINT IF EXISTS profiles_role_check;

      ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));
      
      success_message := success_message || 'Fixed role constraint to include business. ';
    EXCEPTION WHEN OTHERS THEN
      error_message := error_message || 'Failed to update role constraint: ' || SQLERRM || '. ';
    END;
  ELSE
    success_message := success_message || 'Role constraint is correct. ';
  END IF;

  -- Check if the favorites column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='favorites'
  ) THEN
    has_errors := true;
    error_message := error_message || 'Favorites column does not exist. ';
    
    -- Fix it
    BEGIN
      ALTER TABLE profiles ADD COLUMN favorites UUID[] DEFAULT ARRAY[]::UUID[];
      success_message := success_message || 'Added favorites column. ';
    EXCEPTION WHEN OTHERS THEN
      error_message := error_message || 'Failed to add favorites column: ' || SQLERRM || '. ';
    END;
  ELSE
    success_message := success_message || 'Favorites column exists. ';
  END IF;

  -- Check if the business role policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Business users can read their own properties'
  ) THEN
    has_errors := true;
    error_message := error_message || 'Business role policies are missing. ';
    
    -- Fix it
    BEGIN
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
      
      success_message := success_message || 'Added business role policies. ';
    EXCEPTION WHEN OTHERS THEN
      error_message := error_message || 'Failed to create business role policies: ' || SQLERRM || '. ';
    END;
  ELSE
    success_message := success_message || 'Business role policies exist. ';
  END IF;
  
  -- Return the final status
  IF has_errors THEN
    RETURN 'Found issues: ' || error_message || 'Fixed: ' || success_message;
  ELSE
    RETURN 'No issues found. ' || success_message;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Admin-only API endpoint to validate and repair profiles table
CREATE OR REPLACE FUNCTION public.admin_validate_and_repair_profiles()
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  result TEXT;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN 'Error: Only admin users can perform this operation';
  END IF;
  
  -- Call the validation function
  SELECT public.validate_and_repair_profiles_table() INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
