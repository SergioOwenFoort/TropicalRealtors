import { supabase } from '../config/supabase.config';
import { CarouselSlide, CarouselSlideInput } from '../types';

export class CarouselService {
  // Calendar helper functions - 13 period system starting Monday June 30, 2025
  private static readonly CALENDAR_START_DATE = new Date(2025, 5, 30); // June 30, 2025 (Monday)
  
  private static getCurrentPeriod(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.CALENDAR_START_DATE.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const period = Math.floor(diffWeeks / 4) + 1;
    
    // Ensure period is between 1 and 13
    return Math.max(1, Math.min(13, period));
  }

  private static getPeriodFromDate(date: Date): number {
    const diffTime = date.getTime() - this.CALENDAR_START_DATE.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const period = Math.floor(diffWeeks / 4) + 1;
    
    // Ensure period is between 1 and 13
    return Math.max(1, Math.min(13, period));
  }

  private static getPeriodDateRange(period: number): { start: Date; end: Date } {
    const weeksFromStart = (period - 1) * 4;
    const periodStart = new Date(this.CALENDAR_START_DATE.getTime() + (weeksFromStart * 7 * 24 * 60 * 60 * 1000));
    const periodEnd = new Date(periodStart.getTime() + (27 * 24 * 60 * 60 * 1000)); // 4 weeks - 1 day
    
    return { start: periodStart, end: periodEnd };
  }

  // Get all active carousel slides for a specific island filtered by current period
static async getActiveSlidesByIsland(island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): Promise<CarouselSlide[]> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('is_active', true)
        .eq('island', island)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching carousel slides:', error);
        return [];
      }

      // Filter slides based on current period
      const currentPeriod = this.getCurrentPeriod();
      const filteredData = (data || []).filter(slide => {
        const slideDate = new Date(slide.created_at);
        const slidePeriod = this.getPeriodFromDate(slideDate);
        return slidePeriod === currentPeriod;
      });

      return filteredData;
    } catch (error) {
      console.error('Error in getActiveSlidesByIsland:', error);
      return [];
    }
  }

  // Get active slides for current week (alias for getActiveSlidesByIsland)
static async getCurrentWeekSlidesByIsland(island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): Promise<CarouselSlide[]> {
    return this.getActiveSlidesByIsland(island);
  }

  // Get slides for a specific period and island
static async getSlidesByIslandAndPeriod(
    island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten', 
    periodNumber?: number, 
    _year?: number
  ): Promise<CarouselSlide[]> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('island', island)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching slides by island and period:', error);
        return [];
      }

      // Filter slides based on specified period (or current period if not specified)
      const targetPeriod = periodNumber || this.getCurrentPeriod();
      const filteredData = (data || []).filter(slide => {
        const slideDate = new Date(slide.created_at);
        const slidePeriod = this.getPeriodFromDate(slideDate);
        return slidePeriod === targetPeriod;
      });

      return filteredData;
    } catch (error) {
      console.error('Error in getSlidesByIslandAndPeriod:', error);
      return [];
    }
  }
  // Get all slides for management (admin/realtor/owner)
  static async getAllSlides(): Promise<CarouselSlide[]> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('island', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching all carousel slides:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSlides:', error);
      return [];
    }
  }

  // Get slides by user
  static async getSlidesByUser(userId: string): Promise<CarouselSlide[]> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('created_by', userId)
        .order('island', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching user carousel slides:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSlidesByUser:', error);
      return [];
    }
  }

  // Get next available display order for a specific island
static async getNextDisplayOrder(island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('display_order')
        .eq('island', island)
        .order('display_order', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error getting max display order:', error);
        return 1; // Default to 1 if error
      }

      const maxOrder = data && data.length > 0 ? data[0].display_order : 0;
      const nextOrder = Math.max(maxOrder + 1, 1); // Ensure it's at least 1
      
      return nextOrder;
    } catch (error) {
      console.error('Error in getNextDisplayOrder:', error);
      return 1; // Default to 1 if error
    }
  }

  // Manual cleanup function for admins
  static async cleanupAllTestSlides(): Promise<{ removed: number; slides: string[] }> {
    try {
      
      // Define patterns that identify test slides
      const testPatterns = [
        'test',
        'placeholder',
        'example',
        'demo',
        'sample',
        'https://test.com',
        'https://example.com',
        'https://placeholder.com',
        'test.jpg',
        'test.png',
        'placeholder.jpg',
        'example.jpg'
      ];

      const { data: allSlides, error: fetchError } = await supabase
        .from('carousel_slides')
        .select('*');

      if (fetchError) {
        console.error('Error fetching all slides for cleanup:', fetchError);
        return { removed: 0, slides: [] };
      }

      if (!allSlides || allSlides.length === 0) {
        return { removed: 0, slides: [] };
      }

      // Find test slides based on patterns
      const testSlides = allSlides.filter(slide => {
        const imageUrlLower = slide.image_url?.toLowerCase() || '';
        const externalLinkLower = slide.external_link?.toLowerCase() || '';

        return testPatterns.some(pattern => 
          imageUrlLower.includes(pattern) ||
          externalLinkLower.includes(pattern)
        );
      });

      if (testSlides.length > 0) {
        const slideNames = testSlides.map(s => s.id);
        
        const testSlideIds = testSlides.map(slide => slide.id);
        
        const { error: deleteError } = await supabase
          .from('carousel_slides')
          .delete()
          .in('id', testSlideIds);

        if (deleteError) {
          console.error('Error deleting test slides:', deleteError);
          return { removed: 0, slides: [] };
        } else {
          return { removed: testSlides.length, slides: slideNames };
        }
      } else {
        return { removed: 0, slides: [] };
      }
    } catch (error) {
      console.error('Error in cleanupAllTestSlides:', error);
      return { removed: 0, slides: [] };
    }
  }

  // Remove test slides when a real slide with link is uploaded
  static async removeTestSlides(island: 'bonaire' | 'aruba' | 'curacao'): Promise<void> {
    try {
      
      // Define patterns that identify test slides
      const testPatterns = [
        'test',
        'placeholder',
        'example',
        'demo',
        'sample',
        'https://test.com',
        'https://example.com',
        'https://placeholder.com',
        'test.jpg',
        'test.png',
        'placeholder.jpg',
        'example.jpg'
      ];

      const { data: existingSlides, error: fetchError } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('island', island);

      if (fetchError) {
        console.error('Error fetching slides for cleanup:', fetchError);
        return;
      }

      if (!existingSlides || existingSlides.length === 0) {
        return;
      }

      // Find test slides based on patterns
      const testSlides = existingSlides.filter(slide => {
        const imageUrlLower = slide.image_url?.toLowerCase() || '';
        const externalLinkLower = slide.external_link?.toLowerCase() || '';

        return testPatterns.some(pattern => 
          imageUrlLower.includes(pattern) ||
          externalLinkLower.includes(pattern)
        );
      });

      if (testSlides.length > 0) {
        const testSlideIds = testSlides.map(slide => slide.id);
        
        const { error: deleteError } = await supabase
          .from('carousel_slides')
          .delete()
          .in('id', testSlideIds);

        if (deleteError) {
          console.error('Error deleting test slides:', deleteError);
        }
      }
    } catch (error) {
      console.error('Error in removeTestSlides:', error);
    }
  }

  // Create a new slide
  static async createSlide(slideData: CarouselSlideInput): Promise<CarouselSlide | null> {
    try {
      // Get the next available display order if not provided or if it's 0
      let displayOrder = slideData.display_order;
      if (!displayOrder || displayOrder === 0) {
      displayOrder = await this.getNextDisplayOrder(slideData.island);
      }
      
      // Set default values and ensure we don't have any old sort_order property
      const { sort_order, ...cleanSlideData } = slideData as any; // Remove any old sort_order property
      const slideWithDefaults = {
        ...cleanSlideData,
        title: cleanSlideData.title || 'Carousel Advertisement', // Provide default title
        display_order: displayOrder,
        year: new Date().getFullYear(), // Add required year field
        always_visible: false, // Add default value
        // Keep external_link as-is since that's what the DB expects
        // unique_id and created_by will be set automatically by the database trigger
      };

      // If this is a real slide with a link, remove test slides first
      if (slideWithDefaults.external_link && slideWithDefaults.external_link.trim() !== '') {
        await this.removeTestSlides(slideWithDefaults.island);
      }

      const { data, error } = await supabase
        .from('carousel_slides')
        .insert([slideWithDefaults])
        .select()
        .single();

      if (error) {
        console.error('Error creating carousel slide:');
        console.error('Error object:', JSON.stringify(error, null, 2));
        console.error('Failed slideData:', JSON.stringify(slideWithDefaults, null, 2));
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      if (!data) {
        console.error('No data returned from insert operation');
        return null;
      }

      return data;
    } catch (error) {
      console.error('💥 Exception in createSlide:', error);
      console.error('   - Error type:', typeof error);
      console.error('   - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('   - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return null;
    }
  }

  // Check if a slot is available (max 8 slides per island)
static async isSlotAvailable(
    island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('carousel_slides')
        .select('*', { count: 'exact', head: true })
        .eq('island', island);

      if (error) {
        console.error('Error checking slot availability:', error);
        return false;
      }

      return (count || 0) < 8;
    } catch (error) {
      console.error('Error in isSlotAvailable:', error);
      return false;
    }
  }

  // Update a slide
  static async updateSlide(id: string, slideData: Partial<CarouselSlideInput>): Promise<CarouselSlide | null> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .update(slideData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating carousel slide:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateSlide:', error);
      return null;
    }
  }

  // Delete a slide
  static async deleteSlide(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting carousel slide:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSlide:', error);
      return false;
    }
  }

  // Toggle slide active status
  static async toggleSlideStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling slide status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleSlideStatus:', error);
      return false;
    }
  }

  // Update slide order
  static async updateSlideOrder(id: string, newOrder: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) {
        console.error('Error updating slide order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSlideOrder:', error);
      return false;
    }
  }

  // Upload image to Supabase storage
  static async uploadImage(file: File, userId: string): Promise<string | null> {
    try {
      console.log('🔄 Starting image upload for carousel...', { file: file.name, userId, size: file.size });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/ad-${fileName}`;

      console.log('📁 Upload path:', filePath);

      // Try primary bucket: carousel-ads
      console.log('🎠 Trying carousel-ads bucket...');
      const { error: primaryError } = await supabase.storage
        .from('carousel-ads')
        .upload(filePath, file);

      if (primaryError) {
        console.error('❌ Error uploading to carousel-ads bucket:', primaryError);
        console.log('🔄 Falling back to images bucket...');
        
        // Fallback to images bucket if carousel-ads doesn't work
        const { error: fallbackError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (fallbackError) {
          console.error('❌ Error uploading to images bucket:', fallbackError);
          
          // Try a third fallback with a simpler path
          console.log('🔄 Trying with simplified path...');
          const simplePath = `carousel/${fileName}`;
          const { error: simpleError } = await supabase.storage
            .from('images')
            .upload(simplePath, file);
            
          if (simpleError) {
            console.error('❌ All upload attempts failed:', simpleError);
            return null;
          }
          
          // Get public URL from images bucket with simple path
          const { data: simplePublicData } = supabase.storage
            .from('images')
            .getPublicUrl(simplePath);

          console.log('✅ Upload successful with simplified path:', simplePublicData.publicUrl);
          return simplePublicData.publicUrl;
        }
        
        // Get public URL from images bucket
        const { data: publicData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        console.log('✅ Upload successful to images bucket:', publicData.publicUrl);
        return publicData.publicUrl;
      }

      // Get public URL from carousel-ads bucket
      const { data: publicData } = supabase.storage
        .from('carousel-ads')
        .getPublicUrl(filePath);

      console.log('✅ Upload successful to carousel-ads bucket:', publicData.publicUrl);
      return publicData.publicUrl;
    } catch (error) {
      console.error('💥 Critical error in uploadImage:', error);
      return null;
    }
  }

  // Get slide counts for a specific island and current period
static async getSlideCounts(
    island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('island', island);

      if (error) {
        console.error('Error fetching slide counts:', error);
        return 0;
      }

      // Filter by current period
      const currentPeriod = this.getCurrentPeriod();
      const filteredData = (data || []).filter(slide => {
        const slideDate = new Date(slide.created_at);
        const slidePeriod = this.getPeriodFromDate(slideDate);
        return slidePeriod === currentPeriod;
      });

      return filteredData.length;
    } catch (error) {
      console.error('Error in getSlideCounts:', error);
      return 0;
    }
  }

  // Get slide counts for a specific island and period
static async getSlideCountsByPeriod(
    island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten',
    period: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('island', island);

      if (error) {
        console.error('Error fetching slide counts by period:', error);
        return 0;
      }

      // Filter by specified period
      const filteredData = (data || []).filter(slide => {
        const slideDate = new Date(slide.created_at);
        const slidePeriod = this.getPeriodFromDate(slideDate);
        return slidePeriod === period;
      });

      return filteredData.length;
    } catch (error) {
      console.error('Error in getSlideCountsByPeriod:', error);
      return 0;
    }
  }
}
