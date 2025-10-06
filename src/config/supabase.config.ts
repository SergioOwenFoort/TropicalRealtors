import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Replace these with your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  throw new Error(
    `Missing Supabase configuration: ${missing.join(', ')} not set. ` +
      'In production, define these as Environment variables (e.g., Netlify → Site configuration → Build & deploy → Environment variables) and redeploy.'
  );
}

// Ensure we only ever create ONE supabase client in the browser to avoid multiple GoTrueClient warnings
// Reuse a global singleton if it exists (helps during HMR and multiple imports)
const globalAny = globalThis as unknown as { __tr_supabase__?: ReturnType<typeof createClient<Database>> };

const client = globalAny.__tr_supabase__ ?? createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'Cache-Control': 'max-age=60', // Add caching for 1 minute
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit realtime events
    },
  },
});

globalAny.__tr_supabase__ = client;

// Create the client with anon key for regular user authentication
export const supabase = client;
