// Check profiles table structure and test favorites query
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesTable() {
  console.log('🔍 Checking profiles table structure...\n');
  
  try {
    // Get all profiles to see the structure
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Error querying profiles:', error);
      return;
    }
    
    console.log('📋 Sample profiles:');
    profiles.forEach((profile, index) => {
      console.log(`   Profile ${index + 1}:`);
      console.log(`      ID: ${profile.id}`);
      console.log(`      Email: ${profile.email}`);
      console.log(`      Favorites: ${JSON.stringify(profile.favorites)}`);
      console.log(`      Favorites type: ${typeof profile.favorites}`);
      console.log('');
    });
    
    // Test the specific query that's failing
    const testUserId = '847146bd-1904-43d3-8ff8-138388bf2a01';
    console.log(`🧪 Testing favorites query for user: ${testUserId}`);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.error('❌ Favorites query failed:', profileError);
      
      // Try alternative query without .single()
      console.log('🔄 Trying alternative query...');
      const { data: profiles2, error: error2 } = await supabase
        .from('profiles')
        .select('favorites')
        .eq('id', testUserId);
      
      if (error2) {
        console.error('❌ Alternative query also failed:', error2);
      } else {
        console.log('✅ Alternative query worked:', profiles2);
      }
    } else {
      console.log('✅ Favorites query successful:', profile);
    }
    
    // Check if the user exists at all
    console.log('\n🔍 Checking if user exists...');
    const { data: userCheck, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', testUserId);
    
    if (userError) {
      console.error('❌ User check failed:', userError);
    } else {
      console.log('👤 User exists:', userCheck);
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkProfilesTable();
