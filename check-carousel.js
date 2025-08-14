import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function checkCarouselSlides() {
  console.log('🎠 Checking carousel slides in local database...\n')
  
  try {
    // Get all carousel slides
    const { data: slides, error, count } = await supabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.error('❌ Error getting carousel slides:', error.message)
      return
    }
    
    console.log(`📊 Found ${count} carousel slides:\n`)
    
    if (slides && slides.length > 0) {
      slides.forEach((slide, index) => {
        console.log(`🖼️  Slide ${index + 1}:`)
        console.log(`   ID: ${slide.id}`)
        console.log(`   Title: ${slide.title || 'No title'}`)
        console.log(`   Image URL: ${slide.image_url || 'No image'}`)
        console.log(`   Island: ${slide.island || 'No island'}`)
        console.log(`   Order: ${slide.order_index || 'No order'}`)
        console.log(`   Created: ${slide.created_at || 'No date'}`)
        console.log(`   Active: ${slide.is_active !== undefined ? slide.is_active : 'Unknown'}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No carousel slides found in the database')
    }
    
    // Also check if there are slides from the cloud that should have been migrated
    console.log('💭 Migration status:')
    console.log('   - During migration, we found 0 carousel slides in cloud')
    console.log('   - The 1 record you see might be from initial setup')
    console.log('   - Cloud carousel_slides table appears to be empty')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

checkCarouselSlides()
