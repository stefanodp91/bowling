import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Port of the game dev server (wiki/workspace/monorepo.md, criterion 3). */
const DEV_PORT = 3000;

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-reactylon'] } })],
  resolve: {
    alias: { '@models': fileURLToPath(new URL('../models/src/index.ts', import.meta.url)) },
    dedupe: ['@babylonjs/core', 'react', 'react-dom'],
  },
  optimizeDeps: { exclude: ['@babylonjs/havok'] },
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: DEV_PORT, strictPort: true },
});
