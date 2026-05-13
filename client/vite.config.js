import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://mern-school-management-system-olive.vercel.app/',
        changeOrigin: true,
        // Enable credentials for cookie support
        cookieDomainRewrite: '',
      },
      '/uploads': {
        target: 'https://mern-school-management-system-olive.vercel.app/',
        changeOrigin: true,
      },
    },
  },
});
