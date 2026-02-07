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
          includeAssets: ['favicon.ico', 'assets/ui/*.webp', 'assets/ui/*.png', 'assets/ui/*.svg', 'assets/icons/*.png'],
          manifest: {
            name: 'CircuitMind AI',
            short_name: 'CircuitMind',
            description: 'Intelligent Engineering OS for Electronics Prototyping',
            theme_color: '#050508',
            background_color: '#050508',
            display: 'standalone',
            orientation: 'any',
            categories: ['productivity', 'utilities', 'education'],
            icons: [
              { src: '/assets/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
              { src: '/assets/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
              { src: '/assets/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
              { src: '/assets/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
              { src: '/assets/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
              { src: '/assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/assets/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
              { src: '/assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
              { src: '/assets/icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
              { src: '/assets/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
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
              'vendor-charts': ['recharts', 'react-grid-layout'],
              'vendor-git': ['isomorphic-git', '@isomorphic-git/lightning-fs'],
              'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
              'vendor-pdf': ['jspdf'],
            }
          }
        },
        chunkSizeWarningLimit: 400,
      }
    };
});
