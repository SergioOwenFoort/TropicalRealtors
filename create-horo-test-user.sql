-- Test script to create a horo user for testing the Horo Dashboard
-- This script creates a test profile with the 'horo' role

-- First, check if the profile exists and update or create it
DO $$
BEGIN
  -- Check if profile exists for the test user
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'test.horo@example.com') THEN
    -- Update existing profile to horo role
    UPDATE profiles 
    SET role = 'horo', 
        display_name = 'Test Horo User',
        updated_at = NOW()
    WHERE email = 'test.horo@example.com';
    
    RAISE NOTICE 'Updated existing profile to horo role for test.horo@example.com';
  ELSE
    -- Create new profile (assuming the auth user exists)
    -- Note: In production, you would need to create the auth user first
    INSERT INTO profiles (id, email, role, display_name, created_at, updated_at)
    VALUES (
      gen_random_uuid(), 
      'test.horo@example.com', 
      'horo', 
      'Test Horo User',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new horo profile for test.horo@example.com';
  END IF;
END $$;

-- Verify the profile was created/updated
SELECT 
  id,
  email,
  role,
  display_name,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'test.horo@example.com';