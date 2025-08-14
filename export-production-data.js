// Export production data using Supabase REST API
import fs from 'fs';

// Production Supabase configuration
const PROD_URL = 'https://imhtjggudeidvmpgwjho.supabase.co';
const PROD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ';

async function exportTable(tableName) {
  try {
    console.log(`📥 Exporting ${tableName}...`);
    
    const response = await fetch(`${PROD_URL}/rest/v1/${tableName}?select=*`, {
      method: 'GET',
      headers: {
        'apikey': PROD_ANON_KEY,
        'Authorization': `Bearer ${PROD_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${tableName}: ${data.length} records`);
    return { table: tableName, data };
  } catch (error) {
    console.error(`❌ Error exporting ${tableName}:`, error.message);
    return { table: tableName, data: [], error: error.message };
  }
}

async function exportAllData() {
  console.log('🚀 Starting production data export...\n');

  // Tables to export
  const tables = [
    'profiles',
    'realtors', 
    'properties',
    'carousel_slides'
  ];

  const exportResults = [];

  for (const table of tables) {
    const result = await exportTable(table);
    exportResults.push(result);
  }

  // Generate SQL insert statements
  let sqlContent = '-- Production data export\n';
  sqlContent += '-- Generated on: ' + new Date().toISOString() + '\n\n';

  for (const result of exportResults) {
    if (result.error) {
      sqlContent += `-- Error exporting ${result.table}: ${result.error}\n\n`;
      continue;
    }

    if (result.data.length === 0) {
      sqlContent += `-- No data found for table: ${result.table}\n\n`;
      continue;
    }

    sqlContent += `-- Data for table: ${result.table}\n`;
    sqlContent += `-- Records: ${result.data.length}\n\n`;

    for (const row of result.data) {
      const columns = Object.keys(row);
      const values = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val.toString();
        if (typeof val === 'object') {
          // Handle specific column types
          if (col === 'favorites' || col === 'languages') {
            // favorites and languages are text[] array types
            return `'{${Array.isArray(val) ? val.map(v => `"${v}"`).join(',') : ''}}'`;
          } else if (col === 'features' || col === 'images') {
            // These are jsonb array types
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
          } else {
            // Default jsonb handling
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
          }
        }
        return val;
      });

      sqlContent += `INSERT INTO public.${result.table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
    sqlContent += '\n';
  }

  // Write to file
  fs.writeFileSync('production_data_export.sql', sqlContent);
  console.log('\n✅ Export complete! Data saved to: production_data_export.sql');
  
  // Summary
  console.log('\n📊 Export Summary:');
  for (const result of exportResults) {
    if (result.error) {
      console.log(`❌ ${result.table}: Error - ${result.error}`);
    } else {
      console.log(`✅ ${result.table}: ${result.data.length} records`);
    }
  }
}

exportAllData().catch(console.error);
