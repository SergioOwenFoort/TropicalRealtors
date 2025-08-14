import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPropertyInsert() {
  console.log('🧪 Testing property insert with minimal data...');
  
  const testProperty = {
    title: 'Test Property',
    description: 'Test description',
    price: 100000,
    address: 'Test Address',
    city: 'Bonaire',
    country: 'Netherlands Antilles',
    postal_code: '12345',
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 100,
    property_type: 'koop',
    category: 'huizen',
    status: 'actief',
    featured: false
  };

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([testProperty])
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Insert successful:', data.id);
      // Clean up
      await supabase.from('properties').delete().eq('id', data.id);
      console.log('✅ Test data cleaned up');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testPropertyInsert();
