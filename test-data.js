// Quick test script to check if data is accessible
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.error('Connection error:', tablesError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Test data fetch
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);
    
    if (propertiesError) {
      console.error('Properties fetch error:', propertiesError);
      return;
    }
    
    console.log('✅ Properties fetched successfully');
    console.log('Total properties:', properties?.length || 0);
    
    if (properties && properties.length > 0) {
      console.log('Sample property:', properties[0]);
      
      // Check for featured properties
      const featured = properties.filter(p => p.featured);
      console.log('Featured properties:', featured.length);
    }
    
    // Test profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
    } else {
      console.log('✅ Profiles fetched successfully');
      console.log('Total profiles:', profiles?.length || 0);
    }
    
    // Test realtors
    const { data: realtors, error: realtorsError } = await supabase
      .from('realtors')
      .select('*')
      .limit(3);
    
    if (realtorsError) {
      console.error('Realtors fetch error:', realtorsError);
    } else {
      console.log('✅ Realtors fetched successfully');
      console.log('Total realtors:', realtors?.length || 0);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
