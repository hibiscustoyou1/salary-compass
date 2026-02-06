import { defineConfig } from 'tsup'
import { dependencies } from './package.json'

export default defineConfig({
  entry: ['src/http.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node22',
  platform: 'node',
  clean: true,
  noExternal: Object.keys(dependencies)
})
