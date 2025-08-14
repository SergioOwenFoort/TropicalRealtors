-- STEP 2: Populate the new columns with data from existing columns
-- Run this after adding the columns

-- Copy location to city (many properties use location as city)
UPDATE properties 
SET city = location 
WHERE city IS NULL AND location IS NOT NULL;

-- Copy area_sqm to square_meters (frontend expects square_meters)
UPDATE properties 
SET square_meters = area_sqm 
WHERE square_meters IS NULL AND area_sqm IS NOT NULL;

-- Copy property_type to category (frontend expects category)
UPDATE properties 
SET category = property_type 
WHERE category IS NULL AND property_type IS NOT NULL;

-- Set original_price to current price (for price history tracking)
UPDATE properties 
SET original_price = price 
WHERE original_price IS NULL AND price IS NOT NULL;

-- Set a default owner_id (you can update this later to actual owners)
-- First, let's get the admin user ID
DO $$
DECLARE
    admin_uuid UUID;
BEGIN
    -- Get the admin user ID (the one we created earlier)
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 's.foort@bonairemakelaars.com' LIMIT 1;
    
    IF admin_uuid IS NOT NULL THEN
        UPDATE properties 
        SET created_by = admin_uuid, owner_id = admin_uuid 
        WHERE created_by IS NULL;
        
        RAISE NOTICE 'Set admin as owner for all properties: %', admin_uuid;
    ELSE
        RAISE NOTICE 'Admin user not found, skipping owner assignment';
    END IF;
END $$;

-- Generate listing_id for properties that don't have one
UPDATE properties 
SET listing_id = 'BM-' || id 
WHERE listing_id IS NULL;

-- Verify the updates
SELECT 
    COUNT(*) as total_properties,
    COUNT(city) as properties_with_city,
    COUNT(square_meters) as properties_with_square_meters,
    COUNT(category) as properties_with_category,
    COUNT(original_price) as properties_with_original_price,
    COUNT(created_by) as properties_with_created_by,
    COUNT(owner_id) as properties_with_owner_id,
    COUNT(listing_id) as properties_with_listing_id
FROM properties;
