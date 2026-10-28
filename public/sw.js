const CACHE_NAME = 'easter-choir-v21';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './audio/track_01.mp3',
  './audio/track_02.mp3',
  './audio/track_03.mp3',
  './audio/track_04.mp3',
  './audio/track_05.mp3',
  './audio/track_06.mp3',
  './audio/track_07.mp3',
  './audio/track_08.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // HTML / JS / CSS は Network First（更新を最優先、圏外ならキャッシュ）
  const isCode = url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('.js') ||
                 url.pathname.endsWith('.css') ||
                 url.pathname === '/' ||
                 url.pathname.endsWith('/');

  if (isCode) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
  } else {
    // 音源・画像・フォントは Cache First（高速再生 & オフライン動作）
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (request.method === 'GET' && networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
  }
});
