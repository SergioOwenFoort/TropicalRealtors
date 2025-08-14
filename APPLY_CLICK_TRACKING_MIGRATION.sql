-- Migration: Add click tracking to carousel slides
-- Run this in the Supabase SQL Editor

-- Step 1: Add the click tracking columns
DO $$ 
BEGIN
    -- Add click_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' AND column_name = 'click_count'
    ) THEN
        ALTER TABLE carousel_slides ADD COLUMN click_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_clicked_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' AND column_name = 'last_clicked_at'
    ) THEN
        ALTER TABLE carousel_slides ADD COLUMN last_clicked_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 2: Update existing slides to have 0 click count
UPDATE carousel_slides 
SET click_count = 0 
WHERE click_count IS NULL;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_carousel_slides_click_count 
ON carousel_slides(click_count DESC);

-- Step 4: Create the click tracking function
-- First drop existing function if it exists
DROP FUNCTION IF EXISTS increment_carousel_click(TEXT);

CREATE OR REPLACE FUNCTION increment_carousel_click(slide_unique_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE carousel_slides 
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    last_clicked_at = NOW()
  WHERE unique_id = slide_unique_id;
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION increment_carousel_click(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_carousel_click(TEXT) TO anon;

-- Step 6: Verify the changes
SELECT 
    'carousel_slides' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'carousel_slides' 
    AND column_name IN ('click_count', 'last_clicked_at')
ORDER BY column_name;
