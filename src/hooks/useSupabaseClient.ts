import { useSupabaseClient } from '../context/SupabaseClientContext';

// Example hook to get the correct Supabase client (admin or anon)
export function useClient() {
  const { client } = useSupabaseClient();
  return client;
}
