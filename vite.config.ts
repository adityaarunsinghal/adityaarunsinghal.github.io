import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/images': path.resolve(__dirname, './src/images'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    fs: {
      strict: false,
      allow: ['..']
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/.DS_Store', '**/Trash/**', '**/.Trash/**']
    }
  },
  build: {
    // NOTE: vite is pinned to an EXACT version (8.0.16) in package.json, not a
    // caret range, to patch the two vite Dependabot CVEs deterministically.
    //
    // The manualChunks below restores the vendor split we had on vite 8.0.8.
    // That split used to come from a rolldown default that changed in later
    // 8.0.x/8.1.x releases (which merge all vendor code into the single ~700kB
    // entry chunk). We reinstate it explicitly so the large, near-static
    // firebase dep stays in its own chunk and remains cached across app-code
    // deploys, instead of being re-downloaded every ship.
    //
    // What we deliberately did NOT do, and why:
    //  - Did NOT use a catch-all `node_modules -> 'vendor'` rule: because the
    //    eager graph imports firebase, a single vendor chunk drags lazy-only
    //    deps (firestore, confetti, react-spring, charts) onto the eager path,
    //    growing first-load from ~216kB to ~258kB gzip. The targeted rule below
    //    only names firebase + react, so everything else keeps its default
    //    (lazy, per-route) chunking.
    // If you bump vite, re-check dist/stats.html and the eager modulepreload set
    // in dist/index.html before shipping.
    rollupOptions: {
      plugins: [
        copy({
          targets: [{ src: 'public/CNAME', dest: 'dist' }],
        }),
      ],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react';
          }
        },
      },
    },
  },
});
