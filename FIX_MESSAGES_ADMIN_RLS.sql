-- Fix Messages RLS Policy for Admin Access
-- This script ensures admins can see ALL messages

-- First, check current user's role
SELECT 
    id,
    email,
    role,
    display_name
FROM public.profiles
WHERE id = auth.uid();

-- Check if messages table exists and has RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'messages' AND schemaname = 'public';

-- Check existing policies on messages table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages' 
AND schemaname = 'public'
ORDER BY policyname;

-- Drop and recreate the admin policy with correct syntax
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
DROP POLICY IF EXISTS "admin_all_messages" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_access" ON public.messages;

-- Create a comprehensive admin policy that definitely works
CREATE POLICY "messages_admin_full_access" ON public.messages
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Verify the new policy was created
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages' 
AND policyname = 'messages_admin_full_access';

-- Test: Try to count messages (should work if you're admin)
SELECT COUNT(*) as total_messages FROM public.messages;

-- If the above returns 0 but you know messages exist, your user might not be marked as admin
-- Run this to check and fix your admin status:
SELECT 
    id,
    email,
    role,
    display_name
FROM public.profiles
WHERE id = auth.uid();

-- If your role is not 'admin', run this (replace YOUR_USER_ID with your actual ID):
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'YOUR_USER_ID';
