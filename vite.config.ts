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
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-three': ['three'],
              'vendor-ai': ['@google/genai'],
              'vendor-ui': ['framer-motion'],
              'vendor-markdown': ['react-markdown', 'remark-gfm', 'remark-breaks'],
              'vendor-collab': ['yjs', 'y-webrtc'],
              'vendor-git': ['isomorphic-git', '@isomorphic-git/lightning-fs'],
              'vendor-charts': ['recharts'],
              'vendor-i18n': ['i18next', 'i18next-browser-languagedetector', 'i18next-http-backend', 'react-i18next'],
              'vendor-pdf': ['jspdf'],
            }
          }
        },
        chunkSizeWarningLimit: 400,
      }
    };
});
