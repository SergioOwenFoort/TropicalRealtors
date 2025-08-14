-- Add company_name column to realtors table
-- This migration handles adding the company_name field to existing installations

-- Add the company_name column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'realtors' 
        AND column_name = 'company_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.realtors ADD COLUMN company_name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Remove the default value after adding the column
ALTER TABLE public.realtors ALTER COLUMN company_name DROP DEFAULT;
