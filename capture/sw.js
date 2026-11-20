/* LFAI Capture — app shell cache + Web Share Target 수신 */
const SHELL = 'lfai-capture-v1';
const SHARE = 'lfai-share-v1';
const ASSETS = [
  './', './index.html', './app.js', './style.css', './manifest.webmanifest',
  './icons/icon.svg', './config/capture-ui-config.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(ASSETS).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = new Set([SHELL, SHARE]);
    for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function handleShare(req) {
  let title = '', text = '', url = '';
  try {
    const fd = await req.formData();
    title = (fd.get('title') || '').toString();
    text = (fd.get('text') || '').toString();
    url = (fd.get('url') || '').toString();
  } catch (_) { /* body 없음 */ }
  const cache = await caches.open(SHARE);
  await cache.put(
    new Request(new URL('./share-last', self.registration.scope).href),
    new Response(JSON.stringify({ title, text, url, at: Date.now() }), {
      headers: { 'Content-Type': 'application/json' }
    })
  );
  return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.method === 'POST' && url.pathname.endsWith('/share-target.html')) {
    e.respondWith(handleShare(req));
    return;
  }
  if (req.method !== 'GET') return;
  if (!url.pathname.includes('/capture/')) return;

  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const resp = await fetch(req);
      if (resp.ok) {
        const copy = resp.clone();
        (await caches.open(SHELL)).put(req, copy).catch(() => {});
      }
      return resp;
    } catch (_) {
      return (await caches.match('./index.html')) || Response.error();
    }
  })());
});
