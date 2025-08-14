-- Run the contents of: supabase/add_company_name_to_realtors.sql

-- Create realtors table
CREATE TABLE IF NOT EXISTS public.realtors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT NOT NULL,
  company_name TEXT NOT NULL,
  rating NUMERIC,
  languages TEXT[] DEFAULT ARRAY['Dutch', 'English']::TEXT[],
  location TEXT NOT NULL,
  island TEXT NOT NULL CHECK (island IN ('bonaire', 'aruba', 'curacao')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies for realtors table
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Anyone can read realtors
CREATE POLICY "Anyone can read realtors" 
ON public.realtors FOR SELECT USING (true);

-- Authenticated users can create realtors (for admin/realtor management)
CREATE POLICY "Authenticated users can create realtors"
ON public.realtors FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update their own realtor profile OR admins can update any
CREATE POLICY "Users can update realtors"
ON public.realtors FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'realtor')
  )
);

-- Authenticated users can delete realtors (temporary - for development)
CREATE POLICY "Authenticated users can delete realtors"
ON public.realtors FOR DELETE TO authenticated USING (true);

-- Create index on island for filtering
CREATE INDEX IF NOT EXISTS idx_realtors_island ON public.realtors (island);

-- Create index on user_id for profile management
CREATE INDEX IF NOT EXISTS idx_realtors_user_id ON public.realtors (user_id);
