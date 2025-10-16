-- Migration: Add latitude and longitude coordinates to vacation_properties table
-- Purpose: Enable map display and geocoding functionality for vacation listings
-- Date: January 2025

-- Add coordinate columns if they don't exist
ALTER TABLE vacation_properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add comments to document the columns
COMMENT ON COLUMN vacation_properties.latitude IS 'Latitude coordinate in WGS84 format (4 decimal places = ~11m accuracy)';
COMMENT ON COLUMN vacation_properties.longitude IS 'Longitude coordinate in WGS84 format (4 decimal places = ~11m accuracy)';

-- Create index for efficient geographic queries
CREATE INDEX IF NOT EXISTS idx_vacation_properties_coordinates 
ON vacation_properties(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    numeric_precision, 
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vacation_properties' 
AND column_name IN ('latitude', 'longitude');

-- Example: Update sample properties with coordinates
-- Uncomment and modify as needed for your data

/*
-- Aruba properties
UPDATE vacation_properties 
SET latitude = 12.5211, longitude = -69.9683 
WHERE city = 'Aruba' AND latitude IS NULL;

-- Bonaire properties
UPDATE vacation_properties 
SET latitude = 12.1784, longitude = -68.2385 
WHERE city = 'Bonaire' AND latitude IS NULL;

-- Curaçao properties
UPDATE vacation_properties 
SET latitude = 12.1696, longitude = -68.9900 
WHERE city = 'Curaçao' AND latitude IS NULL;

-- Sint Maarten properties
UPDATE vacation_properties 
SET latitude = 18.0708, longitude = -63.0501 
WHERE city = 'Sint Maarten' AND latitude IS NULL;

-- Saba properties
UPDATE vacation_properties 
SET latitude = 17.6350, longitude = -63.2300 
WHERE city = 'Saba' AND latitude IS NULL;

-- Sint Eustatius properties
UPDATE vacation_properties 
SET latitude = 17.4895, longitude = -62.9736 
WHERE city = 'Sint Eustatius' AND latitude IS NULL;
*/

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration completed: latitude and longitude columns added to vacation_properties table';
END $$;
