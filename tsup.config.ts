import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  outDir: 'dist',
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  loader: {
    '.html': 'file'
  }
})