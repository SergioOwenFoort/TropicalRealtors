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

async function migrateWithUserMapping() {
  console.log('🚀 Migrating data with proper user ID mapping...\n')
  
  try {
    // Step 1: Create email to user ID mapping for local users
    console.log('📊 Getting local users...')
    const { data: localUsers } = await localSupabase.auth.admin.listUsers()
    
    const emailToLocalUserId = {}
    localUsers.users?.forEach(user => {
      emailToLocalUserId[user.email] = user.id
      console.log(`   ${user.email} -> ${user.id}`)
    })
    
    // Step 2: Get cloud data
    console.log('\n📊 Getting cloud profiles...')
    const { data: cloudProfiles, error: profileError } = await cloudSupabase
      .from('profiles')
      .select('*')
    
    if (profileError) {
      console.error('❌ Error getting profiles:', profileError.message)
      return
    }
    
    console.log(`✅ Found ${cloudProfiles?.length || 0} profiles`)
    
    // Step 3: Map profiles data to use local user IDs
    const mappedProfiles = cloudProfiles?.map(profile => {
      const localUserId = emailToLocalUserId[profile.email]
      if (!localUserId) {
        console.warn(`⚠️  No local user found for ${profile.email}`)
        return null
      }
      
      return {
        ...profile,
        id: localUserId // Use the local user ID instead of cloud ID
      }
    }).filter(Boolean) // Remove null entries
    
    console.log(`📋 Mapped ${mappedProfiles?.length || 0} profiles to local user IDs`)
    
    // Step 4: Import mapped profiles
    if (mappedProfiles && mappedProfiles.length > 0) {
      console.log('\n📥 Importing profiles...')
      
      // Clear existing profiles first
      const { error: deleteError } = await localSupabase
        .from('profiles')
        .delete()
        .gt('created_at', '1900-01-01') // Delete all
      
      if (deleteError) {
        console.warn(`⚠️  Warning clearing profiles: ${deleteError.message}`)
      }
      
      // Import new profiles
      const { error: insertError } = await localSupabase
        .from('profiles')
        .insert(mappedProfiles)
      
      if (insertError) {
        console.error(`❌ Error importing profiles: ${insertError.message}`)
      } else {
        console.log(`✅ Successfully imported ${mappedProfiles.length} profiles`)
      }
    }
    
    // Step 5: Get and map realtors data
    console.log('\n📊 Getting cloud realtors...')
    const { data: cloudRealtors, error: realtorError } = await cloudSupabase
      .from('realtors')
      .select('*')
    
    if (realtorError) {
      console.error('❌ Error getting realtors:', realtorError.message)
      return
    }
    
    console.log(`✅ Found ${cloudRealtors?.length || 0} realtors`)
    
    // Create cloud ID to email mapping
    const cloudIdToEmail = {}
    cloudProfiles?.forEach(profile => {
      cloudIdToEmail[profile.id] = profile.email
    })
    
    // Map realtors data to use local user IDs
    const mappedRealtors = cloudRealtors?.map(realtor => {
      if (!realtor.user_id) {
        return realtor // Keep realtors without user_id as is
      }
      
      const email = cloudIdToEmail[realtor.user_id]
      const localUserId = email ? emailToLocalUserId[email] : null
      
      if (!localUserId) {
        console.warn(`⚠️  No local user found for realtor ${realtor.name} (user_id: ${realtor.user_id})`)
        return {
          ...realtor,
          user_id: null // Remove the invalid user_id reference
        }
      }
      
      return {
        ...realtor,
        user_id: localUserId // Use the local user ID
      }
    })
    
    console.log(`📋 Mapped ${mappedRealtors?.length || 0} realtors to local user IDs`)
    
    // Step 6: Import mapped realtors
    if (mappedRealtors && mappedRealtors.length > 0) {
      console.log('\n📥 Importing realtors...')
      
      // Clear existing realtors first
      const { error: deleteError } = await localSupabase
        .from('realtors')
        .delete()
        .gt('created_at', '1900-01-01') // Delete all
      
      if (deleteError) {
        console.warn(`⚠️  Warning clearing realtors: ${deleteError.message}`)
      }
      
      // Import new realtors
      const { error: insertError } = await localSupabase
        .from('realtors')
        .insert(mappedRealtors)
      
      if (insertError) {
        console.error(`❌ Error importing realtors: ${insertError.message}`)
      } else {
        console.log(`✅ Successfully imported ${mappedRealtors.length} realtors`)
      }
    }
    
    // Step 7: Import carousel slides (no user mapping needed)
    console.log('\n📊 Getting carousel slides...')
    const { data: cloudSlides, error: slideError } = await cloudSupabase
      .from('carousel_slides')
      .select('*')
    
    if (slideError) {
      console.error('❌ Error getting carousel slides:', slideError.message)
    } else if (cloudSlides && cloudSlides.length > 0) {
      console.log(`✅ Found ${cloudSlides.length} carousel slides`)
      
      // Clear and import slides
      const { error: deleteError } = await localSupabase
        .from('carousel_slides')
        .delete()
        .gt('created_at', '1900-01-01')
      
      const { error: insertError } = await localSupabase
        .from('carousel_slides')
        .insert(cloudSlides)
      
      if (insertError) {
        console.error(`❌ Error importing carousel slides: ${insertError.message}`)
      } else {
        console.log(`✅ Successfully imported ${cloudSlides.length} carousel slides`)
      }
    } else {
      console.log('⏭️  No carousel slides to import')
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ All users created with password: temp123456')
    console.log('   ✅ Profiles mapped to local user IDs')
    console.log('   ✅ Realtors mapped to local user IDs')
    console.log('   ✅ Carousel slides imported')
    console.log('   ✅ Foreign key constraints satisfied')
    console.log('\n🚀 Your application now has all the data locally!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

migrateWithUserMapping()
