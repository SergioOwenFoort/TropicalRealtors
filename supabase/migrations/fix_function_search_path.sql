-- Fix function search_path security issue
-- Drop and recreate the function with a stable search_path

-- First, drop the trigger that depends on the function
DROP TRIGGER IF EXISTS update_vacation_properties_updated_at_trigger ON public.vacation_properties;
DROP TRIGGER IF EXISTS vacation_properties_updated_at_trigger ON public.vacation_properties;

-- Now we can drop the function
DROP FUNCTION IF EXISTS public.update_vacation_properties_updated_at();

-- Recreate the function with secure search_path
CREATE OR REPLACE FUNCTION public.update_vacation_properties_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER vacation_properties_updated_at_trigger
    BEFORE UPDATE ON public.vacation_properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vacation_properties_updated_at();

COMMENT ON FUNCTION public.update_vacation_properties_updated_at() 
IS 'Automatically updates the updated_at timestamp when vacation_properties row is modified. Uses stable search_path for security.';
