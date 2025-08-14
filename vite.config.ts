import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { emailServicePlugin } from './src/plugins/emailServicePlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), emailServicePlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    allowedHosts: [
      '3d2d7326ccd5.ngrok-free.app'
    ]
  }
});