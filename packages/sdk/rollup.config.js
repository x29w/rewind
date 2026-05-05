/**
 * Rollup 打包配置
 * Rollup Build Configuration
 * Rollup ビルド設定
 * Rollup 打包配置
 */

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  // UMD 格式（浏览器 <script> 标签）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rewind.umd.js',
      format: 'umd',
      name: 'Rewind',
      sourcemap: true,
      globals: {},
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // UMD 压缩版本
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rewind.umd.min.js',
      format: 'umd',
      name: 'Rewind',
      sourcemap: true,
      globals: {},
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      }),
    ],
  },

  // ESM 格式（现代打包工具）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rewind.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
      }),
    ],
  },

  // CJS 格式（Node.js）
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/rewind.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      resolve({
        browser: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
    ],
  },
]);
