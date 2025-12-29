import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  // Base path cho GitHub Pages
  base: '/bravemath/',
  
  // Root directory
  root: 'src/pages',
  
  // Public directory - static assets (ảnh)
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
  },
  
  // Plugin để copy documents.json
  plugins: [{
    name: 'copy-data',
    closeBundle() {
      try {
        mkdirSync('dist/data', { recursive: true });
        copyFileSync('data/documents.json', 'dist/data/documents.json');
        console.log('Copied documents.json to dist/data/');
      } catch (err) {
        console.error('Failed to copy documents.json:', err);
      }
    }
  }]
});

