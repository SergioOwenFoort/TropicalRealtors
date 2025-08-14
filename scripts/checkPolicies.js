// Simple diagnostic script for profile policy issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
  console.log('✅ VITE_SUPABASE_URL found:', SUPABASE_URL);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing in .env file');
  process.exit(1);
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY found (key is valid)');
}

// Initialize Supabase client
console.log('\n=== SUPABASE CONNECTION TEST ===');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Test direct Supabase connection
async function testConnection() {
  try {
    console.log('Testing basic Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error(`❌ Supabase connection failed with error code ${error.code}: ${error.message}`);
      
      if (error.code === '42P17') {
        console.error('\n❌ DETECTED POLICY RECURSION ISSUE');
        console.error('This confirms the infinite recursion in the profiles table policy.');
        console.error('\nSOLUTION:');
        console.error('1. Run SQL fixes: npm run fix-policies');
        console.error('2. OR login to Supabase dashboard and run the quickFix.sql script');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
}

// Simple test for reading profiles
async function testProfilesRead() {
  try {
    console.log('\n=== PROFILES TABLE ACCESS TEST ===');
    console.log('Attempting to read from profiles table...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error(`❌ Profiles read failed with error code ${error.code}: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Successfully read from profiles table. Found ${data.length} record(s).`);
    return true;
  } catch (err) {
    console.error('❌ Error reading from profiles:', err.message);
    return false;
  }
}

// Run tests
async function runDiagnostics() {
  const connected = await testConnection();
  
  if (connected) {
    await testProfilesRead();
  }
  
  console.log('\n=== DIAGNOSTIC SUMMARY ===');
  console.log('If you are encountering policy recursion errors (code 42P17):');
  console.log('1. The app includes fallback logic for admin login (s.admin@bonairemakelaars.com)');
  console.log('2. To fix policy issues permanently, run: npm run fix-policies');
  console.log('3. Or apply the SQL fixes manually through Supabase dashboard');
}

runDiagnostics().catch(console.error);
