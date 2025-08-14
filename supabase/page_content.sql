-- Create table for page content management
CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each page path and content key combination must be unique
  UNIQUE (page_path, content_key)
);

-- Add RLS policies for page_content
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Allow admins to do anything with page_content
DO $$
BEGIN
  -- Check if policy exists first
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies 
    WHERE tablename = 'page_content' 
    AND policyname = 'Admins can do anything with page content'
  ) THEN
    CREATE POLICY "Admins can do anything with page content"
    ON public.page_content
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
  END IF;
END
$$;
