/* The ladder's offline helper. It only serves pages from the saved copy.
   app.js decides what to save and when; this file never touches the record. */
const CACHE = 'ladder-pages';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            /* fonts etc. go to the network */
  if (u.pathname.endsWith('/version.json')) return;     /* always asked of the network */
  /* the updater asks with cache 'reload' or 'no-store': those go to the network, never to the saved copy
     (before 0.0.504 they were answered from the saved copy, so an update re-saved the old pages) */
  if (r.cache === 'reload' || r.cache === 'no-store') return;
  if (u.pathname.endsWith('/')) u.pathname += 'index.html';
  u.search = ''; u.hash = '';
  e.respondWith(caches.open(CACHE).then(c => c.match(u.href).then(hit => hit ||
    fetch(r).then(res => { if (res.ok && res.type === 'basic') c.put(u.href, res.clone()); return res; })
      .catch(() => c.match(new URL('index.html', self.registration.scope).href).then(x => x || Response.error())))));
});
