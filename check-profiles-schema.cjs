// Check what columns actually exist in the profiles table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesSchema() {
  console.log('🔍 Checking profiles table schema...\n');
  
  try {
    // Get table schema information
    const { data: columns, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error('❌ Error getting schema:', error);
      
      // Try alternative method - just select * with limit 0 to see columns
      console.log('🔄 Trying alternative method...');
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Alternative method failed:', sampleError);
      } else {
        console.log('✅ Sample data structure:');
        if (sampleData && sampleData.length > 0) {
          const keys = Object.keys(sampleData[0]);
          keys.forEach(key => {
            console.log(`   Column: ${key} | Value: ${sampleData[0][key]} | Type: ${typeof sampleData[0][key]}`);
          });
        }
      }
    } else {
      console.log('📋 Profiles table columns:');
      columns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'Nullable' : 'Not Null'} - Default: ${col.column_default || 'None'}`);
      });
      
      // Check if favorites column exists
      const favoritesColumn = columns.find(col => col.column_name === 'favorites');
      if (favoritesColumn) {
        console.log(`\n✅ FAVORITES column EXISTS: ${favoritesColumn.data_type}`);
      } else {
        console.log('\n❌ FAVORITES column DOES NOT EXIST');
        console.log('💡 This explains the "column profiles.favorites does not exist" error');
      }
    }
    
    // Also show actual profiles data
    console.log('\n📊 Sample profiles data:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(2);
    
    if (profilesError) {
      console.error('❌ Error getting profiles:', profilesError);
    } else {
      profiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`);
        Object.keys(profile).forEach(key => {
          console.log(`      ${key}: ${profile[key]}`);
        });
        console.log('');
      });
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

checkProfilesSchema();
