import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(profile);
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile');
        toast.error('Er is een fout opgetreden bij het laden van uw profiel');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return { profile, loading, error };
}
