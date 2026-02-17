/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // CacheFirst for pre-generated audio MP3 files (English + Burmese)
    {
      matcher({ url }) {
        return url.pathname.startsWith('/audio/');
      },
      handler: new CacheFirst({
        cacheName: 'audio-v2',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1200, // ~384 English + ~384 Burmese + buffer
            maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
          }),
        ],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    // Bilingual notification per user decision
    const title = data.title || 'US Civics / US Civics';
    const options = {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag || 'study-reminder',
      data: {
        url: data.url || '/',
      },
      // Vibrate pattern for mobile
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification click - open or focus app window
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app window exists, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});
