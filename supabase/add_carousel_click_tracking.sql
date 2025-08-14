-- Add click tracking to carousel_slides table
ALTER TABLE carousel_slides 
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_carousel_slides_click_count ON carousel_slides(click_count DESC);

-- Update existing slides to have 0 click count
UPDATE carousel_slides SET click_count = 0 WHERE click_count IS NULL;

-- Create a function to increment click count
CREATE OR REPLACE FUNCTION increment_carousel_click(slide_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE carousel_slides 
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    last_clicked_at = NOW()
  WHERE id = slide_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_carousel_click(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_carousel_click(TEXT) TO anon;
