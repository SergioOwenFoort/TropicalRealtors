-- Create public storage buckets for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- Configure file size limits and allowed MIME types for the bucket
update storage.buckets
set file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
where id = 'images';

-- Set up access policies for the images bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'images' );

create policy "Owner can update their own images"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'images' AND auth.uid() = owner );

create policy "Owner can delete their own images"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'images' AND auth.uid() = owner );

-- Create a subdirectory specifically for realtor images
insert into storage.objects (bucket_id, name, owner, metadata)
values ('images', 'realtor-images/.gitkeep', auth.uid(), '{"contentType": "text/plain"}');
