-- Migration to expand property categories to include hotel and resort options

-- First, remove the existing check constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_category_check;

-- Add the new check constraint with expanded categories
ALTER TABLE properties 
ADD CONSTRAINT properties_category_check 
CHECK (category IN ('appartementen', 'huizen', 'vakantiewoningen', 'nieuwbouw', 'hotel', 'resort'));
