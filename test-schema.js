import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPropertiesSchema() {
  console.log('🔍 Checking properties table schema...');
  
  try {
    // Test 1: Check if properties table exists and get schema info using raw SQL
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'properties' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (schemaError) {
      console.log('⚠️ Could not check schema via RPC, trying direct table access...');
      
      // Test 2: Try a simple select to verify table exists
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      if (testError) {
        console.error('❌ Properties table does not exist or is not accessible:', testError.message);
        
        // Let's check what tables do exist
        const { data: tableData, error: tableError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
          
        if (!tableError && tableData) {
          console.log('📋 Available tables:');
          tableData.forEach(table => console.log(`  - ${table.tablename}`));
        }
        
        return;
      } else {
        console.log('✅ Properties table exists and is accessible');
        console.log('📊 Sample data structure:', testData?.[0] ? Object.keys(testData[0]) : 'No data yet');
      }
    } else {
      console.log('✅ Properties table found with columns:');
      if (schemaData && schemaData.length > 0) {
        schemaData.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    }

    // Test 3: Check if we can insert (this will test RLS policies)
    const testProperty = {
      title: 'Test Property',
      description: 'Test description',
      price: 100000,
      address: 'Test Address',
      city: 'Test City',
      property_type: 'House',
      status: 'available'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('properties')
      .insert([testProperty])
      .select()
      .single();

    if (insertError) {
      console.log('⚠️ Insert test failed (this might be due to RLS policies):', insertError.message);
    } else {
      console.log('✅ Insert test successful - cleaning up...');
      // Clean up test data
      await supabase.from('properties').delete().eq('id', insertData.id);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPropertiesSchema();
