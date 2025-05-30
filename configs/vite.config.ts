/* eslint-disable import/no-extraneous-dependencies */
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
// eslint-disable-next-line no-console
console.log(`${chalk.whiteBright.bold(' ✨ Start')} ${chalk.green.bold('Hacking...👨‍💻')}`);

export default defineConfig({
  base: './',
  clearScreen: false,
  root: resolve('./src/renderer'),
  server: {
    port,
  },
  build: {
    assetsDir: '',
    outDir: resolve('./app/dist/renderer'),
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
        build: {
          assetsDir: '',
          outDir: resolve('./app/dist/main'),
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
