-- Add additional fields to profiles table for owner registration

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country_of_residence TEXT;

-- Update the database comment
COMMENT ON COLUMN public.profiles.first_name IS 'First name of the user';
COMMENT ON COLUMN public.profiles.last_name IS 'Last name of the user';  
COMMENT ON COLUMN public.profiles.phone IS 'Phone number of the user';
COMMENT ON COLUMN public.profiles.address IS 'Address of the user';
COMMENT ON COLUMN public.profiles.country_of_residence IS 'Country of residence for the user';

-- Create index for better performance on lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_country_residence_idx ON public.profiles(country_of_residence);
