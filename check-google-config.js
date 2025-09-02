import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSupabaseConfig() {
  console.log('🔍 Checking Supabase Configuration for Google OAuth...\n');
  
  console.log('📊 Current Configuration:');
  console.log(`   Supabase URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`   Expected Redirect URI: ${process.env.VITE_SUPABASE_URL}/auth/v1/callback`);
  console.log('');
  
  console.log('🎯 Required Google Cloud Console Settings:');
  console.log('   📍 Authorized redirect URIs:');
  console.log(`      ✅ ${process.env.VITE_SUPABASE_URL}/auth/v1/callback`);
  console.log('      ✅ http://localhost:5174/auth/callback (for development)');
  console.log('');
  
  console.log('🔧 Steps to Fix:');
  console.log('   1. Go to Google Cloud Console');
  console.log('   2. Select your project');
  console.log('   3. Navigate to APIs & Services > Credentials');
  console.log('   4. Edit your OAuth 2.0 Client ID');
  console.log('   5. Add the redirect URI above');
  console.log('   6. Save and wait 5-10 minutes');
  console.log('');
  
  try {
    // Test OAuth initiation to see current error
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.VITE_SUPABASE_URL}/auth/v1/callback`,
        skipBrowserRedirect: true
      }
    });
    
    if (error) {
      console.log('⚠️ Current OAuth Status:', error.message);
    } else if (data.url) {
      console.log('✅ OAuth URL generation works');
      console.log('   The issue is with Google Cloud Console configuration');
    }
    
  } catch (err) {
    console.log('❌ OAuth test error:', err.message);
  }
}

checkSupabaseConfig();
