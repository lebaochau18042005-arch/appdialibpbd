import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Separate local preview only. Never used by the production build or deployment.
export default defineConfig({
  plugins: [{ name: 'learning-preview-fixtures', enforce: 'pre', resolveId(source) {
    if (/\/(contexts\/AuthContext|services\/(examService|liveExamService|liveTrackingService|assignmentService|ai|libraryService))$/.test(source))
      return path.resolve('tests/previewFixtures.ts');
  } }, react(), tailwindcss()],
  optimizeDeps: { entries: ['tests/learning-preview.html'] },
  server: { host: '127.0.0.1', port: 4178, strictPort: true },
});
