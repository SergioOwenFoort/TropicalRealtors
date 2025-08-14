// Full Supabase Test including Admin Login
// This will test if the database connection is working and if admin login works

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fullTest() {
  console.log('🔍 Running complete Supabase test...');
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log('🔑 Using anon key: ✓\n');

  try {
    console.log('1️⃣ Testing simple profiles query...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error accessing profiles table:', error);
    } else {
      console.log('✅ Successfully queried profiles table');
      console.log(`📊 Found ${profiles.length} profiles`);
      
      if (profiles.length > 0) {
        console.log('👤 Profiles:', profiles.map(p => ({
          id: p.id.substring(0, 8) + '...',
          email: p.email,
          role: p.role
        })));
      }
    }

    console.log('\n2️⃣ Testing admin login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });

    if (signInError) {
      console.error('❌ Admin login failed:', signInError);
    } else {
      console.log('✅ Admin login successful!');
      console.log('👤 Admin details:', {
        id: signInData.user.id.substring(0, 8) + '...',
        email: signInData.user.email,
        role: signInData.user?.app_metadata?.role || 'No role set'
      });
      
      console.log('\n3️⃣ Checking admin access to profiles...');
      const { data: profilesAfterLogin, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
        
      if (profilesError) {
        console.error('❌ Error accessing profiles after login:', profilesError);
      } else {
        console.log('✅ Successfully accessed profiles after login');
        console.log(`📊 Found ${profilesAfterLogin.length} profiles`);
      }
      
      // Try to sign out
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('❌ Error signing out:', signOutError);
      } else {
        console.log('✅ Successfully signed out');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
fullTest();
