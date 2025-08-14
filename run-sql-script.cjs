const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function runSqlScript() {
  console.log('Running add-missing-columns.sql script...');
  
  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync('add-missing-columns.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`);
          if (data) console.log('Result:', data);
        }
      } catch (err) {
        console.error(`Exception in statement ${i + 1}:`, err.message);
      }
    }
    
    // Verify the schema after changes
    console.log('\nVerifying updated schema...');
    const { data: updatedData, error: verifyError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying schema:', verifyError);
    } else if (updatedData && updatedData.length > 0) {
      console.log('\n✓ Updated properties columns:');
      console.log(Object.keys(updatedData[0]).sort());
    }
    
  } catch (error) {
    console.error('Error running SQL script:', error);
  }
}

runSqlScript();
