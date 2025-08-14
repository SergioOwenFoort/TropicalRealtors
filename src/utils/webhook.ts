import { webhookConfig } from '../config/webhook.config';
import { WebhookPayload } from '../types/webhook';

export async function validateWebhookSecret(secret: string): Promise<boolean> {
  if (!secret) {
    throw new Error('Webhook secret is not configured');
  }
  return secret === webhookConfig.secret;
}

export async function sendToN8N(data: WebhookPayload): Promise<Response> {
  const { url, secret } = webhookConfig;

  if (!url || !secret) {
    throw new Error('Webhook configuration is not complete');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Webhook-Secret': secret,
    'Origin': window.location.origin
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `HTTP error ${response.status}`;
      } catch {
        errorMessage = `HTTP error ${response.status}: ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error when sending webhook. Check if the server is reachable.');
    }
    throw error;
  }
}
