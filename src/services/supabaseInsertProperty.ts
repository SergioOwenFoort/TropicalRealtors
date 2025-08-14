import { createClient } from '@supabase/supabase-js';
import { Property } from '../types';

// Use your environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Insert a property into the Supabase 'properties' table
 * @param property The property object to insert
 * @returns The inserted property or error
 */
export async function insertProperty(property: Property) {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();
  if (error) throw error;
  return data;
}
