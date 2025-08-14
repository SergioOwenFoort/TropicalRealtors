-- Check if favorites column actually exists in the database
-- and get the real schema information

-- Check if the column exists in the system tables
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'favorites';

-- If it exists, check its current type and constraints
SELECT 
    a.attname AS column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
    a.attnotnull AS not_null,
    pg_get_expr(d.adbin, d.adrelid) AS default_value
FROM pg_catalog.pg_attribute a
LEFT JOIN pg_catalog.pg_attrdef d ON (a.attrelid = d.adrelid AND a.attnum = d.adnum)
WHERE a.attrelid = (
    SELECT oid FROM pg_catalog.pg_class 
    WHERE relname = 'profiles' AND relnamespace = (
        SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = 'public'
    )
)
AND a.attname = 'favorites'
AND NOT a.attisdropped;

-- Show all columns in profiles table to compare
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
ORDER BY ordinal_position;
