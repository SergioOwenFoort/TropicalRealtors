-- Change rating column from INTEGER to DECIMAL to support decimal ratings like 4.6
ALTER TABLE public.vacation_properties 
ALTER COLUMN rating TYPE DECIMAL USING rating::DECIMAL;

-- Update the check constraint to allow decimal values between 1 and 5
ALTER TABLE public.vacation_properties 
DROP CONSTRAINT IF EXISTS vacation_properties_rating_check;

ALTER TABLE public.vacation_properties 
ADD CONSTRAINT vacation_properties_rating_check CHECK (rating >= 1 AND rating <= 5);

-- Add comment
COMMENT ON COLUMN public.vacation_properties.rating IS 'Property rating from 1.0 to 5.0 (supports decimals)';
