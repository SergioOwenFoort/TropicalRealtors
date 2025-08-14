// Simple script to test Supabase connection
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as your application
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test the connection
async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log(''); // Empty line for readability
  
  try {
    console.log('📊 Testing database access...');
    // Try to query a public table (this should work with anon key)
    // Using a simpler query that should work
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📋 Data returned: ${JSON.stringify(data)}`);
    
    // Additional verification - try to get the current timestamp from Supabase
    const { data: timeData, error: timeError } = await supabase
      .rpc('now');
      
    if (timeError) {
      console.log('⚠️ Could not get server timestamp: ' + timeError.message);
    } else {
      console.log(`⏰ Supabase server time: ${timeData}`);
    }
    
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    console.error('Details:', err);
    
    if (err.message.includes('Failed to fetch')) {
      console.log('\n🔍 Possible causes:');
      console.log('1. Network connection issues');
      console.log('2. Wrong Supabase URL');
      console.log('3. Supabase project might be paused or unavailable');
    } else if (err.message.includes('JWT')) {
      console.log('\n🔍 Possible causes:');
      console.log('1. Invalid anon key');
      console.log('2. Key might be expired');
      console.log('3. Key might not have proper permissions');
    }
  }
}

// Run the test
testSupabaseConnection();
