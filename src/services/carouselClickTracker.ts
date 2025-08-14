import { supabase } from '../config/supabase.config';

export class CarouselClickTracker {
  /**
   * Track a click on a carousel slide
   */
  static async trackClick(slideId: string): Promise<boolean> {
    try {
      // Don't track clicks on placeholder slides
      if (slideId.startsWith('placeholder-')) {
        return false;
      }

      // Get current count and increment with direct update
      const { data: currentSlide } = await supabase
        .from('carousel_slides')
        .select('click_count')
        .eq('id', slideId)
        .single();

      const newClickCount = (currentSlide?.click_count || 0) + 1;

      const { error } = await supabase
        .from('carousel_slides')
        .update({ 
          click_count: newClickCount,
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', slideId);

      if (error) {
        console.error('Error tracking carousel click:', error);
        return false;
      }

      console.log(`✅ Tracked click for slide: ${slideId}`);
      return true;
    } catch (error) {
      console.error('Error in click tracking:', error);
      return false;
    }
  }

  /**
   * Get click statistics for carousel slides
   */
  static async getClickStats(filters?: {
    island?: 'bonaire' | 'aruba' | 'curacao';
    createdBy?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('carousel_slides')
        .select('id, title, image_url, island, click_count, last_clicked_at, created_by, created_at')
        .order('click_count', { ascending: false });

      if (filters?.island) {
        query = query.eq('island', filters.island);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching click stats:', error);
        // Fallback to basic query without click columns
        const fallbackQuery = supabase
          .from('carousel_slides')
          .select('id, title, image_url, island, created_by, created_at')
          .order('created_at', { ascending: false });

        if (filters?.island) {
          fallbackQuery.eq('island', filters.island);
        }

        if (filters?.createdBy) {
          fallbackQuery.eq('created_by', filters.createdBy);
        }

        const { data: fallbackData } = await fallbackQuery;
        return (fallbackData || []).map(slide => ({
          ...slide,
          click_count: 0,
          last_clicked_at: null
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Error in getClickStats:', error);
      return [];
    }
  }

  /**
   * Get total clicks across all slides for a user or island
   */
  static async getTotalClicks(filters?: {
    island?: 'bonaire' | 'aruba' | 'curacao';
    createdBy?: string;
  }) {
    try {
      let query = supabase
        .from('carousel_slides')
        .select('click_count');

      if (filters?.island) {
        query = query.eq('island', filters.island);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching total clicks:', error);
        return 0;
      }

      return data?.reduce((total, slide) => total + (slide.click_count || 0), 0) || 0;
    } catch (error) {
      console.error('Error in getTotalClicks:', error);
      return 0;
    }
  }
}
