import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';

export function usePropertySearch(filters: {
  type?: string;
  category?: string;
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSize?: number;
}) {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        let q = collection(db, 'properties');
        const conditions = [];

        if (filters.type) {
          conditions.push(where('type', '==', filters.type));
        }
        
        if (filters.category) {
          conditions.push(where('category', '==', filters.category));
        }

        if (filters.country) {
          conditions.push(where('locations', '==', filters.country));
        }

        if (filters.city) {
          conditions.push(where('city', '==', filters.city));
        }

        if (filters.minPrice) {
          conditions.push(where('price', '>=', filters.minPrice));
        }

        if (filters.maxPrice) {
          conditions.push(where('price', '<=', filters.maxPrice));
        }

        if (filters.minBedrooms) {
          conditions.push(where('bedrooms', '>=', filters.minBedrooms));
        }

        if (filters.minSize) {
          conditions.push(where('size', '>=', filters.minSize));
        }

        q = query(q, ...conditions, orderBy('datePosted', 'desc'), limit(50));
        
        const snapshot = await getDocs(q);
        const properties = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];

        setResults(properties);
      } catch (err) {
        console.error('Search error:', err);
        setError('Er is een fout opgetreden bij het zoeken');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { results, loading, error };
}
