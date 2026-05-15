import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/icon/' : '/',
  plugins: [react()],
  server: {
    port: 4174
  },
  preview: {
    port: 4175
  }
});
