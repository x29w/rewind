import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/rewind.umd.js',
      format: 'umd',
      name: 'Rewind',
      sourcemap: true,
      globals: {}
    },
    {
      file: 'dist/rewind.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      rootDir: './src'
    }),
    isProduction && terser({
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    })
  ].filter(Boolean),
  external: []
};
