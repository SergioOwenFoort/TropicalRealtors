import { useState, useEffect } from 'react';
import { Property } from '../types';
import * as propertyService from '../services/propertyService';

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