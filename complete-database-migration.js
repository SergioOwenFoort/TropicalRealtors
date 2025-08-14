const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Old database connection
const oldSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY5MjM5MywiZXhwIjoyMDUwMjY4MzkzfQ.r6Zl9wJtXQ8V_3i2A7v-ZwGZe8_KIRaP_cG1L4jGz9Q'
);

// New database connection  
const newSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function fullDatabaseMigration() {
  console.log('🚀 Starting complete database migration...\n');

  try {
    // List of tables to migrate in order (respecting foreign key dependencies)
    const tablesToMigrate = [
      'profiles',
      'realtors', 
      'properties',
      'carousel_slides',
      'saved_searches',
      'property_views',
      'click_tracking'
    ];

    const migrationResults = {};

    for (const tableName of tablesToMigrate) {
      console.log(`📋 Migrating table: ${tableName}`);
      
      try {
        // 1. Export data from old database
        console.log(`   📤 Exporting data from old database...`);
        const { data: oldData, error: exportError } = await oldSupabase
          .from(tableName)
          .select('*');

        if (exportError) {
          console.log(`   ⚠️  Table '${tableName}' not found in old database:`, exportError.message);
          migrationResults[tableName] = { status: 'skipped', reason: 'not found in old database' };
          continue;
        }

        if (!oldData || oldData.length === 0) {
          console.log(`   ℹ️  Table '${tableName}' is empty in old database`);
          migrationResults[tableName] = { status: 'skipped', reason: 'empty table' };
          continue;
        }

        console.log(`   ✅ Found ${oldData.length} records in old database`);

        // 2. Clear existing data in new database (optional - comment out if you want to keep existing data)
        console.log(`   🗑️  Clearing existing data in new database...`);
        const { error: deleteError } = await newSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (deleteError) {
          console.log(`   ⚠️  Could not clear table '${tableName}':`, deleteError.message);
        }

        // 3. Insert data into new database
        console.log(`   📥 Importing data to new database...`);
        
        // Insert in batches to avoid timeout
        const batchSize = 100;
        let successfulInserts = 0;
        
        for (let i = 0; i < oldData.length; i += batchSize) {
          const batch = oldData.slice(i, i + batchSize);
          
          const { data: insertedData, error: insertError } = await newSupabase
            .from(tableName)
            .insert(batch)
            .select();

          if (insertError) {
            console.log(`   ❌ Error inserting batch ${i}-${i + batch.length} for '${tableName}':`, insertError.message);
            // Try individual inserts for this batch
            for (const record of batch) {
              const { error: singleError } = await newSupabase
                .from(tableName)
                .insert([record]);
              
              if (!singleError) {
                successfulInserts++;
              } else {
                console.log(`   ❌ Failed to insert record ID ${record.id || 'unknown'}:`, singleError.message);
              }
            }
          } else {
            successfulInserts += insertedData?.length || 0;
            console.log(`   ✅ Inserted batch ${i}-${i + batch.length} (${insertedData?.length || 0} records)`);
          }
        }

        migrationResults[tableName] = { 
          status: 'completed', 
          originalCount: oldData.length, 
          migratedCount: successfulInserts 
        };

        console.log(`   🎉 Migration completed for '${tableName}': ${successfulInserts}/${oldData.length} records\n`);

      } catch (error) {
        console.log(`   ❌ Error migrating table '${tableName}':`, error.message);
        migrationResults[tableName] = { status: 'failed', error: error.message };
      }
    }

    // Summary
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log('=' .repeat(50));
    for (const [table, result] of Object.entries(migrationResults)) {
      if (result.status === 'completed') {
        console.log(`✅ ${table}: ${result.migratedCount}/${result.originalCount} records migrated`);
      } else if (result.status === 'skipped') {
        console.log(`⏭️  ${table}: ${result.reason}`);
      } else {
        console.log(`❌ ${table}: ${result.error}`);
      }
    }

    console.log('\n🎉 Database migration completed!');
    console.log('Please verify your data in the new database and update your frontend accordingly.');

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
  }
}

// Run the migration
fullDatabaseMigration();
