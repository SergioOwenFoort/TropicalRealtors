import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function investigateMissingSlides() {
  console.log('🔍 INVESTIGATING MISSING CAROUSEL SLIDES\n')
  
  try {
    // Check all slides including inactive ones
    const { data: allSlides, error: slidesError } = await supabase
      .from('carousel_slides')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (slidesError) {
      console.error('❌ Error getting slides:', slidesError.message)
      return
    }
    
    console.log(`📊 Current slides in database: ${allSlides?.length || 0}`)
    
    if (allSlides && allSlides.length > 0) {
      console.log('\n🖼️ EXISTING SLIDES:')
      allSlides.forEach((slide, index) => {
        console.log(`   ${index + 1}. "${slide.title}" (${slide.is_active ? 'Active' : 'Inactive'}) - Created: ${new Date(slide.created_at).toLocaleString()}`)
      })
    }
    
    // Check if there's any evidence of deleted slides by looking at the created_at timestamp
    // If we only have 1 slide created today, but you had more before...
    console.log('\n🕐 TIMELINE ANALYSIS:')
    if (allSlides && allSlides.length === 1) {
      const slide = allSlides[0]
      const createdToday = new Date(slide.created_at).toDateString() === new Date().toDateString()
      
      if (createdToday) {
        console.log('⚠️  The only slide was created TODAY (July 8, 2025)')
        console.log('💭 This suggests:')
        console.log('   - Your previous slides were lost/deleted')
        console.log('   - This might be a demo slide created during setup')
        console.log('   - The database may have been reset/recreated')
      }
    }
    
    // Check if we can see any logs or evidence of what happened
    console.log('\n🔍 POSSIBLE CAUSES:')
    console.log('   1. Database was reset during migration process')
    console.log('   2. Slides were deleted accidentally')
    console.log('   3. Local Docker container was recreated')
    console.log('   4. Database schema was recreated')
    
    console.log('\n💡 RECOVERY OPTIONS:')
    console.log('   1. Check if slides exist in cloud database (we can re-migrate)')
    console.log('   2. Restore from backup if available')
    console.log('   3. Recreate slides manually through admin dashboard')
    
  } catch (err) {
    console.error('❌ ERROR:', err.message)
  }
}

investigateMissingSlides()
