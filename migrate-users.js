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

async function migrateUsersFromProfiles() {
  console.log('🚀 Migrating users based on profiles data...\n')
  
  try {
    // Get all profiles from cloud (these contain user info)
    console.log('📊 Getting profiles from cloud...')
    const { data: cloudProfiles, error: profileError } = await cloudSupabase
      .from('profiles')
      .select('*')
    
    if (profileError) {
      console.error('❌ Error getting profiles:', profileError.message)
      return
    }
    
    console.log(`✅ Found ${cloudProfiles?.length || 0} profiles in cloud`)
    
    if (!cloudProfiles || cloudProfiles.length === 0) {
      console.log('⏭️  No profiles to migrate')
      return
    }
    
    // Get realtors to see if they have user_id references
    console.log('\n📊 Getting realtors from cloud...')
    const { data: cloudRealtors, error: realtorError } = await cloudSupabase
      .from('realtors')
      .select('*')
    
    if (realtorError) {
      console.error('❌ Error getting realtors:', realtorError.message)
    } else {
      console.log(`✅ Found ${cloudRealtors?.length || 0} realtors in cloud`)
    }
    
    // Collect all unique user IDs we need to create
    const userIds = new Set()
    
    // Add user IDs from profiles (using the 'id' field as user_id)
    cloudProfiles.forEach(profile => {
      if (profile.id) {
        userIds.add(profile.id)
      }
    })
    
    // Add user IDs from realtors
    if (cloudRealtors) {
      cloudRealtors.forEach(realtor => {
        if (realtor.user_id) {
          userIds.add(realtor.user_id)
        }
      })
    }
    
    console.log(`\n👥 Found ${userIds.size} unique user IDs to create`)
    
    // Create users locally
    let created = 0
    let skipped = 0
    
    for (const userId of userIds) {
      // Find the profile for this user ID
      const profile = cloudProfiles.find(p => p.id === userId)
      
      if (!profile) {
        console.log(`⚠️  No profile found for user ID ${userId}, skipping`)
        skipped++
        continue
      }
      
      try {
        console.log(`Creating user: ${profile.email}`)
        
        const { data, error } = await localSupabase.auth.admin.createUser({
          email: profile.email,
          password: 'temp123456',
          email_confirm: true,
          user_metadata: {
            display_name: profile.display_name,
            role: profile.role
          }
        })
        
        if (error) {
          if (error.message.includes('already registered')) {
            console.log(`   ⏭️  User ${profile.email} already exists, skipping`)
            skipped++
          } else {
            console.error(`   ❌ Error creating user ${profile.email}:`, error.message)
          }
        } else {
          console.log(`   ✅ Created user: ${profile.email} (${data.user.id})`)
          created++
        }
      } catch (err) {
        console.error(`   ❌ Exception creating user ${profile.email}:`, err.message)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Created: ${created} users`)
    console.log(`   ⏭️  Skipped: ${skipped} users`)
    
    // Now check local users
    console.log('\n👥 Current local users:')
    const { data: localUsers } = await localSupabase.auth.admin.listUsers()
    localUsers.users?.forEach(user => {
      console.log(`   ${user.email} (${user.id})`)
    })
    
    console.log('\n🎉 User migration completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. All users now have password: temp123456')
    console.log('   2. Now we can migrate table data without foreign key issues')
    console.log('   3. Run the table data migration script')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

migrateUsersFromProfiles()
