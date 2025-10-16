-- Add phone_number column to vacation_properties table
-- Date: October 16, 2025

-- Add phone_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_properties' 
        AND column_name = 'phone_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.vacation_properties 
        ADD COLUMN phone_number TEXT;
        
        RAISE NOTICE '✅ Successfully added phone_number column to vacation_properties table';
    ELSE
        RAISE NOTICE '⚠️  phone_number column already exists in vacation_properties table';
    END IF;
END $$;

-- Verify the migration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vacation_properties' 
        AND column_name = 'phone_number'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Verification successful: phone_number column exists';
        RAISE NOTICE 'Column details:';
        RAISE NOTICE '  - Table: vacation_properties';
        RAISE NOTICE '  - Column: phone_number';
        RAISE NOTICE '  - Type: TEXT';
        RAISE NOTICE '  - Nullable: YES';
    ELSE
        RAISE EXCEPTION '❌ Verification failed: phone_number column does not exist';
    END IF;
END $$;

-- Optional: Show sample of the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vacation_properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;
