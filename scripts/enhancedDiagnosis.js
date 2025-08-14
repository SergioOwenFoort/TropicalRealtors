// Test script to verify Supabase admin login using service role
// Run this after applying the fixes to check if the login issue is resolved

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Attempt to read service key from .env.service if it exists
let serviceRoleKey = null;
const serviceEnvPath = path.resolve(__dirname, '../.env.service');
if (fs.existsSync(serviceEnvPath)) {
  const serviceEnvContent = fs.readFileSync(serviceEnvPath, 'utf8');
  const match = serviceEnvContent.match(/SUPABASE_SERVICE_KEY=(.+)/);
  if (match && match[1]) {
    serviceRoleKey = match[1].trim();
  }
}

if (!supabaseUrl) {
  console.error('Error: Missing Supabase URL in .env file');
  process.exit(1);
}

console.log('🔍 Starting enhanced Supabase diagnostic tool...');

// Create Supabase clients
const anonClient = createClient(supabaseUrl, supabaseAnonKey || '');
const serviceClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

async function testSupabaseConnection() {
  console.log('\n📡 Testing Supabase connection with anon key...');
  
  try {
    // Test simple query
    const { data, error } = await anonClient.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Failed to connect with anon key:', error);
    } else {
      console.log('✅ Connected successfully with anon key');
    }
  } catch (err) {
    console.error('❌ Connection error with anon key:', err);
  }
  
  // Test service role connection if available
  if (serviceClient) {
    console.log('\n🔑 Testing connection with service role key...');
    
    try {
      const { data, error } = await serviceClient.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('❌ Failed to connect with service role key:', error);
      } else {
        console.log('✅ Connected successfully with service role key');
      }
    } catch (err) {
      console.error('❌ Connection error with service role key:', err);
    }
  } else {
    console.log('\n⚠️ No service role key found in .env.service file, skipping service role tests');
    console.log('   Create a .env.service file with SUPABASE_SERVICE_KEY=your_key to test service role access');
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testing admin login...');
  
  try {
    // Sign in as admin
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: 's.admin@bonairemakelaars.com',
      password: 'SuperSecure2025!'
    });

    if (signInError) {
      console.error('❌ Admin login failed:', signInError);
      console.log('\n🔍 Detailed error information:', JSON.stringify(signInError, null, 2));
    } else {
      console.log('✅ Admin login successful!');
      console.log('🔑 User info:', {
        id: signInData.user?.id,
        email: signInData.user?.email,
        role: signInData.user?.app_metadata?.role
      });
      
      // Test RPC function
      try {
        const { data: rpcData, error: rpcError } = await anonClient.rpc('verify_admin_policies');
        
        if (rpcError) {
          console.error('❌ Failed to run verify_admin_policies RPC:', rpcError);
        } else {
          console.log('✅ verify_admin_policies RPC executed successfully');
        }
      } catch (rpcError) {
        console.error('❌ Error calling RPC function:', rpcError);
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error during login test:', error);
  }
}

async function inspectAuthSchema() {
  if (!serviceClient) {
    console.log('\n⚠️ Cannot check auth schema without service role key');
    return;
  }
  
  console.log('\n🔍 Checking auth schema functions...');
  
  try {
    // Check if auth.uid() function exists and works
    const { data, error } = await serviceClient.rpc('check_auth_functions');
    
    if (error) {
      console.error('❌ Failed to check auth functions:', error);
      
      // Try to create helper functions in public schema
      console.log('⚙️ Attempting to create public schema helper functions...');
      
      const { error: createError } = await serviceClient.rpc('create_auth_helpers');
      
      if (createError) {
        console.error('❌ Failed to create helper functions:', createError);
      } else {
        console.log('✅ Created public schema helper functions');
      }
    } else {
      console.log('✅ Auth schema functions are working properly');
      console.log('📊 Results:', data);
    }
  } catch (err) {
    console.error('❌ Error checking auth schema:', err);
  }
}

// Run all tests
async function runAllTests() {
  await testSupabaseConnection();
  await testAdminLogin();
  await inspectAuthSchema();
  
  console.log('\n📝 Test Summary:');
  console.log('1. Anon key connection: Verify if this was successful');
  console.log('2. Service role connection: Verify if this was successful (if available)');
  console.log('3. Admin login: Verify if this was successful');
  console.log('4. RPC function: Verify if this was successful');
  
  console.log('\n🚀 Next steps:');
  console.log('1. If login failed with "Database error querying schema", run combined_auth_fix.sql with SERVICE_ROLE connection');
  console.log('2. If you see "infinite recursion detected", run final_infinite_recursion_fix.sql with ANON connection');
  console.log('3. If all else fails, create a service_role client in your application for admin operations');
}

// Before we run tests, create the helper functions if service key is available
async function createHelperFunctions() {
  if (!serviceClient) return;
  
  console.log('\n⚙️ Creating helper functions for testing...');
  
  try {
    // Create a function to check auth schema functions
    const checkAuthFnSql = `
    CREATE OR REPLACE FUNCTION public.check_auth_functions()
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result jsonb;
    BEGIN
      result := jsonb_build_object(
        'auth_uid_exists', (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))),
        'auth_role_exists', (SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'role' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')))
      );
      
      RETURN result;
    END;
    $$;
    `;
    
    // Create a function to create auth helpers
    const createHelpersSql = `
    CREATE OR REPLACE FUNCTION public.create_auth_helpers()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Create get_auth_uid replacement
      CREATE OR REPLACE FUNCTION public.get_auth_user_id()
      RETURNS uuid
      LANGUAGE sql STABLE
      SECURITY DEFINER
      AS $inner$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.sub', true), ''),
          NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'sub'
        )::uuid;
      $inner$;
      
      -- Create get_auth_role replacement
      CREATE OR REPLACE FUNCTION public.get_auth_role()
      RETURNS text
      LANGUAGE sql STABLE
      SECURITY DEFINER
      AS $inner$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.role', true), ''),
          NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'role',
          'authenticated'
        )::text;
      $inner$;
      
      -- Grant permissions
      GRANT EXECUTE ON FUNCTION public.get_auth_user_id() TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon, authenticated, service_role;
    END;
    $$;
    `;
    
    // Execute SQL
    const { error: error1 } = await serviceClient.rpc('check_auth_functions');
    
    if (error1 && error1.message.includes('does not exist')) {
      const { error: error2 } = await serviceClient.sql(checkAuthFnSql);
      if (error2) {
        console.error('❌ Failed to create check_auth_functions:', error2);
      } else {
        console.log('✅ Created check_auth_functions');
      }
    }
    
    const { error: error3 } = await serviceClient.rpc('create_auth_helpers');
    
    if (error3 && error3.message.includes('does not exist')) {
      const { error: error4 } = await serviceClient.sql(createHelpersSql);
      if (error4) {
        console.error('❌ Failed to create create_auth_helpers:', error4);
      } else {
        console.log('✅ Created create_auth_helpers');
      }
    }
  } catch (err) {
    console.error('❌ Error creating helper functions:', err);
  }
}

// Run everything
(async () => {
  await createHelperFunctions();
  await runAllTests();
})();
