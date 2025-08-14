// Test favorites functionality after schema cache refresh
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFavoritesAfterCacheRefresh() {
  console.log('🧪 Testing favorites functionality after schema cache refresh...\n');
  
  try {
    // Test 1: Query favorites column
    console.log('1️⃣ Testing favorites column query...');
    const { data: profiles, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, favorites')
      .limit(2);
    
    if (queryError) {
      console.error('❌ Still getting query error:', queryError);
      console.log('💡 The schema cache might not be refreshed yet, or there might be RLS policies blocking access');
    } else {
      console.log('✅ Successfully queried favorites column!');
      profiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}: ${profile.email}`);
        console.log(`   Favorites: ${JSON.stringify(profile.favorites)} (${typeof profile.favorites})`);
      });
    }
    
    // Test 2: Update favorites
    console.log('\n2️⃣ Testing favorites update...');
    const { data: testUser } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
      .single();
    
    if (testUser) {
      const testPropertyId = 'test-property-123';
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ favorites: [testPropertyId] })
        .eq('id', testUser.id)
        .select('id, favorites');
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
      } else {
        console.log('✅ Successfully updated favorites:', updateResult);
        
        // Test 3: Query the updated favorites
        console.log('\n3️⃣ Testing favorites retrieval...');
        const { data: updatedProfile, error: retrieveError } = await supabase
          .from('profiles')
          .select('favorites')
          .eq('id', testUser.id)
          .single();
        
        if (retrieveError) {
          console.error('❌ Retrieve error:', retrieveError);
        } else {
          console.log('✅ Retrieved favorites:', updatedProfile.favorites);
        }
        
        // Clean up - reset to empty array
        await supabase
          .from('profiles')
          .update({ favorites: [] })
          .eq('id', testUser.id);
        
        console.log('🧹 Cleaned up test data');
      }
    }
    
    console.log('\n🎉 If all tests passed, your favorites functionality should work now!');
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testFavoritesAfterCacheRefresh();
