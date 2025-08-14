// diagnoseAuthIssues.js - A script to diagnose Supabase auth issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Attempt to load environment variables from multiple sources
dotenv.config();

// Function to try reading Supabase config from TS file
async function tryReadSupabaseConfig() {
  try {
    console.log('Looking for Supabase config in src/config/supabase.config.ts...');
    const configContent = fs.readFileSync('./src/config/supabase.config.ts', 'utf8');
    
    // Extract URL using regex
    const urlMatch = configContent.match(/supabaseUrl\s*=\s*(import\.meta\.env\.VITE_SUPABASE_URL|['"`](.*?)['"`])/);
    
    // Extract key using regex
    const keyMatch = configContent.match(/supabaseAnonKey\s*=\s*(import\.meta\.env\.VITE_SUPABASE_ANON_KEY|['"`](.*?)['"`])/);
    
    if (urlMatch && urlMatch[2]) {
      console.log('Found hardcoded Supabase URL in config file');
      return { 
        url: urlMatch[2],
        key: keyMatch && keyMatch[2] ? keyMatch[2] : null 
      };
    }
    
    console.log('Config file refers to environment variables, continuing search...');
    return null;
  } catch (error) {
    console.log('Could not read Supabase config file:', error.message);
    return null;
  }
}

// Initialize variables
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = 's.admin@bonairemakelaars.com';
const adminPassword = 'SuperSecure2025!';

// If env vars are not found, try to read from config
if (!supabaseUrl || !supabaseKey) {
  console.log('Environment variables not found, checking alternate sources...');
  
  // Try to read from .env file directly
  try {
    console.log('Looking for .env file...');
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('Found .env file');
    
    const lines = envContent.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) {
        supabaseUrl = value.trim();
        console.log('Found Supabase URL in .env file');
      }
      if (key === 'VITE_SUPABASE_ANON_KEY' && !supabaseKey) {
        supabaseKey = value.trim();
        console.log('Found Supabase key in .env file');
      }
    });
  } catch (error) {
    console.log('Could not find or read .env file, checking alternatives...');
    
    // Check for .env.local, .env.development, etc.
    const envFiles = ['.env.local', '.env.development', '.env.production'];
    for (const file of envFiles) {
      try {
        if (fs.existsSync(file)) {
          console.log(`Found ${file}, checking for Supabase credentials...`);
          const envContent = fs.readFileSync(file, 'utf8');
          const lines = envContent.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) {
              supabaseUrl = value.trim();
              console.log(`Found Supabase URL in ${file}`);
            }
            if (key === 'VITE_SUPABASE_ANON_KEY' && !supabaseKey) {
              supabaseKey = value.trim();
              console.log(`Found Supabase key in ${file}`);
            }
          });
        }
      } catch (err) {
        console.log(`Error reading ${file}:`, err.message);
      }
    }
    
    // If still not found, try to read from config file
    if (!supabaseUrl || !supabaseKey) {
      const configResult = await tryReadSupabaseConfig();
      if (configResult) {
        supabaseUrl = configResult.url || supabaseUrl;
        supabaseKey = configResult.key || supabaseKey;
      }
    }
  }
}

// Final check if we have what we need
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Could not find Supabase credentials!');
  console.error('Please ensure your .env file or supabase.config.ts has the correct values:');
  console.error('- VITE_SUPABASE_URL: The URL of your Supabase project');
  console.error('- VITE_SUPABASE_ANON_KEY: The anon/public key of your Supabase project');
  console.error('\nYou can find these values in the Supabase dashboard under:');
  console.error('Project Settings > API > Project URL and Project API keys');
  
  // Interactive mode - allow user to enter values
  console.log('\n📝 Would you like to enter these values manually for this diagnostic run? (y/n)');
  
  // Note: This would require user input, but for a script we'll exit
  console.log('Since this is running as a script, we cannot prompt for input.');
  console.log('Please update the .env file with the correct values and try again.');
  
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Diagnostic report structure
const diagnosticReport = {
  timestamp: new Date().toISOString(),
  environment: {
    supabaseUrl: supabaseUrl,
    supabaseKeyPresent: !!supabaseKey,
    nodeVersion: process.version,
  },
  connectionStatus: null,
  authStatus: null,
  tables: {},
  adminLogin: {
    attempted: false,
    success: false,
    error: null,
  },
  profiles: {
    adminProfileExists: false,
    adminProfileDetails: null,
  }
};

async function diagnoseAuth() {
  console.log('🔍 Starting Supabase authentication diagnostic...\n');
  
  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing Supabase connection...');
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('❌ Connection test failed:', error.message);
        diagnosticReport.connectionStatus = 'Failed: ' + error.message;
      } else {
        console.log('✅ Connection successful');
        diagnosticReport.connectionStatus = 'Success';
      }
    } catch (error) {
      console.error('❌ Connection error:', error.message);
      diagnosticReport.connectionStatus = 'Error: ' + error.message;
    }
    
    // 2. Check auth service
    console.log('\n2️⃣ Testing authentication service...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Auth service test failed:', error.message);
        diagnosticReport.authStatus = 'Failed: ' + error.message;
      } else {
        console.log('✅ Auth service is working');
        diagnosticReport.authStatus = 'Success';
      }
    } catch (error) {
      console.error('❌ Auth service error:', error.message);
      diagnosticReport.authStatus = 'Error: ' + error.message;
    }
    
    // 3. Check tables
    console.log('\n3️⃣ Checking database tables...');
    const tablesToCheck = ['profiles', 'realtors'];
    
    for (const table of tablesToCheck) {
      try {
        console.log(`Checking ${table} table...`);
        const { data, error } = await supabase.from(table).select('count').limit(1);
        
        if (error) {
          console.error(`❌ ${table} table error:`, error.message);
          diagnosticReport.tables[table] = 'Error: ' + error.message;
        } else {
          console.log(`✅ ${table} table accessible`);
          diagnosticReport.tables[table] = 'Success';
        }
      } catch (error) {
        console.error(`❌ ${table} check error:`, error.message);
        diagnosticReport.tables[table] = 'Error: ' + error.message;
      }
    }
    
    // 4. Try admin login
    console.log('\n4️⃣ Testing admin login...');
    try {
      diagnosticReport.adminLogin.attempted = true;
      
      console.log(`Attempting login with admin email: ${adminEmail}`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (signInError) {
        console.error('❌ Admin login failed:', signInError.message);
        diagnosticReport.adminLogin.error = signInError.message;
        
        // Provide more details on specific errors
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('   This could mean the password is incorrect or the user doesn\'t exist.');
        } else if (signInError.message.includes('Database error')) {
          console.log('   This indicates a schema or database permission issue.');
          console.log('   The auth functions may not be properly set up in the database.');
        }
      } else if (signInData.user) {
        console.log('✅ Admin login successful!');
        console.log(`   User ID: ${signInData.user.id}`);
        console.log(`   Email: ${signInData.user.email}`);
        console.log(`   Role: ${signInData.user.app_metadata?.role || 'Not specified'}`);
        
        diagnosticReport.adminLogin.success = true;
      } else {
        console.error('❌ Login returned no user and no error');
        diagnosticReport.adminLogin.error = 'No user returned';
      }
    } catch (error) {
      console.error('❌ Admin login attempt error:', error.message);
      diagnosticReport.adminLogin.error = error.message;
    }
    
    // 5. Check for admin profile
    console.log('\n5️⃣ Checking admin profile...');
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      if (profileError) {
        console.error('❌ Failed to get admin profile:', profileError.message);
      } else if (profileData) {
        console.log('✅ Admin profile found:');
        console.log(`   Profile ID: ${profileData.id}`);
        console.log(`   Email: ${profileData.email}`);
        console.log(`   Role: ${profileData.role}`);
        diagnosticReport.profiles.adminProfileExists = true;
        diagnosticReport.profiles.adminProfileDetails = profileData;
      } else {
        console.error('❌ Admin profile not found');
      }
    } catch (error) {
      console.error('❌ Admin profile check error:', error.message);
    }
    
    // 6. Conclusion and recommendations
    console.log('\n🔍 Diagnostic Summary:');
    console.log(`Connection: ${diagnosticReport.connectionStatus}`);
    console.log(`Auth Service: ${diagnosticReport.authStatus}`);
    console.log(`Admin Login: ${diagnosticReport.adminLogin.success ? 'Success' : 'Failed'}`);
    if (diagnosticReport.adminLogin.error) {
      console.log(`Login Error: ${diagnosticReport.adminLogin.error}`);
    }
    
    console.log('\n📋 Recommendations:');
    
    if (diagnosticReport.connectionStatus !== 'Success') {
      console.log('- Check Supabase URL and key in environment variables');
      console.log('- Verify the Supabase project is online');
    }
    
    if (diagnosticReport.adminLogin.error?.includes('Database error')) {
      console.log('- Run the fix_login_comprehensive.sql script in the Supabase SQL Editor');
      console.log('- This should repair auth functions and RLS policies');
    }
    
    if (!diagnosticReport.adminLogin.success && !diagnosticReport.adminLogin.error?.includes('Database error')) {
      console.log('- Reset the admin password using the password reset SQL script');
      console.log('- Verify the admin user exists in auth.users table');
    }
    
    if (!diagnosticReport.profiles.adminProfileExists) {
      console.log('- Create the admin profile record in the profiles table');
      console.log('- Link it with the correct user ID from auth.users');
    }
    
    // Save diagnostic report
    const reportPath = path.join(process.cwd(), 'supabase-diagnostic-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(diagnosticReport, null, 2));
    console.log(`\n📄 Full diagnostic report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Unexpected error during diagnosis:', error);
  }
}

diagnoseAuth();
