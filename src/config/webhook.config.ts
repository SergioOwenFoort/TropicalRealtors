export const webhookConfig = {
  url: 'https://hook.eu2.make.com/aoajlp6qbro6i8veoycsm1gcqj86oh23',
  allowedOrigins: [
    'https://woningaanbod.eu',
    'http://localhost:3000',
    'http://localhost:5173'
  ]
};

export function validateWebhookConfig(): { isValid: boolean; error?: string } {
  if (!webhookConfig.url) {
    return { isValid: false, error: 'Webhook URL is not configured' };
  }
  return { isValid: true };
}
