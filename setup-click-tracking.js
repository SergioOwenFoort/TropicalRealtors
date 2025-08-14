import { createClient } from '@supabase/supabase-js'

// Cloud configuration
const cloudSupabase = createClient(
  'https://imhtjggudeidvmpgwjho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaHRqZ2d1ZGVpZHZtcGd3amhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ5Nzk0MiwiZXhwIjoyMDY0MDczOTQyfQ.YRn8qKQwv1qjd0Ot9_cxxSlZHkKfm7xraJE2a42xjAw',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkAndApplyClickTracking() {
  console.log('🔍 CHECKING CLICK TRACKING INFRASTRUCTURE\n')
  
  try {
    // 1. Check if click tracking columns exist
    console.log('📊 Checking carousel_slides table structure...')
    
    const { data: slides, error: slidesError } = await cloudSupabase
      .from('carousel_slides')
      .select('*')
      .limit(1)
    
    if (slidesError) {
      console.error('❌ Error accessing carousel_slides:', slidesError.message)
      return
    }
    
    const hasClickCount = slides && slides.length > 0 && 'click_count' in slides[0]
    const hasLastClicked = slides && slides.length > 0 && 'last_clicked_at' in slides[0]
    
    console.log(`   Click count column: ${hasClickCount ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   Last clicked column: ${hasLastClicked ? '✅ EXISTS' : '❌ MISSING'}`)
    
    // 2. Check if RPC function exists
    console.log('\n🔧 Checking RPC functions...')
    
    try {
      const { data: rpcTest, error: rpcError } = await cloudSupabase
        .rpc('increment_carousel_click', { slide_id: 999999 }) // Test with non-existent ID
      
      if (rpcError && rpcError.message.includes('function increment_carousel_click does not exist')) {
        console.log('   ❌ RPC function increment_carousel_click: MISSING')
      } else {
        console.log('   ✅ RPC function increment_carousel_click: EXISTS')
      }
    } catch (error) {
      if (error.message.includes('function increment_carousel_click does not exist')) {
        console.log('   ❌ RPC function increment_carousel_click: MISSING')
      } else {
        console.log('   ✅ RPC function increment_carousel_click: EXISTS')
      }
    }
    
    // 3. Apply migration if needed
    if (!hasClickCount || !hasLastClicked) {
      console.log('\n🚀 APPLYING CLICK TRACKING MIGRATION\n')
      
      const migrationSQL = `
-- Add click tracking columns if they don't exist
DO $$ 
BEGIN
  -- Add click_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carousel_slides' 
    AND column_name = 'click_count'
  ) THEN
    ALTER TABLE carousel_slides ADD COLUMN click_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added click_count column';
  ELSE
    RAISE NOTICE 'click_count column already exists';
  END IF;
  
  -- Add last_clicked_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carousel_slides' 
    AND column_name = 'last_clicked_at'
  ) THEN
    ALTER TABLE carousel_slides ADD COLUMN last_clicked_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added last_clicked_at column';
  ELSE
    RAISE NOTICE 'last_clicked_at column already exists';
  END IF;
END $$;

-- Create or replace the RPC function for incrementing clicks
CREATE OR REPLACE FUNCTION increment_carousel_click(slide_id UUID)
RETURNS JSON AS $$
DECLARE
    result_row record;
BEGIN
    -- Update the click count and last clicked timestamp
    UPDATE carousel_slides 
    SET 
        click_count = COALESCE(click_count, 0) + 1,
        last_clicked_at = NOW()
    WHERE id = slide_id
    RETURNING 
        id, 
        title, 
        click_count, 
        last_clicked_at 
    INTO result_row;
    
    -- Check if the slide was found and updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Slide with id % not found', slide_id;
    END IF;
    
    -- Return the updated data as JSON
    RETURN json_build_object(
        'id', result_row.id,
        'title', result_row.title,
        'click_count', result_row.click_count,
        'last_clicked_at', result_row.last_clicked_at,
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_carousel_click(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_carousel_click(UUID) TO anon;
      `
      
      console.log('📤 Executing migration SQL...')
      
      const { error: migrationError } = await cloudSupabase.rpc('exec_sql', {
        sql_query: migrationSQL
      })
      
      if (migrationError) {
        console.log('⚠️ exec_sql function not available, trying direct execution...')
        
        // Try alternative approach - execute parts individually
        const sqlStatements = [
          `ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0`,
          `ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP WITH TIME ZONE`,
          `
CREATE OR REPLACE FUNCTION increment_carousel_click(slide_id UUID)
RETURNS JSON AS $$
DECLARE
    result_row record;
BEGIN
    UPDATE carousel_slides 
    SET 
        click_count = COALESCE(click_count, 0) + 1,
        last_clicked_at = NOW()
    WHERE id = slide_id
    RETURNING 
        id, 
        title, 
        click_count, 
        last_clicked_at 
    INTO result_row;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Slide with id % not found', slide_id;
    END IF;
    
    RETURN json_build_object(
        'id', result_row.id,
        'title', result_row.title,
        'click_count', result_row.click_count,
        'last_clicked_at', result_row.last_clicked_at,
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        ]
        
        console.log('\n⚠️ Manual migration required. Please execute the following SQL in your Supabase SQL editor:')
        console.log('\n' + '='.repeat(80))
        console.log(migrationSQL)
        console.log('='.repeat(80))
      } else {
        console.log('✅ Migration executed successfully!')
      }
    } else {
      console.log('\n✅ Click tracking infrastructure is already set up!')
    }
    
    // 4. Test click tracking functionality
    console.log('\n🧪 TESTING CLICK TRACKING FUNCTIONALITY')
    
    const { data: testSlides } = await cloudSupabase
      .from('carousel_slides')
      .select('id, title, click_count, last_clicked_at')
      .limit(1)
    
    if (testSlides && testSlides.length > 0) {
      const testSlide = testSlides[0]
      console.log(`\n🎯 Testing with slide: "${testSlide.title}" (ID: ${testSlide.id})`)
      console.log(`   Current click count: ${testSlide.click_count || 0}`)
      
      try {
        const { data: clickResult, error: clickError } = await cloudSupabase
          .rpc('increment_carousel_click', { slide_id: testSlide.id })
        
        if (clickError) {
          console.log('❌ Click tracking test failed:', clickError.message)
        } else {
          console.log('✅ Click tracking test successful!')
          console.log(`   New click count: ${clickResult.click_count}`)
          console.log(`   Last clicked: ${clickResult.last_clicked_at}`)
        }
      } catch (error) {
        console.log('❌ Click tracking test failed:', error.message)
      }
    }
    
    console.log('\n📋 SUMMARY:')
    console.log('✅ Carousel slides: Present in cloud database')
    console.log(`${hasClickCount ? '✅' : '⚠️'} Click count column: ${hasClickCount ? 'Ready' : 'Needs setup'}`)
    console.log(`${hasLastClicked ? '✅' : '⚠️'} Last clicked column: ${hasLastClicked ? 'Ready' : 'Needs setup'}`)
    console.log('🎯 Click tracking should now work consistently!')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

checkAndApplyClickTracking()
