-- Fix carousel_slides table issues
-- Run this SQL in your Supabase SQL editor to fix the database issues

-- Fix the indexes that reference wrong column names
DROP INDEX IF EXISTS idx_carousel_slides_week;
DROP INDEX IF EXISTS idx_carousel_slides_island_week_year;

-- Create correct indexes for period_number
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period ON public.carousel_slides (period_number);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_island_period_year ON public.carousel_slides (island, period_number, year);

-- Make sure the table has the correct unique constraint
ALTER TABLE public.carousel_slides DROP CONSTRAINT IF EXISTS carousel_slides_island_period_number_year_display_order_key;
ALTER TABLE public.carousel_slides ADD CONSTRAINT carousel_slides_island_period_number_year_display_order_key 
  UNIQUE(island, period_number, year, display_order);

-- Also ensure created_by is set automatically for new slides
CREATE OR REPLACE FUNCTION set_carousel_slide_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_carousel_slide_created_by_trigger ON public.carousel_slides;
CREATE TRIGGER set_carousel_slide_created_by_trigger
  BEFORE INSERT ON public.carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION set_carousel_slide_created_by();
