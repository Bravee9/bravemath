import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path cho GitHub Pages
  base: '/bravemath/',
  
  // Root directory
  root: 'src/pages',
  
  // Public directory - static assets
  publicDir: '../../assets',
  
  // Build options
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        subject: resolve(__dirname, 'src/pages/subject.html'),
      }
    }
  },
  
  // Server options
  server: {
    port: 3000,
    open: '/index.html'
  }
});

