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

async function analyzeConstraints() {
  console.log('🔍 Analyzing database relationships...\n')
  
  try {
    // Check local users first
    console.log('👥 Local Users:')
    const { data: localUsers } = await localSupabase.auth.admin.listUsers()
    console.log(`   Found ${localUsers.users?.length || 0} users`)
    localUsers.users?.forEach(user => {
      console.log(`   ✅ ${user.email} (ID: ${user.id.slice(0, 8)}...)`)
    })
    
    console.log('\n📊 Sample data from cloud tables:')
    
    // Check profiles data from cloud
    const { data: cloudProfiles, error: profileError } = await cloudSupabase
      .from('profiles')
      .select('*')
      .limit(2)
    
    if (profileError) {
      console.log(`   profiles: ❌ ${profileError.message}`)
    } else {
      console.log(`   profiles: ${cloudProfiles?.length || 0} records`)
      if (cloudProfiles && cloudProfiles.length > 0) {
        console.log('   Sample record:', JSON.stringify(cloudProfiles[0], null, 2))
      }
    }
    
    // Check realtors data from cloud
    const { data: cloudRealtors, error: realtorError } = await cloudSupabase
      .from('realtors')
      .select('*')
      .limit(2)
    
    if (realtorError) {
      console.log(`   realtors: ❌ ${realtorError.message}`)
    } else {
      console.log(`   realtors: ${cloudRealtors?.length || 0} records`)
      if (cloudRealtors && cloudRealtors.length > 0) {
        console.log('   Sample record:', JSON.stringify(cloudRealtors[0], null, 2))
      }
    }
    
    // Check carousel_slides data from cloud
    const { data: cloudSlides, error: slideError } = await cloudSupabase
      .from('carousel_slides')
      .select('*')
      .limit(2)
    
    if (slideError) {
      console.log(`   carousel_slides: ❌ ${slideError.message}`)
    } else {
      console.log(`   carousel_slides: ${cloudSlides?.length || 0} records`)
      if (cloudSlides && cloudSlides.length > 0) {
        console.log('   Sample record:', JSON.stringify(cloudSlides[0], null, 2))
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

analyzeConstraints()
