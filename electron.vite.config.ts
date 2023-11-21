import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('./src/preload/index.ts'),
          library: resolve('./src/preload/library.ts')
        }
      }
    }
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
    plugins: [react()],

    build: {
      rollupOptions: {
        input: {
          index: resolve('./src/renderer/index.html'),
          library: resolve('./src/renderer/library.html')
        }
      }
    }
  }
});
