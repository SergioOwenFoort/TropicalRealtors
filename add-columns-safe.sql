-- STEP 1: Add missing columns one by one to handle any errors gracefully
-- Copy and paste each of these commands individually in your Supabase Dashboard > SQL Editor

-- Add city column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
        ALTER TABLE properties ADD COLUMN city VARCHAR(255);
        RAISE NOTICE 'Added city column';
    ELSE
        RAISE NOTICE 'City column already exists';
    END IF;
END $$;

-- Add postal_code column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'postal_code') THEN
        ALTER TABLE properties ADD COLUMN postal_code VARCHAR(20);
        RAISE NOTICE 'Added postal_code column';
    ELSE
        RAISE NOTICE 'Postal_code column already exists';
    END IF;
END $$;

-- Add square_meters column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'square_meters') THEN
        ALTER TABLE properties ADD COLUMN square_meters DECIMAL(10,2);
        RAISE NOTICE 'Added square_meters column';
    ELSE
        RAISE NOTICE 'Square_meters column already exists';
    END IF;
END $$;

-- Add created_by column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'created_by') THEN
        ALTER TABLE properties ADD COLUMN created_by UUID;
        RAISE NOTICE 'Added created_by column';
    ELSE
        RAISE NOTICE 'Created_by column already exists';
    END IF;
END $$;

-- Add owner_id column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_id') THEN
        ALTER TABLE properties ADD COLUMN owner_id UUID;
        RAISE NOTICE 'Added owner_id column';
    ELSE
        RAISE NOTICE 'Owner_id column already exists';
    END IF;
END $$;

-- Add listing_id column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'listing_id') THEN
        ALTER TABLE properties ADD COLUMN listing_id VARCHAR(50);
        RAISE NOTICE 'Added listing_id column';
    ELSE
        RAISE NOTICE 'Listing_id column already exists';
    END IF;
END $$;

-- Add category column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'category') THEN
        ALTER TABLE properties ADD COLUMN category VARCHAR(100);
        RAISE NOTICE 'Added category column';
    ELSE
        RAISE NOTICE 'Category column already exists';
    END IF;
END $$;

-- Add original_price column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'original_price') THEN
        ALTER TABLE properties ADD COLUMN original_price DECIMAL(12,2);
        RAISE NOTICE 'Added original_price column';
    ELSE
        RAISE NOTICE 'Original_price column already exists';
    END IF;
END $$;
