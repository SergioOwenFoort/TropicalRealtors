import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { supabaseAnon } from '../config/supabaseAnon.config';
import { toast } from 'react-hot-toast';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from Supabase
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Use supabaseAnon for session to match AuthProvider
        const { data: { session } } = await supabaseAnon.auth.getSession();
        if (!session?.user) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Use service role client for database operations  
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('favorites')
          .eq('id', session.user.id)
          .single();

        if (error) {
          if (error.code === '500') {
            console.warn('Server error when fetching favorites, likely missing favorites column');
            setFavorites([]);
          } else {
            throw error;
          }
        } else {
          // favorites is now a JSONB array, ensure it's a proper array
          const favoritesData = profile?.favorites;
          if (Array.isArray(favoritesData)) {
            setFavorites(favoritesData);
          } else if (favoritesData && typeof favoritesData === 'object' && favoritesData.length !== undefined) {
            // Handle case where JSONB might come back as array-like object
            setFavorites(Array.from(favoritesData));
          } else {
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]); // Reset favorites on error
        // Only show error toast to user if not a server issue
        if (error && typeof error === 'object' && 'code' in error && error.code !== '500') {
          toast.error('Er is een fout opgetreden bij het laden van uw favorieten');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Subscribe to auth changes using supabaseAnon
    const { data: { subscription } } = supabaseAnon.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setFavorites([]);
      } else if (event === 'SIGNED_IN') {
        loadFavorites();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    // Use supabaseAnon for session to match AuthProvider
    const { data: { session } } = await supabaseAnon.auth.getSession();
    if (!session?.user) {
      toast.error('U moet ingelogd zijn om favorieten te kunnen opslaan');
      return;
    }

    try {
      const newFavorites = favorites.includes(propertyId)
        ? favorites.filter(id => id !== propertyId)
        : [...favorites, propertyId];

      // Use service role client for database operations
      const { error } = await supabase
        .from('profiles')
        .update({ favorites: newFavorites })
        .eq('id', session.user.id);

      if (error) throw error;

      setFavorites(newFavorites);
      const action = favorites.includes(propertyId) ? 'verwijderd uit' : 'toegevoegd aan';
      toast.success(`Woning ${action} favorieten`);
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Er is een fout opgetreden bij het bijwerken van uw favorieten');
    }
  }, [favorites]);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading
  };
}
