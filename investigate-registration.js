import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersAndProfiles() {
  console.log('🔍 Investigating user registration flow...\n');
  
  try {
    // Check if we can query the auth schema directly
    console.log('1️⃣ Checking auth.users table directly...');
    const { data: authUsers, error: authError } = await supabase
      .rpc('get_auth_users');
    
    if (authError) {
      console.log('⚠️ Cannot access auth.users directly:', authError.message);
      console.log('   This is normal - auth tables are protected');
    }
    
    // Let's try a different approach - check if the user can actually log in
    console.log('\n2️⃣ Testing if sergioytpremium@gmail.com can sign in...');
    
    // We need to create a client with anon key for this test
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    // Try to send a password reset email - this will tell us if the user exists
    const { data: resetData, error: resetError } = await anonClient.auth.resetPasswordForEmail(
      'sergioytpremium@gmail.com',
      { redirectTo: 'http://localhost:5174/reset-password' }
    );
    
    if (resetError) {
      console.log('❌ Password reset failed:', resetError.message);
      if (resetError.message.includes('User not found')) {
        console.log('   🔍 This confirms the user does NOT exist in auth.users');
        console.log('   📝 The registration process likely failed or was incomplete');
      }
    } else {
      console.log('✅ Password reset email would be sent');
      console.log('   🔍 This means the user EXISTS in auth.users');
      console.log('   📝 The issue is that the profile creation trigger failed');
    }
    
    // Now let's see what profiles we have and try to understand the pattern
    console.log('\n3️⃣ Analyzing existing profiles for pattern...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('❌ Error getting profiles:', profileError.message);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ID: ${profile.id.substring(0, 8)}... | Email: ${profile.email} | Role: ${profile.role}`);
    });
    
    // Check if there's a registration page or sign-up endpoint we can test
    console.log('\n4️⃣ Recommendations:');
    console.log('   📋 To fix this issue:');
    console.log('   1. Check if the user registration actually completed');
    console.log('   2. If user exists in auth but no profile, create profile manually');
    console.log('   3. If user doesn\'t exist, re-register with proper error handling');
    console.log('   4. Check if profile creation triggers are working');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Full error:', error);
  }
}

checkUsersAndProfiles();
