import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/AGRONAUTS/',

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@tanstack/react-router': path.resolve(
          __dirname,
          'src/lib/router.tsx'
        ),
        '@tanstack/react-start': path.resolve(
          __dirname,
          'src/lib/agri.functions.ts'
        ),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
