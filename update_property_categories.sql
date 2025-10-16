-- Update property categories in Supabase properties table
-- Remove: vakantiewoningen, hotel, resort
-- Add: winkel, kantoor, werkplaats
-- Date: October 16, 2025

-- First, update existing properties with removed categories to 'huizen' as default
-- This prevents constraint violations when we update the check constraint
UPDATE properties 
SET category = 'huizen' 
WHERE category IN ('vakantiewoningen', 'hotel', 'resort');

-- Drop the existing check constraint
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_category_check;

-- Add the new check constraint with updated category values
ALTER TABLE properties 
ADD CONSTRAINT properties_category_check 
CHECK (category IN ('appartementen', 'huizen', 'nieuwbouw', 'winkel', 'kantoor', 'werkplaats'));

-- Verify the migration
DO $$
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'properties_category_check' 
        AND table_name = 'properties'
        AND table_schema = 'public'
        AND constraint_type = 'CHECK'
    ) THEN
        RAISE NOTICE '✅ Property categories updated successfully!';
        RAISE NOTICE 'Removed categories: vakantiewoningen, hotel, resort';
        RAISE NOTICE 'Added categories: winkel, kantoor, werkplaats';
        RAISE NOTICE 'Current allowed categories: appartementen, huizen, nieuwbouw, winkel, kantoor, werkplaats';
    ELSE
        RAISE EXCEPTION '❌ Failed to update property categories constraint';
    END IF;
END $$;

-- Optional: Show count of properties by category after migration
SELECT 
    category,
    COUNT(*) as count
FROM properties 
GROUP BY category 
ORDER BY count DESC;