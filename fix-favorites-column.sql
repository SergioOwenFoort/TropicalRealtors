-- Safe approach: Drop existing favorites column and recreate it properly
-- Only run this if the column exists but is causing issues

-- First, check what exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'favorites';

-- If it exists but is wrong type, drop it
-- ALTER TABLE profiles DROP COLUMN IF EXISTS favorites;

-- Add the column properly as jsonb
-- ALTER TABLE profiles ADD COLUMN favorites jsonb DEFAULT '[]'::jsonb;

-- Add index for performance
-- CREATE INDEX IF NOT EXISTS idx_profiles_favorites ON profiles USING gin(favorites);

-- Verify it worked
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'favorites';
