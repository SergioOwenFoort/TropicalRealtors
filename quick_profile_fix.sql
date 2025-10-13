-- QUICK FIX: Temporarily disable RLS on profiles table to restore access
-- This will immediately fix the 406 errors and allow dashboard access
-- Run this in your Supabase SQL Editor NOW

-- Disable RLS temporarily to restore access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Ensure admin profile exists
INSERT INTO public.profiles (id, email, display_name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'System Administrator',
    'admin',
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 's.admin@tropicalrealtors.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Update existing admin profile if needed
UPDATE public.profiles 
SET role = 'admin', display_name = 'System Administrator'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 's.admin@tropicalrealtors.com'
);

SELECT 'QUICK FIX APPLIED: RLS disabled on profiles table. Access should work now.' as status;