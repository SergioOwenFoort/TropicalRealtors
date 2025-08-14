import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { supabaseAnon } from '../config/supabaseAnon.config';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export interface SavedSearch {
  id: string;
  name: string;
  searchParams: Record<string, string>;
  date: string;
  user_id: string;
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadSavedSearches = async () => {
    if (!user) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSearches = (data || []).map(search => ({
        id: search.id,
        name: search.name,
        searchParams: search.search_params,
        date: search.created_at,
        user_id: search.user_id
      }));

      setSavedSearches(formattedSearches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
      toast.error('Fout bij het laden van opgeslagen zoekopdrachten');
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async (name: string, searchParams: URLSearchParams) => {
    // Use supabaseAnon for session to match AuthProvider
    const { data: { session } } = await supabaseAnon.auth.getSession();
    if (!session?.user) {
      toast.error('U moet ingelogd zijn om een zoekopdracht op te slaan');
      return false;
    }

    try {
      // Convert URLSearchParams to a plain object
      const paramsObject: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObject[key] = value;
      });

      // Use service role client for database operations
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{
          name,
          search_params: paramsObject,
          user_id: session.user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newSearch: SavedSearch = {
        id: data.id,
        name,
        searchParams: paramsObject,
        date: data.created_at,
        user_id: data.user_id
      };

      setSavedSearches(prev => [newSearch, ...prev]);
      toast.success('Zoekopdracht opgeslagen!');
      return true;
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Fout bij het opslaan van de zoekopdracht');
      return false;
    }
  };

  const deleteSearch = async (searchId: string) => {
    const { data: { session } } = await supabaseAnon.auth.getSession();
    if (!session?.user) {
      toast.error('U moet ingelogd zijn');
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      toast.success('Zoekopdracht verwijderd');
      return true;
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Fout bij het verwijderen van de zoekopdracht');
      return false;
    }
  };

  useEffect(() => {
    loadSavedSearches();
  }, [user]);

  return {
    savedSearches,
    loading,
    saveSearch,
    deleteSearch,
    refreshSavedSearches: loadSavedSearches
  };
}
