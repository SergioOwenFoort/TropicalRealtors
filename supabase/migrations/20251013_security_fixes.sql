-- Security Fix Migration for TropicalRealtors Database
-- Fixes RLS and search_path security issues
-- Date: October 13, 2025

-- Set search_path to prevent search_path injection attacks
SET search_path = public, pg_temp;

-- 1. Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Fix function security: update_updated_at_column
-- Drop and recreate with proper security settings
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 3. Fix function security: increment_carousel_click
-- Drop and recreate with proper security settings
-- Handle potential parameter name differences
DROP FUNCTION IF EXISTS public.increment_carousel_click(TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.increment_carousel_click(slide_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.carousel_slides 
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    last_clicked_at = NOW()
  WHERE id = slide_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_carousel_click(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_carousel_click(TEXT) TO anon;

-- 4. Fix function security: verify_admin_policies
-- Drop and recreate with proper security settings
DROP FUNCTION IF EXISTS public.verify_admin_policies() CASCADE;
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    policy_count INTEGER;
    result json;
BEGIN
    -- Check if admin policies exist on profiles table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND schemaname = 'public'
    AND policyname LIKE '%admin%';
    
    result := json_build_object(
        'profiles_admin_policies', policy_count,
        'timestamp', NOW(),
        'status', CASE WHEN policy_count > 0 THEN 'OK' ELSE 'MISSING' END
    );
    
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_policies() TO service_role;

-- 5. Fix function security: increment_property_view_count
-- Drop and recreate with proper security settings
DROP FUNCTION IF EXISTS public.increment_property_view_count(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_property_view_count(property_id UUID)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result_row RECORD;
BEGIN
    UPDATE public.properties SET
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = property_id
    RETURNING 
        id, 
        title, 
        view_count, 
        last_viewed_at 
    INTO result_row;
    
    IF result_row.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Property not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'property_id', result_row.id,
        'title', result_row.title,
        'view_count', result_row.view_count,
        'last_viewed_at', result_row.last_viewed_at
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_property_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_property_view_count(UUID) TO anon;

-- 6. Fix function security: handle_new_user
-- Drop and recreate with proper security settings
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'displayName', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

-- 7. Create the missing get_auth_uid function (if it doesn't exist)
-- This is a safe wrapper around auth.uid()
CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO anon;

-- Recreate triggers that were dropped
-- Trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for update_updated_at_column (if saved_searches table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_searches') THEN
    DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
    CREATE TRIGGER update_saved_searches_updated_at
      BEFORE UPDATE ON public.saved_searches
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Additional security checks and improvements

-- Ensure RLS is enabled on all important tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- If properties table exists, ensure RLS is enabled
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- If carousel_slides table exists, ensure RLS is enabled
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'carousel_slides') THEN
    ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;
    
    -- Create basic RLS policy for carousel slides if it doesn't exist
    DROP POLICY IF EXISTS "Carousel slides are viewable by everyone" ON public.carousel_slides;
    CREATE POLICY "Carousel slides are viewable by everyone"
      ON public.carousel_slides FOR SELECT
      USING (true);
      
    DROP POLICY IF EXISTS "Only admins can modify carousel slides" ON public.carousel_slides;
    CREATE POLICY "Only admins can modify carousel slides"
      ON public.carousel_slides FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- If saved_searches table exists, ensure RLS is enabled
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_searches') THEN
    ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create a security audit function
CREATE OR REPLACE FUNCTION public.security_audit()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result json;
    tables_without_rls text[];
    functions_without_search_path text[];
BEGIN
    -- Check for tables without RLS
    SELECT array_agg(tablename) INTO tables_without_rls
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND NOT c.relrowsecurity;
    
    result := json_build_object(
        'timestamp', NOW(),
        'tables_without_rls', COALESCE(tables_without_rls, ARRAY[]::text[]),
        'rls_status', CASE WHEN array_length(tables_without_rls, 1) IS NULL THEN 'ALL_ENABLED' ELSE 'SOME_DISABLED' END
    );
    
    RETURN result;
END;
$$;

-- Grant permissions for the audit function
GRANT EXECUTE ON FUNCTION public.security_audit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.security_audit() TO service_role;

-- Reset search_path
RESET search_path;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Security fixes applied successfully at %', NOW();
  RAISE NOTICE '1. Enabled RLS on profiles table';
  RAISE NOTICE '2. Fixed search_path for all functions';
  RAISE NOTICE '3. Added SECURITY DEFINER to all functions';
  RAISE NOTICE '4. Created missing get_auth_uid function';
  RAISE NOTICE '5. Added security audit function';
END $$;