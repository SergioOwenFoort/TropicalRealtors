import { useState, useEffect } from 'react';
import { Property } from '../types';
import * as propertyService from '../services/propertyService';
import { useAuth } from './useAuth';

export function useAllProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyService.getAllProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    refreshProperties,
  };
}

// Add this:
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { user } = useAuth();

  const refreshProperties = async (force = false) => {
    if (!user) return;
    
    // Cache for 60 seconds to prevent rapid successive calls (increased from 30)
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
      // Use the comprehensive function that checks all ownership fields
      const data = await propertyService.getPropertiesByUser(user.id);
      setProperties(data);
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
    if (user) {
      refreshProperties();
    } else {
      // Clear properties when no user
      setProperties([]);
    }
  }, [user?.id]); // Use user.id instead of user object to prevent unnecessary re-renders

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