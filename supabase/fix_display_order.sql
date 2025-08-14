-- Fix slides with display_order 0 and ensure proper sequencing
-- This will fix existing slides and prevent carousel display issues

-- ==========================================
-- Fix existing slides with display_order 0
-- ==========================================

-- Update slides with display_order 0 to have proper sequence numbers
-- We'll assign sequential numbers based on creation date
DO $$
DECLARE
    slide_record RECORD;
    current_order INTEGER;
BEGIN
    -- For each combination of island, period_number, and year
    FOR slide_record IN
        SELECT DISTINCT island, period_number, year, always_visible
        FROM public.carousel_slides
        WHERE display_order = 0
        ORDER BY island, period_number, year
    LOOP
        -- Reset counter for each group
        current_order := 1;
        
        -- Update slides in this group with sequential order based on created_at
        UPDATE public.carousel_slides 
        SET display_order = current_order + (
            ROW_NUMBER() OVER (ORDER BY created_at) - 1
        )
        WHERE island = slide_record.island
        AND (
            (slide_record.period_number IS NULL AND period_number IS NULL) OR
            (period_number = slide_record.period_number)
        )
        AND year = slide_record.year
        AND always_visible = slide_record.always_visible
        AND display_order = 0;
        
        -- Log the update
        RAISE NOTICE 'Updated slides for island: %, period: %, year: %', 
            slide_record.island, 
            COALESCE(slide_record.period_number::text, 'always_visible'), 
            slide_record.year;
    END LOOP;
END $$;

-- ==========================================
-- Ensure all slides have display_order >= 1
-- ==========================================

-- Any remaining slides with display_order 0, set to 1
UPDATE public.carousel_slides 
SET display_order = 1 
WHERE display_order = 0 OR display_order IS NULL;

-- ==========================================
-- Create a function to auto-assign display order
-- ==========================================

CREATE OR REPLACE FUNCTION auto_assign_display_order()
RETURNS TRIGGER AS $$
BEGIN
    -- If display_order is not set or is 0, auto-assign it
    IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
        SELECT COALESCE(MAX(display_order), 0) + 1
        INTO NEW.display_order
        FROM public.carousel_slides
        WHERE island = NEW.island
        AND (
            (NEW.period_number IS NULL AND period_number IS NULL) OR
            (period_number = NEW.period_number)
        )
        AND year = NEW.year
        AND always_visible = NEW.always_visible;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Create trigger for auto-assignment
-- ==========================================

DROP TRIGGER IF EXISTS trigger_auto_assign_display_order ON public.carousel_slides;

CREATE TRIGGER trigger_auto_assign_display_order
    BEFORE INSERT ON public.carousel_slides
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_display_order();

-- ==========================================
-- Verify the fix
-- ==========================================

-- Show current display orders
SELECT 
    'Current slides display order' as info,
    island,
    period_number,
    year,
    always_visible,
    display_order,
    title,
    created_at
FROM public.carousel_slides
ORDER BY island, period_number, year, display_order;

-- Count slides with display_order 0 (should be 0 after this fix)
SELECT 
    'Slides with display_order 0' as check_name,
    COUNT(*) as count
FROM public.carousel_slides
WHERE display_order = 0;

SELECT 'DISPLAY ORDER FIX COMPLETE - Carousel should now display properly!' as status;
