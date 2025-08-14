import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('Applying password reset tokens migration...');
  
  try {
    // Create the table and indexes
    const { error: createError } = await supabase.rpc('sql', {
      query: `
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
        DROP POLICY IF EXISTS "Service role can manage password reset tokens" ON public.password_reset_tokens;
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
      `
    });

    if (createError) {
      console.error('Migration failed:', createError);
      return;
    }

    console.log('✅ Password reset tokens migration applied successfully!');
    
    // Test the table by checking if it exists
    const { data, error: testError } = await supabase
      .from('password_reset_tokens')
      .select('count', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Table verification failed:', testError);
    } else {
      console.log('✅ Table verified successfully!');
    }

  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run the migration
applyMigration().then(() => {
  console.log('Migration process completed');
  process.exit(0);
}).catch(error => {
  console.error('Migration process failed:', error);
  process.exit(1);
});
