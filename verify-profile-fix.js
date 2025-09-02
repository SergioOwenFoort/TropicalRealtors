import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyUserProfile() {
  console.log('🔍 Verifying user profile after manual fix...\n');
  
  try {
    // Check if the profile now exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'sergioytpremium@gmail.com');
    
    if (profileError) {
      console.error('❌ Error checking profiles:', profileError.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('✅ Profile found!');
      console.log(`   ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Display Name: ${profile.display_name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Created: ${profile.created_at}`);
      console.log('\n🎉 The user should now appear in your admin dashboard!');
      
      // Show all profiles for context
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('email, role, created_at')
        .order('created_at', { ascending: false });
      
      if (!allError) {
        console.log(`\n📊 All profiles in system (${allProfiles.length} total):`);
        allProfiles.forEach((p, index) => {
          console.log(`   ${index + 1}. ${p.email} (${p.role}) - ${p.created_at}`);
        });
      }
      
    } else {
      console.log('❌ Profile still not found');
      console.log('   Please run the MANUAL_FIX_MISSING_PROFILE.sql in your Supabase dashboard');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyUserProfile();
