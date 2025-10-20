import { useState, useEffect } from 'react';
import { Property } from '../types';
import * as propertyService from '../services/propertyService';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

/**
 * Hook to fetch properties filtered by the user's current role
 * This prevents showing properties from previous roles when a user switches roles
 */
export function useRoleBasedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { user } = useAuth();
  const { profile } = useProfile();

  const refreshProperties = async (force = false) => {
    if (!user || !profile) return;
    
    // Cache for 60 seconds to prevent rapid successive calls
    const now = Date.now();
    if (!force && now - lastFetchTime < 60000 && properties.length > 0) {
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Get all properties for this user
      const allUserProperties = await propertyService.getPropertiesByUser(user.id);
      
      // Filter based on created_by_role (the role when property was created)
      let filteredProperties: Property[] = [];
      
      switch (profile.role) {
        case 'horo':
          // HoRo users: Only show properties created while they had the horo role
          filteredProperties = allUserProperties.filter(prop => 
            prop.created_by_role === 'horo'
          );
          break;
          
        case 'realtor':
        case 'makelaar':
          // Realtors: Show properties created while they had the realtor role
          filteredProperties = allUserProperties.filter(prop =>
            prop.created_by_role === 'realtor' || prop.created_by_role === 'makelaar'
          );
          break;
          
        case 'owner':
          // Owners: Show properties created while they had the owner role (max 3)
          filteredProperties = allUserProperties
            .filter(prop => prop.created_by_role === 'owner')
            .slice(0, 3); // Enforce 3-property limit
          break;
          
        case 'admin':
          // Admins: Show all properties regardless of created_by_role
          filteredProperties = allUserProperties;
          break;
          
        default:
          // Default: show all properties for this user
          filteredProperties = allUserProperties;
      }
      
      setProperties(filteredProperties);
      setLastFetchTime(now);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Add property to Supabase and refresh list
  const addProperty = async (property: Omit<Property, 'id'>) => {
    const result = await propertyService.addProperty(property);
    await refreshProperties(true); // Force refresh after adding
    return result;
  };

  // Update property and refresh list
  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const result = await propertyService.updateProperty(id, updates);
    await refreshProperties(true); // Force refresh after updating
    return result;
  };

  // Delete property and refresh list
  const deleteProperty = async (id: string) => {
    const result = await propertyService.deleteProperty(id);
    await refreshProperties(true); // Force refresh after deleting
    return result;
  };

  // Toggle featured status
  const toggleFeatured = async (id: string, featured: boolean) => {
    const result = await propertyService.updateProperty(id, { featured });
    await refreshProperties(true); // Force refresh after toggling
    return result;
  };

  useEffect(() => {
    if (user && profile) {
      refreshProperties();
    } else {
      // Clear properties when no user or profile
      setProperties([]);
    }
  }, [user?.id, profile?.role]); // Re-fetch when user or role changes

  return {
    properties,
    loading,
    error,
    refreshProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleFeatured,
  };
}
