// checkAuth.js - A simplified script to check Supabase auth configuration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple function to try to find Supabase credentials
function findSupabaseCredentials() {
  // First try to read from config file
  try {
    const configPath = path.join(__dirname, '..', 'src', 'config', 'supabase.config.ts');
    if (fs.existsSync(configPath)) {
      console.log('Found Supabase config file...');
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      console.log('Please check these values are correct:');
      
      if (configContent.includes('VITE_SUPABASE_URL')) {
        console.log('✓ Config references VITE_SUPABASE_URL environment variable');
      } else {
        const urlMatch = configContent.match(/supabaseUrl\s*=\s*['"`](.*?)['"`]/);
        if (urlMatch && urlMatch[1]) {
          console.log(`✓ Found hardcoded URL: ${urlMatch[1].slice(0, 30)}...`);
        }
      }
      
      if (configContent.includes('VITE_SUPABASE_ANON_KEY')) {
        console.log('✓ Config references VITE_SUPABASE_ANON_KEY environment variable');
      } else {
        const keyMatch = configContent.match(/supabaseAnonKey\s*=\s*['"`](.*?)['"`]/);
        if (keyMatch && keyMatch[1]) {
          console.log(`✓ Found hardcoded key: ${keyMatch[1].slice(0, 5)}...`);
        }
      }
    }
  } catch (error) {
    console.log('Error reading config file:', error.message);
  }
  
  // Then check for environment files
  const envFiles = ['.env', '.env.local', '.env.development'];
  for (const file of envFiles) {
    try {
      const envPath = path.join(__dirname, '..', file);
      if (fs.existsSync(envPath)) {
        console.log(`Found ${file} file...`);
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        if (envContent.includes('VITE_SUPABASE_URL')) {
          console.log(`✓ ${file} contains VITE_SUPABASE_URL`);
        }
        
        if (envContent.includes('VITE_SUPABASE_ANON_KEY')) {
          console.log(`✓ ${file} contains VITE_SUPABASE_ANON_KEY`);
        }
      }
    } catch (error) {
      console.log(`Error reading ${file}:`, error.message);
    }
  }
}

async function checkAuth() {
  console.log('🔍 Checking Supabase configuration...');
  
  // Look for credentials
  findSupabaseCredentials();
  
  console.log('\n📋 Next steps to fix login issues:');
  console.log('1. Run the diagnose_and_fix_rls.sql script in Supabase SQL Editor');
  console.log('2. Run the fix_login_comprehensive.sql script if the first one doesn\'t work');
  console.log('3. Make sure your environment variables are correctly set');
  console.log('4. Try logging in with email: s.admin@bonairemakelaars.com and password: SuperSecure2025!');
  console.log('\n❗ If login still fails, check the database logs in Supabase Dashboard');
}

checkAuth();
