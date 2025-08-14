-- Export script for production data
-- This will create INSERT statements for all your tables

-- Export profiles
\copy (SELECT * FROM public.profiles) TO 'export_profiles.csv' WITH CSV HEADER;

-- Export realtors
\copy (SELECT * FROM public.realtors) TO 'export_realtors.csv' WITH CSV HEADER;

-- Export properties  
\copy (SELECT * FROM public.properties) TO 'export_properties.csv' WITH CSV HEADER;

-- Export carousel_slides
\copy (SELECT * FROM public.carousel_slides) TO 'export_carousel_slides.csv' WITH CSV HEADER;

-- Export auth.users (this is more complex, we'll handle separately)
-- Note: We'll need to be careful with auth.users as it contains sensitive data
