import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.e2e-spec.ts'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  loader: {
    '.html': 'file',
  },
})