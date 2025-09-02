import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function checkUserAndProfile() {
  console.log('🔍 Checking user registration and profile creation...\n');
  
  try {
    // First, let's check if the profiles table exists and what data it has
    console.log('1️⃣ Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (profileError) {
      console.error('❌ Error accessing profiles table:', profileError.message);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles in the database:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - Created: ${profile.created_at}`);
    });
    
    // Check specifically for the target email
    const targetProfile = profiles.find(p => p.email === 'sergioytpremium@gmail.com');
    
    if (targetProfile) {
      console.log('\n✅ Target user found in profiles table:');
      console.log(`   ID: ${targetProfile.id}`);
      console.log(`   Email: ${targetProfile.email}`);
      console.log(`   Display Name: ${targetProfile.display_name}`);
      console.log(`   Role: ${targetProfile.role}`);
      console.log(`   Created: ${targetProfile.created_at}`);
    } else {
      console.log('\n❌ Target user NOT found in profiles table');
      
      // Let's try to create a profile manually
      console.log('\n2️⃣ Creating profile manually...');
      
      // Generate a UUID for the user
      const userId = crypto.randomUUID();
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'sergioytpremium@gmail.com',
          display_name: 'sergioytpremium',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError.message);
        console.error('   Details:', createError);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('   The user should now appear in the admin dashboard');
      }
    }
    
    // Check the structure of the profiles table
    console.log('\n3️⃣ Checking profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .single();
    
    if (tableError) {
      console.log('⚠️ Could not get table structure (this is normal)');
    } else {
      console.log('✅ Table structure obtained');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Full error:', error);
  }
}

checkUserAndProfile();
