// Check the existing favorites column more thoroughly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFavoritesColumn() {
  console.log('🔍 Checking existing favorites column...\n');
  
  try {
    // Try to query favorites directly with error handling
    console.log('1️⃣ Testing direct favorites query...');
    const { data: favData, error: favError } = await supabase
      .from('profiles')
      .select('id, email, favorites')
      .limit(3);
    
    if (favError) {
      console.error('❌ Error querying favorites:', favError);
      
      // Try raw SQL to see what's going on
      console.log('\n2️⃣ Trying raw SQL approach...');
      const { data: rawData, error: rawError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (rawError) {
        console.error('❌ Raw query failed:', rawError);
      } else {
        console.log('✅ Raw data shows these columns:');
        Object.keys(rawData[0] || {}).forEach(key => {
          console.log(`   - ${key}`);
        });
      }
    } else {
      console.log('✅ Favorites data retrieved successfully:');
      favData.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`);
        console.log(`      ID: ${profile.id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Favorites: ${JSON.stringify(profile.favorites)} (type: ${typeof profile.favorites})`);
      });
    }
    
    // Try to get column info using a different approach
    console.log('\n3️⃣ Checking column metadata...');
    
    // Test if we can insert/update favorites
    console.log('\n4️⃣ Testing favorites operations...');
    
    // Get a test user
    const { data: testUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
      .single();
    
    if (userError) {
      console.error('❌ Error getting test user:', userError);
    } else {
      console.log(`✅ Test user: ${testUser.email}`);
      
      // Try to update their favorites
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ favorites: ['test-property-id'] })
        .eq('id', testUser.id)
        .select('id, favorites');
      
      if (updateError) {
        console.error('❌ Error updating favorites:', updateError);
        console.log('💡 This tells us what the real issue is with the favorites column');
      } else {
        console.log('✅ Successfully updated favorites:', updateData);
        
        // Reset it back to empty
        await supabase
          .from('profiles')
          .update({ favorites: [] })
          .eq('id', testUser.id);
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkFavoritesColumn();
