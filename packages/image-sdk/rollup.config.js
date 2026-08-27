import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

const input = 'src/index.ts';

export default [
  {
    input,
    output: {
      file: 'dist/image-sdk.umd.js',
      format: 'umd',
      name: 'DRP',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
  {
    input,
    output: {
      file: 'dist/image-sdk.iife.js',
      format: 'iife',
      name: 'DRP',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
  {
    input,
    output: {
      file: 'dist/image-sdk.min.js',
      format: 'iife',
      name: 'DRP',
      sourcemap: false,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
    ],
  },
];
