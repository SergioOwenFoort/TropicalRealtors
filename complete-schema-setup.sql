-- COMPLETE DATABASE SCHEMA FOR BONAIRE MAKELAARS
-- Run this in Supabase Dashboard > SQL Editor to create all missing tables

-- 1. Create profiles table (referenced by auth system)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(50),
    company VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create realtors table
CREATE TABLE IF NOT EXISTS realtors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    specialization TEXT,
    languages JSONB DEFAULT '[]',
    island VARCHAR(50) DEFAULT 'bonaire',
    office_address TEXT,
    license_number VARCHAR(100),
    years_experience INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    social_media JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample realtors
INSERT INTO realtors (name, email, phone, bio, specialization, island, is_active) VALUES 
    ('Sergio Foort', 's.foort@bonairemakelaars.com', '+599 717-8888', 'Experienced real estate agent specializing in luxury properties on Bonaire.', 'Luxury Properties, Vacation Homes', 'bonaire', true),
    ('Maria Rodriguez', 'm.rodriguez@bonairemakelaars.com', '+599 717-8889', 'Local expert with deep knowledge of Bonaire neighborhoods and culture.', 'Residential, Local Properties', 'bonaire', true),
    ('John Williams', 'j.williams@bonairemakelaars.com', '+599 717-8890', 'International property specialist helping clients relocate to Bonaire.', 'International Clients, Relocation', 'bonaire', true)
ON CONFLICT (email) DO NOTHING;

-- Enable RLS for realtors
ALTER TABLE realtors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active realtors" ON realtors;
CREATE POLICY "Public can view active realtors" 
    ON realtors FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage realtors" ON realtors;
CREATE POLICY "Authenticated users can manage realtors" 
    ON realtors FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Create carousel_slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    cta_text VARCHAR(100),
    cta_link TEXT,
    island VARCHAR(50) DEFAULT 'bonaire',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample carousel slides
INSERT INTO carousel_slides (title, subtitle, description, image_url, cta_text, cta_link, island, display_order, is_active) VALUES 
    ('Welcome to Bonaire Real Estate', 'Your dream home awaits', 'Discover luxury properties in paradise with stunning ocean views and modern amenities.', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop', 'View Properties', '/properties', 'bonaire', 1, true),
    ('Luxury Villas & Vacation Homes', 'Exclusive Caribbean Properties', 'From beachfront villas to cozy apartments, find your perfect property on beautiful Bonaire.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop', 'Browse Villas', '/properties?type=villa', 'bonaire', 2, true),
    ('Investment Opportunities', 'Smart Real Estate Investments', 'Explore profitable investment properties in one of the Caribbean''s most stable real estate markets.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop', 'Learn More', '/contact', 'bonaire', 3, true);

-- Enable RLS for carousel slides
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active slides" ON carousel_slides;
CREATE POLICY "Public can view active slides" 
    ON carousel_slides FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage slides" ON carousel_slides;
CREATE POLICY "Authenticated users can manage slides" 
    ON carousel_slides FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Update properties table to match frontend expectations
-- Add missing columns that the frontend is looking for
ALTER TABLE properties ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Bonaire';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS date_posted TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing properties to have correct status values
UPDATE properties SET status = 'actief' WHERE status IN ('available', 'for_sale', 'for_rent');
UPDATE properties SET country = 'Bonaire' WHERE country IS NULL OR country = '';
UPDATE properties SET featured = is_featured WHERE featured IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_properties_country ON properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_date_posted ON properties(date_posted);

-- 5. Create additional helpful tables

-- Property categories for better organization
CREATE TABLE IF NOT EXISTS property_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO property_categories (name, description, icon, sort_order) VALUES 
    ('huizen', 'Single family houses and homes', 'home', 1),
    ('appartementen', 'Apartments and condominiums', 'building', 2),
    ('villa', 'Luxury villas and estates', 'crown', 3),
    ('commercial', 'Commercial properties', 'briefcase', 4),
    ('land', 'Land and lots', 'map', 5)
ON CONFLICT (name) DO NOTHING;

-- Property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
DROP POLICY IF EXISTS "Public can view active categories" ON property_categories;
CREATE POLICY "Public can view active categories" 
    ON property_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can submit inquiries" ON property_inquiries;
CREATE POLICY "Anyone can submit inquiries" 
    ON property_inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON property_inquiries;
CREATE POLICY "Authenticated users can view inquiries" 
    ON property_inquiries FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Create useful views for the frontend

-- Properties with full details view
CREATE OR REPLACE VIEW properties_full AS
SELECT 
    p.*,
    COALESCE(img_count.count, 0) as image_count,
    CASE WHEN img_count.count > 0 THEN true ELSE false END as has_images,
    pi.url as primary_image_url
FROM properties p
LEFT JOIN (
    SELECT property_id, COUNT(*) as count
    FROM property_images
    GROUP BY property_id
) img_count ON p.id = img_count.property_id
LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = true;

-- Grant access to views
GRANT SELECT ON properties_full TO anon, authenticated;
GRANT SELECT ON property_categories TO anon, authenticated;

-- Success message
SELECT 'Complete database schema created successfully! All tables ready.' as message;
