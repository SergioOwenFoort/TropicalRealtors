// Test admin login now that RLS is disabled
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  console.log('🔍 Testing admin login after RLS has been disabled...');
  
  try {
    // First check if we can access profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
      
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
    } else {
      console.log('✅ Successfully accessed profiles table');
      console.log(`📊 Found ${profiles.length} profiles`);
    }
    
    // Now try logging in as admin
    console.log('\n🔐 Attempting admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });
    
    if (loginError) {
      console.error('❌ Admin login failed:', loginError);
    } else {
      console.log('✅ Admin login successful!');
      console.log('👤 User details:', {
        id: loginData.user?.id,
        email: loginData.user?.email,
        role: loginData.user?.app_metadata?.role
      });
      
      // Try to fetch admin profile
      const { data: adminProfile, error: adminProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 's.admin@bonairemakelaars.com')
        .single();
        
      if (adminProfileError) {
        console.error('❌ Error fetching admin profile:', adminProfileError);
      } else {
        console.log('✅ Admin profile found:', {
          id: adminProfile.id,
          email: adminProfile.email,
          role: adminProfile.role
        });
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Run the test
testAdminLogin();
