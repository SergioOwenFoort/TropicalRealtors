// Alternative migration approach using direct SQL execution
import fetch from 'node-fetch';

const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

async function testTableExists() {
  console.log('Testing if password_reset_tokens table already exists...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/password_reset_tokens?select=count`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (response.status === 200) {
      console.log('✅ Table already exists!');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Table does not exist, need to create it');
      return false;
    } else {
      console.log(`❓ Unexpected response: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log('Response:', text);
      return false;
    }
  } catch (error) {
    console.error('Error checking table:', error);
    return false;
  }
}

// Test if the table exists
testTableExists().then(exists => {
  if (exists) {
    console.log('Migration not needed - table already exists');
  } else {
    console.log('Table needs to be created manually in Supabase dashboard');
    console.log('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log(`
-- Create table for custom password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Add RLS policies
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage reset tokens
CREATE POLICY "Service role can manage password reset tokens"
ON public.password_reset_tokens
FOR ALL
TO service_role
USING (true);

-- Clean up expired tokens periodically (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
    `);
  }
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
