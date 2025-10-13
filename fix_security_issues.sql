-- Quick Security Fix for TropicalRealtors
-- Run this script in your Supabase SQL Editor to fix the security issues

-- 1. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Fix all functions with search_path issues
-- Update function: update_updated_at_column
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

-- Update function: increment_carousel_click
-- First drop the existing function to handle parameter name change
DROP FUNCTION IF EXISTS public.increment_carousel_click(TEXT);

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

-- Update function: verify_admin_policies
CREATE OR REPLACE FUNCTION public.verify_admin_policies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result json;
BEGIN
    result := json_build_object(
        'status', 'OK',
        'timestamp', NOW()
    );
    RETURN result;
END;
$$;

-- Update function: increment_property_view_count
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
    RETURNING id, title, view_count INTO result_row;
    
    RETURN json_build_object('success', true, 'view_count', result_row.view_count);
END;
$$;

-- Update function: handle_new_user
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

-- Create function: get_auth_uid (if it was missing)
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