// Quick database diagnostic to check property countries
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPropertyCountries() {
  console.log('🔍 Checking property countries in database...\n');
  
  try {
    // Get all unique countries
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, country, city, status')
      .order('country');
    
    if (error) {
      console.error('❌ Error fetching properties:', error);
      return;
    }
    
    // Count properties by country
    const countryStats = {};
    properties.forEach(p => {
      const country = p.country || 'NULL';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    
    console.log('📊 Properties by Country:');
    Object.entries(countryStats).forEach(([country, count]) => {
      console.log(`   ${country}: ${count} properties`);
    });
    
    console.log('\n🎯 Expected island country names:');
    console.log('   Aruba, Bonaire, Curaçao, Saba, Sint Eustatius, Sint Maarten');
    
    console.log('\n📋 Sample properties:');
    properties.slice(0, 5).forEach(p => {
      console.log(`   ID: ${p.id} | Country: "${p.country}" | City: "${p.city}" | Title: ${p.title?.substring(0, 30)}...`);
    });
    
    // Test specific island filtering
    console.log('\n🧪 Testing island filtering...');
    
    const testIslands = ['bonaire', 'aruba', 'curacao', 'saba', 'sint-eustatius', 'sint-maarten'];
    
    for (const island of testIslands) {
      const countryName = getIslandCountryName(island);
      const { data: filtered, error: filterError } = await supabase
        .from('properties')
        .select('id, country')
        .ilike('country', countryName);
        
      if (filterError) {
        console.log(`   ❌ ${island} (${countryName}): Error - ${filterError.message}`);
      } else {
        console.log(`   ✅ ${island} (${countryName}): ${filtered?.length || 0} properties`);
      }
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

// Helper function from MasterIslandContext
function getIslandCountryName(island) {
  const islandCountryMap = {
    'aruba': 'Aruba',
    'bonaire': 'Bonaire',
    'curacao': 'Curaçao',
    'saba': 'Saba',
    'sint-eustatius': 'Sint Eustatius',
    'sint-maarten': 'Sint Maarten'
  };
  
  return islandCountryMap[island] || island;
}

checkPropertyCountries();
