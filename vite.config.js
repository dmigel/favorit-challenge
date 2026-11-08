import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/hsprice': {
        target: 'http://api.favorit-parts.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hsprice\/?/, '/hs/hsprice/'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.{js,jsx}'],
    css: false,
    env: {
      VITE_API_BASE_URL: '/api/hsprice',
      VITE_API_KEY: 'test-key',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      exclude: ['src/test/**', 'src/main.jsx'],
    },
  },
});
