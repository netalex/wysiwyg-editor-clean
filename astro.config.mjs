import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4321
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      },
      hmr: {
        clientPort: 4321
      }
    }
  }
});
