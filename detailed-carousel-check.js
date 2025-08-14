import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function detailedCarouselCheck() {
  console.log('🔍 DETAILED CAROUSEL SLIDES ANALYSIS\n')
  
  try {
    // Get all carousel slides with all possible fields
    const { data: slides, error, count } = await supabase
      .from('carousel_slides')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('❌ Error getting carousel slides:', error.message)
      return
    }
    
    console.log(`📊 TOTAL SLIDES: ${count}\n`)
    
    if (slides && slides.length > 0) {
      slides.forEach((slide, index) => {
        console.log(`🖼️  SLIDE ${index + 1}:`)
        console.log(`   ├─ ID: ${slide.id}`)
        console.log(`   ├─ Title: "${slide.title || 'No title'}"`)
        console.log(`   ├─ Description: "${slide.description || 'No description'}"`)
        console.log(`   ├─ Image URL: ${slide.image_url || 'No image'}`)
        console.log(`   ├─ Link URL: ${slide.link_url || 'No link'}`)
        console.log(`   ├─ Island: ${slide.island || 'No island specified'}`)
        console.log(`   ├─ Order Index: ${slide.order_index !== null ? slide.order_index : 'Not set'}`)
        console.log(`   ├─ Active: ${slide.is_active ? '✅ Yes' : '❌ No'}`)
        console.log(`   ├─ Created: ${new Date(slide.created_at).toLocaleDateString()} ${new Date(slide.created_at).toLocaleTimeString()}`)
        console.log(`   └─ Updated: ${slide.updated_at ? new Date(slide.updated_at).toLocaleDateString() + ' ' + new Date(slide.updated_at).toLocaleTimeString() : 'Never'}`)
        console.log('')
      })
      
      // Summary
      console.log('📋 SUMMARY:')
      const activeSlides = slides.filter(s => s.is_active).length
      const inactiveSlides = slides.filter(s => !s.is_active).length
      const byIsland = slides.reduce((acc, s) => {
        const island = s.island || 'unspecified'
        acc[island] = (acc[island] || 0) + 1
        return acc
      }, {})
      
      console.log(`   ├─ Active slides: ${activeSlides}`)
      console.log(`   ├─ Inactive slides: ${inactiveSlides}`)
      console.log(`   └─ By island:`)
      Object.entries(byIsland).forEach(([island, count]) => {
        console.log(`       └─ ${island}: ${count} slides`)
      })
      
    } else {
      console.log('⚠️  NO CAROUSEL SLIDES FOUND IN LOCAL DATABASE')
      console.log('\n💡 This means:')
      console.log('   - No slides were migrated from cloud (cloud was empty)')
      console.log('   - No default slides were created during setup')
      console.log('   - The carousel will be empty on your website')
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message)
  }
}

detailedCarouselCheck()
