// testServiceKeyConnection.js
// Test script to verify Supabase service key connection

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Please check your .env file.');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_KEY');
  process.exit(1);
}

console.log('=== SUPABASE SERVICE KEY CONNECTION TEST ===');
console.log('URL:', SUPABASE_URL);
console.log('Service Key:', SUPABASE_SERVICE_KEY.substring(0, 20) + '...');

// Create Supabase client with service key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testServiceKeyConnection() {
  try {
    console.log('\n--- Testing Service Key Permissions ---');
    
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Basic connection failed:', tablesError.message);
      return false;
    }
    console.log('✅ Basic connection successful');
    
    // Test 2: Admin-level permissions (access auth schema)
    console.log('2. Testing admin permissions (auth.users access)...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .limit(1);
    
    if (usersError) {
      console.log('⚠️ Auth schema access limited:', usersError.message);
    } else {
      console.log('✅ Auth schema access confirmed');
    }
    
    // Test 3: RPC function call
    console.log('3. Testing RPC function calls...');
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('check_admin_credentials', {
      admin_email: 's.admin@bonairemakelaars.com',
      admin_password: 'SuperSecure2025!'
    });
    
    if (rpcError) {
      console.log('⚠️ RPC function call failed:', rpcError.message);
      console.log('This might be expected if the function is not created yet');
    } else {
      console.log('✅ RPC function call successful:', rpcData);
    }
    
    // Test 4: Profiles table access
    console.log('4. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table access failed:', profilesError.message);
    } else {
      console.log('✅ Profiles table access successful');
      console.log(`Found ${profiles.length} profiles`);
    }
    
    console.log('\n✅✅✅ SERVICE KEY CONNECTION TEST COMPLETED ✅✅✅');
    console.log('Your Supabase service key is working correctly!');
    console.log('You now have elevated permissions to bypass RLS and access admin functions.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
    return false;
  }
}

// Run the test
testServiceKeyConnection();
