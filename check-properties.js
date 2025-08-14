import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProperties() {
  console.log('🔍 Checking properties in database...');
  
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, country, city, status, property_type, price, original_price, created_by, owner_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }

    console.log('📋 Recent properties:');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Country: ${prop.country || 'NULL'}`);
      console.log(`   City: ${prop.city || 'NULL'}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Property Type: ${prop.property_type || 'NULL'}`);
      console.log(`   Price: €${prop.price || 'NULL'}`);
      console.log(`   Original Price: €${prop.original_price || 'NULL'}`);
      console.log(`   Created By: ${prop.created_by || 'NULL'}`);
      console.log(`   Owner ID: ${prop.owner_id || 'NULL'}`);
      console.log('');
    });

    // Check if island column exists
    console.log('🔍 Checking if island column exists...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('properties')
      .select('island')
      .limit(1);

    if (schemaError) {
      console.log('❌ Island column does not exist:', schemaError.message);
    } else {
      console.log('✅ Island column exists');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProperties();
