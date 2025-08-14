// Diagnostic script to verify project setup and Supabase connection

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Check environment
console.log('\n=== ENVIRONMENT CHECK ===');
if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL is missing in .env file');
  process.exit(1);
} else {
  console.log('✅ VITE_SUPABASE_URL found');
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing in .env file');
  process.exit(1);
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY found');
}

// Check for problematic whitespace or line breaks in the anon key
if (SUPABASE_ANON_KEY.includes('\n') || SUPABASE_ANON_KEY.includes('\r')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY contains line breaks, which is invalid');
  console.log('   Please ensure the key is on a single line in your .env file');
  process.exit(1);
}

// Initialize Supabase client
console.log('\n=== SUPABASE CONNECTION TEST ===');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Check for project name consistency
console.log('\n=== PROJECT NAME CONSISTENCY ===');
const packageJsonPath = path.resolve('./package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.name === 'bonairemakelaars' || packageJson.name === 'bonairemakelaars.com') {
    console.log(`✅ package.json project name is correctly set to: ${packageJson.name}`);
  } else {
    console.error(`❌ package.json project name is incorrectly set to: ${packageJson.name}`);
    console.log('   Should be "bonairemakelaars" or "bonairemakelaars.com"');
  }
} else {
  console.error('❌ Could not find package.json file');
}

// Test Supabase connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
}

// Check for admin user in database
async function checkAdmin() {
  try {
    // Try to find admin profile
    const { data, error } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('role', 'admin');
    
    if (error) {
      console.error('❌ Could not check for admin users:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} admin users:`);
      data.forEach(user => {
        console.log(`   - ${user.email || 'No email'} (${user.role})`);
      });
      
      // Check for the specific admin user
      const specificAdmin = data.find(user => user.email === 's.admin@bonairemakelaars.com');
      if (specificAdmin) {
        console.log('✅ Main admin account (s.admin@bonairemakelaars.com) found');
      } else {
        console.log('⚠️ Main admin account (s.admin@bonairemakelaars.com) not found');
      }
    } else {
      console.log('⚠️ No admin users found in the database');
    }
  } catch (err) {
    console.error('❌ Error checking admin users:', err.message);
  }
}

// Check database tables
async function checkDatabaseTables() {
  try {
    console.log('\n=== DATABASE TABLES ===');
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count');
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists');
    }
    
    // Check properties table
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('count');
    
    if (propertiesError) {
      console.error('❌ Properties table error:', propertiesError.message);
    } else {
      console.log('✅ Properties table exists');
    }
    
    // Check page_content table
    const { data: pageContent, error: pageContentError } = await supabase
      .from('page_content')
      .select('count');
    
    if (pageContentError) {
      console.error('❌ Page_content table error:', pageContentError.message);
    } else {
      console.log('✅ Page_content table exists');
    }
    
  } catch (err) {
    console.error('❌ Error checking database tables:', err.message);
  }
}

// Run tests
async function runDiagnostics() {
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n=== ADMIN USER CHECK ===');
    await checkAdmin();
    await checkDatabaseTables();
  }
  
  console.log('\n=== DIAGNOSTIC SUMMARY ===');
  if (connected) {
    console.log('✅ Basic checks passed. The application should be able to connect to Supabase.');
    console.log('   If you are still experiencing issues, please check:');
    console.log('   1. RLS policies in Supabase dashboard');
    console.log('   2. Network connectivity and firewall settings');
    console.log('   3. Browser console for CORS errors');
  } else {
    console.log('❌ Supabase connection failed. Please fix the issues above before continuing.');
  }
}

runDiagnostics().catch(console.error);
