import { supabase } from '../config/supabase.config';

interface PropertyViewStats {
  id: string;
  title: string;
  view_count: number;
  last_viewed_at?: string;
  created_by?: string;
  created_at?: string;
  owner_id?: string;
  property_type?: string;
  country?: string;
}

/**
 * Service for tracking property view counts and analytics
 * Similar to CarouselClickTracker but for property views
 */
export class PropertyViewTracker {
  /**
   * Track a view for a specific property
   */
  static async trackView(propertyId: string): Promise<boolean> {
    try {
      // Don't track views for invalid IDs
      if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
        console.log('Invalid property ID for tracking:', propertyId);
        return false;
      }

      console.log('Attempting to track view for property:', propertyId);

      // Try the database function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('increment_property_view_count', { property_id: propertyId });

      if (!rpcError && rpcData && rpcData.success) {
        console.log(`Property view tracked via RPC: ${propertyId} (${rpcData.view_count} views)`);
        return true;
      }

      console.log('RPC failed, trying manual approach. RPC Error:', rpcError);

      // Fallback to manual approach if RPC fails
      // First check if property exists
      const { data: currentProperty, error: selectError } = await supabase
        .from('properties')
        .select('view_count')
        .eq('id', propertyId)
        .single();

      if (selectError) {
        console.error('Error checking property existence:', selectError);
        return false;
      }

      if (!currentProperty) {
        console.log('Property not found:', propertyId);
        return false;
      }

      const newViewCount = (currentProperty?.view_count || 0) + 1;
      console.log(`Current view count: ${currentProperty?.view_count || 0}, new count: ${newViewCount}`);

      // Update the view count
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          view_count: newViewCount,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error updating property view count:', updateError);
        return false;
      }

      console.log(`Property view tracked manually: ${propertyId} (${newViewCount} views)`);
      return true;
    } catch (error) {
      console.error('Error in trackView:', error);
      return false;
    }
  }

  /**
   * Get view statistics for properties with optional filtering
   */
  static async getViewStats(filters?: {
    userId?: string;
    country?: string;
    island?: string;
    propertyType?: string;
  }): Promise<PropertyViewStats[]> {
    try {
      let query = supabase
        .from('properties')
        .select('id, title, view_count, last_viewed_at, created_by, created_at, owner_id, property_type, country')
        .order('view_count', { ascending: false });

      // Apply filters
      if (filters?.userId) {
        query = query.eq('created_by', filters.userId);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching property view stats:', error);
        return [];
      }

      return data?.map((property: any) => ({
        id: property.id,
        title: property.title,
        view_count: property.view_count || 0,
        last_viewed_at: property.last_viewed_at,
        created_by: property.created_by,
        created_at: property.created_at,
        owner_id: property.owner_id,
        property_type: property.property_type,
        country: property.country,
      })) || [];

    } catch (error) {
      console.error('Error in getViewStats:', error);
      return [];
    }
  }

  /**
   * Get total views across all properties for a user or country
   */
  static async getTotalViews(filters?: {
    userId?: string;
    country?: string;
    propertyType?: string;
  }): Promise<number> {
    try {
      let query = supabase
        .from('properties')
        .select('view_count');

      // Apply filters
      if (filters?.userId) {
        query = query.eq('created_by', filters.userId);
      }
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching total views:', error);
        return 0;
      }

      return data?.reduce((total: number, property: any) => total + (property.view_count || 0), 0) || 0;

    } catch (error) {
      console.error('Error in getTotalViews:', error);
      return 0;
    }
  }

  /**
   * Get view statistics summary for dashboard display
   */
  static async getViewSummary(filters?: {
    userId?: string;
    country?: string;
    propertyType?: string;
  }) {
    try {
      const [stats, totalViews] = await Promise.all([
        this.getViewStats(filters),
        this.getTotalViews(filters)
      ]);

      const activeProperties = stats.filter(p => p.view_count > 0);
      const averageViews = stats.length > 0 ? Math.round(totalViews / stats.length) : 0;

      return {
        totalProperties: stats.length,
        totalViews,
        activeProperties: activeProperties.length,
        averageViews,
        topProperty: stats[0] || null,
        stats
      };

    } catch (error) {
      console.error('Error in getViewSummary:', error);
      return {
        totalProperties: 0,
        totalViews: 0,
        activeProperties: 0,
        averageViews: 0,
        topProperty: null,
        stats: []
      };
    }
  }

  /**
   * Get property view count by ID
   */
  static async getPropertyViewCount(propertyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('view_count')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error fetching property view count:', error);
        return 0;
      }

      return data?.view_count || 0;

    } catch (error) {
      console.error('Error in getPropertyViewCount:', error);
      return 0;
    }
  }
}
