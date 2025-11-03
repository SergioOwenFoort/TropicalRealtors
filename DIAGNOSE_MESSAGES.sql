-- Check if admin RLS policy exists for messages table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages' 
AND schemaname = 'public'
ORDER BY policyname;

-- Check total message count
SELECT 
    COUNT(*) as total_messages,
    COUNT(DISTINCT sender_id) as unique_senders,
    COUNT(DISTINCT recipient_id) as unique_recipients
FROM public.messages;

-- Check sample messages (first 5)
SELECT 
    id,
    sender_id,
    recipient_id,
    sender_name,
    recipient_name,
    subject,
    created_at,
    status
FROM public.messages
ORDER BY created_at DESC
LIMIT 5;

-- Check if current user is admin
SELECT 
    id,
    email,
    role,
    display_name
FROM public.profiles
WHERE id = auth.uid();

-- Check all users with message activity
SELECT DISTINCT
    u.id,
    u.email,
    p.display_name,
    p.role,
    (SELECT COUNT(*) FROM public.messages WHERE sender_id = u.id OR recipient_id = u.id) as message_count
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE EXISTS (
    SELECT 1 FROM public.messages 
    WHERE sender_id = u.id OR recipient_id = u.id
)
ORDER BY message_count DESC;
