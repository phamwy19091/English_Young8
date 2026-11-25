import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
          if (id.includes('/src/data/units/') || id.includes('\\src\\data\\units\\')) {
            return 'data-units';
          }
          if (id.includes('/src/data/exams/') || id.includes('\\src\\data\\exams\\')) {
            return 'data-exams';
          }
        },
      },
    },
  },
  // @ts-expect-error vitest config
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/unit/**/*.test.{ts,tsx}'],
  },
});
