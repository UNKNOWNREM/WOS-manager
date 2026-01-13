import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ranks: resolve(__dirname, 'ranks.html'),
        map: resolve(__dirname, 'map.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    allowedHosts: [
      '.ngrok-free.app',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'https://wos-giftcode-api.centurygame.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});