-- Check if phone_number column exists and has data in properties table
SELECT 
  id,
  title,
  address,
  city,
  phone_number,
  CASE 
    WHEN phone_number IS NULL THEN 'NULL'
    WHEN phone_number = '' THEN 'EMPTY STRING'
    ELSE 'HAS VALUE'
  END as phone_status,
  created_by,
  owner_id
FROM public.properties
ORDER BY date_posted DESC
LIMIT 20;
