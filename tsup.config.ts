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
  external: ['dotenv'],
  loader: {
    '.html': 'file',
  },
  esbuildOptions: (options, context) => {
    if (context.format === 'esm') {
      options.packages = 'external';
    }
  },
})