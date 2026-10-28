import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Port of the game dev server (wiki/workspace/monorepo.md, criterion 3). */
const DEV_PORT = 3000;

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-reactylon'] } })],
  resolve: {
    // @models is the models workspace; @models/<path> reaches one module (the domain may import
    // only @models/measures/..., see check-boundaries).
    alias: [
      { find: /^@models$/, replacement: fileURLToPath(new URL('../models/src/index.ts', import.meta.url)) },
      { find: /^@models\/(.*)$/, replacement: fileURLToPath(new URL('../models/src/$1', import.meta.url)) },
    ],
    dedupe: ['@babylonjs/core', 'react', 'react-dom'],
  },
  optimizeDeps: {
    // Babylon is served as its own ES modules, never pre-bundled: a pre-bundle split it into chunks
    // and lazily imported shaders under a version hash that changes whenever the server re-bundles,
    // so a page could hold two copies of the shader store and draw nothing (AGENTS.md traps).
    exclude: ['@babylonjs/havok', '@babylonjs/core'],
  },
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: DEV_PORT, strictPort: true },
});
