const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function updateStorageUrls() {
  console.log('🔄 Updating storage URLs in database records...\n');

  const oldBaseUrl = 'https://imhtjggudeidvmpgwjho.supabase.co/storage/v1/object/public';
  const newBaseUrl = 'https://pwmsihnepjvzwbrgrbdn.supabase.co/storage/v1/object/public';

  try {
    // 1. Update properties table - images column
    console.log('📋 Updating properties images...');
    const { data: properties, error: propError } = await newSupabase
      .from('properties')
      .select('id, images');

    if (propError) {
      console.log('❌ Error fetching properties:', propError.message);
    } else {
      console.log(`✅ Found ${properties?.length || 0} properties to check`);
      
      let updatedProperties = 0;
      for (const property of properties || []) {
        if (property.images) {
          let needsUpdate = false;
          let updatedImages;

          if (typeof property.images === 'string') {
            // Handle comma-separated string format
            if (property.images.includes(oldBaseUrl)) {
              updatedImages = property.images.replace(new RegExp(oldBaseUrl, 'g'), newBaseUrl);
              needsUpdate = true;
            }
          } else if (Array.isArray(property.images)) {
            // Handle array format
            updatedImages = property.images.map(img => 
              typeof img === 'string' && img.includes(oldBaseUrl) 
                ? img.replace(oldBaseUrl, newBaseUrl)
                : img
            );
            needsUpdate = property.images.some(img => 
              typeof img === 'string' && img.includes(oldBaseUrl)
            );
          }

          if (needsUpdate) {
            const { error: updateError } = await newSupabase
              .from('properties')
              .update({ images: updatedImages })
              .eq('id', property.id);

            if (updateError) {
              console.log(`   ❌ Error updating property ${property.id}:`, updateError.message);
            } else {
              updatedProperties++;
              console.log(`   ✅ Updated property ${property.id}`);
            }
          }
        }
      }
      console.log(`✅ Updated ${updatedProperties} properties\n`);
    }

    // 2. Update carousel_slides table - image_url column
    console.log('📋 Updating carousel slides...');
    const { data: slides, error: slideError } = await newSupabase
      .from('carousel_slides')
      .select('id, image_url');

    if (slideError) {
      console.log('❌ Error fetching carousel slides:', slideError.message);
    } else {
      console.log(`✅ Found ${slides?.length || 0} carousel slides to check`);
      
      let updatedSlides = 0;
      for (const slide of slides || []) {
        if (slide.image_url && slide.image_url.includes(oldBaseUrl)) {
          const updatedUrl = slide.image_url.replace(oldBaseUrl, newBaseUrl);
          
          const { error: updateError } = await newSupabase
            .from('carousel_slides')
            .update({ image_url: updatedUrl })
            .eq('id', slide.id);

          if (updateError) {
            console.log(`   ❌ Error updating slide ${slide.id}:`, updateError.message);
          } else {
            updatedSlides++;
            console.log(`   ✅ Updated slide ${slide.id}`);
          }
        }
      }
      console.log(`✅ Updated ${updatedSlides} carousel slides\n`);
    }

    // 3. Update realtors table - avatar/image columns
    console.log('📋 Updating realtors...');
    const { data: realtors, error: realtorError } = await newSupabase
      .from('realtors')
      .select('id, image, avatar_url');

    if (realtorError) {
      console.log('❌ Error fetching realtors:', realtorError.message);
    } else {
      console.log(`✅ Found ${realtors?.length || 0} realtors to check`);
      
      let updatedRealtors = 0;
      for (const realtor of realtors || []) {
        let updates = {};
        let needsUpdate = false;

        if (realtor.image && realtor.image.includes(oldBaseUrl)) {
          updates.image = realtor.image.replace(oldBaseUrl, newBaseUrl);
          needsUpdate = true;
        }

        if (realtor.avatar_url && realtor.avatar_url.includes(oldBaseUrl)) {
          updates.avatar_url = realtor.avatar_url.replace(oldBaseUrl, newBaseUrl);
          needsUpdate = true;
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
            console.log(`   ✅ Updated realtor ${realtor.id}`);
          }
        }
      }
      console.log(`✅ Updated ${updatedRealtors} realtors\n`);
    }

    // 4. Update profiles table - avatar_url column
    console.log('📋 Updating profiles...');
    const { data: profiles, error: profileError } = await newSupabase
      .from('profiles')
      .select('id, avatar_url');

    if (profileError) {
      console.log('❌ Error fetching profiles:', profileError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles to check`);
      
      let updatedProfiles = 0;
      for (const profile of profiles || []) {
        if (profile.avatar_url && profile.avatar_url.includes(oldBaseUrl)) {
          const updatedUrl = profile.avatar_url.replace(oldBaseUrl, newBaseUrl);
          
          const { error: updateError } = await newSupabase
            .from('profiles')
            .update({ avatar_url: updatedUrl })
            .eq('id', profile.id);

          if (updateError) {
            console.log(`   ❌ Error updating profile ${profile.id}:`, updateError.message);
          } else {
            updatedProfiles++;
            console.log(`   ✅ Updated profile ${profile.id}`);
          }
        }
      }
      console.log(`✅ Updated ${updatedProfiles} profiles\n`);
    }

    console.log('🎉 Storage URL migration completed!');
    console.log('\n📝 Summary:');
    console.log('- All database records have been updated to use new storage URLs');
    console.log('- Make sure you have uploaded all files to the new buckets');
    console.log('- Test your application to ensure images load correctly');

  } catch (error) {
    console.error('💥 Error during URL migration:', error);
  }
}

updateStorageUrls();
