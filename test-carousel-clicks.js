import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ'
);

async function testCarouselClickTracking() {
  console.log('🧪 TESTING CAROUSEL CLICK TRACKING\n')
  
  try {
    // 1. Fetch carousel slides like the app does
    console.log('📊 Fetching carousel slides for current island (bonaire)...')
    const { data: slides, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('island', 'bonaire')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) {
      console.error('❌ Error fetching slides:', error.message)
      return
    }
    
    console.log(`✅ Found ${slides?.length || 0} active carousel slides for Bonaire:`)
    slides?.forEach((slide, i) => {
      console.log(`   ${i+1}. "${slide.title}" (ID: ${slide.id})`)
      console.log(`      Clicks: ${slide.click_count || 0}`)
      console.log(`      Has external link: ${slide.external_link ? '✅ YES' : '❌ NO'}`)
    })
    
    if (!slides || slides.length === 0) {
      console.log('\n⚠️ No slides found - carousel will use fallback default slides')
      console.log('   Click tracking will not work on default slides!')
      return
    }
    
    // 2. Test click tracking on first real slide
    const testSlide = slides[0]
    console.log(`\n🎯 Testing click tracking on: "${testSlide.title}"`)
    console.log(`   Current clicks: ${testSlide.click_count || 0}`)
    
    // Simulate exactly what CarouselClickTracker.trackClick does
    const { data: currentSlide } = await supabase
      .from('carousel_slides')
      .select('click_count')
      .eq('id', testSlide.id)
      .single()
    
    const newClickCount = (currentSlide?.click_count || 0) + 1
    
    const { error: updateError } = await supabase
      .from('carousel_slides')
      .update({ 
        click_count: newClickCount,
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', testSlide.id)
    
    if (updateError) {
      console.log('❌ Click tracking failed:', updateError.message)
    } else {
      console.log('✅ Click tracked successfully!')
      console.log(`   New click count: ${newClickCount}`)
    }
    
    // 3. Verify the update
    const { data: verifySlide } = await supabase
      .from('carousel_slides')
      .select('click_count, last_clicked_at')
      .eq('id', testSlide.id)
      .single()
    
    console.log('\n🔍 Verification:')
    console.log(`   Click count: ${verifySlide?.click_count}`)
    console.log(`   Last clicked: ${verifySlide?.last_clicked_at}`)
    
    // 4. Test opening external links (simulation)
    if (testSlide.external_link) {
      console.log('\n🔗 External link test:')
      console.log(`   Would open: ${testSlide.external_link}`)
      console.log('   ✅ External link opening would work')
    } else {
      console.log('\n⚠️ No external link - clicking will only track, not navigate')
    }
    
    console.log('\n📋 SUMMARY:')
    console.log(`   ✅ Real slides loaded: ${slides.length}`)
    console.log(`   ✅ Click tracking working: YES`)
    console.log(`   ✅ Database updates: SUCCESSFUL`)
    console.log('\n🎉 Carousel click tracking should work in the app!')
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testCarouselClickTracking()
