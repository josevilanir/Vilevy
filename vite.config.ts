import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dns from 'dns'
import { componentTagger } from 'lovable-tagger'
import { VitePWA } from 'vite-plugin-pwa'

// força DNS na ordem verbatim (opcional)
dns.setDefaultResultOrder('verbatim')

export default defineConfig(({ mode }) => {
  // ativa PWA só em development
  const enablePWA = mode === 'development'

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      // inclui plugin PWA apenas em dev
      enablePWA && VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
        manifest: {
          name: 'Pup Pixel Photo Pal',
          short_name: 'PixelPal',
          description: 'Seu app pixelado com coala!',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: { cacheName: 'html-cache' },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
