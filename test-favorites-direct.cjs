// Test favorites functionality with a direct user lookup (bypassing session)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFavoritesDirectly() {
  console.log('🧪 Testing favorites functionality directly (bypassing session)...\n');
  
  try {
    // Get a user to test with
    console.log('1️⃣ Getting a test user...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, favorites')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in profiles table');
      return;
    }
    
    const testUser = users[0];
    console.log('✅ Test user:', testUser.email);
    console.log('   Current favorites:', testUser.favorites);
    console.log('   Type:', typeof testUser.favorites);
    
    // Test 2: Try to update favorites
    console.log('\n2️⃣ Testing favorites update...');
    const newFavorites = ['test-property-abc', 'test-property-xyz'];
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({ favorites: newFavorites })
      .eq('id', testUser.id)
      .select('id, favorites');
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      console.log('💡 This tells us if there\'s a fundamental issue with the favorites column');
    } else {
      console.log('✅ Update successful:', updateResult);
      
      // Test 3: Query the updated data
      console.log('\n3️⃣ Querying updated favorites...');
      const { data: updatedUser, error: queryError } = await supabase
        .from('profiles')
        .select('favorites')
        .eq('id', testUser.id)
        .single();
      
      if (queryError) {
        console.error('❌ Query error:', queryError);
      } else {
        console.log('✅ Updated favorites:', updatedUser.favorites);
        console.log('   Is Array:', Array.isArray(updatedUser.favorites));
        console.log('   Length:', updatedUser.favorites?.length);
      }
      
      // Test 4: Reset back to original
      console.log('\n4️⃣ Resetting favorites...');
      await supabase
        .from('profiles')
        .update({ favorites: testUser.favorites || [] })
        .eq('id', testUser.id);
      
      console.log('🧹 Reset to original state');
    }
    
    // Test 5: Check if RLS policies exist
    console.log('\n5️⃣ Checking for RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'profiles');
    
    if (policiesError) {
      console.log('ℹ️ Could not check RLS policies (this is normal)');
    }
    
    console.log('\n📋 Summary:');
    console.log('- If updates work: The favorites column is functional');
    console.log('- If updates fail: There\'s a database/permissions issue'); 
    console.log('- The original error might be due to no active session');
    console.log('- Check that users are properly logged in when testing favorites');
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testFavoritesDirectly();
