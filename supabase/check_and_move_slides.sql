-- Check current carousel slide assignments
SELECT 
  island,
  period,
  COUNT(*) as slide_count,
  MIN(created_at) as earliest_slide,
  MAX(created_at) as latest_slide
FROM carousel_slides 
GROUP BY island, period 
ORDER BY island, period;

-- Show total slides per island
SELECT 
  island,
  COUNT(*) as total_slides
FROM carousel_slides 
GROUP BY island 
ORDER BY island;

-- Move all slides to period 1 (current period)
UPDATE carousel_slides 
SET period = 1 
WHERE period != 1;

-- Verify the update
SELECT 
  island,
  period,
  COUNT(*) as slide_count
FROM carousel_slides 
GROUP BY island, period 
ORDER BY island, period;
