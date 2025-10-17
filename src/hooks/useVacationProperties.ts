import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { VacationProperty } from '../types';

export function useVacationProperties() {
  const [properties, setProperties] = useState<VacationProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vacation_properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching vacation properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return { properties, loading, error, refetch: fetchProperties };
}
