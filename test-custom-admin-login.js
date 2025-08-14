// Test script for custom admin login solution
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('🔍 Testing custom admin login solution...');
  
  try {
    // Test 1: Check if profiles table is accessible
    console.log('\n🧪 Test 1: Check profiles access');
    const { data: accessCheck, error: accessError } = await supabase.rpc('check_profiles_access');
    
    if (accessError) {
      console.error('❌ Profiles access error:', accessError);
    } else {
      console.log('✅ Profiles access result:', accessCheck);
    }
    
    // Test 2: Try custom admin login
    console.log('\n🧪 Test 2: Custom admin login');
    const { data: loginData, error: loginError } = await supabase.rpc(
      'custom_admin_login',
      { 
        admin_email: 's.admin@bonairemakelaars.com', 
        admin_password: 'SuperSecure2025!' 
      }
    );
    
    if (loginError) {
      console.error('❌ Custom login error:', loginError);
    } else {
      console.log('✅ Login result:', loginData);
    }
    
    // Test 3: Get all profiles
    console.log('\n🧪 Test 3: Get all profiles');
    const { data: profilesData, error: profilesError } = await supabase.rpc('get_all_profiles');
    
    if (profilesError) {
      console.error('❌ Get profiles error:', profilesError);
    } else {
      console.log(`✅ Retrieved ${profilesData?.length || 0} profiles`);
      if (profilesData && profilesData.length > 0) {
        // Display first profile as sample (remove sensitive info)
        const sample = { ...profilesData[0] };
        if (sample.password) sample.password = '[REDACTED]';
        console.log('Sample profile:', sample);
      }
    }
    
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
  
  console.log('\n🏁 Testing completed');
}

// Run tests
runTests();
