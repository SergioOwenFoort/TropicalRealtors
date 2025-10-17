import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkVacationCoordinates() {
  console.log('🗺️ Checking vacation property coordinates...\n');
  
  try {
    const { data: properties, error } = await supabase
      .from('vacation_properties')
      .select('id, name, island, city, latitude, longitude, status')
      .eq('status', 'available')
      .order('island', { ascending: true });
      
    if (error) {
      console.error('❌ Error fetching properties:', error.message);
      return;
    }
    
    console.log(`Found ${properties.length} available vacation properties:\n`);
    
    properties.forEach((prop, index) => {
      const hasValidCoords = 
        prop.latitude !== null && 
        prop.latitude !== undefined && 
        prop.longitude !== null && 
        prop.longitude !== undefined &&
        !isNaN(prop.latitude) &&
        !isNaN(prop.longitude);
        
      console.log(`${index + 1}. ${prop.name}`);
      console.log(`   Island: ${prop.island}`);
      console.log(`   City: ${prop.city}`);
      console.log(`   Latitude: ${prop.latitude}`);
      console.log(`   Longitude: ${prop.longitude}`);
      console.log(`   Valid Coords: ${hasValidCoords ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    const validCount = properties.filter(p => 
      p.latitude !== null && 
      p.latitude !== undefined && 
      p.longitude !== null && 
      p.longitude !== undefined &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude)
    ).length;
    
    console.log(`\n📊 Summary: ${validCount} out of ${properties.length} properties have valid coordinates`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkVacationCoordinates();
