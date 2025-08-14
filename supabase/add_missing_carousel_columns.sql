-- Add missing columns to carousel_slides table
ALTER TABLE carousel_slides 
ADD COLUMN IF NOT EXISTS period_number integer,
ADD COLUMN IF NOT EXISTS always_visible boolean DEFAULT false;

-- Add index for better performance on period_number queries
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period_number ON carousel_slides(period_number);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_always_visible ON carousel_slides(always_visible);

-- Update existing slides to have period_number = 1 for migration
UPDATE carousel_slides 
SET period_number = 1 
WHERE period_number IS NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN carousel_slides.period_number IS 'Period number (1-13) for the carousel slide, each period is 4 weeks starting June 30, 2025';
COMMENT ON COLUMN carousel_slides.always_visible IS 'Whether the slide is always visible regardless of period';
