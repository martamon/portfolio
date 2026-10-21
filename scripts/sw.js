// Framer's CMS loader asks its CDN for byte ranges of *.framercms files via ?range=from-to,from-to
// (inclusive) and expects only those bytes back. Static hosting ignores the parameter and returns the
// whole file, which breaks client-side navigation to CMS pages. This worker serves the slices instead.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin === self.location.origin && u.pathname.endsWith('.framercms') && u.searchParams.has('range')) {
    e.respondWith(slice(u));
  } else if (u.hostname === 'framerusercontent.com' && /^\/(images|assets)\//.test(u.pathname) && e.request.method === 'GET') {
    e.respondWith(local(e.request, u));
  }
});

// Framer's CMS data points at https://framerusercontent.com/images/...; serve those from this site's copies
// (optimized .webp when the original was converted) and only fall back to Framer's CDN if a file is missing.
async function local(req, u) {
  const base = self.location.origin + '/framerusercontent.com' + u.pathname;
  const tries = [base];
  if (/\.(png|jpe?g)$/i.test(base)) tries.push(base.replace(/\.(png|jpe?g)$/i, '.webp'));
  for (const t of tries) {
    try { const r = await fetch(t); if (r.ok) return r; } catch (err) { /* try the next one */ }
  }
  return fetch(req);
}

async function slice(u) {
  const ranges = u.searchParams.get('range').split(',').map(s => s.split('-').map(Number));
  const base = new URL(u); base.search = '';
  const cache = await caches.open('framercms-v1');
  let res = await cache.match(base.href);
  if (!res) {
    res = await fetch(base.href);
    if (!res.ok) return res;
    await cache.put(base.href, res.clone());
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  const parts = ranges.map(([from, to]) => buf.subarray(from, to + 1));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return new Response(out, { status: 200, headers: { 'content-type': 'application/octet-stream' } });
}
