import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingProfile() {
  console.log('🔧 Creating missing profile for sergioytpremium@gmail.com...\n');
  
  try {
    // First, let's try to get the user ID using the admin API
    console.log('1️⃣ Getting user information from auth system...');
    
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error getting users:', usersError.message);
      return;
    }
    
    const targetUser = users.find(user => user.email === 'sergioytpremium@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User not found in auth system');
      return;
    }
    
    console.log('✅ User found in auth system:');
    console.log(`   ID: ${targetUser.id}`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   Created: ${targetUser.created_at}`);
    console.log(`   Email confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Now create the missing profile
    console.log('\n2️⃣ Creating missing profile...');
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: targetUser.id,
        email: targetUser.email,
        display_name: targetUser.email.split('@')[0], // sergioytpremium
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating profile:', createError.message);
      console.error('   Details:', createError);
      return;
    }
    
    console.log('✅ Profile created successfully!');
    console.log(`   ID: ${newProfile.id}`);
    console.log(`   Email: ${newProfile.email}`);
    console.log(`   Display Name: ${newProfile.display_name}`);
    console.log(`   Role: ${newProfile.role}`);
    
    // Verify the profile was created
    console.log('\n3️⃣ Verifying profile creation...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError.message);
      return;
    }
    
    console.log('✅ Profile verified in database!');
    console.log('   The user should now appear in your admin dashboard');
    
    // Show total profiles now
    const { data: allProfiles, error: countError } = await supabase
      .from('profiles')
      .select('email, role')
      .order('created_at', { ascending: false });
    
    if (!countError) {
      console.log(`\n📊 Total profiles in system: ${allProfiles.length}`);
      allProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Full error:', error);
  }
}

createMissingProfile();
