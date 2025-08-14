const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function diagnoseImageIssues() {
  console.log('🔍 Diagnosing image loading issues...\n');

  try {
    // 1. Check what buckets exist in new database
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketError } = await newSupabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error listing buckets:', bucketError.message);
      return;
    }

    console.log(`✅ Found ${buckets?.length || 0} buckets:`);
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // 2. Check files in each bucket
    console.log('\n📁 Checking files in each bucket...');
    for (const bucket of buckets || []) {
      console.log(`\n🪣 Bucket: ${bucket.name}`);
      try {
        const { data: files, error: filesError } = await newSupabase.storage
          .from(bucket.name)
          .list('', { limit: 10 });

        if (filesError) {
          console.log(`   ❌ Error listing files: ${filesError.message}`);
        } else {
          console.log(`   📊 ${files?.length || 0} files found`);
          if (files && files.length > 0) {
            files.slice(0, 3).forEach(file => {
              console.log(`      - ${file.name} (${Math.round(file.metadata?.size / 1024) || 0}KB)`);
            });
            if (files.length > 3) {
              console.log(`      ... and ${files.length - 3} more files`);
            }
          } else {
            console.log('   ⚠️  Bucket is empty - this is likely the issue!');
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // 3. Check database image references
    console.log('\n🗄️  Checking database image references...');
    
    // Check carousel slides
    const { data: slides, error: slideError } = await newSupabase
      .from('carousel_slides')
      .select('id, title, image_url');

    if (slideError) {
      console.log('❌ Error fetching carousel slides:', slideError.message);
    } else {
      console.log(`\n🎠 Carousel slides (${slides?.length || 0} found):`);
      slides?.forEach(slide => {
        console.log(`   - ${slide.title}: ${slide.image_url}`);
      });
    }

    // Check realtors
    const { data: realtors, error: realtorError } = await newSupabase
      .from('realtors')
      .select('id, name, avatar_url');

    if (realtorError) {
      console.log('❌ Error fetching realtors:', realtorError.message);
    } else {
      console.log(`\n👨‍💼 Realtors (${realtors?.length || 0} found):`);
      realtors?.forEach(realtor => {
        console.log(`   - ${realtor.name}: ${realtor.avatar_url || 'No avatar'}`);
      });
    }

    // Check properties
    const { data: properties, error: propError } = await newSupabase
      .from('properties')
      .select('id, title, images')
      .limit(3);

    if (propError) {
      console.log('❌ Error fetching properties:', propError.message);
    } else {
      console.log(`\n🏠 Properties (showing first 3 of ${properties?.length || 0}):`);
      properties?.forEach(property => {
        const imageCount = Array.isArray(property.images) ? property.images.length : 
                          typeof property.images === 'string' ? property.images.split(',').length : 0;
        console.log(`   - ${property.title}: ${imageCount} images`);
        if (property.images) {
          const firstImage = Array.isArray(property.images) ? property.images[0] : 
                           typeof property.images === 'string' ? property.images.split(',')[0] : '';
          console.log(`     First image: ${firstImage}`);
        }
      });
    }

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('=' .repeat(50));
    console.log('1. Check if buckets have files (if empty, files need to be uploaded)');
    console.log('2. Check if database URLs match bucket structure');
    console.log('3. Check if bucket permissions allow public access');
    console.log('\n💡 LIKELY SOLUTION:');
    console.log('You need to manually transfer files from old to new storage buckets!');

  } catch (error) {
    console.error('💥 Error during diagnosis:', error);
  }
}

diagnoseImageIssues();
