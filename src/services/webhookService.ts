import { WebhookPayload, WebhookResponse } from '../types/webhook';
import { webhookConfig } from '../config/webhook.config';

export class WebhookService {
  private static instance: WebhookService;
  private retryAttempts = 3;
  private retryDelay = 1000;
  
  private constructor() {}

  static getInstance(): WebhookService {
    if (!this.instance) {
      this.instance = new WebhookService();
    }
    return this.instance;
  }

  async processListingUrl(url: string, userId: string): Promise<boolean> {
    if (!webhookConfig.url) {
      throw new Error('Webhook configuratie ontbreekt. Controleer uw omgevingsvariabelen.');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const payload: WebhookPayload = {
          url: url.trim(),
          userId,
          timestamp: new Date().toISOString(),
          type: 'listing_process'
        };

        const response = await fetch(webhookConfig.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json() as WebhookResponse;
        if (!data.success) {
          throw new Error(data.error || 'Onbekende fout bij verwerken van URL');
        }

        return true;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Onbekende fout');
        console.error(`Poging ${attempt} mislukt:`, error);
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          continue;
        }
      }
    }

    throw lastError || new Error('Maximaal aantal pogingen bereikt');
  }

  async testConnection(): Promise<boolean> {
    if (!webhookConfig.url) {
      throw new Error('Webhook configuratie ontbreekt. Controleer uw omgevingsvariabelen.');
    }

    const testPayload: WebhookPayload = {
      url: 'https://test.woningaanbod.eu',
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      type: 'listing_process'
    };

    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json() as WebhookResponse;
    return data.success;
  }
}

export const webhookService = WebhookService.getInstance();
