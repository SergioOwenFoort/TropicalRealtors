export interface WebhookPayload {
  url: string;
  userId: string;
  timestamp: string;
  type: 'listing_process';
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}
