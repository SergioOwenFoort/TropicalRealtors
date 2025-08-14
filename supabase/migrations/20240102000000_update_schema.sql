-- Updated migration to match production schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and recreate with correct schema
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.realtors CASCADE;
DROP TABLE IF EXISTS public.carousel_slides CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table (production schema)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    favorites TEXT[] DEFAULT '{}'
);

-- Create carousel_slides table
CREATE TABLE public.carousel_slides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT,
    description TEXT,
    image_url TEXT,
    external_link TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create realtors table (production schema)
CREATE TABLE public.realtors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT,
    bio TEXT,
    image_url TEXT,
    company_name TEXT,
    rating DECIMAL,
    languages TEXT[],
    location TEXT,
    island TEXT,
    user_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create properties table (production schema)
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL,
    address TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_meters DECIMAL,
    property_type TEXT,
    category TEXT,
    features JSONB,
    images JSONB,
    status TEXT DEFAULT 'available',
    owner_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    date_posted TIMESTAMP WITH TIME ZONE,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (non-recursive)
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Carousel slides policies
CREATE POLICY "Carousel slides are viewable by everyone" ON public.carousel_slides
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage carousel slides" ON public.carousel_slides
    FOR ALL USING (auth.role() = 'authenticated');

-- Realtors policies
CREATE POLICY "Realtors are viewable by everyone" ON public.realtors
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage realtors" ON public.realtors
    FOR ALL USING (auth.role() = 'authenticated');

-- Properties policies
CREATE POLICY "Properties are viewable by everyone" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage properties" ON public.properties
    FOR ALL USING (auth.role() = 'authenticated');

-- Create admin user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
