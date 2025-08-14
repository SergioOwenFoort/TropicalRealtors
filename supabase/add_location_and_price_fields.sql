-- Migration script to add new fields to the properties table
-- Run this script on your Supabase database to add the new fields

-- Add latitude and longitude columns for Google Maps integration
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add original_price column for price comparison feature
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2);

-- Add comments for documentation
COMMENT ON COLUMN properties.latitude IS 'Latitude coordinate for property location (Google Maps integration)';
COMMENT ON COLUMN properties.longitude IS 'Longitude coordinate for property location (Google Maps integration)';
COMMENT ON COLUMN properties.original_price IS 'Original price for showing price reductions/comparisons';

-- Create index for location-based queries (useful for map searches)
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create index for price comparison queries
CREATE INDEX IF NOT EXISTS idx_properties_price_comparison ON properties(price, original_price) WHERE original_price IS NOT NULL;

-- Optional: Add check constraint to ensure original_price is higher than current price
ALTER TABLE properties 
ADD CONSTRAINT chk_original_price_higher 
CHECK (original_price IS NULL OR original_price > price);

-- Update existing rows to have default values (optional)
-- UPDATE properties SET latitude = NULL, longitude = NULL, original_price = NULL WHERE latitude IS NULL;

-- Grant necessary permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE ON properties TO authenticated;

-- Example of updating RLS policies to include new fields (uncomment if needed)
-- DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
-- CREATE POLICY "Properties are viewable by everyone" 
-- ON properties FOR SELECT 
-- USING (true);

-- DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
-- CREATE POLICY "Users can insert their own properties" 
-- ON properties FOR INSERT 
-- WITH CHECK (auth.uid() = makelaar_id);

-- DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
-- CREATE POLICY "Users can update their own properties" 
-- ON properties FOR UPDATE 
-- USING (auth.uid() = makelaar_id);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('latitude', 'longitude', 'original_price')
ORDER BY ordinal_position;
