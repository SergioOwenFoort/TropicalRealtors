// Import required modules
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSupabase() {
  try {
    console.log('🔍 Starting Supabase diagnostic checks...');
    
    // Test the connection
    console.log('\n📊 Testing Supabase connection...');
    
    try {
      // Test basic query
      const { data: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (countError) {
        console.error('❌ Failed to count profiles:', countError);
      } else {
        console.log('✅ Successfully connected to profiles table');
      }

      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('❌ Failed to get auth session:', authError);
      } else {
        console.log('✅ Successfully connected to authentication service');
      }
      
      // Check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profileError) {
        console.error('❌ Failed to query profiles table:', profileError);
      } else {
        console.log('✅ Profiles table exists and is accessible');
      }

      // Check properties table
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      if (propertyError) {
        console.error('❌ Failed to query properties table:', propertyError);
      } else {
        console.log('✅ Properties table exists and is accessible');
      }
      
      console.log('\n🏁 Diagnostic completed');
    } catch (error) {
      console.error('❌ Unexpected error during diagnostics:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running diagnostics:', error);
    process.exit(1);
  }
}

diagnoseSupabase();
