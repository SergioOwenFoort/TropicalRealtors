const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function createStorageBuckets() {
  console.log('🪣 Creating storage buckets in new database...\n');

  // Common bucket configurations for real estate websites
  const bucketsToCreate = [
    {
      name: 'images',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    },
    {
      name: 'property-images', 
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    },
    {
      name: 'carousel-images',
      public: true, 
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    },
    {
      name: 'documents',
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 100 * 1024 * 1024 // 100MB
    }
  ];

  for (const bucketConfig of bucketsToCreate) {
    console.log(`📦 Creating bucket: ${bucketConfig.name}`);
    
    try {
      // Create the bucket
      const { data, error } = await newSupabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
        fileSizeLimit: bucketConfig.fileSizeLimit
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Bucket '${bucketConfig.name}' already exists`);
        } else {
          console.log(`   ❌ Error creating bucket '${bucketConfig.name}':`, error.message);
        }
      } else {
        console.log(`   ✅ Successfully created bucket '${bucketConfig.name}'`);
      }

      // Set up RLS policies for the bucket
      console.log(`   🔒 Setting up policies for '${bucketConfig.name}'...`);
      
      // Note: Policies are typically set up via SQL, not the JS client
      console.log(`   ℹ️  You may need to set up RLS policies manually in the dashboard`);

    } catch (error) {
      console.log(`   ❌ Error creating bucket '${bucketConfig.name}':`, error.message);
    }
  }

  // Verify buckets were created
  console.log('\n📋 Verifying created buckets...');
  try {
    const { data: buckets, error } = await newSupabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Error listing buckets:', error.message);
    } else {
      console.log(`✅ Total buckets in new database: ${buckets?.length || 0}`);
      buckets?.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
  } catch (error) {
    console.log('❌ Error verifying buckets:', error.message);
  }

  console.log('\n🎉 Bucket creation completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to your old database Storage section');
  console.log('2. Download files from each bucket manually');
  console.log('3. Upload files to corresponding buckets in new database');
  console.log('4. Update any hardcoded URLs in your application');
}

createStorageBuckets();
