import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.e2e-spec.ts'],
  outDir: 'dist',
  splitting: false,
  dts: false,
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true,
  target: 'es6',
  loader: {
    '.html': 'file',
  },
})