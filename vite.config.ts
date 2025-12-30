import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL : '';
  const isDevelopment = mode === 'development';

  const config: UserConfig = {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    optimizeDeps: {
      exclude: ['pdfjs-dist']
    },
    assetsInclude: ['**/*.worker.js', '**/*.worker.min.js', '**/*.worker.mjs'],
    worker: {
      format: 'es'
    },
    preview: {
      host: '0.0.0.0',
      port: 4173
    },
    build: {
      // Optimización de chunks para mejor code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks - librerías principales
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],

            // Charts y visualización
            'charts-vendor': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],

            // UI y utilidades
            'ui-vendor': ['lucide-react', 'react-select', 'react-window'],

            // Mapas (si InformeEjecutivo usa leaflet)
            'maps-vendor': ['leaflet', 'react-leaflet'],

            // Validación y forms
            'forms-vendor': ['zod']
          },
          // Nombres de chunks más descriptivos
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()
              : 'chunk';
            return `assets/js/${facadeModuleId}-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      // Aumentar límite de warnings de chunk size (opcional)
      chunkSizeWarningLimit: 1000,
      // Minificación optimizada
      minify: 'esbuild',
      // Source maps solo en desarrollo
      sourcemap: isDevelopment
    }
  };

  // Solo agregar configuración de server/proxy en desarrollo
  if (isDevelopment) {
    config.server = {
      proxy: {
        // Proxy todas las peticiones /api/* al backend usando variable de entorno
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy: any, _options: any) => {
            proxy.on('error', (err: any, _req: any, _res: any) => {
              console.log('🚨 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
              console.log(`🔄 Proxy: ${req.method} ${req.url} → ${apiBaseUrl}${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
              console.log(`📦 Response: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            });
          }
        },
        // Proxy para archivos estáticos /uploads/* al backend
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy: any, _options: any) => {
            proxy.on('error', (err: any, _req: any, _res: any) => {
              console.log('🚨 Upload proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
              console.log(`📁 Upload proxy: ${req.method} ${req.url} → ${apiBaseUrl}${proxyReq.path}`);
            });
            proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
              console.log(`🖼️ Upload response: ${req.method} ${req.url} → ${proxyRes.statusCode}`);
            });
          }
        }
      }
    };
  }

  return config;
})
