// Site-specific additions on top of the mirrored Framer pages. Loaded on every page (see add-root-shim.py).
//  - about: the hair video fades into the page background at the top and bottom edges
//  - lexus-singapore: Instagram reel appended to the image column
//  - schweppes: YouTube video below the text, with a sound button
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
    // menu and project captions in the typeface, colour and hover animation of paul-michel.framer.website
    '@font-face{font-family:"IBM Plex Mono";font-weight:500;font-style:normal;font-display:swap;src:url(/fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2) format("woff2")}',
    '[data-xnc]{z-index:10!important}',
    '[data-xn]{color:#fff!important}',
    '[data-xn],[data-xcap]{font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;font-size:14px!important;font-weight:500!important;letter-spacing:.025em!important;text-transform:uppercase!important;line-height:1.6em!important;text-decoration:none!important}',
    '[data-xcap]{color:#888!important}',
    '.x-roll{position:relative;display:inline-grid;overflow:hidden;white-space:pre;vertical-align:top}',
    '.x-roll>span{grid-area:1/1;display:inline-flex}',
    '.x-roll i{font-style:normal;display:inline-block;transition:transform .55s cubic-bezier(.3,1.35,.5,1);transition-delay:calc(var(--i) * 40ms)}',
    '.x-roll .x-b i{transform:translateY(112%)}',
    '[data-xn]:hover .x-roll .x-a i,[data-xn]:focus-visible .x-roll .x-a i{transform:translateY(-112%)}',
    '[data-xn]:hover .x-roll .x-b i,[data-xn]:focus-visible .x-roll .x-b i{transform:translateY(0)}',
    // project pages: Framer fixes the page, main and image column to ~5,000px, but the images are taller, so the
    // footer ended up in the middle of the images and the background gradient stopped. Let them grow with the content.
    'main[data-xm]{height:auto!important;min-height:0!important}',
    '[data-xr]{height:auto!important;min-height:100vh!important}',
    '[data-xg]{height:auto!important}',
    // view toggle
    // the view toggle is the first row of the image column (not floating), so it can never cover the text or the images
    '.x-toggle{display:flex;justify-content:flex-end;align-items:center;align-self:center;gap:4px;width:100%;height:32px;padding:0;box-sizing:border-box;flex:none}',
    '.x-toggle button{width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:none;color:#1b1b1b;opacity:.35;cursor:pointer;transition:opacity .2s}',
    '.x-toggle button[aria-pressed="true"]{opacity:1}',
    '.x-toggle button:hover{opacity:.75}',
    '.x-toggle svg{width:16px;height:16px;fill:currentColor}',
    'main[data-gal="grid"]{flex-direction:column!important;height:auto!important;min-height:0!important}',
    'main[data-gal="grid"]>:not([data-xg]){flex:none!important;width:605px!important;max-width:100%!important;height:auto!important;position:relative!important;top:auto!important}',
    // grid view on wide screens: title/role/year on the left, description beside it instead of one tall narrow column
    '@media(min-width:811px){main[data-gal="grid"]>:not([data-xg]){width:100%!important;max-width:none!important;padding-right:96px!important;box-sizing:border-box!important}',
    'main[data-gal="grid"]>:not([data-xg])>*{width:100%!important;max-width:none!important;height:auto!important;flex-direction:row!important;align-items:flex-start!important;justify-content:flex-start!important;gap:80px!important}',
    'main[data-gal="grid"]>:not([data-xg])>*>:first-child{flex:none!important;width:320px!important}',
    'main[data-gal="grid"]>:not([data-xg])>*>:last-child{flex:1 1 0!important;width:auto!important;max-width:900px!important}}',
    'main[data-gal="grid"]>[data-xg]{flex:none!important}',
    // grid view is a masonry: every item goes under the shortest column, so there are no empty gaps
    'main[data-gal="grid"] [data-xg]{display:block!important;align-content:flex-start!important;justify-content:flex-start!important;position:relative!important;width:100%!important;height:var(--ch,auto)!important;min-height:0!important;padding:0!important;box-sizing:border-box}',
    'main[data-gal="grid"] [data-xg]>.x-toggle{position:relative!important;left:auto!important;top:auto!important;width:100%!important;height:32px!important;padding:6px var(--pad,20px) 0!important;box-sizing:border-box!important}',
    'main[data-gal="grid"] [data-xg]>:not(.x-toggle){position:absolute!important;left:var(--mx,0);top:var(--my,0);width:var(--mw,100%)!important;height:var(--gh,auto)!important;max-width:none!important;margin:0!important}',
    // project footer (prev/next row and © / contact row): Switzer, the typeface of nolan-barret.framer.website, small and quiet
    'main[data-xm]~section,main[data-xm]~section *,main[data-xm]~*:not(.x-yt) footer,main[data-xm]~*:not(.x-yt) footer *{font-family:"Switzer","Switzer Placeholder",sans-serif!important;font-weight:500!important;font-size:12.5px!important;letter-spacing:-.01em!important;line-height:1.35!important}',
    'main[data-xm]~section a,main[data-xm]~section p,main[data-xm]~section span,main[data-xm]~*:not(.x-yt) footer a,main[data-xm]~*:not(.x-yt) footer p,main[data-xm]~*:not(.x-yt) footer span{color:rgba(20,20,20,.55)!important;transition:color .2s}',
    'main[data-xm]~section a:hover,main[data-xm]~section a:hover *,main[data-xm]~*:not(.x-yt) footer a:hover,main[data-xm]~*:not(.x-yt) footer a:hover *{color:#141414!important}',
    // home: the project list is a masonry like the project galleries (each card goes under the shortest column)
    'main[data-xhome]{display:block!important;position:relative!important;height:var(--hh)!important;min-height:0!important}',
    'main[data-xhome] [data-xhi]{position:absolute!important;left:var(--mx);top:var(--my);width:var(--mw)!important;margin:0!important}',
    'main[data-xhome] [data-xhi][data-xs]{display:none!important}',
    'main[data-xhome] [data-xhi]{overflow:hidden}',
    // Framer's own hover effect on the cards (a zoom of the card or its picture) would pile up on ours and push the card past its column
    'main[data-xhome] [data-xhi] a,main[data-xhome] [data-xhi] a>div,main[data-xhome] [data-xhi] a>div>div,main[data-xhome] [data-xhi] img{transform:none!important;scale:none!important;transition:none!important}',
    // hover: see placeHome (the layout is animated from script)
    // lexus extras: instagram video (cropped to the media only) and the RZ image
    '.x-insta,.x-img{position:relative;flex:none;overflow:hidden}',
    '.x-insta iframe{position:absolute;left:0;top:-' + IG_HEAD + 'px;width:100%;height:calc(100% + ' + (IG_HEAD + IG_FOOT) + 'px);border:0}',
    '.x-img img{display:block;width:100%;height:100%;object-fit:cover}',
    // contact portrait: 3D tilt on hover
    '[data-x3d]{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s,1))!important;transition:transform .2s ease-out,box-shadow .3s;will-change:transform;box-shadow:0 0 0 rgba(20,60,100,0)}',
    '[data-x3d][data-hot]{box-shadow:0 28px 55px rgba(20,60,100,.32);transition:transform .08s linear,box-shadow .3s}',
    // home reel: our own sound button
    '.x-reel-ctl{position:absolute;right:16px;bottom:16px;z-index:5;width:44px;height:44px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.45);color:#fff;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:auto;transition:background .2s}',
    '.x-reel-ctl:hover{background:rgba(0,0,0,.65)}',
    '.x-reel-ctl svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    // schweppes: text on top like the other projects, the video below it (16:9, full width) with some air and its own sound button
    '[data-xr]{isolation:isolate}',
    // its height is set by apply() so that it ends at the bottom edge of the screen (at least 16:9); the video covers its box
    '.x-yt{position:relative;width:calc(100% - 40px);margin:40px 20px 20px;aspect-ratio:16/9;overflow:hidden;background:#000;container-type:size}',
    '.x-yt iframe{position:absolute;top:50%;left:50%;width:max(100cqw,177.78cqh);height:max(100cqh,56.25cqw);transform:translate(-50%,-50%);border:0}',
    // face of the menu: turns around on hover
    '[data-xfc]{z-index:11!important}',
    // the link itself stays still (a turning link is edge-on half-way, the pointer leaves it and the click is lost): only its picture turns
    '[data-xf]>div{transition:transform .9s cubic-bezier(.3,1.2,.4,1);transform-origin:center}',
    '[data-xf]:hover>div{transform:perspective(500px) rotateY(360deg)}',
    '[data-xs]{display:none!important}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var mode = 'single';
  try { if (localStorage.getItem('gallery-view') === 'grid') mode = 'grid'; } catch (e) {}

  function pageKey() { return location.pathname.replace(/\/+$/, '').replace(/^\//, '') || 'home'; }
  function mainEl() { return document.querySelector('main'); }
  // the images/videos of the column (without the view toggle)
  function items(g) {
    var out = [];
    for (var i = 0; i < g.children.length; i++) if (!g.children[i].classList.contains('x-toggle')) out.push(g.children[i]);
    return out;
  }
  function galleryEl(m) {
    return m.lastElementChild;
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

  function ensureToggle(m, g) {
    var t = g.querySelector(':scope > .x-toggle');
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
    }
    if (g.firstChild !== t) g.insertBefore(t, g.firstChild);
    var bs = t.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) setAttr(bs[i], 'aria-pressed', String(bs[i].getAttribute('data-m') === mode));
    // as wide as the images in single view (so it sits above their right edge), full width in the grid
    var ref = null, k = items(g);
    for (i = 0; i < k.length; i++) if (!k[i].hasAttribute('data-x')) { ref = k[i]; break; }
    if (mode === 'single' && ref && ref.offsetWidth) t.style.width = ref.offsetWidth + 'px'; else t.style.width = '';
  }

  // where the first image goes: right after the view toggle
  function firstItemSlot(g) {
    var t = g.querySelector(':scope > .x-toggle');
    return t ? t.nextSibling : g.firstChild;
  }

  // items added to the image column; data-r is height/width
  function extraItems(g) { return g.querySelectorAll(':scope > [data-x]'); }

  function sizeExtras(g) {
    var ref = null, i;
    var kk = items(g);
    for (i = 0; i < kk.length; i++) if (!kk[i].hasAttribute('data-x')) { ref = kk[i]; break; }
    var w = ref ? ref.offsetWidth : 0, extra = extraItems(g);
    for (i = 0; i < extra.length; i++) {
      var el = extra[i], r = parseFloat(el.getAttribute('data-r')) || 1;
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
      g.insertBefore(ig, firstItemSlot(g));   // first in the gallery
    } else if (firstItemSlot(g) !== ig) {
      g.insertBefore(ig, firstItemSlot(g));
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

  function knownRatio(c) {
    if (c.hasAttribute('data-x')) return 0;
    var im = c.querySelector('img'), v = c.querySelector('video');
    if (im) {
      var mm = /[?&]width=(\d+)&height=(\d+)/.exec(im.getAttribute('src') || '');
      if (mm && +mm[1] && +mm[2]) return +mm[2] / +mm[1];
      if (im.complete && im.naturalWidth) return im.naturalHeight / im.naturalWidth;
    }
    if (v && v.videoWidth) return v.videoHeight / v.videoWidth;
    return 0;
  }

  function applyGrid(m, g) {
    var kids = items(g), i, c;
    // remember each item's height/width ratio from the single-column layout
    // images carry their pixel size in the URL (width=..&height=..): exact even before they load
    var missing = false;
    for (i = 0; i < kids.length; i++) {
      var kr = knownRatio(kids[i]);
      if (kr) kids[i].setAttribute('data-r', String(kr));
      else if (!kids[i].getAttribute('data-r')) missing = true;
    }
    if (missing) {
      var was = m.getAttribute('data-gal');
      m.removeAttribute('data-gal');
      for (i = 0; i < kids.length; i++) {
        c = kids[i];
        if (!c.getAttribute('data-r') && c.offsetWidth && c.offsetHeight > 20) c.setAttribute('data-r', String(c.offsetHeight / c.offsetWidth));
      }
      if (was) m.setAttribute('data-gal', was);
    }
    setAttr(m, 'data-gal', 'grid');
    // the text column's content can be taller than its own box; keep the grid below it
    for (i = 0; i < m.children.length; i++) {
      var t = m.children[i];
      if (t === g) continue;
      t.style.minHeight = '';
      if (t.scrollHeight > t.clientHeight) t.style.minHeight = t.scrollHeight + 'px';
    }
    var narrow = innerWidth <= 810, cols = narrow ? 2 : 3, gap = 12, pad = narrow ? 12 : 20, top = 40;
    g.style.setProperty('--pad', pad + 'px');
    var W = g.clientWidth - 2 * pad, colW = Math.floor((W - gap * (cols - 1)) / cols), heights = [], k;
    for (k = 0; k < cols; k++) heights.push(0);
    for (i = 0; i < kids.length; i++) {
      c = kids[i];
      var r = parseFloat(c.getAttribute('data-r')) || 1, h = Math.round(colW * r), col = 0;
      for (k = 1; k < cols; k++) if (heights[k] < heights[col]) col = k;
      c.style.setProperty('--mx', (pad + col * (colW + gap)) + 'px');
      c.style.setProperty('--my', (top + heights[col]) + 'px');
      c.style.setProperty('--mw', colW + 'px');
      c.style.setProperty('--gh', h + 'px');
      heights[col] += h + gap;
    }
    g.style.setProperty('--ch', (top + pad + Math.max.apply(null, heights) - gap) + 'px');
  }

  // ---- home: masonry of the project cards, with the columns and gaps Framer's grid had at this breakpoint
  function applyHome(on) {
    var mains = document.querySelectorAll('main'), i, j;
    for (i = 0; i < mains.length; i++) {
      var m = mains[i];
      if (!on || !m.querySelector('a[href^="./"] img')) { m.removeAttribute('data-xhome'); continue; }
      if (m.__xl && m.__hv >= 0) continue;   // hovering: keep the layout still
      // read the grid as Framer lays it out (hidden breakpoint variants have no grid and are skipped); only when the
      // window width changed, because taking the layout off for a moment can throw the page's scroll position to the top
      if (!m.__xg || m.__xg.w !== innerWidth) {
        var sy = scrollY;
        m.removeAttribute('data-xhome');
        var cs = getComputedStyle(m);
        var tr = cs.display === 'grid' ? cs.gridTemplateColumns.split(' ').map(parseFloat).filter(function (n) { return n > 0; }) : [];
        m.__xg = tr.length && m.offsetWidth ? { w: innerWidth, cols: tr.length, padL: parseFloat(cs.paddingLeft) || 0, padR: parseFloat(cs.paddingRight) || 0, padT: parseFloat(cs.paddingTop) || 0, padB: parseFloat(cs.paddingBottom) || 0, sy: sy } : null;
        if (!m.__xg) continue;
      }
      var G = m.__xg, tracks = [];
      // same rhythm as the project galleries: 12px between columns, 18px between rows (room for the captions), the page's own side padding
      var cols = G.cols, gap = 12, rowGap = 18, padL = G.padL, padR = G.padR, padT = G.padT, padB = G.padB;
      var colW = Math.floor((Math.min(m.clientWidth, innerWidth) - padL - padR - gap * (cols - 1)) / cols);
      var kids = [], heights = [];
      // the cards may sit inside wrappers that have no box of their own (display: contents)
      var collect = function (el) {
        for (var q = 0; q < el.children.length; q++) {
          var c = el.children[q], d = getComputedStyle(c).display;
          if (d === 'contents' || (d !== 'none' && c.querySelectorAll('a[href^="./"]').length >= 3)) collect(c); else if (d !== 'none') kids.push(c);
        }
      };
      collect(m);
      for (j = 0; j < kids.length; j++) {
        kids[j].setAttribute('data-xhi', '');
        kids[j].style.setProperty('--mw', colW + 'px');
      }
      setAttr(m, 'data-xhome', '');
      // a card is its picture plus the caption row under it; the box has spare room below the caption, which is cut off
      for (j = 0; j < kids.length; j++) {
        var cap = kids[j].querySelector('[data-xcap]'), hh = kids[j].offsetHeight;
        if (cap) hh = Math.min(hh, Math.round(cap.getBoundingClientRect().bottom - kids[j].getBoundingClientRect().top));
        heights.push(hh);
      }
      // model: each card's column (fixed, so nothing jumps between columns on hover), picture ratio and caption height
      for (j = 0; j < cols; j++) tracks[j] = 0;
      var L = { kids: kids, col: [], r: [], capH: [], cols: cols, gap: gap, rowGap: rowGap, padL: padL, padT: padT, padB: padB, avail: Math.min(m.clientWidth, innerWidth) - padL - padR - gap * (cols - 1) };
      for (j = 0; j < kids.length; j++) {
        var col = 0, k, link = kids[j].querySelector('a'), pic = link && link.firstElementChild;
        for (k = 1; k < cols; k++) if (tracks[k] < tracks[col]) col = k;
        var ph = Math.min(heights[j], Math.round(pic ? pic.getBoundingClientRect().height : heights[j]));
        L.col.push(col); L.r.push(ph / colW); L.capH.push(heights[j] - ph);
        tracks[col] += heights[j] + rowGap;
      }
      m.__xl = L;
      if (G.sy != null) { if (Math.abs(scrollY - G.sy) > 1) scrollTo(0, G.sy); G.sy = null; }
      placeHome(m, m.__hv == null ? -1 : m.__hv, true);
    }
  }

  // positions for the current hover: hv is the hovered column (-1: none). The column weights are animated here, one
  // frame at a time for every card, so the cards can never be caught out of step with each other (overlapping).
  function layoutHome(m, wts) {
    var L = m.__xl, cols = L.cols, sum = 0, c, j;
    for (c = 0; c < cols; c++) sum += wts[c];
    var widths = [], xs = [], x = L.padL, tracks = [];
    for (c = 0; c < cols; c++) { widths.push(L.avail * wts[c] / sum); xs.push(x); x += widths[c] + L.gap; tracks.push(0); }
    for (j = 0; j < L.kids.length; j++) {
      c = L.col[j];
      var k = L.kids[j];
      k.style.setProperty('--mx', xs[c].toFixed(1) + 'px');
      k.style.setProperty('--my', (L.padT + tracks[c]).toFixed(1) + 'px');
      k.style.setProperty('--mw', widths[c].toFixed(1) + 'px');
      tracks[c] += L.r[j] * widths[c] + L.capH[j] + L.rowGap;
    }
    m.style.setProperty('--hh', (L.padT + Math.max.apply(null, tracks) - L.rowGap + L.padB).toFixed(1) + 'px');
  }
  function placeHome(m, hv, instant) {
    var L = m.__xl;
    if (!L) return;
    var cols = L.cols, target = [], c;
    for (c = 0; c < cols; c++) target.push(cols > 1 && c === hv ? 1.28 : 1);
    var tsum = 0, tx = L.padL; L.geo = { xs: [], ws: [] };
    for (c = 0; c < cols; c++) tsum += target[c];
    for (c = 0; c < cols; c++) { var tw = L.avail * target[c] / tsum; L.geo.xs.push(tx); L.geo.ws.push(tw); tx += tw + L.gap; }
    if (m.__raf) { cancelAnimationFrame(m.__raf); m.__raf = 0; }
    if (!L.cw || L.cw.length !== cols) { L.cw = target.slice(); instant = true; }
    if (instant || matchMedia('(prefers-reduced-motion:reduce)').matches) { L.cw = target.slice(); layoutHome(m, L.cw); return; }
    var from = L.cw.slice(), t0 = performance.now(), dur = 650;
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      for (var q = 0; q < cols; q++) L.cw[q] = from[q] + (target[q] - from[q]) * e;
      layoutHome(m, L.cw);
      m.__raf = p < 1 ? requestAnimationFrame(step) : 0;
    };
    m.__raf = requestAnimationFrame(step);
  }
  function ensureYoutube(m) {
    var sec = document.querySelector('.x-yt');
    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'x-yt';
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + YOUTUBE + '?autoplay=1&mute=1&loop=1&playlist=' + YOUTUBE + '&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
      f.title = 'Schweppes';
      f.allowFullscreen = true;
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      sec.appendChild(f);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'x-reel-ctl';
      var muted = true;
      var paint = function () {
        b.innerHTML = muted ? ICON_OFF : ICON_ON;
        b.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
      };
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        muted = !muted;
        if (muted) yt('mute', [], f); else { yt('unMute', [], f); yt('setVolume', [100], f); }
        yt('playVideo', [], f);
        paint();
      });
      paint();
      sec.appendChild(b);
      m.parentNode.insertBefore(sec, m.nextSibling);
    }
    setAttr(m, 'data-xy', '');
    // Framer lays the page blocks out with CSS `order` (it changes per breakpoint): same order as the text block and right after it in the DOM, so it lands just below the text
    var ord = String(parseInt(getComputedStyle(m).order, 10) || 0);
    if (sec.style.order !== ord) sec.style.order = ord;
    // reach the bottom of the screen: all the room left under the text, but never flatter than 16:9
    sec.style.height = '';
    var minH = Math.round(sec.offsetWidth * 9 / 16);
    var room = Math.round(innerHeight - (sec.getBoundingClientRect().top + scrollY) - 20);
    sec.style.aspectRatio = 'auto';
    sec.style.height = Math.max(minH, room) + 'px';
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
  function yt(func, args, frame) {
    var f = frame || reel.f;
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
    reel.f = reel.wrap = reel.btn = null;
  }

  // ---- menu: letters roll up on hover (copy of the "rolling text" of paul-michel.framer.website)
  function rollify(a) {
    if (a.querySelector('.x-roll')) return;
    var text = a.textContent.trim();
    if (!text) return;
    if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', text);
    var row = function (cls) {
      var s = document.createElement('span');
      s.className = cls;
      s.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(text, function (ch, i) {
        var l = document.createElement('i');
        l.textContent = ch;
        l.style.setProperty('--i', i);
        s.appendChild(l);
      });
      return s;
    };
    var w = document.createElement('span');
    w.className = 'x-roll';
    w.appendChild(row('x-a'));
    w.appendChild(row('x-b'));
    a.textContent = '';
    a.appendChild(w);
  }
  function styleMenu() {
    var links = document.querySelectorAll('a[href="./about"],a[href="./contact"]'), i, e;
    for (i = 0; i < links.length; i++) {
      // the header menu is the sticky one; the same links also exist in the page footer
      for (e = links[i].parentElement; e && e !== document.body; e = e.parentElement) {
        var cs = getComputedStyle(e);
        if (cs.position === 'sticky' || cs.position === 'fixed') {
          setAttr(links[i], 'data-xn', '');
          if (cs.mixBlendMode !== 'normal') setAttr(e, 'data-xnc', '');
          rollify(links[i]);
          break;
        }
      }
    }
  }
  // ---- home: project captions under the thumbnails
  function styleCaptions(on) {
    var old = document.querySelectorAll('[data-xcap]'), i;
    if (!on) { for (i = 0; i < old.length; i++) old[i].removeAttribute('data-xcap'); return; }
    var cards = document.querySelectorAll('a[href^="./"]');
    for (i = 0; i < cards.length; i++) {
      if (!cards[i].querySelector('img')) continue;
      var p = cards[i].querySelector(':scope > div:last-child p');
      if (p) setAttr(p, 'data-xcap', '');
    }
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
        setAttr(a, 'data-xl', '');
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
    var isGallery = proj && !!(g && items(g).length >= 3 && g.querySelector('img'));

    if (proj) {
      setAttr(m, 'data-xm', '');
      setAttr(m.parentElement, 'data-xr', '');
      if (g) setAttr(g, 'data-xg', '');
    } else {
      unset('[data-xm]', 'data-xm'); unset('[data-xr]', 'data-xr'); unset('[data-xg]', 'data-xg');
    }

    if (isGallery) {
      ensureToggle(m, g);
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

    watchColumn(isGallery ? g : null);
    dropComingSoon(p);
    styleMenu();
    styleCaptions(p === 'home');
    applyHome(p === 'home');
    setupTilt(p === 'contact');
    setupReel(p === 'home');

    var faces = document.querySelectorAll('a[href="./#hero"],a[href="/#hero"],a[href="./"]');
    for (var q = 0; q < faces.length; q++) {
      if (!faces[q].querySelector('img') || faces[q].closest('main')) continue;
      setAttr(faces[q], 'data-xf', '');
      // the header (z-index 10) spans the whole width and sat on top of the face, swallowing its clicks
      for (var fe = faces[q].parentElement; fe && fe !== document.body; fe = fe.parentElement) {
        if (getComputedStyle(fe).position === 'fixed') { setAttr(fe, 'data-xfc', ''); break; }
      }
    }

    if (p === 'schweppes' && m) ensureYoutube(m);
    else { removeAll('.x-yt'); unset('[data-xh]', 'data-xh'); unset('[data-xy]', 'data-xy'); }
  }

  // the face in the menu: on project pages Framer only scrolls to #hero, so go to the home page ourselves
  addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="#hero"],a[data-xf]');
    if (!a || !a.querySelector('img') || a.closest('main') || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (pageKey() === 'home') return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.href = '/';
  }, true);

  // links rewritten by dropComingSoon: Framer's router would still go to its own (original) target
  addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-xl]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.href = a.href;
  }, true);

  var timer = 0;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = 0; try { apply(); } catch (e) {} }, 120);
  }

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href', 'class', 'data-gal', 'data-xg', 'data-xm'] });
  // images and videos finishing their load change the ratios the grid needs
  document.addEventListener('load', function (e) { var t = e.target; if (t && (t.tagName === 'IMG' || t.tagName === 'VIDEO') && (mode === 'grid' || pageKey() === 'home')) schedule(); }, true);
  document.addEventListener('loadedmetadata', function (e) { if (mode === 'grid') schedule(); }, true);
  addEventListener('load', function () { schedule(); });
  [400, 1000, 2000, 4000].forEach(function (ms) { setTimeout(schedule, ms); });
  // sizes change without any DOM change (window resize, zoom, breakpoint switch): watch the column itself
  var sizeWatch = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  var watched = null;
  function watchColumn(g) {
    if (!sizeWatch || watched === g) return;
    sizeWatch.disconnect();
    watched = g;
    if (g) {
      sizeWatch.observe(g);
      var k = items(g);
      for (var i = 0; i < k.length && i < 3; i++) if (!k[i].hasAttribute('data-x')) { sizeWatch.observe(k[i]); break; }
    }
  }
  addEventListener('resize', schedule);
  addEventListener('popstate', schedule);
  schedule();
})();
