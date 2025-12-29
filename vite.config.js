import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Base path cho GitHub Pages
  base: '/bravemath/',
  
  // Root directory
  root: 'src/pages',
  
  // Public directory - static assets
  publicDir: resolve(__dirname, 'assets'),
  
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
        const dataDir = resolve(__dirname, 'dist/data');
        const srcFile = resolve(__dirname, 'data/documents.json');
        const destFile = resolve(__dirname, 'dist/data/documents.json');
        
        if (!existsSync(srcFile)) {
          console.error('❌ Source file not found:', srcFile);
          return;
        }
        
        mkdirSync(dataDir, { recursive: true });
        copyFileSync(srcFile, destFile);
        console.log('✅ Copied documents.json to dist/data/');
      } catch (err) {
        console.error('❌ Failed to copy documents.json:', err);
      }
    }
  }]
});

