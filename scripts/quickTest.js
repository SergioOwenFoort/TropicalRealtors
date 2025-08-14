// Quick Supabase Connection Test
// This will test if the database connection is working and if the profiles
// table can be queried without the infinite recursion error

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

async function quickTest() {
  console.log('🔍 Running quick connection test...');
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log('🔑 Using anon key: ✓\n');

  try {
    console.log('1️⃣ Testing simple profiles query...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing profiles table:', error);
    } else {
      console.log('✅ Successfully queried profiles table');
      console.log(`📊 Found ${profiles.length} profiles`);
      
      if (profiles.length > 0) {
        console.log('👤 First profile:', {
          id: profiles[0].id.substring(0, 8) + '...',
          email: profiles[0].email,
          role: profiles[0].role
        });
      }
    }

    console.log('\n2️⃣ Testing admin profile specifically...');
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 's.admin@bonairemakelaars.com')
      .single();

    if (adminError) {
      console.error('❌ Error accessing admin profile:', adminError);
    } else {
      console.log('✅ Successfully found admin profile');
      console.log('👤 Admin details:', {
        id: adminProfile.id.substring(0, 8) + '...',
        email: adminProfile.email,
        role: adminProfile.role
      });
    }

    console.log('\n3️⃣ Testing auth session...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Error getting auth session:', authError);
    } else if (!authData.session) {
      console.log('ℹ️ No active session (not logged in)');
    } else {
      console.log('✅ Auth session is active');
      console.log('👤 Logged in as:', authData.session.user.email);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
quickTest();
