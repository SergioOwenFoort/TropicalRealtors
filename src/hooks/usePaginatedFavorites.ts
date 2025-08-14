import { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';
import { getFavoriteProperties } from '../services/propertyService';
import { useFavorites } from './useFavorites';

interface UsePaginatedFavoritesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedFavorites(pageSize: number = 6): UsePaginatedFavoritesReturn {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadFavorites = useCallback(async (page: number, reset: boolean = false) => {
    if (favoritesLoading || favorites.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getFavoriteProperties(favorites, page, pageSize);
      
      if (reset) {
        setProperties(result.properties);
      } else {
        setProperties(prev => [...prev, ...result.properties]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorite properties');
    } finally {
      setLoading(false);
    }
  }, [favorites, favoritesLoading, pageSize]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadFavorites(currentPage + 1, false);
  }, [hasMore, loading, currentPage, loadFavorites]);

  const refresh = useCallback(async () => {
    setProperties([]);
    setCurrentPage(0);
    await loadFavorites(0, true);
  }, [loadFavorites]);

  // Load initial favorites when favorites list changes
  useEffect(() => {
    if (!favoritesLoading && favorites.length > 0) {
      refresh();
    } else if (!favoritesLoading && favorites.length === 0) {
      // No favorites, clear everything
      setProperties([]);
      setHasMore(false);
      setTotal(0);
      setCurrentPage(0);
    }
  }, [favorites, favoritesLoading, refresh]);

  return {
    properties,
    loading: loading || favoritesLoading,
    error,
    hasMore,
    total,
    loadMore,
    refresh
  };
}
