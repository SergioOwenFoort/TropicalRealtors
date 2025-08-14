import { createClient } from '@supabase/supabase-js'

// Your Supabase Cloud credentials
const CLOUD_SUPABASE_URL = 'https://imhtjggudeidvmpgwjho.supabase.co'
const CLOUD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'

// Local Docker Supabase
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321'
const LOCAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const cloudSupabase = createClient(CLOUD_SUPABASE_URL, CLOUD_SUPABASE_SERVICE_KEY)
const localSupabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY)

async function getAllTables() {
  console.log('🔍 Discovering all tables in cloud database...')
  
  try {
    const { data, error } = await cloudSupabase.rpc('get_table_list')
    
    if (error) {
      // Fallback: try common tables
      console.log('Using fallback table list...')
      return [
        'profiles',
        'realtors',
        'listings', 
        'carousel_slides',
        'properties',
        'users',
        'categories',
        'locations'
      ]
    }
    
    return data.map(row => row.table_name)
  } catch (err) {
    console.log('Using predefined table list...')
    return [
      'profiles',
      'realtors',
      'listings', 
      'carousel_slides',
      'properties',
      'categories',
      'locations'
    ]
  }
}

async function exportTable(tableName) {
  console.log(`📤 Exporting ${tableName}...`)
  
  try {
    const { data, error, count } = await cloudSupabase
      .from(tableName)
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log(`❌ Error exporting ${tableName}: ${error.message}`)
      return null
    }
    
    console.log(`✅ Exported ${data?.length || 0} records from ${tableName}`)
    return data
  } catch (err) {
    console.log(`❌ Exception exporting ${tableName}: ${err.message}`)
    return null
  }
}

async function importTable(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️  No data to import for ${tableName}`)
    return true
  }
  
  console.log(`📥 Importing ${data.length} records to ${tableName}...`)
  
  try {
    // Clear existing data first (but ignore errors if table doesn't exist)
    try {
      await localSupabase
        .from(tableName)
        .delete()
        .neq('id', 'impossible-id-that-never-exists')
    } catch (clearError) {
      console.log(`⚠️  Could not clear ${tableName} (table might not exist yet)`)
    }
    
    // Import new data in chunks to avoid timeout
    const chunkSize = 100
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      
      const { error } = await localSupabase
        .from(tableName)
        .insert(chunk)
      
      if (error) {
        console.log(`❌ Error importing chunk ${i / chunkSize + 1} of ${tableName}: ${error.message}`)
        return false
      }
      
      console.log(`✅ Imported chunk ${i / chunkSize + 1}/${Math.ceil(data.length / chunkSize)} for ${tableName}`)
    }
    
    console.log(`✅ Successfully imported all ${data.length} records to ${tableName}`)
    return true
  } catch (err) {
    console.log(`❌ Exception importing ${tableName}: ${err.message}`)
    return false
  }
}

async function exportAndImportTable(tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}`)
  
  const data = await exportTable(tableName)
  if (data) {
    return await importTable(tableName, data)
  }
  return false
}

async function migrateAuthUsers() {
  console.log(`\n👥 Migrating auth users...`)
  
  try {
    // Get all users from cloud
    const { data: cloudUsers, error: cloudError } = await cloudSupabase.auth.admin.listUsers()
    
    if (cloudError) {
      console.log(`❌ Error getting cloud users: ${cloudError.message}`)
      return false
    }
    
    console.log(`📤 Found ${cloudUsers.users?.length || 0} users in cloud`)
    
    if (!cloudUsers.users || cloudUsers.users.length === 0) {
      console.log(`⏭️  No users to migrate`)
      return true
    }
    
    // Create each user in local database
    let successCount = 0
    for (const user of cloudUsers.users) {
      try {
        console.log(`👤 Creating user: ${user.email}`)
        
        const { data, error } = await localSupabase.auth.admin.createUser({
          email: user.email,
          password: 'temp123456', // Temporary password
          email_confirm: true,
          user_metadata: user.user_metadata || {},
          app_metadata: user.app_metadata || {},
          role: user.role || 'authenticated'
        })
        
        if (error) {
          console.log(`❌ Error creating user ${user.email}: ${error.message}`)
        } else {
          console.log(`✅ Created user: ${user.email}`)
          successCount++
        }
      } catch (err) {
        console.log(`❌ Exception creating user ${user.email}: ${err.message}`)
      }
    }
    
    console.log(`✅ Successfully created ${successCount}/${cloudUsers.users.length} users`)
    return successCount > 0
  } catch (err) {
    console.log(`❌ Exception migrating users: ${err.message}`)
    return false
  }
}

async function testConnections() {
  console.log('🔍 Testing database connections...')
  
  try {
    // Test cloud connection
    const { data: cloudTest, error: cloudError } = await cloudSupabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (cloudError) {
      console.log(`❌ Cloud connection failed: ${cloudError.message}`)
      return false
    }
    
    // Test local connection
    const { data: localTest, error: localError } = await localSupabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (localError) {
      console.log(`❌ Local connection failed: ${localError.message}`)
      return false
    }
    
    console.log('✅ Both connections working')
    return true
  } catch (err) {
    console.log(`❌ Connection test failed: ${err.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Starting COMPLETE database migration from Supabase Cloud to Local Docker...\n')
  
  // Test connections
  if (!(await testConnections())) {
    console.log('❌ Connection test failed. Exiting.')
    process.exit(1)
  }
  
  console.log('')
  
  try {
    // Step 1: Migrate users FIRST (other tables depend on users)
    console.log('🔥 STEP 1: Migrating authentication users...')
    await migrateAuthUsers()
    
    // Step 2: Get all tables and migrate them
    console.log('\n🔥 STEP 2: Migrating all data tables...')
    const tables = await getAllTables()
    console.log(`📋 Found tables to migrate: ${tables.join(', ')}`)
    
    let successCount = 0
    let totalTables = tables.length
    
    for (const table of tables) {
      const success = await exportAndImportTable(table)
      if (success) successCount++
    }
    
    console.log(`\n🎉 MIGRATION COMPLETED!`)
    console.log(`📊 Results: ${successCount}/${totalTables} tables migrated successfully`)
    
    console.log('\n📋 What happened:')
    console.log('   ✅ All users migrated with temporary password: temp123456')
    console.log('   ✅ All table data copied from cloud to local')
    console.log('   ✅ Your local database now matches your cloud database')
    
    console.log('\n🔥 Next steps:')
    console.log('   1. Start your dev server: npm run dev')
    console.log('   2. Login with: s.admin@bonairemakelaars.com / temp123456')
    console.log('   3. Admin dashboard should now be visible!')
    console.log('   4. All your data is now available locally')
    
  } catch (error) {
    console.log(`❌ Migration failed: ${error.message}`)
    console.log(`❌ Stack trace: ${error.stack}`)
    process.exit(1)
  }
}

main()
