// Site-specific additions on top of the mirrored Framer pages. Loaded on every page (see add-root-shim.py).
//  - about: the hair video fades into the page background at the top and bottom edges
//  - lexus-singapore: Instagram reel appended to the image column
//  - schweppes: full-screen landscape YouTube video right under the text
//  - project pages: toggle between the single-column list and a grid, like nolan-barret.framer.website/playground
// Framer re-renders on navigation, so everything is applied by an idempotent apply() that is re-run on DOM changes.
(function () {
  'use strict';

  // every route that is not one of these is a project page (the project list lives in Framer's CMS and grows)
  var NOT_PROJECTS = ['home', 'about', 'contact'];
  var TITLES = { 'soapglory': 'Soap&Glory', 'lexus-singapore': 'Lexus', 'china': 'China', 'schweppes': 'Schweppes', 'soidades-de-onte': 'Soidades de onte', 'djone': 'Djone', 'ayeaye': 'AYE AYE', 'pedrapas': 'Pedra Pas', 'greece': 'Greece', 'portugal': 'Portugal', 'nothing-to-see-here': 'Nothing to see here', 'studio-girls': 'Studio' };
  var INSTAGRAM = 'https://www.instagram.com/p/DUYB457D3x5/embed/';
  // Instagram's embed card is header (54px) + media + footer with likes/comments (154px); only the media is shown
  var IG_HEAD = 54, IG_FOOT = 154;
  var LEXUS_IMAGE = '/extras/lexus-rz.webp';
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
    // grid view on wide screens: title/role/year on the left, description beside it instead of one tall narrow column
    '@media(min-width:811px){main[data-gal="grid"]>:not([data-xg]):not(.x-toggle){width:100%!important;max-width:none!important}',
    'main[data-gal="grid"]>:not([data-xg]):not(.x-toggle)>*{width:100%!important;max-width:none!important;height:auto!important;flex-direction:row!important;align-items:flex-start!important;justify-content:flex-start!important;gap:80px!important}',
    'main[data-gal="grid"]>:not([data-xg]):not(.x-toggle)>*>:first-child{flex:none!important;width:320px!important}',
    'main[data-gal="grid"]>:not([data-xg]):not(.x-toggle)>*>:last-child{flex:1 1 0!important;width:auto!important;max-width:900px!important}}',
    'main[data-gal="grid"]>[data-xg]{flex:none!important}',
    'main[data-gal="grid"] [data-xg]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start;width:100%!important;height:auto!important;min-height:0!important;padding:20px!important;box-sizing:border-box}',
    'main[data-gal="grid"] [data-xg]>*{width:100%!important;max-width:none!important;height:var(--gh,auto)!important}',
    '@media(max-width:810px){main[data-gal="grid"] [data-xg]{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:12px!important}}',
    // lexus extras: instagram video (cropped to the media only) and the RZ image
    '.x-insta,.x-img{position:relative;flex:none;overflow:hidden}',
    '.x-insta iframe{position:absolute;left:0;top:-' + IG_HEAD + 'px;width:100%;height:calc(100% + ' + (IG_HEAD + IG_FOOT) + 'px);border:0}',
    '.x-img img{display:block;width:100%;height:100%;object-fit:cover}',
    // project galleries: only the outer corners of the column (or of the grid) are rounded
    '[data-xc]{overflow:hidden}',
    '[data-xc~="tl"]{border-top-left-radius:20px}',
    '[data-xc~="tr"]{border-top-right-radius:20px}',
    '[data-xc~="bl"]{border-bottom-left-radius:20px}',
    '[data-xc~="br"]{border-bottom-right-radius:20px}',
    // contact portrait: 3D tilt on hover
    '[data-x3d]{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s,1))!important;transition:transform .2s ease-out,box-shadow .3s;will-change:transform;box-shadow:0 0 0 rgba(20,60,100,0)}',
    '[data-x3d][data-hot]{box-shadow:0 28px 55px rgba(20,60,100,.32);transition:transform .08s linear,box-shadow .3s}',
    // home reel: no YouTube UI (iframe is enlarged inside its clipping box) and our own sound button
    '[data-xv]{transform:scale(1.16)!important;transform-origin:50% 50%}',
    '.x-reel-ctl{position:absolute;right:16px;bottom:16px;z-index:5;width:44px;height:44px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.45);color:#fff;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:auto;transition:background .2s}',
    '.x-reel-ctl:hover{background:rgba(0,0,0,.65)}',
    '.x-reel-ctl svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    // schweppes full-screen video: fills the viewport (cropping the sides a little) on screens up to 16:9,
    // and shows the whole frame, full width, on wider or portrait screens
    '.x-yt{position:relative;width:calc(100% - 40px);height:calc(100vh - 40px);margin:20px;overflow:hidden;background:#000;border-radius:20px}',
    '.x-yt iframe{position:absolute;top:50%;left:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%);border:0}',
    '@media(min-aspect-ratio:16/9),(max-aspect-ratio:1/1){.x-yt{height:calc((100vw - 40px) * .5625)}.x-yt iframe{top:0;left:0;width:100%;height:100%;transform:none}}',
    '[data-xs]{display:none!important}'
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

  // items added to the image column; data-r is height/width
  function extraItems(g) { return g.querySelectorAll(':scope > [data-x]'); }

  function sizeExtras(g) {
    var ref = null, i;
    for (i = 0; i < g.children.length; i++) if (!g.children[i].hasAttribute('data-x')) { ref = g.children[i]; break; }
    var w = ref ? ref.offsetWidth : 0, items = extraItems(g);
    for (i = 0; i < items.length; i++) {
      var el = items[i], r = parseFloat(el.getAttribute('data-r')) || 1;
      if (mode === 'single' && w) { el.style.width = w + 'px'; el.style.height = Math.round(w * r) + 'px'; }
      else if (mode === 'grid') { el.style.width = ''; el.style.height = ''; }
    }
  }

  function ensureExtras(g, show) {
    var ig = g.querySelector(':scope > .x-insta'), im = g.querySelector(':scope > .x-img');
    if (!show) { if (ig) g.removeChild(ig); if (im) g.removeChild(im); return; }
    if (!ig) {
      ig = document.createElement('div');
      ig.className = 'x-insta';
      ig.setAttribute('data-x', 'insta');
      ig.setAttribute('data-r', String(9 / 16));
      var f = document.createElement('iframe');
      f.src = INSTAGRAM;
      f.title = 'Lexus on Instagram';
      f.loading = 'lazy';
      f.allowFullscreen = true;
      f.setAttribute('scrolling', 'no');
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      ig.appendChild(f);
      g.insertBefore(ig, g.firstChild);       // first in the gallery
    } else if (g.firstChild !== ig) {
      g.insertBefore(ig, g.firstChild);
    }
    if (!im) {
      im = document.createElement('div');
      im.className = 'x-img';
      im.setAttribute('data-x', 'img');
      im.setAttribute('data-r', String(1676 / 1658));
      var i = document.createElement('img');
      i.src = LEXUS_IMAGE;
      i.alt = 'Lexus RZ - Bold. Beautiful.';
      i.loading = 'lazy';
      im.appendChild(i);
      g.appendChild(im);                      // last in the gallery
    } else if (g.lastChild !== im) {
      g.appendChild(im);
    }
    sizeExtras(g);
  }

  // Instagram's embed reports the height of its card; derive the media's height/width ratio from it
  addEventListener('message', function (e) {
    if (!/(^|\.)instagram\.com$/.test(String(e.origin).replace(/^https?:\/\//, ''))) return;
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
    if (!d || d.type !== 'MEASURE' || !d.details || !d.details.height) return;
    var el = document.querySelector('.x-insta');
    if (!el || !el.offsetWidth) return;
    var ratio = (d.details.height - IG_HEAD - IG_FOOT) / el.offsetWidth;
    if (ratio > 0.2 && ratio < 3) {
      el.setAttribute('data-r', String(ratio));
      var g = el.parentNode;
      if (g) { sizeExtras(g); if (mode === 'grid') schedule(); }
    }
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


  // ---- rounded corners: only the outer corners of the image column (single view) or of the grid
  function tagCorners(g) {
    var kids = g.children, n = kids.length, i;
    var cols = 1;
    if (mode === 'grid' && getComputedStyle(g).display === 'grid') {
      cols = Math.max(1, getComputedStyle(g).gridTemplateColumns.split(' ').length);
    }
    var lastRow = Math.floor((n - 1) / cols);
    for (i = 0; i < n; i++) {
      var row = Math.floor(i / cols), col = i % cols, c = [];
      if (i === 0) c.push('tl');
      if (row === 0 && (col === cols - 1 || i === n - 1)) c.push('tr');
      if (row === lastRow && col === 0) c.push('bl');
      if (i === n - 1) c.push('br');
      if (cols === 1) { c = []; if (i === 0) c.push('tl', 'tr'); if (i === n - 1) c.push('bl', 'br'); }
      var v = c.join(' ');
      if (v) setAttr(kids[i], 'data-xc', v); else kids[i].removeAttribute('data-xc');
    }
  }

  // ---- contact portrait: 3D tilt following the mouse
  // Framer shrinks this portrait to a third of its size on hover; the tilt replaces that, so it is applied to
  // the same container (image > div > container) and overrides Framer's inline transform.
  var tilt = { el: null, rect: null, raf: 0, x: -1, y: -1 };
  function setupTilt(on) {
    var img = on ? document.querySelector('img[alt="About Me"]') : null;
    var el = img && img.parentElement && img.parentElement.parentElement;
    var old = document.querySelectorAll('[data-x3d]');
    for (var i = 0; i < old.length; i++) if (old[i] !== el) {
      old[i].removeAttribute('data-x3d'); old[i].removeAttribute('data-hot');
      old[i].style.removeProperty('--rx'); old[i].style.removeProperty('--ry'); old[i].style.removeProperty('--s');
    }
    if (el) setAttr(el, 'data-x3d', '');
    tilt.el = el || null;
  }
  function tiltFrame() {
    tilt.raf = 0;
    var el = tilt.el;
    if (!el || !el.isConnected) return;
    var hot = el.hasAttribute('data-hot');
    if (!hot || !tilt.rect) tilt.rect = el.getBoundingClientRect();   // at rest the box is untransformed
    var r = tilt.rect;
    var inside = tilt.x >= r.left && tilt.x <= r.right && tilt.y >= r.top && tilt.y <= r.bottom;
    if (inside) {
      var px = (tilt.x - r.left) / r.width, py = (tilt.y - r.top) / r.height;
      el.style.setProperty('--ry', ((px - 0.5) * 18).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - py) * 18).toFixed(2) + 'deg');
      el.style.setProperty('--s', '1.04');
      setAttr(el, 'data-hot', '');
    } else {
      el.style.removeProperty('--ry'); el.style.removeProperty('--rx'); el.style.removeProperty('--s');
      el.removeAttribute('data-hot');
      tilt.rect = null;
    }
  }
  addEventListener('pointermove', function (e) {
    if (!tilt.el || e.pointerType === 'touch') return;
    tilt.x = e.clientX; tilt.y = e.clientY;
    if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltFrame);
  }, { passive: true });
  document.addEventListener('pointerleave', function () { tilt.x = tilt.y = -1; if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltFrame); });

  // ---- home reel: autoplay everywhere, no YouTube UI, own sound button inside the video
  var reel = { f: null, wrap: null, btn: null, muted: true, io: null, timers: [] };
  var ICON_OFF = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';
  var ICON_ON = '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  function yt(func, args) {
    var f = reel.f;
    if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
  }
  function reelPlay() { if (reel.muted) yt('mute'); yt('playVideo'); }
  function paintReelBtn() {
    if (!reel.btn) return;
    reel.btn.innerHTML = reel.muted ? ICON_OFF : ICON_ON;
    reel.btn.setAttribute('aria-label', reel.muted ? 'Turn sound on' : 'Turn sound off');
  }
  function setupReel(on) {
    var f = on ? document.querySelector('iframe[src*="youtube.com/embed/NrxFBp4bl2Q"]') : null;
    if (!f || !f.parentElement || !f.parentElement.parentElement) {
      if (reel.f || reel.btn) teardownReel();
      return;
    }
    if (reel.f === f && reel.btn && reel.btn.isConnected) return;
    teardownReel();
    reel.f = f; reel.wrap = f.parentElement.parentElement; reel.muted = true;
    setAttr(f, 'data-xv', '');
    reel.btn = document.createElement('button');
    reel.btn.type = 'button';
    reel.btn.className = 'x-reel-ctl';
    reel.btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      reel.muted = !reel.muted;
      if (reel.muted) yt('mute'); else { yt('unMute'); yt('setVolume', [100]); }
      yt('playVideo');
      paintReelBtn();
    });
    paintReelBtn();
    reel.wrap.appendChild(reel.btn);
    // start playback as soon as the player listens, and keep nudging it: some phones block the first attempt
    [600, 1500, 3000, 6000].forEach(function (ms) { reel.timers.push(setTimeout(reelPlay, ms)); });
    f.addEventListener('load', function () { setTimeout(reelPlay, 400); });
    reel.io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) reelPlay(); else yt('pauseVideo'); });
    }, { threshold: 0.25 });
    reel.io.observe(reel.wrap);
    var kick = function () { reelPlay(); };
    ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (t) { addEventListener(t, kick, { once: true, passive: true }); });
  }
  function teardownReel() {
    reel.timers.forEach(clearTimeout); reel.timers = [];
    if (reel.io) { reel.io.disconnect(); reel.io = null; }
    if (reel.btn && reel.btn.parentNode) reel.btn.parentNode.removeChild(reel.btn);
    if (reel.f) reel.f.removeAttribute('data-xv');
    reel.f = reel.wrap = reel.btn = null;
  }

  // ---- the "Coming soon" project is gone: no card on the home page, footer links skip it, its URL goes home
  function dropComingSoon(p) {
    if (p === 'coming-soon') { location.replace('/'); return; }
    var i, a, links = document.querySelectorAll('a[href$="coming-soon"]');
    for (i = 0; i < links.length; i++) {
      a = links[i];
      if (p === 'home') {
        // hide the whole card: climb to the element that sits among the other cards
        var c = a;
        while (c.parentElement && c.parentElement.children.length < 4 && c.parentElement !== document.body) c = c.parentElement;
        setAttr(c, 'data-xs', '');
      } else if (a.closest('section')) {
        // project footer: "↳ Coming soon" (next) and "Coming soon ↵" (previous)
        var next = /^\s*↳/.test(a.textContent), slug = next ? 'china' : 'lexus-singapore';
        setAttr(a, 'href', './' + slug);
        var label = next ? '↳ ' + TITLES[slug] : TITLES[slug] + ' ↵';
        if (a.textContent !== label) a.textContent = label;
      }
    }
    if (p !== 'home') unset('[data-xs]', 'data-xs');
  }

  function apply() {
    var p = pageKey();
    setAttr(document.documentElement, 'data-xp', p);

    var m = mainEl();
    var g = m && galleryEl(m);
    var proj = !!m && NOT_PROJECTS.indexOf(p) === -1 && m.children.length >= 2;
    var isGallery = proj && !!(g && g.children.length >= 3 && g.querySelector('img'));

    if (proj) {
      setAttr(m, 'data-xm', '');
      setAttr(m.parentElement, 'data-xr', '');
      if (g) setAttr(g, 'data-xg', '');
    } else {
      unset('[data-xm]', 'data-xm'); unset('[data-xr]', 'data-xr'); unset('[data-xg]', 'data-xg');
    }

    if (isGallery) {
      ensureToggle(m);
      if (p === 'lexus-singapore') ensureExtras(g, true);
      else removeAll('[data-x]');
      if (mode === 'grid') applyGrid(m, g);
      else {
        m.removeAttribute('data-gal');
        for (var j = 0; j < m.children.length; j++) if (m.children[j] !== g) m.children[j].style.minHeight = '';
      }
    } else {
      removeAll('.x-toggle'); removeAll('[data-x]');
      unset('[data-gal]', 'data-gal');
    }

    if (isGallery) tagCorners(g); else unset('[data-xc]', 'data-xc');
    watchColumn(isGallery ? g : null);
    dropComingSoon(p);
    setupTilt(p === 'contact');
    setupReel(p === 'home');

    if (p === 'schweppes' && m) ensureYoutube(m);
    else { removeAll('.x-yt'); unset('[data-xh]', 'data-xh'); }
  }

  var timer = 0;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = 0; try { apply(); } catch (e) {} }, 120);
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] });
  // sizes change without any DOM change (window resize, zoom, breakpoint switch): watch the column itself
  var sizeWatch = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  var watched = null;
  function watchColumn(g) {
    if (!sizeWatch || watched === g) return;
    sizeWatch.disconnect();
    watched = g;
    if (g) {
      sizeWatch.observe(g);
      for (var i = 0; i < g.children.length && i < 3; i++) if (!g.children[i].hasAttribute('data-x')) { sizeWatch.observe(g.children[i]); break; }
    }
  }
  addEventListener('resize', schedule);
  addEventListener('popstate', schedule);
  schedule();
})();
