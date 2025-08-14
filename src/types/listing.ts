export interface ListingUrl {
  id: string;
  url: string;
  user_id: string;
  created_at: string;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
