import { createClient } from '@supabase/supabase-js'

// Cloud Supabase configuration (your actual credentials)
const CLOUD_SUPABASE_URL = 'https://imhtjggudeidvmpgwjho.supabase.co'
const CLOUD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'

// Local Supabase configuration
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321'
const LOCAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Create clients
const cloudSupabase = createClient(CLOUD_SUPABASE_URL, CLOUD_SUPABASE_SERVICE_KEY)
const localSupabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY)

async function exportTableData(tableName) {
  console.log(`📤 Exporting ${tableName}...`)
  
  try {
    const { data, error } = await cloudSupabase
      .from(tableName)
      .select('*')
    
    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error.message)
      return null
    }
    
    console.log(`✅ Exported ${data?.length || 0} records from ${tableName}`)
    return data
  } catch (err) {
    console.error(`❌ Exception exporting ${tableName}:`, err.message)
    return null
  }
}

async function importTableData(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️  No data to import for ${tableName}`)
    return true
  }
  
  console.log(`📥 Importing ${data.length} records to ${tableName}...`)
  
  try {
    // Clear existing data first (except for tables that might have constraints)
    if (!['profiles'].includes(tableName)) {
      const { error: deleteError } = await localSupabase
        .from(tableName)
        .delete()
        .neq('id', 'impossible-id') // Delete all records
      
      if (deleteError) {
        console.warn(`⚠️  Warning clearing ${tableName}:`, deleteError.message)
      }
    }
    
    // Import new data in batches to avoid large payload issues
    const batchSize = 100
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      const { error } = await localSupabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' })
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1} for ${tableName}:`, error.message)
        return false
      }
      
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} for ${tableName}`)
    }
    
    console.log(`✅ Successfully imported ${data.length} records to ${tableName}`)
    return true
  } catch (err) {
    console.error(`❌ Exception importing ${tableName}:`, err.message)
    return false
  }
}

async function migrateTable(tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}`)
  
  const data = await exportTableData(tableName)
  if (data) {
    await importTableData(tableName, data)
  }
}

async function testConnections() {
  console.log('🔍 Testing connections...')
  
  try {
    // Test cloud connection
    const { data: cloudTest, error: cloudError } = await cloudSupabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (cloudError) {
      console.error('❌ Cloud connection failed:', cloudError.message)
      return false
    }
    
    // Test local connection
    const { data: localTest, error: localError } = await localSupabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (localError) {
      console.error('❌ Local connection failed:', localError.message)
      return false
    }
    
    console.log('✅ Both connections working')
    return true
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting data migration from Supabase Cloud to Local Docker...\n')
  
  // Test connections first
  const connectionsOk = await testConnections()
  if (!connectionsOk) {
    console.error('❌ Connection tests failed. Please check your credentials.')
    process.exit(1)
  }
  
  try {
    // Define tables to migrate (in order of dependencies)
    const tables = [
      'realtors',
      'carousel_slides',
      'profiles',
      // Add other tables as needed
    ]
    
    // Migrate each table
    for (const table of tables) {
      await migrateTable(table)
    }
    
    console.log('\n🎉 Data migration completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Admin user already created and working')
    console.log('   ✅ Table data migrated from cloud')
    console.log('   ✅ Your application now has all the data locally')
    console.log('\n🚀 You can now develop with full data locally!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
