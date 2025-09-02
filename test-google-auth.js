import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testGoogleAuth() {
  console.log('🔍 Testing Google Authentication Configuration...\n');
  
  try {
    // Test if we can initiate Google OAuth (this won't complete in Node.js but will test the config)
    console.log('1️⃣ Testing Google OAuth initiation...');
    
    // This should work if Google is properly configured in Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5174/auth/callback',
        skipBrowserRedirect: true // Important for testing in Node.js
      }
    });
    
    if (error) {
      console.error('❌ Google OAuth configuration error:', error.message);
      
      if (error.message.includes('provider not enabled')) {
        console.log('\n📋 To fix this:');
        console.log('   1. Go to your Supabase Dashboard');
        console.log('   2. Navigate to Authentication > Providers');
        console.log('   3. Enable Google provider');
        console.log('   4. Add your Google Client ID and Secret');
      }
      
      return false;
    }
    
    if (data.url) {
      console.log('✅ Google OAuth is properly configured!');
      console.log('   OAuth URL would be:', data.url.substring(0, 80) + '...');
      console.log('\n🎉 Users can now sign in with Google!');
      return true;
    } else {
      console.log('⚠️ OAuth initiated but no URL returned');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Also test basic auth functionality
async function testBasicAuth() {
  console.log('\n2️⃣ Testing basic Supabase auth functionality...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session check failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase auth is working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ Basic auth test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running Google Authentication Tests\n');
  console.log('📊 Configuration Status:');
  console.log(`   Supabase URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`   Anon Key: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`);
  console.log(`   Google Client ID: ${process.env.VITE_GOOGLE_CLIENT_ID || 'Not configured yet'}`);
  console.log('');
  
  const basicAuthOk = await testBasicAuth();
  const googleAuthOk = await testGoogleAuth();
  
  console.log('\n📋 Summary:');
  console.log(`   Basic Auth: ${basicAuthOk ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Google OAuth: ${googleAuthOk ? '✅ Configured' : '❌ Needs Setup'}`);
  
  if (!googleAuthOk) {
    console.log('\n🛠️ Next Steps:');
    console.log('   1. Follow the Google OAuth setup guide');
    console.log('   2. Configure Google provider in Supabase Dashboard');
    console.log('   3. Add credentials to .env file');
    console.log('   4. Re-run this test');
  }
}

runTests();
