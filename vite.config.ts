import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf', 'pdfjs-dist/build/pdf.worker.min.js']
  },
  assetsInclude: ['**/*.worker.js', '**/*.worker.min.js', '**/*.worker.mjs'],
  worker: {
    format: 'es'
  }
})
