-- Convert favorites column from text[] to jsonb (simple approach)
-- Run this in Supabase SQL Editor

-- Step 1: Add the new jsonb column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorites_new JSONB DEFAULT '[]'::jsonb;

-- Step 2: Simple migration - convert text[] to jsonb
UPDATE public.profiles 
SET favorites_new = COALESCE(to_jsonb(favorites), '[]'::jsonb);

-- Step 3: Drop the old text[] column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS favorites;

-- Step 4: Rename the new column to 'favorites'
ALTER TABLE public.profiles RENAME COLUMN favorites_new TO favorites;

-- Step 5: Add comment and index
COMMENT ON COLUMN public.profiles.favorites IS 'Array of property IDs that the user has favorited (JSONB)';
CREATE INDEX IF NOT EXISTS idx_profiles_favorites_gin ON public.profiles USING gin (favorites);

-- Step 6: Check the result
SELECT id, email, favorites, 
       jsonb_array_length(favorites) as favorites_count,
       jsonb_typeof(favorites) as favorites_type
FROM public.profiles 
LIMIT 3;
