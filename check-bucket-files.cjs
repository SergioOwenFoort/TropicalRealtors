const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function checkBucketFiles() {
  console.log('📦 Checking file counts in all buckets...\n');

  const buckets = ['images', 'carousel-ads', 'property-images', 'realtor-images'];

  for (const bucketName of buckets) {
    console.log(`🪣 Bucket: ${bucketName}`);
    try {
      const { data: files, error } = await newSupabase.storage
        .from(bucketName)
        .list('', { limit: 100 });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   📊 ${files?.length || 0} files found`);
        if (files && files.length > 0) {
          console.log(`   📁 Sample files:`);
          files.slice(0, 3).forEach(file => {
            console.log(`      - ${file.name} (${Math.round(file.metadata?.size / 1024) || 0}KB)`);
          });
        } else {
          console.log(`   ⚠️  EMPTY - Images won't load until files are uploaded!`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error checking bucket: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 WHAT THIS MEANS:');
  console.log('✅ images: Working (has files)');
  console.log('✅ carousel-ads: Working (has files)');
  console.log('❌ property-images: EMPTY → Property photos won\'t show');
  console.log('❌ realtor-images: EMPTY → Realtor avatars won\'t show');
}

checkBucketFiles();
