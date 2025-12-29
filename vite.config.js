import { defineConfig } from 'vite';

export default defineConfig({
  // Base path cho GitHub Pages
  base: '/bravemath/',
  
  // Root directory - Vite sẽ serve từ đây
  root: '.',
  
  // Public directory - static assets
  publicDir: 'assets',
  
  // Build options
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/pages/index.html',
        about: 'src/pages/about.html',
        subject: 'src/pages/subject.html',
      }
    }
  },
  
  // Server options
  server: {
    port: 3000,
    open: '/src/pages/index.html'
  }
});

