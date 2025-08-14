import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { Property } from '../types';
import { PropertyContext } from './property.context';

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimized query - only fetch active properties
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'actief')
        .order('featured', { ascending: false })
        .order('date_posted', { ascending: false });
        
      if (fetchError) {
        console.error('Property fetch error:', fetchError);
        throw fetchError;
      }
      
      if (data) {
        setProperties(data as Property[]);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const addProperty = async (property: Partial<Property>) => {
    try {
      setLoading(true);
      const { error: insertError } = await supabase
        .from('properties')
        .insert([property]);
      
      if (insertError) throw insertError;
      await loadProperties();
    } catch (err) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Error adding property');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id: string, property: Partial<Property>) => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('properties')
        .update(property)
        .eq('id', id);
      
      if (updateError) throw updateError;
      await loadProperties();
    } catch (err) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Error updating property');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      await loadProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err instanceof Error ? err.message : 'Error deleting property');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const property = properties.find(p => p.id === id);
      if (!property) throw new Error('Property not found');
      
      await updateProperty(id, { featured: !property.featured });
    } catch (err) {
      console.error('Error toggling featured status:', err);
      setError(err instanceof Error ? err.message : 'Error toggling featured status');
      throw err;
    }
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, 
      loading, 
      error,
      refreshProperties: loadProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      toggleFeatured
    }}>
      {children}
    </PropertyContext.Provider>
  );
}
