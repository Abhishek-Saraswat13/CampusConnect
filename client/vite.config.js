import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Lets the frontend call /api/... during dev without CORS headaches -
      // Vite forwards it to the Express server. In production, VITE_API_URL
      // (see src/services/api.js) points straight at the deployed backend.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
