const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function checkExistingTables() {
  console.log('Checking existing tables in database...');
  
  try {
    // Try to get a list of tables by attempting to select from them
    const tablesToCheck = [
      'saved_searches',
      'profiles', 
      'properties',
      'carousel_slides',
      'property_views',
      'click_tracking'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table '${tableName}' does not exist or is not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${tableName}' exists with ${data?.length || 0} sample records`);
          if (data && data.length > 0) {
            console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`❌ Error checking table '${tableName}':`, err.message);
      }
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkExistingTables();
