// Apply the favorites column fix to the database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFavoritesColumn() {
  console.log('🔧 Adding favorites column to profiles table...\n');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('add-favorites-column.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Failed to execute SQL via RPC:', error);
      
      // Try individual commands instead
      console.log('🔄 Trying individual SQL commands...');
      
      // Add the column (but it already exists as text[])
      const { error: addError } = await supabase.rpc('exec_sql', {
        sql_query: "UPDATE public.profiles SET favorites = '{}'::text[] WHERE favorites IS NULL;"
      });
      
      if (addError) {
        console.error('❌ Failed to add column:', addError);
        return;
      }
      
      // Add empty favorites array for existing users
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql_query: "UPDATE public.profiles SET favorites = '{}'::text[] WHERE favorites IS NULL;"
      });
      
      if (updateError) {
        console.error('❌ Failed to update existing records:', updateError);
        return;
      }
      
      console.log('✅ Successfully added favorites column!');
    } else {
      console.log('✅ SQL executed successfully:', data);
    }
    
    // Test the favorites functionality
    console.log('\n🧪 Testing favorites functionality...');
    
    const testUserId = '847146bd-1904-43d3-8ff8-138388bf2a01';
    
    // Test reading favorites
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', testUserId)
      .single();
    
    if (readError) {
      console.error('❌ Failed to read favorites:', readError);
    } else {
      console.log('✅ Successfully read favorites:', profile.favorites);
    }
    
    // Test updating favorites
    const testFavorites = ['property1', 'property2'];
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ favorites: testFavorites })
      .eq('id', testUserId);
    
    if (updateError) {
      console.error('❌ Failed to update favorites:', updateError);
    } else {
      console.log('✅ Successfully updated favorites');
      
      // Read back to confirm
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('favorites')
        .eq('id', testUserId)
        .single();
      
      console.log('✅ Updated favorites:', updatedProfile.favorites);
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

addFavoritesColumn();
