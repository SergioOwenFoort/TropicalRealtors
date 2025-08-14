const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function updateRealtorImages() {
  console.log('🔄 Updating realtor storage URLs...\n');

  const oldBaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co/storage/v1/object/public';
  const newBaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co/storage/v1/object/public';

  try {
    // First, let's check what columns exist in the realtors table
    console.log('📋 Checking realtors table structure...');
    const { data: realtors, error: realtorError } = await newSupabase
      .from('realtors')
      .select('*')
      .limit(1);

    if (realtorError) {
      console.log('❌ Error fetching realtors:', realtorError.message);
      return;
    }

    if (realtors && realtors.length > 0) {
      console.log('✅ Realtors table columns:', Object.keys(realtors[0]));
    }

    // Now let's get all realtors and check for image-related columns
    console.log('\n📋 Fetching all realtors...');
    const { data: allRealtors, error: fetchError } = await newSupabase
      .from('realtors')
      .select('*');

    if (fetchError) {
      console.log('❌ Error fetching all realtors:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${allRealtors?.length || 0} realtors`);

    if (!allRealtors || allRealtors.length === 0) {
      console.log('ℹ️  No realtors found to update');
      return;
    }

    // Check what image-related columns exist
    const sampleRealtor = allRealtors[0];
    const imageColumns = Object.keys(sampleRealtor).filter(key => 
      key.toLowerCase().includes('image') || 
      key.toLowerCase().includes('avatar') || 
      key.toLowerCase().includes('photo')
    );

    console.log('🖼️  Found image-related columns:', imageColumns);

    let updatedRealtors = 0;

    for (const realtor of allRealtors) {
      let updates = {};
      let needsUpdate = false;

      // Check each image-related column
      for (const column of imageColumns) {
        const value = realtor[column];
        if (value && typeof value === 'string' && value.includes(oldBaseUrl)) {
          updates[column] = value.replace(new RegExp(oldBaseUrl, 'g'), newBaseUrl);
          needsUpdate = true;
          console.log(`   📝 Will update ${column} for realtor ${realtor.id || realtor.name || 'unknown'}`);
        }
      }

      if (needsUpdate) {
        const { error: updateError } = await newSupabase
          .from('realtors')
          .update(updates)
          .eq('id', realtor.id);

        if (updateError) {
          console.log(`   ❌ Error updating realtor ${realtor.id}:`, updateError.message);
        } else {
          updatedRealtors++;
          console.log(`   ✅ Updated realtor ${realtor.id || realtor.name || 'unknown'}`);
        }
      } else {
        console.log(`   ℹ️  No image URLs to update for realtor ${realtor.id || realtor.name || 'unknown'}`);
      }
    }

    console.log(`\n🎉 Updated ${updatedRealtors} realtors with new storage URLs`);

  } catch (error) {
    console.error('💥 Error during realtor image URL migration:', error);
  }
}

updateRealtorImages();
