import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllUsers() {
  console.log('📋 Checking all users in the database...\n');
  
  try {
    // Check auth.users table (admin access)
    console.log('=== AUTH.USERS TABLE ===');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`Found ${authUsers.users.length} users in auth table:`);
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
        console.log('');
      });
    }
    
    // Check profiles table  
    console.log('=== PROFILES TABLE ===');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
    } else {
      console.log(`Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Display Name: ${profile.display_name || 'None'}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('');
      });
    }
    
    // Look specifically for the new user
    console.log('=== CHECKING FOR sergioytpremium@gmail.com ===');
    const { data: specificProfile, error: specificError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com')
      .single();
      
    if (specificError) {
      console.log('❌ Profile not found for sergioytpremium@gmail.com');
      console.log('   Error:', specificError.message);
    } else {
      console.log('✅ Found profile for sergioytpremium@gmail.com:');
      console.log('   ID:', specificProfile.id);
      console.log('   Display Name:', specificProfile.display_name);
      console.log('   Role:', specificProfile.role);
      console.log('   Created:', specificProfile.created_at);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkAllUsers();
