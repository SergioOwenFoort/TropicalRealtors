import { supabase } from '../config/supabase.config';

/**
 * Service for getting property favorite counts and statistics
 */
export class PropertyFavoriteTracker {
  
  /**
   * Get favorite count for a specific property
   */
  static async getPropertyFavoriteCount(propertyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorites')
        .not('favorites', 'is', null);

      if (error) {
        console.error('Error fetching favorite counts:', error);
        return 0;
      }

      // Count how many users have this property in their favorites
      let count = 0;
      data?.forEach((profile: any) => {
        if (profile.favorites && Array.isArray(profile.favorites)) {
          if (profile.favorites.includes(propertyId)) {
            count++;
          }
        }
      });

      return count;
    } catch (error) {
      console.error('Error in getPropertyFavoriteCount:', error);
      return 0;
    }
  }

  /**
   * Get favorite counts for multiple properties
   */
  static async getMultiplePropertyFavoriteCounts(propertyIds: string[]): Promise<{ [key: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorites')
        .not('favorites', 'is', null);

      if (error) {
        console.error('Error fetching favorite counts:', error);
        return {};
      }

      const counts: { [key: string]: number } = {};
      
      // Initialize all counts to 0
      propertyIds.forEach(id => {
        counts[id] = 0;
      });

      // Count favorites for each property
      data?.forEach((profile: any) => {
        if (profile.favorites && Array.isArray(profile.favorites)) {
          profile.favorites.forEach((favoriteId: string) => {
            if (propertyIds.includes(favoriteId)) {
              counts[favoriteId] = (counts[favoriteId] || 0) + 1;
            }
          });
        }
      });

      return counts;
    } catch (error) {
      console.error('Error in getMultiplePropertyFavoriteCounts:', error);
      return {};
    }
  }

  /**
   * Get favorite statistics for properties owned by a specific user
   */
  static async getUserPropertyFavoriteStats(userId: string): Promise<{
    totalFavorites: number;
    averageFavorites: number;
    topProperty: { id: string; count: number; title?: string } | null;
    propertyCounts: { [key: string]: number };
  }> {
    try {
      // First get user's properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('created_by', userId);

      if (propError) throw propError;
      if (!properties || properties.length === 0) {
        return {
          totalFavorites: 0,
          averageFavorites: 0,
          topProperty: null,
          propertyCounts: {}
        };
      }

      const propertyIds = properties.map(p => p.id);
      const propertyCounts = await this.getMultiplePropertyFavoriteCounts(propertyIds);
      
      const totalFavorites = Object.values(propertyCounts).reduce((sum, count) => sum + count, 0);
      const averageFavorites = properties.length > 0 ? Math.round(totalFavorites / properties.length) : 0;
      
      // Find top property
      let topProperty = null;
      let maxCount = 0;
      
      for (const [propertyId, count] of Object.entries(propertyCounts)) {
        if (count > maxCount) {
          maxCount = count;
          const property = properties.find(p => p.id === propertyId);
          topProperty = {
            id: propertyId,
            count,
            title: property?.title
          };
        }
      }

      return {
        totalFavorites,
        averageFavorites,
        topProperty,
        propertyCounts
      };
    } catch (error) {
      console.error('Error in getUserPropertyFavoriteStats:', error);
      return {
        totalFavorites: 0,
        averageFavorites: 0,
        topProperty: null,
        propertyCounts: {}
      };
    }
  }
}
