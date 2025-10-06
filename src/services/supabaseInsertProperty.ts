import { Property } from '../types';
import { supabase } from '../config/supabase.config';

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
