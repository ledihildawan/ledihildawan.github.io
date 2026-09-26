import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Ledi Hildawan - Software Engineer',
        },
        ejsOptions: {
          views: [
            path.resolve(import.meta.dirname, 'src/ui'),
            path.resolve(import.meta.dirname, 'src/ui/layouts'),
            path.resolve(import.meta.dirname, 'src/ui/patterns'),
            path.resolve(import.meta.dirname, 'src/ui/primitives'),
          ],
          root: path.resolve(import.meta.dirname, 'src/ui'),
        },
      },
    }),
  ],
  build: {
    outDir: 'dist',
    minify: true,
    cssMinify: 'lightningcss',
  },
  server: {
    port: 3000,
    open: true,
  },
});
