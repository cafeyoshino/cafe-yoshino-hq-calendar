const CACHE_NAME = 'cafe-yoshino-calendar-v17';
const APP_FILES = [
  './',
  './index.html',
  './app-config.js',
  './cafe-yoshino-logo-small.jpg',
  './manifest.webmanifest',
  './icon.svg'
];

// 中身が変わるファイル＝常に最新を取りに行きたいもの
const NETWORK_FIRST = ['./', './index.html', './app-config.js', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  // 新しいService Workerを待機させず即有効化する
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      // 有効化後、既に開いているタブもすぐ新Workerの管理下に置く
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // このパスがネット優先対象か判定（index.html等）
  const path = requestUrl.pathname.replace(/^.*\/(?=[^/]*$)/, './');
  const isNetworkFirst =
    NETWORK_FIRST.includes(path) ||
    requestUrl.pathname === self.registration.scope.replace(/^https?:\/\/[^/]+/, '') ||
    requestUrl.pathname.endsWith('/') ||
    requestUrl.pathname.endsWith('/index.html');

  if (isNetworkFirst) {
    // ネット優先：まず取りに行き、成功したらキャッシュも更新。失敗時だけキャッシュを返す
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // それ以外（画像・アイコン等）：キャッシュ優先で高速表示
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
