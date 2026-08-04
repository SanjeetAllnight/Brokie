import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Don't inline the service worker — serve it from the root
      injectRegister: 'auto',
      // Workbox configuration
      workbox: {
        // Pre-cache all built assets
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        // Don't let Workbox intercept the FCM service worker file
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js/],
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Material Symbols icons font
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/icon.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'material-icons',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Web App Manifest
      manifest: {
        name: 'Brokie — Wallet Survival',
        short_name: 'Brokie',
        description: 'Your brutally honest wallet survival companion.',
        theme_color: '#4B3B7C',
        background_color: '#100B1E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['finance', 'productivity'],
      },
      // Dev options — enable SW in development for testing
      devOptions: {
        enabled: false, // Set to true to test SW locally
        type: 'module',
      },
    }),
  ],
});
