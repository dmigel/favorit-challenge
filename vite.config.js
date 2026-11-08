import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.{js,jsx}'],
    css: false,
    env: {
      VITE_API_BASE_URL: 'https://api.favorit-parts.ru/hs/hsprice/',
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
