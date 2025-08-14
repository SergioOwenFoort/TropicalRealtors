import { useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';
import { User } from '@supabase/supabase-js';
import { useSupabaseAuthActions } from './useSupabaseAuthActions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  actions: ReturnType<typeof useSupabaseAuthActions>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
