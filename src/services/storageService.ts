import { supabase } from '../config/supabase.config';
import { ListingUrl } from '../types/listing';

class StorageService {
  async getUserListings(userId: string): Promise<ListingUrl[]> {
    const { data, error } = await supabase
      .from('listing_urls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user listings:', error);
      throw error;
    }

    return data as ListingUrl[];
  }

  async saveListingUrl(url: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('listing_urls')
      .insert([{
        url,
        user_id: userId,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error saving listing URL:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
