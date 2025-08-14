-- Complete setup for carousel_slides table
-- Run this ENTIRE SQL script in your Supabase SQL editor

-- Step 1: Create the carousel_slides table
CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  external_link TEXT,
  island TEXT NOT NULL CHECK (island IN ('bonaire', 'aruba', 'curacao')),
  period_number INTEGER CHECK (period_number >= 1 AND period_number <= 13), -- 13 periods of 4 weeks each
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  always_visible BOOLEAN DEFAULT false, -- Only admins can set this to true
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create RLS policies for carousel_slides table
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Anyone can read active carousel slides
CREATE POLICY "Anyone can read active carousel slides" 
ON public.carousel_slides FOR SELECT USING (is_active = true);

-- Authenticated users with proper roles can create slides
CREATE POLICY "Authenticated users can create carousel slides"
ON public.carousel_slides FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'realtor', 'owner', 'business')
  )
);

-- Users can update their own slides OR admins can update any
CREATE POLICY "Users can update carousel slides"
ON public.carousel_slides FOR UPDATE TO authenticated USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can delete their own slides OR admins can delete any
CREATE POLICY "Users can delete carousel slides"
ON public.carousel_slides FOR DELETE TO authenticated USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON public.carousel_slides (is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_island ON public.carousel_slides (island);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period ON public.carousel_slides (period_number);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_year ON public.carousel_slides (year);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_order ON public.carousel_slides (display_order);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_created_by ON public.carousel_slides (created_by);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_island_period_year ON public.carousel_slides (island, period_number, year);

-- Step 4: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carousel_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically update updated_at
CREATE TRIGGER update_carousel_slides_updated_at
  BEFORE UPDATE ON public.carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_carousel_slides_updated_at();

-- Step 6: Auto-set created_by field
CREATE OR REPLACE FUNCTION set_carousel_slide_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_carousel_slide_created_by_trigger
  BEFORE INSERT ON public.carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION set_carousel_slide_created_by();

-- Step 7: Add unique constraint (handling duplicates gracefully)
DO $$
BEGIN
  ALTER TABLE public.carousel_slides 
    ADD CONSTRAINT carousel_slides_island_period_number_year_display_order_key 
    UNIQUE(island, period_number, year, display_order);
EXCEPTION
  WHEN duplicate_table THEN 
    -- Constraint already exists, ignore
    NULL;
END
$$;
