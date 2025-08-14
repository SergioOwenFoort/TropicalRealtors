import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ'
);

async function debugCarouselSetup() {
  console.log('🔍 DEBUGGING CAROUSEL SETUP AND CLICK HANDLING\n')
  
  try {
    // 1. Test the exact same query the context uses
    console.log('📊 Testing context carousel query...')
    const { data: contextSlides, error: contextError } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('island', 'bonaire')
      .eq('is_active', true)
      .order('display_order')
    
    if (contextError) {
      console.error('❌ Context query failed:', contextError.message)
      return
    }
    
    console.log(`✅ Context query returned ${contextSlides?.length || 0} slides`)
    
    // 2. Check if slides have all required fields
    if (contextSlides && contextSlides.length > 0) {
      console.log('\n📋 Slide field validation:')
      const firstSlide = contextSlides[0]
      const requiredFields = ['id', 'title', 'image_url', 'island', 'is_active', 'display_order']
      const optionalFields = ['description', 'external_link', 'click_count', 'last_clicked_at']
      
      requiredFields.forEach(field => {
        const hasField = field in firstSlide && firstSlide[field] !== null
        console.log(`   ${field}: ${hasField ? '✅' : '❌'} ${hasField ? firstSlide[field] : 'MISSING'}`)
      })
      
      optionalFields.forEach(field => {
        const hasField = field in firstSlide
        console.log(`   ${field}: ${hasField ? '✅' : '⚠️'} ${hasField ? firstSlide[field] || 'null' : 'MISSING'}`)
      })
    }
    
    // 3. Test if the slides would work in the carousel
    console.log('\n🎠 Carousel compatibility test:')
    if (contextSlides && contextSlides.length > 0) {
      console.log(`   ✅ Has slides: ${contextSlides.length} slides`)
      console.log(`   ✅ Will use real slides (not fallback)`)
      
      // Check if slides are clickable
      const clickableSlides = contextSlides.filter(slide => 
        slide.external_link && slide.external_link.trim() !== ''
      )
      console.log(`   📎 Clickable slides: ${clickableSlides.length}/${contextSlides.length}`)
      
      clickableSlides.forEach(slide => {
        console.log(`      - "${slide.title}": ${slide.external_link}`)
      })
      
      const nonClickableSlides = contextSlides.filter(slide => 
        !slide.external_link || slide.external_link.trim() === ''
      )
      if (nonClickableSlides.length > 0) {
        console.log(`   ⚠️ Non-clickable slides: ${nonClickableSlides.length}`)
        nonClickableSlides.forEach(slide => {
          console.log(`      - "${slide.title}": No external link`)
        })
      }
    } else {
      console.log(`   ❌ No slides - will use fallback default slides`)
      console.log(`   ⚠️ Click tracking won't work on fallback slides!`)
    }
    
    // 4. Test CarouselClickTracker logic simulation
    console.log('\n🎯 Click tracker simulation:')
    if (contextSlides && contextSlides.length > 0) {
      const testSlide = contextSlides[0]
      console.log(`   Testing with slide ID: ${testSlide.id}`)
      
      // Check if it's a placeholder
      if (testSlide.id.startsWith('placeholder-')) {
        console.log('   ❌ Is placeholder - click tracking will be skipped')
      } else {
        console.log('   ✅ Is real slide - click tracking will proceed')
        
        // Simulate the tracking process
        const beforeClick = testSlide.click_count || 0
        console.log(`   Current clicks: ${beforeClick}`)
        
        // Test the update query
        const { data: updateTest, error: updateError } = await supabase
          .from('carousel_slides')
          .update({ 
            click_count: beforeClick + 1,
            last_clicked_at: new Date().toISOString()
          })
          .eq('id', testSlide.id)
          .select('click_count')
        
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`)
        } else {
          console.log(`   ✅ Update successful: ${updateTest?.[0]?.click_count}`)
        }
      }
    }
    
    console.log('\n📊 DIAGNOSIS:')
    if (contextSlides && contextSlides.length > 0) {
      console.log('   ✅ Real slides are loading correctly')
      console.log('   ✅ Click tracking database operations work')
      console.log('   🔍 Issue is likely in the frontend event handling or component state')
      console.log('\n💡 NEXT STEPS:')
      console.log('   1. Check browser console for JavaScript errors')
      console.log('   2. Verify carousel component is using real slides (not fallback)')
      console.log('   3. Test click handlers in browser developer tools')
      console.log('   4. Check if slides are loading in the correct island context')
    } else {
      console.log('   ❌ No real slides are loading')
      console.log('   🔍 Carousel is using fallback default slides')
      console.log('   💡 This is why click tracking appears broken')
    }
    
  } catch (err) {
    console.error('❌ Debug failed:', err.message)
  }
}

debugCarouselSetup()
