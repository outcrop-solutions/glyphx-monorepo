/*eslint-disable-next-line node/no-unpublished-import*/
import {defineConfig} from 'tsup';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: IS_PRODUCTION,
  sourcemap: true,
});
