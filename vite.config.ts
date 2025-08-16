import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
