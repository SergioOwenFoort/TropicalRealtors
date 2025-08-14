-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'carousel-images',
  'carousel-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for carousel images bucket
CREATE POLICY "Anyone can view carousel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated users can upload carousel images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'carousel-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'realtor', 'owner')
  )
);

CREATE POLICY "Users can update their own carousel images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'carousel-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Users can delete their own carousel images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'carousel-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);
