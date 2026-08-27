import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'drp-imagesdk': path.resolve(
        __dirname,
        '../../packages/image-sdk/src'
      ),
    },
  },
  server: {
    port: 3000,
  },
});
