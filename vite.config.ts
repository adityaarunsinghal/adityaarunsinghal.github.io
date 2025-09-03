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
    rollupOptions: {
      plugins: [
        copy({
          targets: [{ src: 'public/CNAME', dest: 'dist' }],
        }),
      ],
    },
  },
});
