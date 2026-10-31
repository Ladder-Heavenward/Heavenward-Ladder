/* The ladder as an app: offline copy, updates, and keeping the record safe.
   The record lives in this browser's storage. Nothing here reads, writes or sends it. */
(function () {
  if (!('serviceWorker' in navigator) || !window.caches) return;
  const BASE = new URL('./', document.currentScript.src).href, CACHE = 'ladder-pages', KEY = BASE + '__installed.json';
  const A = (() => { try { return JSON.parse(localStorage.getItem('ladder-app') || '{}'); } catch (e) { return {}; } })();
  const saveA = () => { try { localStorage.setItem('ladder-app', JSON.stringify(A)); } catch (e) {} };
  navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});

  let bar;
  function banner(text, buttons) {
    if (!bar) {
      bar = document.createElement('div');
      bar.setAttribute('role', 'status');
      bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:0 auto;padding:10px 14px;border-radius:10px;background:#1f3a5f;color:#f4ecd8;font:15px/1.4 system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.25);display:flex;flex-wrap:wrap;gap:8px;align-items:center';
      document.body.appendChild(bar);
    }
    bar.innerHTML = ''; const t = document.createElement('span'); t.style.flex = '1 1 200px'; t.textContent = text; bar.appendChild(t);
    (buttons || []).forEach(([label, fn]) => { const b = document.createElement('button'); b.textContent = label;
      b.style.cssText = 'font:inherit;padding:4px 12px;border-radius:6px;border:1px solid #f4ecd8;background:transparent;color:inherit;cursor:pointer';
      b.onclick = fn; bar.appendChild(b); });
    bar.hidden = false;
  }
  const hide = () => { if (bar) bar.hidden = true; };

  async function fetchInto(c, files, say) {
    let done = 0, failed = 0; const q = files.slice();
    async function worker() { while (q.length) { const p = q.shift(); const u = BASE + p;
      try { const r = await fetch(u, { cache: 'reload' }); if (!r.ok) throw 0; await c.put(u, r); } catch (e) { failed++; }
      done++; if (say && done % 20 === 0) say(done, files.length); } }
    await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
    return failed;
  }
  async function apply(remote, local, quiet) {
    const c = await caches.open(CACHE), lf = (local && local.files) || {};
    const changed = Object.keys(remote.files).filter(p => remote.files[p] !== lf[p]);
    const gone = Object.keys(lf).filter(p => !(p in remote.files));
    const say = quiet ? null : (n, N) => banner('Saving the ladder for offline use… ' + n + ' of ' + N);
    const failed = await fetchInto(c, changed, say);
    if (failed) { if (!quiet) banner('Some pages did not save. The ladder will try again next time you are online.', [['OK', hide]]); return false; }
    await Promise.all(gone.map(p => c.delete(BASE + p)));
    await c.put(KEY, new Response(JSON.stringify(remote), { headers: { 'content-type': 'application/json' } }));
    return true;
  }
  async function check() {
    if (!navigator.onLine) return;
    let remote; try { remote = await (await fetch(BASE + 'version.json', { cache: 'no-store' })).json(); } catch (e) { return; }
    const c = await caches.open(CACHE), hit = await c.match(KEY), local = hit ? await hit.json() : null;
    if (!local) { if (await apply(remote, null, false)) banner('The ladder is saved on this device. It works offline now.', [['OK', hide]]); return; }
    if (local.version === remote.version) return;
    if (remote.required) { if (await apply(remote, local, true)) location.reload(); return; }
    if (sessionStorage.getItem('ladder-later') === remote.version) return;
    banner('A new version of the ladder is ready (' + remote.version + '). Your record stays as it is.', [
      ['Update now', async () => { banner('Updating…'); if (await apply(remote, local, false)) location.reload(); }],
      ['Later', () => { sessionStorage.setItem('ladder-later', remote.version); hide(); }]]);
  }
  function remind() {
    if (!window.LadderRecord || bar && !bar.hidden) return;
    const now = Date.now(), DAY = 864e5;
    if (!A.first) { A.first = now; saveA(); return; }
    if (now - (A.copied || A.first) < 14 * DAY || now - (A.asked || 0) < 3 * DAY) return;
    banner('It has been a while. Save a copy of your record, in case this device is lost or cleared.', [
      ['Save a copy', () => { try { LadderRecord.export(); A.copied = Date.now(); saveA(); } catch (e) {} hide(); }],
      ['Not now', () => { A.asked = Date.now(); saveA(); hide(); }]]);
  }
  window.addEventListener('load', () => { check().then(remind, remind); });
})();
