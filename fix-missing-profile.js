import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingProfile() {
  console.log('🔧 Fixing missing profile for sergioytpremium@gmail.com...\n');
  
  try {
    // First, let's try to get the user ID from auth.users using admin client
    console.log('1. Searching for user in auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(user => user.email === 'sergioytpremium@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User not found in auth.users table. Registration may not have completed.');
      console.log('   Available users:');
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
      return;
    }
    
    console.log('✅ Found user in auth.users:');
    console.log(`   ID: ${targetUser.id}`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   Created: ${targetUser.created_at}`);
    console.log(`   Email Confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Now create the missing profile
    console.log('\n2. Creating missing profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: targetUser.id,
        email: targetUser.email,
        display_name: targetUser.email.split('@')[0], // Use the part before @ as display name
        role: 'user', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      console.error('   Details:', profileError);
    } else {
      console.log('✅ Profile created successfully:');
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Display Name: ${profile.display_name}`);
      console.log(`   Role: ${profile.role}`);
    }
    
    // Verify the profile exists
    console.log('\n3. Verifying profile creation...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com')
      .single();
      
    if (verifyError) {
      console.error('❌ Profile verification failed:', verifyError.message);
    } else {
      console.log('✅ Profile verified in database');
      console.log('   The user should now appear in the admin dashboard');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixMissingProfile();
