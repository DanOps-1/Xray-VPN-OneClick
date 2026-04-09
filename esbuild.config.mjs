import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

await build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/cli.mjs',
  format: 'esm',
  sourcemap: true,
  jsx: 'automatic',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
  // Keep all npm packages external — resolved by Node.js from node_modules
  // Only bundle our own src/ code
  packages: 'external',
});

// Prepend shebang
const content = readFileSync('dist/cli.mjs', 'utf-8');
writeFileSync('dist/cli.mjs', '#!/usr/bin/env node\n' + content);

console.log('Build complete: dist/cli.mjs');
