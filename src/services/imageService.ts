import { supabase } from '../config/supabase.config';

export interface ImageUploadResult {
  url: string;
  path: string;
}

/**
 * Upload realtor profile image
 * @param userId - The user ID (used for folder organization)
 * @param file - The image file to upload
 * @returns Promise with the public URL and storage path
 */
export async function uploadRealtorImage(userId: string, file: File): Promise<ImageUploadResult> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile-image.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('realtor-images')
    .upload(fileName, file, { upsert: true });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('realtor-images')
    .getPublicUrl(fileName);
  
  return {
    url: publicUrl,
    path: fileName
  };
}

/**
 * Upload property listing images
 * @param propertyId - The property ID (used for folder organization)
 * @param files - Array of image files to upload
 * @returns Promise with array of public URLs and storage paths
 */
export async function uploadPropertyImages(propertyId: string, files: File[]): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/image-${index + 1}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);
    
    return {
      url: publicUrl,
      path: fileName
    };
  });
  
  return Promise.all(uploadPromises);
}

/**
 * Upload carousel advertisement images
 * @param companyId - The company/advertiser ID (used for folder organization)
 * @param files - Array of image files to upload
 * @returns Promise with array of public URLs and storage paths
 */
export async function uploadCarouselAds(companyId: string, files: File[]): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/ad-${index + 1}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('carousel-ads')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('carousel-ads')
      .getPublicUrl(fileName);
    
    return {
      url: publicUrl,
      path: fileName
    };
  });
  
  return Promise.all(uploadPromises);
}

/**
 * Delete realtor profile image
 * @param imagePath - The storage path of the image to delete
 */
export async function deleteRealtorImage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('realtor-images')
    .remove([imagePath]);
  
  if (error) throw error;
}

/**
 * Delete property images
 * @param imagePaths - Array of storage paths to delete
 */
export async function deletePropertyImages(imagePaths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from('property-images')
    .remove(imagePaths);
  
  if (error) throw error;
}

/**
 * Delete carousel advertisement images
 * @param imagePaths - Array of storage paths to delete
 */
export async function deleteCarouselAds(imagePaths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from('carousel-ads')
    .remove(imagePaths);
  
  if (error) throw error;
}

/**
 * Get all images for a property
 * @param propertyId - The property ID
 * @returns Promise with array of image URLs
 */
export async function getPropertyImages(propertyId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from('property-images')
    .list(propertyId);
  
  if (error) throw error;
  
  if (!data) return [];
  
  return data.map(file => {
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(`${propertyId}/${file.name}`);
    return publicUrl;
  });
}

/**
 * Get all carousel advertisement images
 * @param companyId - The company ID (optional - if not provided, gets all ads)
 * @returns Promise with array of image URLs
 */
export async function getCarouselAds(companyId?: string): Promise<string[]> {
  if (companyId) {
    // Get ads for specific company
    const { data, error } = await supabase.storage
      .from('carousel-ads')
      .list(companyId);
    
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('carousel-ads')
        .getPublicUrl(`${companyId}/${file.name}`);
      return publicUrl;
    });
  } else {
    // Get all carousel ads (for displaying in carousel)
    const { data, error } = await supabase.storage
      .from('carousel-ads')
      .list();
    
    if (error) throw error;
    
    if (!data) return [];
    
    const allImages: string[] = [];
    
    // For each company folder, get all images
    for (const folder of data) {
      if (folder.name) {
        const { data: folderData } = await supabase.storage
          .from('carousel-ads')
          .list(folder.name);
        
        if (folderData) {
          const folderImages = folderData.map(file => {
            const { data: { publicUrl } } = supabase.storage
              .from('carousel-ads')
              .getPublicUrl(`${folder.name}/${file.name}`);
            return publicUrl;
          });
          allImages.push(...folderImages);
        }
      }
    }
    
    return allImages;
  }
}

/**
 * Resize and optimize image before upload (optional utility)
 * @param file - The original file
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise with the compressed file
 */
export async function compressImage(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}
