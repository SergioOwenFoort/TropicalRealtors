// Update property countries based on city-to-island mapping
const { createClient } = require('@supabase/supabase-js');
const { getIslandForCity } = require('./city-to-island-mapping.cjs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePropertyCountries() {
  console.log('🔍 Fetching all properties...\n');
  
  try {
    // Get all properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, city, country')
      .order('id');
    
    if (error) {
      console.error('❌ Error fetching properties:', error.message);
      return;
    }
    
    console.log(`📋 Found ${properties.length} properties to check\n`);
    
    const updates = [];
    const corrections = [];
    
    // Check each property
    for (const property of properties) {
      const correctIsland = getIslandForCity(property.city, property.country);
      
      if (correctIsland !== property.country) {
        updates.push({
          id: property.id,
          country: correctIsland
        });
        
        corrections.push({
          id: property.id,
          title: property.title.substring(0, 30) + '...',
          city: property.city,
          oldCountry: property.country,
          newCountry: correctIsland
        });
      }
    }
    
    console.log('📊 Analysis Results:');
    console.log(`   ✅ Correctly assigned: ${properties.length - corrections.length} properties`);
    console.log(`   🔧 Need correction: ${corrections.length} properties\n`);
    
    if (corrections.length > 0) {
      console.log('🔧 Properties that will be corrected:');
      corrections.forEach(correction => {
        console.log(`   📍 ID ${correction.id}: "${correction.title}"`);
        console.log(`      City: ${correction.city}`);
        console.log(`      ${correction.oldCountry} → ${correction.newCountry}\n`);
      });
      
      // Apply updates
      console.log('🚀 Applying corrections...\n');
      
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ country: update.country })
          .eq('id', update.id);
        
        if (updateError) {
          console.error(`❌ Failed to update property ${update.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated property ${update.id} to ${update.country}`);
        }
      }
      
      console.log(`\n🎉 Successfully updated ${updates.length} properties!`);
      
      // Show final distribution
      console.log('\n📊 Updated property distribution by island:');
      const { data: finalProperties } = await supabase
        .from('properties')
        .select('country')
        .order('country');
      
      const distribution = {};
      finalProperties.forEach(prop => {
        distribution[prop.country] = (distribution[prop.country] || 0) + 1;
      });
      
      Object.entries(distribution).forEach(([island, count]) => {
        console.log(`   🏝️ ${island}: ${count} properties`);
      });
      
    } else {
      console.log('✅ All properties are already correctly assigned to their islands!');
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run the update
updatePropertyCountries();
