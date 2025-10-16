-- Add phone_number column to properties table
-- This migration adds a phone number field to store contact information for property listings

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE properties 
        ADD COLUMN phone_number TEXT;
        
        RAISE NOTICE 'Column phone_number added successfully to properties table';
    ELSE
        RAISE NOTICE 'Column phone_number already exists in properties table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
AND column_name = 'phone_number';

-- Display table structure to confirm
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- Example query to test the new field
-- SELECT id, title, address, phone_number FROM properties LIMIT 5;
