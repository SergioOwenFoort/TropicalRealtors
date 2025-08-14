import { createClient } from '@supabase/supabase-js'

// Cloud Supabase configuration
const CLOUD_SUPABASE_URL = 'https://imhtjggudeidvmpgwjho.supabase.co'
const CLOUD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'

// Local Supabase configuration
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321'
const LOCAL_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Create clients
const cloudSupabase = createClient(CLOUD_SUPABASE_URL, CLOUD_SUPABASE_SERVICE_KEY)
const localSupabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_SERVICE_KEY)

async function checkForeignKeyConstraints() {
  console.log('🔍 Checking foreign key constraints...\n')
  
  try {
    // Check profiles table structure
    const { data: profilesStructure, error: profilesError } = await localSupabase
      .rpc('describe_table', { table_name: 'profiles' })
      .catch(() => null)
    
    console.log('📊 Profiles table foreign keys:')
    
    // Try to get table constraints directly from PostgreSQL
    const { data: constraints } = await localSupabase
      .rpc('exec', { 
        sql: `
          SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name IN ('profiles', 'realtors', 'carousel_slides');
        `
      })
      .catch(() => null)
    
    if (constraints) {
      constraints.forEach(constraint => {
        console.log(`   ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`)
      })
    }
    
    // Let's check what user IDs exist in cloud vs local
    console.log('\n👥 Checking users...')
    
    // Check local users
    const { data: localUsers } = await localSupabase.auth.admin.listUsers()
    console.log(`Local users: ${localUsers.users?.length || 0}`)
    localUsers.users?.forEach(user => {
      console.log(`   ${user.email} (${user.id})`)
    })
    
    // Check cloud users (this might fail due to permissions)
    console.log('\nCloud users:')
    const { data: cloudUsers, error: cloudError } = await cloudSupabase.auth.admin.listUsers()
    if (cloudError) {
      console.log(`   ❌ Cannot access cloud users: ${cloudError.message}`)
      console.log('   💡 This is normal - auth admin access may be restricted')
    } else {
      console.log(`   Found ${cloudUsers.users?.length || 0} users`)
      cloudUsers.users?.slice(0, 3).forEach(user => {
        console.log(`   ${user.email} (${user.id})`)
      })
    }
    
    // Check what data exists in cloud tables
    console.log('\n📊 Checking cloud table data...')
    
    const tables = ['profiles', 'realtors', 'carousel_slides']
    for (const table of tables) {
      const { data, error } = await cloudSupabase
        .from(table)
        .select('*')
        .limit(3)
      
      if (error) {
        console.log(`   ${table}: ❌ ${error.message}`)
      } else {
        console.log(`   ${table}: ${data?.length || 0} records`)
        if (data && data.length > 0) {
          // Show which user_id columns exist
          const firstRecord = data[0]
          const userIdFields = Object.keys(firstRecord).filter(key => 
            key.includes('user') || key.includes('id')
          )
          console.log(`     User-related fields: ${userIdFields.join(', ')}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error.message)
  }
}

checkForeignKeyConstraints()
