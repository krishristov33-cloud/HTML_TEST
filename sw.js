const CACHE = 'sss-mwgpvyf5-1d6q5';
// big immutable assets → cache-first; everything else (html/js/css/data) → network-first
const IMMUTABLE = (p) => /\/a\/|\.(glb|woff2?|ttf|otf|ogg|wav|mp3|m4a|png|jpe?g|webp|atlas)$/i.test(p);
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const save = (res) => { if (res && res.ok && res.type === 'basic') cache.put(req, res.clone()); return res; };
    if (IMMUTABLE(url.pathname)) {
      const hit = await cache.match(req);
      if (hit) return hit;
      return save(await fetch(req));
    }
    // network-first: always try fresh code/data, fall back to cache offline
    try {
      return save(await fetch(req, { cache: 'no-store' }));
    } catch (err) {
      const hit = await cache.match(req);
      if (hit) return hit;
      throw err;
    }
  })());
});
