import { supabase } from '../src/config/supabase.config.js';

async function testImageUpload() {
  console.log('🔍 Testing Image Upload...\n');

  // Test 1: Check authentication
  console.log('1. Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('❌ Auth Error:', authError.message);
    return;
  }
  
  if (!user) {
    console.log('❌ No user logged in');
    return;
  }
  
  console.log('✅ User authenticated:', user.email);

  // Test 2: Check user profile and role
  console.log('\n2. Checking user profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile Error:', profileError.message);
    return;
  }

  console.log('✅ User role:', profile?.role || 'No role set');

  // Test 3: List storage buckets
  console.log('\n3. Checking storage buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Buckets Error:', bucketsError.message);
    return;
  }

  console.log('✅ Available buckets:');
  buckets?.forEach(bucket => {
    console.log(`   - ${bucket.id} (public: ${bucket.public})`);
  });

  // Test 4: Test a simple upload
  console.log('\n4. Testing simple upload...');
  
  // Create a simple test file
  const testContent = 'test';
  const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('realtor-images')
    .upload(`${user.id}/test-image.txt`, testFile, { upsert: true });

  if (uploadError) {
    console.error('❌ Upload Error:', uploadError.message);
    console.error('Error details:', uploadError);
    return;
  }

  console.log('✅ Test upload successful:', uploadData.path);

  // Clean up test file
  await supabase.storage
    .from('realtor-images')
    .remove([`${user.id}/test-image.txt`]);

  console.log('\n🎉 All tests passed! Image upload should work.');
}

// Run the test
testImageUpload().catch(console.error);
