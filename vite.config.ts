import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'process.env.APP_URL': JSON.stringify(env.APP_URL || ''),
      'process.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(env.CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || ''),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Match exact packages to prevent circular chunk dependencies
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/firebase/')) {
                return 'vendor-firebase';
              }
              if (id.includes('node_modules/lucide-react/')) {
                return 'vendor-icons';
              }
              if (id.includes('node_modules/katex/')) {
                return 'vendor-katex';
              }
              if (id.includes('node_modules/mammoth/') || id.includes('node_modules/xlsx/') || id.includes('node_modules/docx/') || id.includes('node_modules/pptxgenjs/')) {
                return 'vendor-docs';
              }
              if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
                return 'vendor-charts';
              }
              if (id.includes('node_modules/@clerk/')) {
                return 'vendor-clerk';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 1500,
    },
  };
});
