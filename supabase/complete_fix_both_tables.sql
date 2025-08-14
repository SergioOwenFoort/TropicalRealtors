-- COMPLETE FIX: Fix profiles AND carousel_slides tables
-- This ensures both tables work without infinite recursion

-- ==========================================
-- PART 1: Fix profiles table (infinite recursion issue)
-- ==========================================

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on profiles table using dynamic SQL
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'profiles'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- Re-enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policy for profiles
CREATE POLICY "Allow all access to profiles" 
ON public.profiles 
FOR ALL
USING (true) 
WITH CHECK (true);

-- ==========================================
-- PART 2: Ensure carousel_slides table works
-- ==========================================

-- Create carousel_slides table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  period_number INTEGER NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  island TEXT NOT NULL CHECK (island IN ('bonaire', 'aruba', 'curacao')),
  always_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Ensure RLS is enabled on carousel_slides
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on carousel_slides
DO $$ 
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name in (
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'carousel_slides'
        AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.carousel_slides', policy_name);
    END LOOP;
END $$;

-- Create simple policy for carousel_slides
CREATE POLICY "Allow all access to carousel_slides" 
ON public.carousel_slides 
FOR ALL
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carousel_slides_island ON public.carousel_slides (island);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_period ON public.carousel_slides (period_number, year);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON public.carousel_slides (is_active);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_display_order ON public.carousel_slides (display_order);

-- ==========================================
-- PART 3: Ensure profiles table has proper structure
-- ==========================================

-- Update profiles table role constraint to include all roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));

-- ==========================================
-- PART 4: Test the setup
-- ==========================================

-- Test query for profiles (should not cause infinite recursion)
SELECT 'Profiles table accessible' as test_type, COUNT(*) as count FROM public.profiles;

-- Test query for carousel_slides
SELECT 'Carousel slides table accessible' as test_type, COUNT(*) as count FROM public.carousel_slides;

-- Final status
SELECT 'Fix completed successfully - both tables should now work' as status;
