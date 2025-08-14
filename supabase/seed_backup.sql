-- Create admin user if it doesn't exist
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 's.foort@bonairemakelaars.com'
  ) INTO admin_exists;
  IF NOT admin_exists THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      uuid_generate_v4(), -- id
      '00000000-0000-0000-0000-000000000000', -- instance_id
      's.foort@bonairemakelaars.com',
      crypt('MeissieFoort@08082013', gen_salt('bf')),
      NOW(),
      'authenticated',
      '{"isAdmin": true}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''    );

    -- Create admin profile
    INSERT INTO public.profiles (id, email, role)
    SELECT id, email, 'admin'
    FROM auth.users
    WHERE email = 's.foort@bonairemakelaars.com';
  END IF;
END $$;

-- Drop and recreate the profiles and properties tables with the correct schema
DO $$ 
BEGIN
  -- Drop existing policies first
  DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
  DROP POLICY IF EXISTS "Realtors can insert properties" ON public.properties;
  DROP POLICY IF EXISTS "Realtors can update own properties" ON public.properties;
  DROP POLICY IF EXISTS "Realtors can delete own properties" ON public.properties;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

  -- Drop tables in correct order (properties depends on profiles)
  DROP TABLE IF EXISTS public.properties;
  DROP TABLE IF EXISTS public.profiles;
  -- Create profiles table first
  CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'realtor', 'owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    favorites TEXT[] DEFAULT ARRAY[]::TEXT[]
  );

  -- Create properties table
  DROP TABLE IF EXISTS public.properties;
  CREATE TABLE public.properties (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL NOT NULL CHECK (price >= 0),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
      bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
      square_meters DECIMAL NOT NULL CHECK (square_meters >= 0),
      property_type TEXT NOT NULL CHECK (property_type IN ('koop', 'huur')),
      category TEXT NOT NULL CHECK (category IN ('appartementen', 'huizen', 'vakantiewoningen', 'nieuwbouw')),
      features TEXT[] DEFAULT ARRAY[]::TEXT[],
      images TEXT[] DEFAULT ARRAY[]::TEXT[],
      status TEXT NOT NULL DEFAULT 'actief' CHECK (status IN ('actief', 'concept', 'verkocht', 'verhuurd', 'ingetrokken')),
      owner_id UUID NOT NULL REFERENCES auth.users(id),
      created_by UUID NOT NULL REFERENCES auth.users(id),
      date_posted TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
    );
END $$;

-- Temporarily disable RLS
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

-- Clear existing data
TRUNCATE TABLE public.properties;

-- Insert sample properties
-- Get admin user ID for sample data
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 's.foort@bonairemakelaars.com' LIMIT 1;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found. Please create an admin user first.';
  END IF;

  INSERT INTO public.properties (
    title,
    description,
    price,
    address,
    city,
    country,
    postal_code,
    bedrooms,
    bathrooms,
    square_meters,
    property_type,
    category,
    features,
    images,
    status,
    owner_id,
    created_by,
    featured
  ) VALUES (
  'Luxe Villa met Zeezicht',
  'Prachtige villa met uitzicht op de Caribische Zee',
  950000,
  'Kaya Grandi 15',
  'Kralendijk',
  'Bonaire',
  '12345',
  4,
  3,
  250,
  'koop',
  'huizen',
  ARRAY['zwembad', 'terras', 'zeezicht'],
  ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200'],
  'actief',  admin_id,
  admin_id,
  true
),
(
  'Modern Appartement in Centrum',
  'Stijlvol appartement in het hart van Kralendijk',
  375000,
  'Kaya Amsterdam 22',
  'Kralendijk',
  'Bonaire',
  '12346',
  2,
  1,
  85,
  'koop',
  'appartementen',
  ARRAY['balkon', 'airco'],
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200'],
  'actief',  admin_id,  admin_id,
  true
);

END $$;

-- Re-enable RLS and set up policies for both tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for properties
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
