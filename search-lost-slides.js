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

async function searchForLostSlides() {
  console.log('🔍 SEARCHING FOR YOUR LOST CAROUSEL SLIDES\n')
  
  try {
    console.log('📡 Checking CLOUD database for carousel slides...')
    const { data: cloudSlides, error: cloudError } = await cloudSupabase
      .from('carousel_slides')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (cloudError) {
      console.log(`❌ Cloud error: ${cloudError.message}`)
    } else {
      console.log(`📊 Cloud database has: ${cloudSlides?.length || 0} slides`)
      
      if (cloudSlides && cloudSlides.length > 0) {
        console.log('\n🎉 FOUND YOUR SLIDES IN CLOUD! 🎉')
        console.log('📋 Your missing slides:')
        cloudSlides.forEach((slide, index) => {
          console.log(`   ${index + 1}. "${slide.title}" - ${slide.description || 'No description'}`)
          console.log(`      Image: ${slide.image_url}`)
          console.log(`      Island: ${slide.island || 'Not specified'}`)
          console.log(`      Created: ${new Date(slide.created_at).toLocaleString()}`)
          console.log('')
        })
        
        console.log('💾 RECOVERY PLAN:')
        console.log('   1. We can migrate these slides from cloud to local')
        console.log('   2. They will be added to your local database')
        console.log('   3. Your carousel will show all your original slides')
        
        return { cloudSlides, canRecover: true }
      } else {
        console.log('😞 No slides found in cloud database either')
        console.log('\n💭 This means:')
        console.log('   - Slides were only created locally (not synced to cloud)')
        console.log('   - They were lost when local database was reset')
        console.log('   - No automatic recovery possible')
      }
    }
    
    console.log('\n🏠 Checking LOCAL database (current state)...')
    const { data: localSlides, error: localError } = await localSupabase
      .from('carousel_slides')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (localError) {
      console.log(`❌ Local error: ${localError.message}`)
    } else {
      console.log(`📊 Local database has: ${localSlides?.length || 0} slides`)
      if (localSlides && localSlides.length > 0) {
        console.log('📋 Current local slides:')
        localSlides.forEach((slide, index) => {
          console.log(`   ${index + 1}. "${slide.title}" (created ${new Date(slide.created_at).toLocaleDateString()})`)
        })
      }
    }
    
    return { cloudSlides: cloudSlides || [], canRecover: false }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message)
    return { cloudSlides: [], canRecover: false }
  }
}

// Run the search
searchForLostSlides().then(result => {
  if (result.canRecover) {
    console.log('\n🚀 Ready to recover your slides!')
    console.log('   Run: node recover-carousel-slides.js')
  } else {
    console.log('\n🛠️  Manual recreation needed')
    console.log('   You can add slides through the admin dashboard')
  }
})
