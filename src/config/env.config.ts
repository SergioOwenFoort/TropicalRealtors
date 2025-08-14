export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
};

export function validateEnv() {
  const missing: string[] = [];

  // Validate Supabase config
  if (!env.supabase.url) missing.push('VITE_SUPABASE_URL');
  if (!env.supabase.anonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    throw new Error('Missing environment variables');
  }
}
