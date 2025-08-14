// Frontend diagnostic test - run this in browser console
// This will help identify what specific functionality is failing

console.log('=== FRONTEND DIAGNOSTIC TEST ===');

// Test 1: Check if user role is working
import { useUserRole } from './src/hooks/useUserRole';
console.log('Testing user role detection...');

// Test 2: Check carousel service
import { CarouselService } from './src/services/carouselService';
console.log('Testing carousel service...');

// Test 3: Try to fetch carousel slides
CarouselService.getCurrentWeekSlidesByIsland('curacao')
  .then(slides => {
    console.log('✅ Carousel slides fetch successful:', slides.length, 'slides found');
    console.log('Sample slide:', slides[0]);
  })
  .catch(error => {
    console.error('❌ Carousel slides fetch failed:', error);
  });

// Test 4: Check if carousel_slides table is accessible
import { supabase } from './src/config/supabase.config';
supabase
  .from('carousel_slides')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Direct carousel_slides query failed:', error);
    } else {
      console.log('✅ Direct carousel_slides query successful:', data);
    }
  });

// Test 5: Check storage buckets
supabase.storage
  .listBuckets()
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Storage buckets list failed:', error);
    } else {
      console.log('✅ Storage buckets available:', data?.map(b => b.name));
    }
  });

console.log('=== DIAGNOSTIC TESTS INITIATED ===');
console.log('Check the console output above for results');
