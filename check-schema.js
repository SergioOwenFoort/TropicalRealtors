import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking properties table schema...');
  
  try {
    // Get table columns info from information_schema
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'properties' })
      .single();

    if (error) {
      console.log('⚠️ RPC method not available, trying direct query...');
      
      // Alternative: Get first row to see available columns
      const { data: sampleData, error: sampleError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Error:', sampleError);
        return;
      }

      if (sampleData && sampleData.length > 0) {
        console.log('📋 Available columns:');
        Object.keys(sampleData[0]).forEach(column => {
          console.log(`   - ${column}: ${typeof sampleData[0][column]} (${sampleData[0][column]})`);
        });
      } else {
        console.log('❌ No sample data found');
      }
    } else {
      console.log('✅ Table columns:', columns);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSchema();
