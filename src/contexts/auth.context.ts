import { createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabaseAuthActions } from '../hooks/useSupabaseAuthActions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  actions: ReturnType<typeof useSupabaseAuthActions>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  actions: {} as ReturnType<typeof useSupabaseAuthActions>,
});
