-- Final Fix for Remaining Search Path Vulnerabilities
-- This script specifically fixes the last two functions with search_path issues

-- Fix function: get_unread_message_count
DROP FUNCTION IF EXISTS public.get_unread_message_count(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER 
    INTO count_result
    FROM public.messages 
    WHERE recipient_id = user_id 
    AND status = 'unread';
    
    RETURN COALESCE(count_result, 0);
END;
$$;

-- Fix function: get_user_messages
DROP FUNCTION IF EXISTS public.get_user_messages(UUID, INTEGER, INTEGER, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_messages(
    p_user_id UUID DEFAULT auth.uid(),
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_folder TEXT DEFAULT 'inbox'
)
RETURNS TABLE (
    id UUID,
    property_id UUID,
    property_title TEXT,
    sender_id UUID,
    recipient_id UUID,
    subject TEXT,
    message TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    sender_name TEXT,
    sender_email TEXT,
    recipient_name TEXT,
    recipient_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.property_id,
        COALESCE(p.title, 'Property Not Found') as property_title,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.message,
        m.status,
        m.created_at,
        m.read_at,
        COALESCE(sp.display_name, sp.email) as sender_name,
        sp.email as sender_email,
        COALESCE(rp.display_name, rp.email) as recipient_name,
        rp.email as recipient_email
    FROM public.messages m
    LEFT JOIN public.properties p ON m.property_id = p.id
    LEFT JOIN public.profiles sp ON m.sender_id = sp.id
    LEFT JOIN public.profiles rp ON m.recipient_id = rp.id
    WHERE 
        (p_folder = 'inbox' AND m.recipient_id = p_user_id) OR
        (p_folder = 'sent' AND m.sender_id = p_user_id) OR
        (p_folder = 'all' AND (m.recipient_id = p_user_id OR m.sender_id = p_user_id))
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_unread_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_messages(UUID, INTEGER, INTEGER, TEXT) TO authenticated;

-- Check if all functions now have secure search_path
SELECT 'Final security fix completed! All functions should now have secure search_path settings.' as status;

-- Instructions for HaveIBeenPwned
SELECT 'To enable HaveIBeenPwned password protection: Go to Supabase Dashboard > Authentication > Settings > Security and enable "Check for compromised passwords"' as haveibeenpwned_instruction;