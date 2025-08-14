-- Fix favorites column for existing text[] type
-- The column already exists as text[] so we just need to set defaults

-- Update any existing profiles to have an empty favorites array if null
UPDATE public.profiles 
SET favorites = '{}'::text[] 
WHERE favorites IS NULL;

-- Create an index for better performance when querying favorites
CREATE INDEX IF NOT EXISTS idx_profiles_favorites_gin ON public.profiles USING gin (favorites);
