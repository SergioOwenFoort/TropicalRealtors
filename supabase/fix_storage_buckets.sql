-- Clean up and fix storage buckets
-- This will remove conflicting buckets and create the correct ones

-- First, remove any existing buckets that might conflict
DELETE FROM storage.buckets WHERE id IN ('carousel-images', 'images');

-- Create the correct storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('realtor-images', 'realtor-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
  ('carousel-ads', 'carousel-ads', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = EXCLUDED.public;

-- Remove any conflicting policies
DROP POLICY IF EXISTS "Anyone can view carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own carousel images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete their own images" ON storage.objects;

-- Create the correct policies
-- Realtor images policies
CREATE POLICY "Authenticated users can upload realtor images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'realtor-images');

CREATE POLICY "Public can view realtor images" ON storage.objects
FOR SELECT USING (bucket_id = 'realtor-images');

CREATE POLICY "Users can update their realtor images" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'realtor-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'realtor')))
);

CREATE POLICY "Users can delete their realtor images" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'realtor-images' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'realtor')))
);

-- Property images policies
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'property-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'realtor', 'business'))
);

CREATE POLICY "Public can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Realtors can update property images" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'property-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'realtor', 'business'))
);

CREATE POLICY "Realtors can delete property images" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'property-images' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'realtor', 'business'))
);

-- Carousel ads policies
CREATE POLICY "Admins and business can upload carousel ads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'carousel-ads' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'business'))
);

CREATE POLICY "Public can view carousel ads" ON storage.objects
FOR SELECT USING (bucket_id = 'carousel-ads');

CREATE POLICY "Admins and business can update carousel ads" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'carousel-ads' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'business'))
);

CREATE POLICY "Admins and business can delete carousel ads" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'carousel-ads' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'business'))
);
