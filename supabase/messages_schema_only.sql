-- Create messages table for property inquiries and communications
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) DEFAULT 'inquiry' CHECK (message_type IN ('inquiry', 'viewing_request', 'general')),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages where they are sender or recipient
CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'admin'
    )
  );

-- Policy: Users can insert messages (as sender)
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update messages where they are sender or recipient
CREATE POLICY "Users can update their messages" ON messages
  FOR UPDATE
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'admin'
    )
  );

-- Policy: Users can delete messages where they are sender or recipient
CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'admin'
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_messages_updated_at_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET status = 'read', read_at = NOW(), updated_at = NOW()
  WHERE id = message_id 
  AND (auth.uid() = sender_id OR auth.uid() = recipient_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE recipient_id = auth.uid()
    AND status = 'unread'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get messages for a user with optional filtering
CREATE OR REPLACE FUNCTION get_user_messages(
  message_status TEXT DEFAULT NULL,
  property_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  sender_id UUID,
  recipient_id UUID,
  message_type VARCHAR,
  subject VARCHAR,
  message TEXT,
  contact_info JSONB,
  status VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  property_title VARCHAR,
  sender_email VARCHAR,
  recipient_email VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.property_id,
    m.sender_id,
    m.recipient_id,
    m.message_type,
    m.subject,
    m.message,
    m.contact_info,
    m.status,
    m.created_at,
    m.updated_at,
    m.read_at,
    p.title as property_title,
    sender.email as sender_email,
    recipient.email as recipient_email
  FROM messages m
  LEFT JOIN properties p ON m.property_id = p.id
  LEFT JOIN auth.users sender ON m.sender_id = sender.id
  LEFT JOIN auth.users recipient ON m.recipient_id = recipient.id
  WHERE 
    (auth.uid() = m.sender_id OR auth.uid() = m.recipient_id)
    AND (message_status IS NULL OR m.status = message_status)
    AND (property_filter IS NULL OR m.property_id = property_filter)
  ORDER BY m.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
