import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        nodePolyfills({
          globals: {
            Buffer: true,
            global: true,
            process: true,
          },
        }),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'assets/ui/*.webp', 'assets/ui/*.png', 'assets/ui/*.svg'],
          manifest: {
            name: 'CircuitMind AI',
            short_name: 'CircuitMind',
            description: 'Intelligent Engineering OS for Electronics Prototyping',
            theme_color: '#050508',
            background_color: '#050508',
            display: 'standalone',
            // PWA manifest icons use PNG format for maximum browser/OS compatibility
            // WebP support in PWA manifests is limited on older Android/iOS devices
            // Logo assets are pre-optimized and included in includeAssets above
            icons: [
              {
                src: '/assets/ui/logo.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/assets/ui/logo.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,webp,svg}'],
            maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB per-file limit
            navigateFallback: 'index.html',
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              },
              {
                urlPattern: /\.(?:js|css)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                  }
                }
              }
            ]
          }
        })
      ],
      test: {
        environment: 'jsdom',
        setupFiles: './tests/setup.tsx',
        globals: true,
        clearMocks: true,
        sequence: { concurrent: false },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          ...(mode === 'production' ? { 'axe-core': path.resolve(__dirname, 'scripts/empty-module.js') } : {}),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              // --- Vendor chunks ---
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
              if (id.includes('node_modules/three/')) return 'vendor-three';
              if (id.includes('node_modules/@google/genai/')) return 'vendor-ai';
              if (id.includes('node_modules/framer-motion/')) return 'vendor-ui';
              if (id.includes('node_modules/react-markdown/') || id.includes('node_modules/remark-gfm/') || id.includes('node_modules/remark-breaks/')) return 'vendor-markdown';
              if (id.includes('node_modules/yjs/') || id.includes('node_modules/y-webrtc/')) return 'vendor-collab';
              if (id.includes('node_modules/isomorphic-git/') || id.includes('node_modules/@isomorphic-git/')) return 'vendor-git';
              if (id.includes('node_modules/recharts/')) return 'vendor-charts';
              if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next/')) return 'vendor-i18n';
              if (id.includes('node_modules/jspdf/')) return 'vendor-pdf';
              if (id.includes('node_modules/mathjs/')) return 'vendor-math';
              if (id.includes('node_modules/react-grid-layout/')) return 'vendor-grid';
              if (id.includes('node_modules/jszip/')) return 'vendor-zip';
              if (id.includes('node_modules/xml-js/')) return 'vendor-xml';

              // --- App service chunks (split heavy service domains out of index) ---
              if (id.includes('/services/gemini/')) return 'app-gemini';
              if (id.includes('/services/simulation/') || id.includes('/services/simulationEngine')) return 'app-simulation';
            }
          }
        },
        chunkSizeWarningLimit: 400,
      }
    };
});
