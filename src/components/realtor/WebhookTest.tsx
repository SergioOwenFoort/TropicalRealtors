import React, { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { webhookService } from '../../services/webhookService';
import { webhookConfig } from '../../config/webhook.config';

export function WebhookTest() {
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setStatus('idle');
    setMessage('');

    try {
      await webhookService.testConnection();
      setStatus('success');
      setMessage('Verbinding met n8n succesvol!');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verbinding mislukt');
      console.error('Webhook test error:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">n8n Verbindingstest</h2>
      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Testen...</span>
            </>
          ) : (
            <span>Test Verbinding</span>
          )}
        </button>

        {status !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${webhookConfig.url ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Webhook URL: {webhookConfig.url ? 'Geconfigureerd' : 'Niet geconfigureerd'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${webhookConfig.secret ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Webhook Secret: {webhookConfig.secret ? 'Geconfigureerd' : 'Niet geconfigureerd'}</span>
          </div>
        </div>

        {(!webhookConfig.url || !webhookConfig.secret) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Configuratie ontbreekt</p>
              <p>Controleer of de volgende omgevingsvariabelen zijn ingesteld:</p>
              <ul className="list-disc list-inside mt-1">
                <li>VITE_WEBHOOK_URL</li>
                <li>VITE_WEBHOOK_SECRET</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
