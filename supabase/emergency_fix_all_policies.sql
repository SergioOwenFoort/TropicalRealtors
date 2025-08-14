-- EMERGENCY FIX: Complete RLS policy reset to eliminate all infinite recursion errors
-- Run this SQL script in your Supabase SQL Editor to fix ALL policy-related issues

-- ==========================================
-- STEP 1: Fix profiles table (main issue)
-- ==========================================

-- Disable RLS temporarily for profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Re-enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, NON-RECURSIVE policies for profiles
CREATE POLICY "Public read access for profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- STEP 2: Fix realtors table policies
-- ==========================================

-- Disable RLS temporarily for realtors
ALTER TABLE public.realtors DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on realtors table
DROP POLICY IF EXISTS "Anyone can read realtors" ON public.realtors;
DROP POLICY IF EXISTS "Authenticated users can create realtors" ON public.realtors;
DROP POLICY IF EXISTS "Users can update realtors" ON public.realtors;
DROP POLICY IF EXISTS "Authenticated users can delete realtors" ON public.realtors;

-- Re-enable RLS for realtors
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Create simple, NON-RECURSIVE policies for realtors
CREATE POLICY "Public read access for realtors" 
ON public.realtors FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create realtors" 
ON public.realtors FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update their own realtor profile" 
ON public.realtors FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete realtors" 
ON public.realtors FOR DELETE TO authenticated 
USING (true);

-- ==========================================
-- STEP 3: Fix carousel_slides table policies
-- ==========================================

-- Disable RLS temporarily for carousel_slides
ALTER TABLE public.carousel_slides DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on carousel_slides table
DROP POLICY IF EXISTS "Anyone can read carousel slides" ON public.carousel_slides;
DROP POLICY IF EXISTS "Authenticated users can manage carousel slides" ON public.carousel_slides;
DROP POLICY IF EXISTS "Business users can manage carousel slides" ON public.carousel_slides;

-- Re-enable RLS for carousel_slides
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Create simple, NON-RECURSIVE policies for carousel_slides
CREATE POLICY "Public read access for carousel slides" 
ON public.carousel_slides FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage carousel slides" 
ON public.carousel_slides FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- ==========================================
-- STEP 4: Ensure proper table structure
-- ==========================================

-- Update profiles table role constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'realtor', 'owner', 'admin', 'business'));

-- Ensure carousel_slides has proper constraints
ALTER TABLE public.carousel_slides 
DROP CONSTRAINT IF EXISTS carousel_slides_island_check;

ALTER TABLE public.carousel_slides 
ADD CONSTRAINT carousel_slides_island_check 
CHECK (island IN ('bonaire', 'aruba', 'curacao'));

-- ==========================================
-- STEP 5: Create admin user if needed
-- ==========================================

-- Insert or update admin profile (safe operation)
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
  auth.uid(),
  auth.jwt() ->> 'email',
  'admin',
  NOW(),
  NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

-- This fix eliminates ALL recursive policy references
-- and creates simple, secure policies that won't cause
-- infinite recursion errors.
