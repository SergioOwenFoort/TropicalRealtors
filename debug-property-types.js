import { createClient } from '@supabase/supabase-js';

// Use your Supabase credentials
const supabaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugPropertyTypes() {
  console.log('🔍 Debugging property types...');
  
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }

    console.log('📋 Raw database data:');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Database property_type: "${prop.property_type}"`);
      console.log(`   Database type: "${prop.type || 'UNDEFINED'}"`);
      console.log('');
    });

    // Test the mapping function
    console.log('🔄 Testing mapping function...');
    properties.forEach((dbData, index) => {
      const mapped = {
        id: dbData.id,
        title: dbData.title,
        description: dbData.description,
        price: dbData.price,
        originalPrice: dbData.original_price,
        address: dbData.address,
        city: dbData.city,
        country: dbData.country,
        postalCode: dbData.postal_code,
        latitude: dbData.latitude,
        longitude: dbData.longitude,
        bedrooms: dbData.bedrooms,
        bathrooms: dbData.bathrooms,
        size: dbData.square_meters,
        images: dbData.images || [],
        type: dbData.property_type, // This should map property_type -> type
        category: dbData.category,
        features: dbData.features || [],
        status: dbData.status,
        featured: dbData.featured || false,
        makelaarId: dbData.owner_id || dbData.created_by,
        datePosted: dbData.date_posted
      };
      
      console.log(`${index + 1}. ${mapped.title}`);
      console.log(`   Mapped type: "${mapped.type}"`);
      console.log(`   Should show: ${mapped.type === 'koop' ? 'Te koop' : 'Te huur'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugPropertyTypes();
