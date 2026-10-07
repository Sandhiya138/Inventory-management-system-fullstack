import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite Proxy] Spring Boot backend unreachable on http://127.0.0.1:8080:', err.message);
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                status: 503,
                error: 'Service Unavailable',
                message: 'Spring Boot backend is currently unreachable. Please ensure the backend is running on port 8080.',
              }));
            }
          });
        },
      },
    },
  },
});
