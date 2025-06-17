import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import chalk from 'chalk';
import Electron from 'vite-plugin-electron';
import EnvironmentPlugin from 'vite-plugin-environment';
import React from '@vitejs/plugin-react';
import TsConfigPaths from 'vite-tsconfig-paths';
import commonjs from '@rollup/plugin-commonjs';
import { port } from '../DevConfig.json';

console.log(`${chalk.whiteBright.bold(' ✨ Start')} ${chalk.green.bold('Hacking...👨‍💻')}`);

export default defineConfig({
  base: '',
  clearScreen: false,
  root: resolve('./src/renderer'),
  server: {
    port: port,
    proxy: {
      '/api': {
        target: 'https://s9rest.ngrok.io',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2015',
    assetsDir: '',
    outDir: resolve(__dirname,'../app/dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, '../src/renderer/index.html'),
      output: {
        entryFileNames: 'main.js', // <- 이걸로 script src="./main.js"가 생성됨
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife', // CommonJS처럼 self-contained 방식으로
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy',
        includePaths: [
          resolve(__dirname, '..', 'src', 'renderer', 'styles'), // 👈 바로 이 폴더를 추가합니다.
        ],
      },
    },
  },
  plugins: [
    React(),
    EnvironmentPlugin(['NODE_ENV', 'ELECTRON_ENV'], { prefix: '' }),
    TsConfigPaths({ projects: [resolve(__dirname, '../tsconfig.json')] }),
    Electron({
      entry: [resolve('src/main/main.ts'), resolve('src/main/preload.ts')],
      onstart: (options) => {
        options.startup([
          'app/dist/main/main.js',
          '--inspect=5858',
          '--remote-debugging-port=9227',
        ]);
      },
      vite: {
        css: {
          preprocessorOptions: {
            scss: {
              api: 'legacy',
              includePaths: [
                resolve(__dirname, '..', 'src', 'renderer', 'styles'),
              ],
            },
          },
        },
        build: {
          assetsDir: '',
          outDir: resolve(__dirname, '../app/dist/main'),
          rollupOptions: {
            external: ['electron', 'better-sqlite3', ...builtinModules],
            // better-sqlite3 사용 관련 추가
            output: {
              manualChunks: undefined,
            },
            plugins: [
              commonjs({
                dynamicRequireTargets: [
                  resolve(
                    __dirname,
                    '../node_modules/better-sqlite3/build/Release/better_sqlite3.node',
                  ),
                  resolve(__dirname, '../node_modules/better-sqlite3/lib/*.js'),
                ],
              }),
            ],
          },
        },
        plugins: [
          EnvironmentPlugin(['NODE_ENV', 'ELECTRON_ENV'], { prefix: '' }),
          TsConfigPaths({ projects: [resolve(__dirname, '../tsconfig.json')] }),
        ],
      },
    }),
  ],
});
