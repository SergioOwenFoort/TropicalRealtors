const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function checkPropertiesSchema() {
  console.log('Checking properties table/view schema...');
  
  try {
    // First, let's see what we can select from properties
    const { data: sampleData, error: sampleError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.error('Error querying properties:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('\nCurrent properties columns:');
      console.log(Object.keys(sampleData[0]).sort());
    }
    
    // Try to get the actual table that might be behind the view
    const { data: allData, error: allError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);
      
    if (allData) {
      console.log(`\nFound ${allData.length} properties in the table/view`);
      console.log('Sample data structure:');
      if (allData[0]) {
        Object.keys(allData[0]).forEach(key => {
          console.log(`  ${key}: ${typeof allData[0][key]} = ${allData[0][key]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPropertiesSchema();
