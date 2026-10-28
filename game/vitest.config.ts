import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // @models is the models workspace; @models/<path> reaches one module (the domain may import
    // only @models/measures/..., see check-boundaries).
    alias: [
      { find: /^@models$/, replacement: fileURLToPath(new URL('../models/src/index.ts', import.meta.url)) },
      { find: /^@models\/(.*)$/, replacement: fileURLToPath(new URL('../models/src/$1', import.meta.url)) },
    ],
  },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
