import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
