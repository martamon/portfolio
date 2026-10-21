// Site-specific additions on top of the mirrored Framer pages. Loaded on every page (see add-root-shim.py).
//  - about: the hair video fades into the page background at the top and bottom edges
//  - lexus-singapore: Instagram reel appended to the image column
//  - schweppes: full-screen landscape YouTube video right under the text
//  - project pages: toggle between the single-column list and a grid, like nolan-barret.framer.website/playground
// Framer re-renders on navigation, so everything is applied by an idempotent apply() that is re-run on DOM changes.
(function () {
  'use strict';

  var PROJECTS = ['lexus-singapore', 'china', 'soapglory', 'djone', 'greece', 'pedrapas', 'ayeaye', 'soidades-de-onte', 'schweppes', 'coming-soon'];
  var INSTAGRAM = 'https://www.instagram.com/p/DUk54nFkTu_/embed/';
  var YOUTUBE = 'CCBU84Ma-gE';

  var css = [
    // about: soft edges for the hair video
    'html[data-xp="about"] video{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 9%,#000 78%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 9%,#000 78%,transparent 100%)}',
    '[data-xh]{display:none!important}',
    // project pages: Framer fixes the page, main and image column to ~5,000px, but the images are taller, so the
    // footer ended up in the middle of the images and the background gradient stopped. Let them grow with the content.
    'main[data-xm]{height:auto!important;min-height:0!important}',
    '[data-xr]{height:auto!important;min-height:100vh!important}',
    '[data-xg]{height:auto!important}',
    // view toggle
    '.x-toggle{position:absolute;top:56px;right:20px;display:flex;gap:4px;z-index:6}',
    '.x-toggle button{width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:none;color:#1b1b1b;opacity:.35;cursor:pointer;transition:opacity .2s}',
    '.x-toggle button[aria-pressed="true"]{opacity:1}',
    '.x-toggle button:hover{opacity:.75}',
    '.x-toggle svg{width:16px;height:16px;fill:currentColor}',
    'main[data-gal="grid"]{flex-direction:column!important;height:auto!important;min-height:0!important}',
    'main[data-gal="grid"]>:not([data-xg]):not(.x-toggle){flex:none!important;width:605px!important;max-width:100%!important;height:auto!important;position:relative!important;top:auto!important}',
    'main[data-gal="grid"]>[data-xg]{flex:none!important}',
    'main[data-gal="grid"] [data-xg]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start;width:100%!important;height:auto!important;min-height:0!important;padding:20px!important;box-sizing:border-box}',
    'main[data-gal="grid"] [data-xg]>*{width:100%!important;max-width:none!important;height:var(--gh,auto)!important}',
    '@media(max-width:810px){main[data-gal="grid"] [data-xg]{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px!important}}',
    // instagram reel
    '.x-insta{position:relative;flex:none;overflow:hidden}',
    '.x-insta iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}',
    // schweppes full-screen video: fills the viewport (cropping the sides a little) on screens up to 16:9,
    // and shows the whole frame, full width, on wider or portrait screens
    '.x-yt{position:relative;width:100%;height:100vh;overflow:hidden;background:#000}',
    '.x-yt iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%);border:0}',
    '@media(min-aspect-ratio:16/9),(max-aspect-ratio:1/1){.x-yt{height:56.25vw}.x-yt iframe{top:0;left:0;width:100%;height:100%;transform:none}}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var mode = 'single';
  try { if (localStorage.getItem('gallery-view') === 'grid') mode = 'grid'; } catch (e) {}

  function pageKey() { return location.pathname.replace(/\/+$/, '').replace(/^\//, '') || 'home'; }
  function mainEl() { return document.querySelector('main'); }
  function galleryEl(m) {
    for (var i = m.children.length - 1; i >= 0; i--) if (!m.children[i].classList.contains('x-toggle')) return m.children[i];
    return null;
  }
  function setAttr(el, name, val) { if (el.getAttribute(name) !== val) el.setAttribute(name, val); }
  function unset(sel, attr) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) list[i].removeAttribute(attr);
  }
  function removeAll(sel) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) list[i].parentNode.removeChild(list[i]);
  }

  function setMode(m) {
    mode = m;
    try { localStorage.setItem('gallery-view', m); } catch (e) {}
    apply();
  }

  function ensureToggle(m) {
    var t = m.querySelector(':scope > .x-toggle');
    if (!t) {
      t = document.createElement('div');
      t.className = 'x-toggle';
      t.innerHTML =
        '<button type="button" data-m="single" aria-label="Single column view"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14"/></svg></button>' +
        '<button type="button" data-m="grid" aria-label="Grid view"><svg viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg></button>';
      t.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button[data-m]');
        if (b) { e.preventDefault(); e.stopPropagation(); setMode(b.getAttribute('data-m')); }
      });
      m.appendChild(t);
    }
    var bs = t.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) setAttr(bs[i], 'aria-pressed', String(bs[i].getAttribute('data-m') === mode));
  }

  function sizeInsta(g) {
    var el = g.querySelector(':scope > .x-insta');
    if (!el) return;
    var ref = g.children[0] !== el ? g.children[0] : null;
    var w = ref ? ref.offsetWidth : el.offsetWidth;
    var h = parseFloat(el.getAttribute('data-h')) || (w ? Math.round(w * 16 / 9) : 0);
    if (w) el.setAttribute('data-r', String(h / w));
    if (mode === 'single' && w && h) { el.style.width = w + 'px'; el.style.height = h + 'px'; }
    else if (mode === 'grid') { el.style.width = ''; el.style.height = ''; }
  }

  function ensureInsta(g) {
    var el = g.querySelector(':scope > .x-insta');
    if (!el) {
      el = document.createElement('div');
      el.className = 'x-insta';
      var f = document.createElement('iframe');
      f.src = INSTAGRAM;
      f.title = 'Lexus on Instagram';
      f.loading = 'lazy';
      f.allowFullscreen = true;
      f.setAttribute('scrolling', 'no');
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      el.appendChild(f);
      g.appendChild(el);
    }
    sizeInsta(g);
  }

  // Instagram's embed reports the height of its card; use it so there is no empty space below the post
  addEventListener('message', function (e) {
    if (!/(^|\.)instagram\.com$/.test(String(e.origin).replace(/^https?:\/\//, ''))) return;
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
    if (!d || d.type !== 'MEASURE' || !d.details || !d.details.height) return;
    var el = document.querySelector('.x-insta');
    if (!el) return;
    el.setAttribute('data-h', String(d.details.height));
    var g = el.parentNode;
    if (g) { sizeInsta(g); if (mode === 'grid') schedule(); }
  });

  function applyGrid(m, g) {
    var kids = g.children, i, c;
    // remember each item's height/width ratio from the single-column layout
    var missing = false;
    for (i = 0; i < kids.length; i++) if (!kids[i].getAttribute('data-r')) missing = true;
    if (missing) {
      var was = m.getAttribute('data-gal');
      m.removeAttribute('data-gal');
      for (i = 0; i < kids.length; i++) {
        c = kids[i];
        if (!c.getAttribute('data-r') && c.offsetWidth) c.setAttribute('data-r', String(c.offsetHeight / c.offsetWidth));
      }
      if (was) m.setAttribute('data-gal', was);
    }
    setAttr(m, 'data-gal', 'grid');
    // the text column's content can be taller than its own box; keep the grid below it
    for (i = 0; i < m.children.length; i++) {
      var t = m.children[i];
      if (t === g || t.classList.contains('x-toggle')) continue;
      t.style.minHeight = '';
      if (t.scrollHeight > t.clientHeight) t.style.minHeight = t.scrollHeight + 'px';
    }
    for (i = 0; i < kids.length; i++) {
      c = kids[i];
      var r = parseFloat(c.getAttribute('data-r'));
      if (r) c.style.setProperty('--gh', Math.round(c.getBoundingClientRect().width * r) + 'px');
    }
  }

  function ensureYoutube(m) {
    var sec = document.querySelector('.x-yt');
    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'x-yt';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + YOUTUBE + '?autoplay=1&mute=1&loop=1&playlist=' + YOUTUBE + '&rel=0&modestbranding=1&playsinline=1';
      f.title = 'Schweppes';
      f.allowFullscreen = true;
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      sec.appendChild(f);
      m.parentNode.insertBefore(sec, m.nextSibling);
    }
    // the empty image column and the small copy of this video further down are replaced by the full-screen one
    var g = galleryEl(m);
    if (g && g.children.length === 0) setAttr(g, 'data-xh', '');
    var img = document.querySelector('img[src*="' + YOUTUBE + '"]');
    if (img && !sec.contains(img)) {
      var blk = img;
      while (blk.parentElement && blk.parentElement !== m.parentNode) blk = blk.parentElement;
      if (blk !== m && blk !== sec) setAttr(blk, 'data-xh', '');
    }
  }

  function apply() {
    var p = pageKey();
    setAttr(document.documentElement, 'data-xp', p);

    var m = mainEl();
    var g = m && galleryEl(m);
    var isGallery = !!(g && g.children.length >= 3 && g.querySelector('img'));

    var proj = !!m && PROJECTS.indexOf(p) !== -1;
    if (proj) {
      setAttr(m, 'data-xm', '');
      setAttr(m.parentElement, 'data-xr', '');
      if (g) setAttr(g, 'data-xg', '');
    } else {
      unset('[data-xm]', 'data-xm'); unset('[data-xr]', 'data-xr'); unset('[data-xg]', 'data-xg');
    }

    if (isGallery) {
      ensureToggle(m);
      if (p === 'lexus-singapore') ensureInsta(g); else removeAll('.x-insta');
      if (mode === 'grid') applyGrid(m, g);
      else {
        m.removeAttribute('data-gal');
        for (var j = 0; j < m.children.length; j++) if (m.children[j] !== g) m.children[j].style.minHeight = '';
      }
    } else {
      removeAll('.x-toggle'); removeAll('.x-insta');
      unset('[data-gal]', 'data-gal');
    }

    if (p === 'schweppes' && m) ensureYoutube(m);
    else { removeAll('.x-yt'); unset('[data-xh]', 'data-xh'); }
  }

  var timer = 0;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = 0; try { apply(); } catch (e) {} }, 120);
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', schedule);
  addEventListener('popstate', schedule);
  schedule();
})();
