import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const chunkFor = (id: string): string | undefined => {
  if (!id.includes('node_modules')) return undefined;
  if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'vendor';
  if (/[\\/](@reduxjs|react-redux|redux|immer|reselect)[\\/]/.test(id)) return 'redux';
  if (/[\\/](recharts|d3-[^\\/]+|victory-vendor)[\\/]/.test(id)) return 'charts';
  if (/[\\/](framer-motion|motion-dom|motion-utils|sonner)[\\/]/.test(id)) return 'ui';
  if (/[\\/]lucide-react[\\/]/.test(id)) return 'icons';
  return undefined;
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: { host: true, port: 5173 },
  build: { rollupOptions: { output: { manualChunks: chunkFor } } },
});
