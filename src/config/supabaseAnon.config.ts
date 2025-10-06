// Use the single centralized Supabase client to avoid multiple GoTrueClient instances
// This prevents duplicate auth clients sharing the same storage key in the browser.
export { supabase as supabaseAnon } from './supabase.config';
