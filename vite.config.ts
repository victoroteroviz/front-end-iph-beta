import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['pdfjs-dist/build/pdf', 'pdfjs-dist/build/pdf.worker.min.js']
    },
    assetsInclude: ['**/*.worker.js', '**/*.worker.min.js', '**/*.worker.mjs'],
    worker: {
      format: 'es'
    },
    server: {
      proxy: {
        // Proxy todas las peticiones /api/* al backend usando variable de entorno
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🚨 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🔄 Proxy: ${req.method} ${req.url} → ${apiBaseUrl}${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`📦 Response: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            });
          }
        },
        // Proxy para archivos estáticos /uploads/* al backend
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🚨 Upload proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`📁 Upload proxy: ${req.method} ${req.url} → ${apiBaseUrl}${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(`🖼️ Upload response: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            });
          }
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: true
    }
  }
})
