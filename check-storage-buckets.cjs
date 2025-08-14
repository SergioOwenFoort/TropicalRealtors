const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Old database connection
const oldSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY5MjM5MywiZXhwIjoyMDUwMjY4MzkzfQ.r6Zl9wJtXQ8V_3i2A7v-ZwGZe8_KIRaP_cG1L4jGz9Q'
);

// New database connection  
const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function checkStorageBuckets() {
  console.log('🪣 Checking storage buckets...\n');

  try {
    // Check old database buckets
    console.log('📋 Old Database Buckets:');
    const { data: oldBuckets, error: oldError } = await oldSupabase.storage.listBuckets();
    
    if (oldError) {
      console.log('❌ Error accessing old database buckets:', oldError.message);
    } else {
      console.log(`✅ Found ${oldBuckets?.length || 0} buckets in old database:`);
      oldBuckets?.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    console.log('\n📋 New Database Buckets:');
    const { data: newBuckets, error: newError } = await newSupabase.storage.listBuckets();
    
    if (newError) {
      console.log('❌ Error accessing new database buckets:', newError.message);
    } else {
      console.log(`✅ Found ${newBuckets?.length || 0} buckets in new database:`);
      newBuckets?.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    // Check files in each old bucket
    if (oldBuckets && oldBuckets.length > 0) {
      console.log('\n📁 Files in old database buckets:');
      for (const bucket of oldBuckets) {
        console.log(`\n🪣 Bucket: ${bucket.name}`);
        try {
          const { data: files, error: filesError } = await oldSupabase.storage
            .from(bucket.name)
            .list('', { limit: 10 });

          if (filesError) {
            console.log(`   ❌ Error listing files: ${filesError.message}`);
          } else {
            console.log(`   ✅ ${files?.length || 0} files found`);
            files?.slice(0, 5).forEach(file => {
              console.log(`      - ${file.name} (${Math.round(file.metadata?.size / 1024) || 0}KB)`);
            });
            if (files && files.length > 5) {
              console.log(`      ... and ${files.length - 5} more files`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('💥 Error checking storage buckets:', error);
  }
}

checkStorageBuckets();
