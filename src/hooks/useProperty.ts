import { useState, useEffect } from 'react';
import { Property } from '../types';
import { FEATURED_PROPERTIES } from '../data/properties';
import { toast } from 'react-hot-toast';

export function useProperty(id: string | undefined) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Geen woning ID opgegeven');
      setLoading(false);
      return;
    }

    // Simuleer een API call
    const fetchProperty = async () => {
      try {
        // In een echte applicatie zou dit een API call zijn
        const found = FEATURED_PROPERTIES.find(p => p.id === id);
        
        if (found) {
          setProperty(found);
        } else {
          setError('Woning niet gevonden');
        }
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de woning');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const updateProperty = async (updatedProperty: Partial<Property>) => {
    try {
      // In een echte applicatie zou dit een API call zijn
      console.log('Updating property:', { id, ...updatedProperty });
      toast.success('Woning succesvol bijgewerkt');
      return true;
    } catch (err) {
      console.error('Error updating property:', err);
      toast.error('Er is een fout opgetreden bij het bijwerken van de woning');
      return false;
    }
  };

  return { property, loading, error, updateProperty };
}
