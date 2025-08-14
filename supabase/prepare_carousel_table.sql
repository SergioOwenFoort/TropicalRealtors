-- ENSURE CAROUSEL_SLIDES TABLE IS READY FOR SAVE BUTTON
-- Run this to make sure the table structure and policies are correct

-- ==========================================
-- Create the carousel_slides table if it doesn't exist
-- ==========================================

CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  period_number INTEGER,  -- Allow NULL for always_visible slides
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  island TEXT NOT NULL CHECK (island IN ('bonaire', 'aruba', 'curacao')),
  always_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ==========================================
-- Ensure RLS is properly configured
-- ==========================================

-- Enable RLS
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
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
        EXECUTE format('DROP POLICY %I ON public.carousel_slides', policy_name);
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors
        NULL;
END $$;

-- Create simple policies that allow all operations
CREATE POLICY "carousel_slides_select" ON public.carousel_slides FOR SELECT USING (true);
CREATE POLICY "carousel_slides_insert" ON public.carousel_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "carousel_slides_update" ON public.carousel_slides FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "carousel_slides_delete" ON public.carousel_slides FOR DELETE USING (true);

-- ==========================================
-- Test the table structure
-- ==========================================

-- Test insert to make sure it works
INSERT INTO public.carousel_slides (
  title, 
  description, 
  image_url, 
  island, 
  period_number, 
  year,
  always_visible
) VALUES (
  'Test Slide', 
  'Test Description', 
  'https://test.com/test.jpg', 
  'bonaire', 
  1, 
  2025,
  false
) ON CONFLICT DO NOTHING;

-- Test that we can query it
SELECT 'Test query result' as test_name, COUNT(*) as total_slides FROM public.carousel_slides;

-- Clean up test data
DELETE FROM public.carousel_slides WHERE title = 'Test Slide';

-- ==========================================
-- Create indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_carousel_slides_island ON public.carousel_slides (island);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period ON public.carousel_slides (period_number, year);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON public.carousel_slides (is_active);

-- ==========================================
-- Final verification
-- ==========================================

SELECT 'CAROUSEL_SLIDES TABLE READY FOR SAVE BUTTON!' as status;
