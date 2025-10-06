import { supabase } from './src/config/supabase.config.js';

async function getProperties() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, address')
      .limit(5);
    
    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }
    
    console.log('Properties in database:');
    if (data && data.length > 0) {
      data.forEach(property => {
        console.log(`ID: ${property.id}, Title: ${property.title}, Address: ${property.address}`);
        console.log(`Test URL: http://localhost:5174/woning/${property.id}`);
      });
    } else {
      console.log('No properties found in database');
    }
  } catch (err) {
    console.error('Failed to connect to database:', err);
  }
}

getProperties();
