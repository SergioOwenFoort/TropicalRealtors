-- Create a trigger function to handle new user profile creation after email verification
-- This function reads user metadata and creates the appropriate profile

CREATE OR REPLACE FUNCTION public.handle_new_user_with_metadata()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata JSONB;
  profile_data RECORD;
BEGIN
  -- Get user metadata
  user_metadata := NEW.raw_user_meta_data;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Create profile with metadata if available
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    role,
    first_name,
    last_name,
    phone,
    address,
    country_of_residence,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(user_metadata->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(user_metadata->>'role', 'user'),
    user_metadata->>'first_name',
    user_metadata->>'last_name', 
    user_metadata->>'phone',
    user_metadata->>'address',
    user_metadata->>'country_of_residence',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new authenticated users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_metadata();

-- Also handle user updates (for email confirmation)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_with_metadata();
