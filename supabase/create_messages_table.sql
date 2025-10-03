-- Create messages table for property inquiries
-- This table will store messages between users and property owners/realtors

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Property and conversation info
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    property_title TEXT NOT NULL, -- Denormalized for performance
    
    -- Participants
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    subject TEXT NOT NULL DEFAULT 'Vraag over eigendom',
    message TEXT NOT NULL,
    
    -- Message type and status
    message_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (message_type IN ('inquiry', 'viewing_request', 'general')),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    
    -- Metadata
    sender_name TEXT NOT NULL, -- Denormalized for performance
    sender_email TEXT NOT NULL, -- Denormalized for performance
    recipient_name TEXT NOT NULL, -- Denormalized for performance
    recipient_email TEXT NOT NULL, -- Denormalized for performance
    
    -- Optional viewing request data
    viewing_date DATE,
    viewing_time TIME,
    viewing_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON public.messages(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(property_id, sender_id, recipient_id);

-- Create a compound index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient_status_date ON public.messages(recipient_id, status, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can see messages where they are sender or recipient
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Users can send messages (insert)
CREATE POLICY "Authenticated users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        auth.uid() IS NOT NULL
    );

-- Users can update messages they sent or received (for marking as read, etc.)
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Admins can see and manage all messages
CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON public.messages;
CREATE TRIGGER trigger_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN := FALSE;
BEGIN
    UPDATE public.messages 
    SET status = 'read', 
        read_at = timezone('utc', now())
    WHERE id = message_id 
    AND auth.uid() = recipient_id
    AND status = 'unread';
    
    GET DIAGNOSTICS result = FOUND;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's messages with pagination
CREATE OR REPLACE FUNCTION get_user_messages(
    p_user_id UUID DEFAULT auth.uid(),
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_folder TEXT DEFAULT 'inbox' -- 'inbox', 'sent', 'all'
)
RETURNS TABLE (
    id UUID,
    property_id UUID,
    property_title TEXT,
    sender_id UUID,
    recipient_id UUID,
    subject TEXT,
    message TEXT,
    message_type TEXT,
    status TEXT,
    sender_name TEXT,
    sender_email TEXT,
    recipient_name TEXT,
    recipient_email TEXT,
    viewing_date DATE,
    viewing_time TIME,
    viewing_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id, m.property_id, m.property_title,
        m.sender_id, m.recipient_id,
        m.subject, m.message, m.message_type, m.status,
        m.sender_name, m.sender_email,
        m.recipient_name, m.recipient_email,
        m.viewing_date, m.viewing_time, m.viewing_notes,
        m.created_at, m.updated_at, m.read_at, m.replied_at
    FROM public.messages m
    WHERE 
        CASE 
            WHEN p_folder = 'inbox' THEN m.recipient_id = p_user_id
            WHEN p_folder = 'sent' THEN m.sender_id = p_user_id
            ELSE (m.sender_id = p_user_id OR m.recipient_id = p_user_id)
        END
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION mark_message_as_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_messages(UUID, INTEGER, INTEGER, TEXT) TO authenticated;

-- Insert some test data (commented out for production)
/*
-- This would be used for testing
INSERT INTO public.messages (
    property_id, property_title, sender_id, recipient_id,
    subject, message, message_type,
    sender_name, sender_email, recipient_name, recipient_email
) VALUES (
    'some-property-uuid', 'Test Property', 
    'sender-user-uuid', 'recipient-user-uuid',
    'Interesse in uw woning', 'Ik ben geïnteresseerd in deze woning. Kunnen we een bezichtiging plannen?', 'inquiry',
    'Test Sender', 'sender@example.com', 'Test Recipient', 'recipient@example.com'
);
*/

-- Verification queries
SELECT 'Messages table created successfully!' as status;

SELECT 
    'Table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Policies created:' as info, policyname 
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;
