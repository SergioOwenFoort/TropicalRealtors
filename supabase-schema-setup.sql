-- SUPABASE PROPERTIES TABLE SETUP
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create the properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    property_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm DECIMAL(10,2),
    lot_size_sqm DECIMAL(10,2),
    location VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    contact_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access (drop if exists first)
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON properties;
CREATE POLICY "Public properties are viewable by everyone" 
    ON properties FOR SELECT 
    USING (true);

-- 5. Create policy for authenticated users to manage properties
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON properties;
CREATE POLICY "Authenticated users can manage properties" 
    ON properties FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- 6. Create additional tables that might be needed

-- Property types table for normalization
CREATE TABLE IF NOT EXISTS property_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common property types
INSERT INTO property_types (name, description) VALUES 
    ('house', 'Single family house'),
    ('apartment', 'Apartment or condo'),
    ('villa', 'Luxury villa'),
    ('land', 'Empty land/lot'),
    ('commercial', 'Commercial property'),
    ('office', 'Office space'),
    ('warehouse', 'Warehouse or storage')
ON CONFLICT (name) DO NOTHING;

-- Property features table for normalization
CREATE TABLE IF NOT EXISTS property_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common features
INSERT INTO property_features (name, icon, category) VALUES 
    ('swimming_pool', 'pool', 'amenities'),
    ('garden', 'tree', 'outdoor'),
    ('garage', 'car', 'parking'),
    ('air_conditioning', 'ac', 'climate'),
    ('balcony', 'balcony', 'outdoor'),
    ('terrace', 'terrace', 'outdoor'),
    ('sea_view', 'water', 'views'),
    ('mountain_view', 'mountain', 'views'),
    ('furnished', 'furniture', 'interior'),
    ('security', 'shield', 'safety')
ON CONFLICT (name) DO NOTHING;

-- Property images table for better image management
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on additional tables
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Policies for additional tables
DROP POLICY IF EXISTS "Public can view property types" ON property_types;
CREATE POLICY "Public can view property types" ON property_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view property features" ON property_features;
CREATE POLICY "Public can view property features" ON property_features FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view property images" ON property_images;
CREATE POLICY "Public can view property images" ON property_images FOR SELECT USING (true);

-- Admin policies for managing data
DROP POLICY IF EXISTS "Authenticated users can manage property types" ON property_types;
CREATE POLICY "Authenticated users can manage property types" ON property_types FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage property features" ON property_features;
CREATE POLICY "Authenticated users can manage property features" ON property_features FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can manage property images" ON property_images;
CREATE POLICY "Authenticated users can manage property images" ON property_images FOR ALL USING (auth.uid() IS NOT NULL);

-- Create view for properties with image count
CREATE OR REPLACE VIEW properties_with_stats AS
SELECT 
    p.*,
    COALESCE(img_count.count, 0) as image_count,
    CASE WHEN img_count.count > 0 THEN true ELSE false END as has_images
FROM properties p
LEFT JOIN (
    SELECT property_id, COUNT(*) as count
    FROM property_images
    GROUP BY property_id
) img_count ON p.id = img_count.property_id;

-- Grant access to the view
GRANT SELECT ON properties_with_stats TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! Ready for data import.' as message;
