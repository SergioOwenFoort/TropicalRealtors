-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'realtor', 'owner', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE,
  favorites UUID[] DEFAULT ARRAY[]::UUID[],
  UNIQUE(email)
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL NOT NULL CHECK (price >= 0),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),  square_meters DECIMAL NOT NULL CHECK (square_meters >= 0),  
  property_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'huizen' CHECK (category IN ('appartementen', 'huizen', 'vakantiewoningen', 'nieuwbouw')),
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'actief' CHECK (status IN ('actief', 'concept', 'verkocht', 'verhuurd', 'ingetrokken')),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),  
  date_posted TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add additional columns with ALTER TABLE
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add the type category with ALTER TABLE
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'huizen'
CHECK (category IN ('appartementen', 'huizen', 'vakantiewoningen', 'nieuwbouw'));

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS properties_owner_id_idx;
DROP INDEX IF EXISTS properties_city_idx;
DROP INDEX IF EXISTS properties_property_type_idx;
DROP INDEX IF EXISTS properties_category_idx;
DROP INDEX IF EXISTS properties_status_idx;
DROP INDEX IF EXISTS properties_featured_idx;
DROP INDEX IF EXISTS properties_price_idx;

-- Create indexes
CREATE INDEX properties_owner_id_idx ON properties(owner_id);
CREATE INDEX properties_city_idx ON properties(city);
CREATE INDEX properties_property_type_idx ON properties(property_type);
CREATE INDEX properties_category_idx ON properties(category);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_featured_idx ON properties(featured);
CREATE INDEX properties_price_idx ON properties(price);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Realtors can insert properties" ON properties;
DROP POLICY IF EXISTS "Realtors can update own properties" ON properties;
DROP POLICY IF EXISTS "Realtors can delete own properties" ON properties;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Realtors can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'realtor' OR role = 'admin')
    )
  );

CREATE POLICY "Realtors can update own properties"
  ON properties FOR UPDATE
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'realtor' OR role = 'admin')
    )
  );

CREATE POLICY "Realtors can delete own properties"
  ON properties FOR DELETE
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'realtor' OR role = 'admin')
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'displayName', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
