import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'common/index': 'src/common/http.ts',
    'node/index': 'src/node/http.ts',
    'browser/index': 'src/browser/http.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['dotenv', 'fs', 'path', 'crypto', 'events'],
});
