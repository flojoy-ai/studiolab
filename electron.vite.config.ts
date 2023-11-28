import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      commonjs({ include: ['protos/*'], requireReturnsDefault: true })
    ],
    resolve: {
      preserveSymlinks: true // required for gRPC to work
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    server: {
      port: 2334
    },
    resolve: {
      alias: {
        '@': resolve('./src/renderer/src')
      }
    },
    plugins: [react()]
  }
});
