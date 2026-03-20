import { generateSW } from 'workbox-build';

generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*'],
  swDest: 'dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'CacheFirst',
      options: {
        cacheName: 'page-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
      handler: 'CacheFirst',
      options: {
        cacheName: 'asset-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
        }
      }
    },
    {
      // Fallback for other requests: CacheFirst to prefer cached responses.
      urlPattern: /.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'default-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
}).then(({ count, size }) => {
  console.log(`Generated service worker, which will precache ${count} files (${size} bytes).`);
}).catch(err => {
  console.error('Failed to generate service worker:', err);
});
