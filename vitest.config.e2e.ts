import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [tsConfigPaths(), swc.vite({ module: { type: 'es6' } })],
  test: {
    environmentMatchGlobs: [['src/infra/http/controllers/**', 'prisma']],
    include: ['**/*.e2e-spec.ts'],
    hookTimeout: 30000
  }
})