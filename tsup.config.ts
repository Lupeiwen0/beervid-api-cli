import { defineConfig } from 'tsup'
import pkg from './package.json' with { type: 'json' }

const sharedConfig = {
  format: ['esm'],
  outDir: 'dist',
  outExtension: () => ({ js: '.mjs' }),
  dts: true,
  shims: true,
  splitting: false,
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
}

export default defineConfig([
  {
    ...sharedConfig,
    entry: ['src/cli.ts'],
    clean: true,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    ...sharedConfig,
    entry: ['src/index.ts'],
    clean: false,
  },
])
