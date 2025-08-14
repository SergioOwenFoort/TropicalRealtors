// Test script to verify Supabase admin login works
// Run this after applying the fixes to check if the login issue is resolved

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
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  console.log('🔑 Testing admin login...');
  
  try {
    // Sign in as admin
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });

    if (signInError) {
      console.error('❌ Admin login failed:', signInError);
      return;
    }

    console.log('✅ Admin login successful!');
    
    // Get admin session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('🔍 Session information:', {
      user: sessionData.session?.user?.email,
      role: sessionData.session?.user?.app_metadata?.role
    });

    // Test querying profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 's.admin@bonairemakelaars.com')
      .single();

    if (profileError) {
      console.error('❌ Failed to query admin profile:', profileError);
    } else {
      console.log('✅ Admin profile retrieved successfully:', {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role
      });
    }

    // Test RPC function
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('verify_admin_policies');
      
      if (rpcError) {
        console.error('❌ Failed to run verify_admin_policies RPC:', rpcError);
      } else {
        console.log('✅ verify_admin_policies RPC executed successfully');
      }
    } catch (rpcError) {
      console.error('❌ Error calling RPC function:', rpcError);
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('🔐 Admin signed out');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error);
  }
}

// Run the test
testAdminLogin();
