import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIslandProperties } from '../contexts/MasterIslandContext';
import { Property } from '../types';

// Helper function to normalize strings for comparison
function normalizeString(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Helper function to check if string a contains string b (case-insensitive)
function containsText(a: string, b: string): boolean {
  return normalizeString(a).includes(normalizeString(b));
}

export function useSearch() {
  const [searchParams] = useSearchParams();
  const { properties } = useIslandProperties();
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      let filtered = [...properties];
      
      const type = searchParams.get('type');
      const category = searchParams.get('category');
      const countryParam = searchParams.get('location');
      const city = searchParams.get('city');
      const priceRange = searchParams.get('price');
      const bedrooms = searchParams.get('bedrooms');
      const sizeRange = searchParams.get('size');

      // Handle multiple locations (countries, cities, or areas)
      if (countryParam) {
        const locations = countryParam.split(',');
        filtered = filtered.filter(p => 
          locations.some(location => 
            containsText(p.country, location) ||
            containsText(p.city, location) ||
            containsText(p.address, location)
          )
        );
      }

      if (type) {
        filtered = filtered.filter(p => 
          normalizeString(p.type) === normalizeString(type)
        );
      }
      
      if (city) {
        filtered = filtered.filter(p => 
          containsText(p.city, city) ||
          containsText(p.country, city) ||
          containsText(`${p.city}, ${p.country}`, city)
        );
      }

      if (category) {
        filtered = filtered.filter(p => 
          normalizeString(p.category) === normalizeString(category)
        );
      }

      // Handle price range
      if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        filtered = filtered.filter(p => {
          if (maxPrice) {
            return p.price >= minPrice && p.price <= maxPrice;
          }
          return p.price >= minPrice;
        });
      }

      // Handle bedrooms (now using "plus" notation)
      if (bedrooms) {
        const minBedrooms = Number(bedrooms);
        filtered = filtered.filter(p => p.bedrooms >= minBedrooms);
      }

      // Handle size range
      if (sizeRange) {
        const [minSize, maxSize] = sizeRange.split('-').map(Number);
        filtered = filtered.filter(p => {
          if (maxSize) {
            return p.size >= minSize && p.size <= maxSize;
          }
          return p.size >= minSize;
        });
      }

      setResults(filtered);
    } catch (error) {
      console.error('Error searching properties:', error);
      setError('Er is een fout opgetreden bij het zoeken');
    } finally {
      setLoading(false);
    }
  }, [searchParams, properties]);

  return { results, loading, error };
}
