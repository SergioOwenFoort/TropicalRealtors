-- Add missing columns to properties table to match frontend expectations
-- Run this in Supabase Dashboard > SQL Editor

-- Add missing columns that the frontend expects
ALTER TABLE properties ADD COLUMN IF NOT EXISTS original_price DECIMAL(12,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS square_meters DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_id VARCHAR(50);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Copy data from existing columns to new columns where applicable
UPDATE properties SET 
    city = location,
    square_meters = area_sqm,
    category = property_type
WHERE city IS NULL OR square_meters IS NULL OR category IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_square_meters ON properties(square_meters);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- Update policies to include new columns
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON properties;
CREATE POLICY "Authenticated users can manage properties" 
    ON properties FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- Success message
SELECT 'Missing columns added successfully! Frontend should now work.' as message;
