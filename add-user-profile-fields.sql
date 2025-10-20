-- Add address, phone_number, and country columns to user_profiles table
-- Run this in your Supabase SQL Editor

-- Check if columns already exist before adding them
DO $$ 
BEGIN
    -- Add address column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN address TEXT;
        
        RAISE NOTICE 'Column "address" added to user_profiles table';
    ELSE
        RAISE NOTICE 'Column "address" already exists in user_profiles table';
    END IF;

    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN phone_number TEXT;
        
        RAISE NOTICE 'Column "phone_number" added to user_profiles table';
    ELSE
        RAISE NOTICE 'Column "phone_number" already exists in user_profiles table';
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN country TEXT;
        
        RAISE NOTICE 'Column "country" added to user_profiles table';
    ELSE
        RAISE NOTICE 'Column "country" already exists in user_profiles table';
    END IF;
END $$;

-- Add comments to document the new columns
COMMENT ON COLUMN public.user_profiles.address IS 'User''s street address';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User''s phone number';
COMMENT ON COLUMN public.user_profiles.country IS 'User''s country of residence';

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
    AND column_name IN ('address', 'phone_number', 'country')
ORDER BY column_name;
