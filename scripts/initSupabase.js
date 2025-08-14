// Initialize Supabase database script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('🔌 Testing connection to Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_system_status');
    
    if (healthError) {
      console.log('⚠️ Database health check error:', healthError);
    } else {
      console.log('✅ Database connection successful');
    }

    // Read the init.sql file
    console.log('📄 Reading init.sql file...');
    const sqlPath = path.join(__dirname, '../supabase/init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the file by statements to execute them one by one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📊 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('execute_sql', { sql_query: statement + ';' });
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Successfully executed statement ${i + 1}`);
        }
      } catch (err) {
        console.error(`❌ Error with statement ${i + 1}:`, err);
      }
    }

    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();
