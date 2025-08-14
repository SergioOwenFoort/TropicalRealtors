import React from 'react';
import { SupabaseClientProvider } from './context/SupabaseClientContext';
import App from './App';

// Wrap your app with the provider
export default function AppWithProvider() {
  return (
    <SupabaseClientProvider>
      <App />
    </SupabaseClientProvider>
  );
}
