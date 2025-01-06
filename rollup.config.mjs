import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/blogroll.js',
  output: [
    {
      file: 'dist/blogroller.umd.js',
      format: 'umd',
      name: 'Blogroller',
      sourcemap: true,
      plugins: [terser()],
    },
    {
      file: 'dist/blogroller.esm.js',
      format: 'esm',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    postcss({
      extract: 'blogroller.css',
      minimize: true,
    }),
  ],
};
