-- Add phone_number column to vacation_properties table
ALTER TABLE public.vacation_properties 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.vacation_properties.phone_number IS 'Contact phone number for the vacation property';
