-- Add favorites column to profiles table
-- This will add a jsonb column to store user's favorite property IDs

-- First, add the column as jsonb (not text[])
ALTER TABLE profiles 
ADD COLUMN favorites jsonb DEFAULT '[]'::jsonb;

-- Add a comment to document what this column stores
COMMENT ON COLUMN profiles.favorites IS 'Array of property IDs that the user has favorited, stored as JSONB';

-- Optional: Add an index to improve performance when querying favorites
CREATE INDEX IF NOT EXISTS idx_profiles_favorites ON profiles USING gin(favorites);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'favorites';
