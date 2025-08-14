-- COMPLETE FIX: Fix carousel_slides table and storage for save button to work
-- This ensures carousel uploads and saves work properly

-- ==========================================
-- PART 1: Ensure carousel_slides table exists with correct structure
-- ==========================================

-- Create carousel_slides table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  period_number INTEGER NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  island TEXT NOT NULL CHECK (island IN ('bonaire', 'aruba', 'curacao')),
  always_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ==========================================
-- PART 2: Fix RLS policies for carousel_slides
-- ==========================================

-- Enable RLS on carousel_slides
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might cause issues
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'carousel_slides'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.carousel_slides', policy_name);
    END LOOP;
END $$;

-- Create comprehensive policies for carousel_slides
CREATE POLICY "Anyone can read carousel slides" 
ON public.carousel_slides FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert carousel slides" 
ON public.carousel_slides FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update carousel slides" 
ON public.carousel_slides FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete carousel slides" 
ON public.carousel_slides FOR DELETE 
TO authenticated
USING (true);

-- ==========================================
-- PART 3: Create storage buckets if they don't exist
-- ==========================================

-- Create carousel-ads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-ads', 'carousel-ads', true)
ON CONFLICT (id) DO NOTHING;

-- Create images bucket (fallback)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create property-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create realtor-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('realtor-images', 'realtor-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- PART 4: Create storage policies for uploads
-- ==========================================

-- Policy for carousel-ads bucket
CREATE POLICY "Allow authenticated uploads to carousel-ads" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'carousel-ads');

CREATE POLICY "Allow public read from carousel-ads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'carousel-ads');

CREATE POLICY "Allow authenticated updates to carousel-ads" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'carousel-ads');

CREATE POLICY "Allow authenticated deletes from carousel-ads" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'carousel-ads');

-- Policy for images bucket (fallback)
CREATE POLICY "Allow authenticated uploads to images" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public read from images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- ==========================================
-- PART 5: Create helpful indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_carousel_slides_island ON public.carousel_slides (island);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period ON public.carousel_slides (period_number, year);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON public.carousel_slides (is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_display_order ON public.carousel_slides (display_order);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_created_by ON public.carousel_slides (created_by);

-- ==========================================
-- PART 6: Test the setup
-- ==========================================

-- Test carousel_slides table access
SELECT 'carousel_slides table test' as test_name, COUNT(*) as record_count 
FROM public.carousel_slides;

-- Test storage buckets
SELECT 'storage buckets test' as test_name, name as bucket_name 
FROM storage.buckets 
WHERE name IN ('carousel-ads', 'images', 'property-images', 'realtor-images')
ORDER BY name;

-- Final success message
SELECT 'SAVE BUTTON FIX COMPLETE - Carousel uploads should now work!' as status;
