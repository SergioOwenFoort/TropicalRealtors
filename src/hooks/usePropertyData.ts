import { useState, useEffect } from 'react';
import { getPropertyById } from '../services/propertyService';
import { findMockProperty } from '../data/mockProperties';
import { Property } from '../types';

export function usePropertyData(propertyId: string | null) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setProperty(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('usePropertyData: Fetching property with ID:', propertyId);
        
        // First try to get from database
        const propertyData = await getPropertyById(propertyId);
        
        if (propertyData) {
          console.log('usePropertyData: Found in database:', propertyData.title);
          setProperty(propertyData);
        } else {
          // If not found in database, check mock data
          const mockProperty = findMockProperty(propertyId);
          if (mockProperty) {
            console.log('usePropertyData: Found in mock data:', mockProperty.title);
            setProperty(mockProperty);
          } else {
            console.log('usePropertyData: Not found in database or mock data');
            setProperty(null);
          }
        }
      } catch (err) {
        console.log('usePropertyData: Database error, trying mock data fallback');
        // If database query fails, try mock data as fallback
        const mockProperty = findMockProperty(propertyId);
        if (mockProperty) {
          console.log('usePropertyData: Found in mock data fallback:', mockProperty.title);
          setProperty(mockProperty);
          setError(null);
        } else {
          console.log('usePropertyData: Error and no mock data found');
          setError(err instanceof Error ? err.message : 'Failed to fetch property');
          setProperty(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { property, loading, error };
}
