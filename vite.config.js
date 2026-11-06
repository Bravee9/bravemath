import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Base path for GitHub Pages
  base: '/bravemath/',

  // Build options
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        howtouse: resolve(__dirname, 'how-to-use.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  },

  // Server options
  server: {
    port: 3000,
    open: '/index.html'
  },

  // Public directory for static assets
  publicDir: 'assets',

  // Plugin to copy all JSON data files from data/ to dist/data/
  plugins: [{
    name: 'copy-data',
    closeBundle() {
      try {
        const srcDir = resolve(__dirname, 'data');
        const destDir = resolve(__dirname, 'dist/data');

        if (!existsSync(srcDir)) {
          return;
        }

        mkdirSync(destDir, { recursive: true });
        const files = readdirSync(srcDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          copyFileSync(resolve(srcDir, file), resolve(destDir, file));
        }
      } catch (err) {
        console.error('Failed to copy data files:', err);
      }
    }
  }]
});
