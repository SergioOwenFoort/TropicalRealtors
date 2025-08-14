-- Simple fix for storage buckets - handle existing policies properly
-- This avoids both foreign key constraint errors and duplicate policy errors

-- Remove any conflicting policies that might be blocking uploads
DROP POLICY IF EXISTS "Anyone can view carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete their own images" ON storage.objects;

-- Also remove the policies we're about to create (in case they exist)
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view realtor images" ON storage.objects;  
DROP POLICY IF EXISTS "Authenticated users can upload realtor images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view carousel ads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload carousel ads" ON storage.objects;

-- Create only the NEW storage buckets (don't modify existing ones)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('realtor-images', 'realtor-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('carousel-ads', 'carousel-ads', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create simple policies for the EXISTING 'images' bucket (don't modify the bucket itself)
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload to images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

-- Create policies for NEW buckets
-- Policies for realtor-images bucket
CREATE POLICY "Public can view realtor images" ON storage.objects
FOR SELECT USING (bucket_id = 'realtor-images');

CREATE POLICY "Authenticated users can upload realtor images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'realtor-images');

-- Policies for property-images bucket  
CREATE POLICY "Public can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

-- Policies for carousel-ads bucket
CREATE POLICY "Public can view carousel ads" ON storage.objects
FOR SELECT USING (bucket_id = 'carousel-ads');

CREATE POLICY "Authenticated users can upload carousel ads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'carousel-ads');
