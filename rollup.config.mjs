import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

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
  plugins: [nodeResolve(), commonjs()],
};
