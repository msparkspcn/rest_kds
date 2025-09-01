// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tsconfigPaths from 'vite-tsconfig-paths';
// import electron from 'vite-plugin-electron';
// import { resolve } from 'path';
//
// export default defineConfig({
//   resolve: {
//     alias: { find: '@', replacement: resolve(__dirname, 'src') },
//   },
//   css: {
//     preprocessorOptions: {
//       scss: {
//         implementation: require('sass-embedded'),
//         includePaths: [
//           resolve(__dirname, '..', 'src', 'renderer', 'styles')
//         ]
//       },
//     },
//   },
//   plugins: [react(), tsconfigPaths()],
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'https://s9rest.ngrok.io',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     outDir: 'dist',
//   },
// });
