// FRONTEND DIAGNOSTIC - Run this in your browser F12 console
// This will help identify what's wrong with the carousel

console.log('🔍 === FRONTEND CAROUSEL DIAGNOSTIC ===');

// Check if React components are working
console.log('📊 Checking component state...');

// Test direct Supabase connection
import { supabase } from './src/config/supabase.config';

console.log('🔌 Testing Supabase connection...');
supabase
  .from('carousel_slides')
  .select('*')
  .limit(5)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connection working. Slides found:', data?.length || 0);
      console.log('Sample slides:', data);
    }
  });

// Test carousel service
import { CarouselService } from './src/services/carouselService';

console.log('🎠 Testing CarouselService...');
CarouselService.getCurrentWeekSlidesByIsland('curacao')
  .then(slides => {
    console.log('✅ CarouselService working. Slides for Curacao:', slides.length);
    console.log('Curacao slides:', slides);
  })
  .catch(error => {
    console.error('❌ CarouselService failed:', error);
  });

// Check if useCarouselSlides hook is available
try {
  const { useCarouselSlides } = await import('./src/hooks/useCarouselSlides');
  console.log('✅ useCarouselSlides hook available');
} catch (error) {
  console.error('❌ useCarouselSlides hook failed to load:', error);
}

// Check current page and components
console.log('📍 Current page:', window.location.pathname);
console.log('🏗️ React root element:', document.getElementById('root'));

// Check for carousel components in DOM
const carouselElements = document.querySelectorAll('[class*="carousel"], [class*="slide"]');
console.log('🎡 Carousel elements found:', carouselElements.length);
carouselElements.forEach((el, index) => {
  console.log(`  ${index + 1}:`, el.className, el.tagName);
});

// Check for error boundaries or error messages
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
console.log('❌ Error elements found:', errorElements.length);
errorElements.forEach((el, index) => {
  console.log(`  Error ${index + 1}:`, el.textContent);
});

// Check console for any React errors
console.log('🔍 Check console above for any React component errors or warnings');

console.log('🏁 === FRONTEND DIAGNOSTIC COMPLETE ===');
console.log('');
console.log('📋 Next steps:');
console.log('1. Check if Supabase connection is working');
console.log('2. Look for any error messages in the console');
console.log('3. Check if carousel components are rendering');
console.log('4. Run the SQL diagnostic script in Supabase');
