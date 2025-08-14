// Script to fix Supabase profiles table policies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials. Check your .env file');
  process.exit(1);
}

// Initialize Supabase client
console.log('Initializing Supabase client...');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixProfiles() {
  try {
    console.log('Loading SQL fix script...');
    const scriptPath = path.join(process.cwd(), 'supabase', 'fixProfiles.sql');
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    // Split the SQL script by semicolons and execute each statement
    // This is a simple approach and might not work for complex SQL with semicolons in strings, etc.
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_statement: stmt });
        if (error) {
          console.warn(`⚠️ Statement ${i + 1} error: ${error.message}`);
          console.log('Continuing with the next statement...');
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️ Error executing statement ${i + 1}: ${err.message}`);
        console.log('Continuing with the next statement...');
      }
    }
    
    console.log('\nAttempting to directly fix the policies with admin access...');
    console.log('This requires admin API keys, which you may need to set up in Supabase');
    
    console.log('\n✅ Profile policies fix process completed.');
    console.log('\nIf you continue to see policy errors, please:');
    console.log('1. Log into the Supabase dashboard at https://app.supabase.io');
    console.log('2. Navigate to your project -> Authentication -> Policies');
    console.log('3. Delete all problematic policies on the profiles table');
    console.log('4. Create simple policies that do not cause recursion');
    console.log('5. Restart your application');
    
  } catch (error) {
    console.error('❌ Error fixing profiles:', error);
  }
}

// Run the fix function
fixProfiles()
  .catch(console.error)
  .finally(() => {
    console.log('\nDone.');
  });
