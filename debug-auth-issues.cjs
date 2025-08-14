// Check authentication status and debug login issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔐 Debugging authentication issues...\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log(`   Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   Service Key: ${supabaseServiceKey ? '✅ Set (length: ' + supabaseServiceKey.length + ')' : '❌ Missing'}`);
console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Set (length: ' + supabaseAnonKey.length + ')' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAuth() {
  try {
    // Check if users exist in auth.users
    console.log('\n2️⃣ Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth.users:', authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Created: ${user.created_at} - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    }
    
    // Check profiles table
    console.log('\n3️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error accessing profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} - ${profile.full_name}`);
      });
    }
    
    // Test a login attempt with service key
    console.log('\n4️⃣ Testing authentication with known user...');
    if (authUsers && authUsers.users.length > 0) {
      const testUser = authUsers.users[0];
      console.log(`   Testing with user: ${testUser.email}`);
      
      // Try to get user by ID
      const { data: userById, error: userByIdError } = await supabase.auth.admin.getUserById(testUser.id);
      
      if (userByIdError) {
        console.error('❌ Error getting user by ID:', userByIdError);
      } else {
        console.log('✅ Successfully retrieved user by ID');
        console.log(`   User status: ${userById.user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);
        console.log(`   Last sign in: ${userById.user.last_sign_in_at || 'Never'}`);
      }
    }
    
    // Check JWT settings (this requires admin access)
    console.log('\n5️⃣ Testing JWT token generation...');
    try {
      // Create a temporary session to test JWT
      const testEmail = 'test@example.com';
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'temppassword123',
        email_confirm: true
      });
      
      if (signUpError) {
        console.error('❌ Error creating test user:', signUpError);
      } else {
        console.log('✅ Created test user successfully');
        
        // Try to sign in as the test user using anon client
        const anonClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
          email: testEmail,
          password: 'temppassword123'
        });
        
        if (signInError) {
          console.error('❌ Sign in failed:', signInError);
          console.log('💡 This indicates JWT or auth configuration issues');
        } else {
          console.log('✅ Sign in successful! Auth is working.');
          
          // Clean up test user
          await supabase.auth.admin.deleteUser(signUpData.user.id);
          console.log('🧹 Cleaned up test user');
        }
      }
    } catch (err) {
      console.error('❌ JWT test failed:', err);
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

debugAuth();
