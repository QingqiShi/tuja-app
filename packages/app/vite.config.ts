import path from 'path';
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    {
      ...webWorkerLoader({
        inline: false,
        sourcemap: true,
        outputFolder: 'assets',
        preserveFileNames: true,
        pattern: /(.+)\?worker$/,
        skipPlugins: ['liveServer', 'serve', 'livereload', 'vite:worker'],
      }),
      enforce: 'pre',
      apply: 'build',
    },
  ],
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  resolve: {
    alias: {
      idb: path.resolve(__dirname, '../../node_modules/idb/build/idb.js'),
      'idb-latest': 'idb',
      '@tuja/components': '@tuja/components/src/index.ts',
      '@tuja/libs': '@tuja/libs/src/index.ts',
    },
  },
  build: {
    brotliSize: false,
  },
});
