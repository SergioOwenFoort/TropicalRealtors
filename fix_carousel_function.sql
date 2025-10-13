-- Fix for the increment_carousel_click function parameter name issue
-- Run this first to handle the parameter name conflict

-- Drop the existing function completely
DROP FUNCTION IF EXISTS public.increment_carousel_click(TEXT) CASCADE;

-- Now recreate it with the correct security settings
CREATE OR REPLACE FUNCTION public.increment_carousel_click(slide_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.carousel_slides 
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    last_clicked_at = NOW()
  WHERE id = slide_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_carousel_click(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_carousel_click(TEXT) TO anon;