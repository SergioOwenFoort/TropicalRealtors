import { supabase } from '../config/supabase.config';

/**
 * Utility to test carousel image upload functionality
 */
export class CarouselUploadTester {
  
  static async testStorageBuckets(): Promise<void> {
    console.log('🔍 Testing Supabase storage buckets...');
    
    try {
      // Test listing buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Error listing buckets:', bucketsError);
        return;
      }
      
      console.log('📦 Available buckets:', buckets?.map(b => b.name));
      
      // Check for carousel-ads bucket
      const carouselBucket = buckets?.find(b => b.name === 'carousel-ads');
      const imagesBucket = buckets?.find(b => b.name === 'images');
      
      console.log('🎠 Carousel-ads bucket exists:', !!carouselBucket);
      console.log('🖼️ Images bucket exists:', !!imagesBucket);
      
      // Test file listing in each bucket
      if (carouselBucket) {
        const { data: carouselFiles, error: carouselError } = await supabase.storage
          .from('carousel-ads')
          .list('', { limit: 5 });
          
        if (carouselError) {
          console.error('❌ Error accessing carousel-ads bucket:', carouselError);
        } else {
          console.log('📁 Carousel-ads bucket accessible, sample files:', carouselFiles?.length);
        }
      }
      
      if (imagesBucket) {
        const { data: imageFiles, error: imageError } = await supabase.storage
          .from('images')
          .list('', { limit: 5 });
          
        if (imageError) {
          console.error('❌ Error accessing images bucket:', imageError);
        } else {
          console.log('📁 Images bucket accessible, sample files:', imageFiles?.length);
        }
      }
      
    } catch (error) {
      console.error('💥 Critical error testing buckets:', error);
    }
  }
  
  static async testImageUpload(file: File, userId: string): Promise<void> {
    console.log('🧪 Testing image upload with file:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
    
    // Test each bucket individually
    const fileExt = file.name.split('.').pop();
    const fileName = `test-${Date.now()}.${fileExt}`;
    
    // Test carousel-ads bucket
    try {
      const carouselPath = `${userId}/test-${fileName}`;
      console.log('🎠 Testing carousel-ads upload to:', carouselPath);
      
      const { error: carouselError } = await supabase.storage
        .from('carousel-ads')
        .upload(carouselPath, file);
        
      if (carouselError) {
        console.error('❌ Carousel-ads upload failed:', carouselError);
      } else {
        console.log('✅ Carousel-ads upload successful');
        
        // Clean up test file
        await supabase.storage.from('carousel-ads').remove([carouselPath]);
      }
    } catch (error) {
      console.error('💥 Carousel-ads test error:', error);
    }
    
    // Test images bucket
    try {
      const imagesPath = `${userId}/test-${fileName}`;
      console.log('🖼️ Testing images upload to:', imagesPath);
      
      const { error: imagesError } = await supabase.storage
        .from('images')
        .upload(imagesPath, file);
        
      if (imagesError) {
        console.error('❌ Images upload failed:', imagesError);
      } else {
        console.log('✅ Images upload successful');
        
        // Clean up test file
        await supabase.storage.from('images').remove([imagesPath]);
      }
    } catch (error) {
      console.error('💥 Images test error:', error);
    }
  }
  
  static createTestFile(): File {
    // Create a small test image file
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText('TEST', 30, 55);
    }
    
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'test-image.png', { type: 'image/png' }));
        }
      }, 'image/png');
    }) as unknown as File;
  }
}
