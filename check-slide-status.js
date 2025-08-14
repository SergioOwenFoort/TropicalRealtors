import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0OTc5NDIsImV4cCI6MjA2NDA3Mzk0Mn0.ArTpMCR1hUP0P0EwQCCfjogswFvEbWZMXxidjNBwyIQ'
);

async function checkSlideStatus() {
  console.log('🔍 CHECKING ALL CAROUSEL SLIDES STATUS\n')
  
  const { data, error } = await supabase
    .from('carousel_slides')
    .select('*')
    .order('display_order')
  
  if (error) {
    console.error('Error:', error.message)
    return
  }
  
  console.log('📊 ALL SLIDES:')
  data?.forEach((slide, i) => {
    console.log(`${i+1}. "${slide.title}" (ID: ${slide.id})`)
    console.log(`   Island: ${slide.island}`)
    console.log(`   Active: ${slide.is_active ? '✅ YES' : '❌ NO'}`)
    console.log(`   Clicks: ${slide.click_count || 0}`)
    console.log(`   Display Order: ${slide.display_order}`)
    console.log(`   Last Clicked: ${slide.last_clicked_at || 'Never'}`)
    console.log('')
  })
  
  const activeSlides = data?.filter(slide => slide.is_active) || []
  const inactiveSlides = data?.filter(slide => !slide.is_active) || []
  
  console.log(`📈 SUMMARY:`)
  console.log(`   Total slides: ${data?.length || 0}`)
  console.log(`   Active slides: ${activeSlides.length}`)
  console.log(`   Inactive slides: ${inactiveSlides.length}`)
  
  if (inactiveSlides.length > 0) {
    console.log('\n⚠️ INACTIVE SLIDES (clicks won\'t work):')
    inactiveSlides.forEach(slide => {
      console.log(`   - "${slide.title}" (${slide.island})`)
    })
  }
}

checkSlideStatus()
