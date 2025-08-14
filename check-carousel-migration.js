import { createClient } from '@supabase/supabase-js'

// Cloud database connection
const cloudSupabase = createClient(
  'https://imhtjggudeivmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw'
)

// Local database connection
const localSupabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkCarouselSlidesMigration() {
  console.log('🔍 CHECKING CAROUSEL SLIDES MIGRATION STATUS\n')
  
  try {
    // Check cloud database
    console.log('☁️  CHECKING CLOUD DATABASE...')
    const { data: cloudSlides, error: cloudError, count: cloudCount } = await cloudSupabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
    
    if (cloudError) {
      console.error('❌ Error accessing cloud carousel_slides:', cloudError.message)
    } else {
      console.log(`📊 Cloud database has ${cloudCount} carousel slides`)
      if (cloudSlides && cloudSlides.length > 0) {
        cloudSlides.forEach((slide, index) => {
          console.log(`   ${index + 1}. "${slide.title}" (${slide.island || 'no island'}) - ${slide.is_active ? 'Active' : 'Inactive'}`)
        })
      }
    }
    
    console.log('')
    
    // Check local database
    console.log('🏠 CHECKING LOCAL DATABASE...')
    const { data: localSlides, error: localError, count: localCount } = await localSupabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
    
    if (localError) {
      console.error('❌ Error accessing local carousel_slides:', localError.message)
    } else {
      console.log(`📊 Local database has ${localCount} carousel slides`)
      if (localSlides && localSlides.length > 0) {
        localSlides.forEach((slide, index) => {
          console.log(`   ${index + 1}. "${slide.title}" (${slide.island || 'no island'}) - ${slide.is_active ? 'Active' : 'Inactive'}`)
        })
      }
    }
    
    console.log('')
    
    // Compare and analyze
    console.log('🔍 ANALYSIS:')
    if (cloudError && localError) {
      console.log('❌ Both databases have errors - cannot compare')
    } else if (cloudError) {
      console.log('❌ Cloud database error - cannot check source')
    } else if (localError) {
      console.log('❌ Local database error - cannot check destination')
    } else {
      const cloudTotal = cloudCount || 0
      const localTotal = localCount || 0
      
      if (cloudTotal > localTotal) {
        console.log(`⚠️  MIGRATION ISSUE: Cloud has ${cloudTotal} slides but local only has ${localTotal}`)
        console.log('   This suggests the migration didn\'t copy all carousel slides')
      } else if (cloudTotal === localTotal && cloudTotal > 0) {
        console.log(`✅ Migration looks complete: ${cloudTotal} slides in both databases`)
      } else if (cloudTotal === 0 && localTotal === 1) {
        console.log('ℹ️  Cloud is empty, local has 1 demo slide (normal for fresh setup)')
      } else if (cloudTotal === 0 && localTotal === 0) {
        console.log('ℹ️  Both databases are empty')
      } else {
        console.log(`❓ Unexpected state: Cloud=${cloudTotal}, Local=${localTotal}`)
      }
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message)
  }
}

checkCarouselSlidesMigration()
