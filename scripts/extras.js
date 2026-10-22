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
    // the whole menu (links, dial) is negative/positive: white type with the header's difference blend, so it inverts against whatever is under it as you
    // scroll (almost black on the light blue, light over dark pictures); at night the type is the page's light blue for a softer grey-blue on the dark blue
    // ...except through dusk and dawn: over the mid blues a difference blend of white turns into a tan/brown that hardly shows, so there the menu
    // is plain type (dark, then light) in the page's own text colour
    'html[data-xdusk] [data-xnc]{mix-blend-mode:normal!important}',
    'html[data-xdusk] [data-xn]{color:var(--xfg)!important}',
    'html[data-xdusk] .x-dial{color:var(--xfg);mix-blend-mode:normal}',
    '[data-xn]{color:#fff!important}',
    'html[data-xnight] [data-xn]{color:rgb(203,237,255)!important}',
    'html[data-xnight] .x-dial{color:rgb(203,237,255)}',
    // the face is never blended once the page leaves the light blue (its inversion only makes it natural against that)
    'html[data-xmid] [data-xfi]{filter:none!important;mix-blend-mode:normal!important}',
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
    // light / dark theme (see "theme" below): --xt is how dark the page is (0..1), --xtt the same for the text, which switches over later, where the dusk background is dark enough for light type
    ':root{--xt:0;--xtt:0;--xtd:0;--xfg:color-mix(in srgb,#1b1b1b calc((1 - var(--xtt)) * 100%),#c2cfe0 calc(var(--xtt) * 100%));--xfg55:color-mix(in srgb,rgba(20,20,20,.55) calc((1 - var(--xtt)) * 100%),rgba(194,207,224,.7) calc(var(--xtt) * 100%))}',
    '[data-xbgm]{background-image:var(--xbgimg)!important}',
    // dark: the menu's difference blend would tint the white type beige over the blue, so it is a plain light grey-blue instead
    // the menu's face is inverted to go with that blend; without the blend it stays as it is
    'html[data-xmid] [data-xfi]{filter:none!important}',
    // the MARTAMON wordmark of the home hero (white): in the dark it becomes the same grey-blue as the type (white -> #b4c2d5)
    'img[src*="X22mGNitGaY93ZEObiQgYak"]{filter:brightness(calc(1 - .38 * var(--xtt))) sepia(var(--xtt)) hue-rotate(calc(175deg * var(--xtt))) saturate(calc(1 - .5 * var(--xtt)))}',
    // the hair/face video of About has a light-blue backdrop of its own: at night a soft frame in the page colour (that of the
    // page at the video's edges, so it follows the theme) covers the backdrop around the head, and the head itself stays untouched
    '.x-vfade{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;opacity:var(--xt);background:color-mix(in srgb,rgb(181,197,217) calc((1 - var(--xt)) * 100%),rgb(41,60,89) calc(var(--xt) * 100%));-webkit-mask-image:radial-gradient(ellipse 40% 70% at 50% 47%,transparent 0,transparent 50%,#000 100%);mask-image:radial-gradient(ellipse 40% 70% at 50% 47%,transparent 0,transparent 50%,#000 100%)}',
    // text that sits on that video is blended with it (exclusion): in the dark it is plain light type instead, or it would vanish
    'html[data-xdark] [data-xbl]{mix-blend-mode:normal!important}',
    'html[data-xdark][data-xp="about"] [data-xtc]{text-shadow:0 0 6px rgba(22,32,52,.8),0 0 18px rgba(22,32,52,.65)}',
    // contact portrait: its tilt shadow turns from blue to black
    '[data-x3d][data-hot]{box-shadow:0 28px 55px color-mix(in srgb,rgba(20,60,100,.32) calc((1 - var(--xtt)) * 100%),rgba(0,0,0,.55) calc(var(--xtt) * 100%))}',
    // type colour: original -> (greys only) a darker grey while the page darkens, so they stay readable on the mid blues -> light type
    '[data-xtc]{color:color-mix(in srgb,color-mix(in srgb,var(--xo) calc((1 - var(--xtd)) * 100%),var(--xd) calc(var(--xtd) * 100%)) calc((1 - var(--xtt)) * 100%),var(--xl) calc(var(--xtt) * 100%))!important}',
    // the dial, as in the original: "LOCAL TIME" over the hours and minutes (a blinking dot between them) and a round dial with a ring inside
    '.x-dial{position:fixed;top:12px;right:150px;z-index:12;display:flex;align-items:center;gap:22px;color:#fff;mix-blend-mode:difference;font:500 14px/1.25 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.025em;text-transform:uppercase;user-select:none;-webkit-user-select:none}',
    '.x-dial-txt{display:flex;flex-direction:column;white-space:nowrap}',
    '.x-dial-label{cursor:default}',
    '.x-dial.x-trav .x-dial-label{cursor:pointer}',
    '.x-dial-time b{font-weight:500}',
    '.x-dial-time i{font-style:normal;display:inline-block;width:2.2em;text-align:center;animation:x-blink 1s step-end infinite}',
    '@keyframes x-blink{50%{opacity:0}}',
    // the dial: a moon in phases. A thin circle filled according to the hour: full by day, waning through dusk to a thin sliver at night,
    // waxing again at dawn; drag it round to travel in time
    '.x-dial-ring{position:relative;width:52px;height:52px;box-sizing:border-box;border-radius:50%;cursor:grab;touch-action:none;flex:none}',
    '.x-dial-ring:active{cursor:grabbing}',
    '.x-dial-face{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}',
    '.x-dial-face .x-rim{fill:none;stroke:currentColor;stroke-width:1.5}',
    '.x-dial-face .x-lit{fill:currentColor}',
    '@media(max-width:480px){.x-dial{gap:14px;font-size:12px}.x-dial-ring{width:44px;height:44px}}',
    // view toggle
    // the view toggle is the first row of the image column (not floating), so it can never cover the text or the images
    '.x-toggle{display:flex;justify-content:flex-end;align-items:center;align-self:center;gap:4px;width:100%;height:32px;padding:0;box-sizing:border-box;flex:none}',
    '.x-toggle button{width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:none;color:var(--xfg,#1b1b1b);opacity:.35;cursor:pointer;transition:opacity .2s}',
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
    'main[data-xm]~section a,main[data-xm]~section p,main[data-xm]~section span,main[data-xm]~*:not(.x-yt) footer a,main[data-xm]~*:not(.x-yt) footer p,main[data-xm]~*:not(.x-yt) footer span{color:var(--xfg55,rgba(20,20,20,.55))!important;transition:color .2s}',
    'main[data-xm]~section a:hover,main[data-xm]~section a:hover *,main[data-xm]~*:not(.x-yt) footer a:hover,main[data-xm]~*:not(.x-yt) footer a:hover *{color:var(--xfg,#141414)!important}',
    // home: the project list is a masonry like the project galleries (each card goes under the shortest column)
    'main[data-xhome]{display:block!important;position:relative!important;height:var(--hh)!important;min-height:0!important}',
    'main[data-xhome] [data-xhi]{position:absolute!important;left:var(--mx);top:var(--my);width:var(--mw)!important;margin:0!important}',
    'main[data-xhome] [data-xhi][data-xs]{display:none!important}',
    'main[data-xhome] [data-xhi]{overflow:hidden}',
    // Framer's own hover effect on the cards (a zoom of the card or its picture) would pile up on ours and push the card past its column
    // the cards can't be hovered at all (so neither Framer's script nor css can react to the pointer); clicks are routed by position, see below
    'main[data-xhome] [data-xhi],main[data-xhome] [data-xhi] *{pointer-events:none!important}',
    // no hover effect at all on the home cards: nothing inside them moves, zooms, rotates, fades or animates (the play button of the video thumbnails keeps its centring)
    'main[data-xhome] [data-xhi]:hover,main[data-xhome] [data-xhi]:hover *:not(button):not(button *){transform:none!important;scale:none!important;rotate:none!important;translate:none!important;filter:none!important}',
    'main[data-xhome] [data-xhi] a,main[data-xhome] [data-xhi] a *:not(button):not(button *){transform:none!important;scale:none!important;rotate:none!important;filter:none!important;transition:none!important;animation:none!important}',
    // hover: see placeHome (the layout is animated from script)
    // lexus extras: instagram video (cropped to the media only) and the RZ image
    '.x-insta,.x-img{position:relative;flex:none;overflow:hidden}',
    '.x-insta iframe{position:absolute;left:0;top:-' + IG_HEAD + 'px;width:100%;height:calc(100% + ' + (IG_HEAD + IG_FOOT) + 'px);border:0}',
    '.x-img img{display:block;width:100%;height:100%;object-fit:cover}',
    // contact portrait: 3D tilt on hover
    '[data-x3d]{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s,1))!important;transition:transform .2s ease-out,box-shadow .3s;will-change:transform;box-shadow:0 0 0 rgba(20,60,100,0)}',
    '[data-x3d][data-hot]{transition:transform .08s linear,box-shadow .3s}',
    // contact: a plain page (after a reference the owner sent): no pictures, just the current texts, small and spaced in the menu's
    // monospace, an arc of "GET IN TOUCH" and the swimming creature; Framer's own blocks are hidden
    'html[data-xp="contact"] main{height:auto!important;min-height:calc(100vh - 83px)!important;min-height:calc(100dvh - 83px)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0 20px!important;box-sizing:border-box!important}',
    'html[data-xp="contact"] main>:not(.x-contact){display:none!important}',
    // the page box Framer sized for the pictures: let it end with the footer
    'html[data-xp="contact"] [data-xcw]{height:auto!important;min-height:100vh!important;min-height:100dvh!important}',
    '.x-contact{position:relative;width:min(560px,100%);height:440px;color:var(--xfg);font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace;font-weight:500}',
    '.x-ct-arc{position:absolute;left:50%;top:6px;width:300px;height:120px;transform:translateX(-18%) rotate(14deg);overflow:visible}',
    '.x-ct-arc text{fill:currentColor;font-size:15px;letter-spacing:.32em;text-transform:uppercase}',
    '.x-ct-text{position:absolute;left:0;bottom:24px;font-size:12.5px;line-height:1.75;letter-spacing:.12em}',
    '.x-ct-text a{color:inherit!important;text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .35s ease}',
    '.x-ct-text a:hover,.x-ct-text a:focus-visible{background-size:100% 1px}',
    '.x-ct-social{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:18px;text-transform:uppercase}',
    '@media(max-width:600px){.x-contact{height:400px}.x-ct-arc{width:250px;transform:translateX(-30%) rotate(12deg)}.x-ct-text{font-size:12px}}',
    // the little creature that drifts by now and then (see setupDrifter); a drop shadow behind it
    '.x-drift{position:fixed;left:0;top:0;z-index:9;display:none;background:url(/extras/blob-sprite.webp) 0 0/1000% 100% no-repeat;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;will-change:transform}',
    // its shadow: a soft blurred oval behind and below it (a gradient, not a copy of its silhouette, so it can never look like a second one)
    '.x-drift::before{content:"";position:absolute;left:8%;right:-4%;top:62%;height:52%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,rgba(20,32,80,.32),rgba(20,32,80,.14) 55%,rgba(20,32,80,0));transform:translate(calc(6% + var(--sd,.5) * 12%),calc(10% + var(--sd,.5) * 22%));pointer-events:none}',
    '.x-drift.x-grab{cursor:grabbing}',
    // it follows the time of day like the type: as the page darkens it turns paler and lighter (towards the light grey-blue of the night type)
    '.x-drift{-webkit-filter:brightness(calc(1 + .22 * var(--xt))) saturate(calc(1 - .25 * var(--xt))) hue-rotate(calc(-8deg * var(--xt))) drop-shadow(0 0 calc(10px * var(--xglow,0)) rgba(185,215,255,calc(.95 * var(--xglow,0)))) drop-shadow(0 0 calc(26px * var(--xglow,0)) rgba(120,170,255,calc(.8 * var(--xglow,0))));filter:brightness(calc(1 + .22 * var(--xt))) saturate(calc(1 - .25 * var(--xt))) hue-rotate(calc(-8deg * var(--xt))) drop-shadow(0 0 calc(10px * var(--xglow,0)) rgba(185,215,255,calc(.95 * var(--xglow,0)))) drop-shadow(0 0 calc(26px * var(--xglow,0)) rgba(120,170,255,calc(.8 * var(--xglow,0))))}',
    // at night it glows: a soft halo around it that breathes
    '.x-drift::after{content:"";position:absolute;left:-60%;top:-60%;width:220%;height:220%;z-index:-2;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(150,190,255,.42),rgba(110,155,255,.18) 45%,rgba(120,165,255,0) 72%);opacity:var(--xglow,0);animation:x-glow 2.8s ease-in-out infinite}',
    '@keyframes x-glow{50%{transform:scale(1.18);filter:brightness(1.25)}}',
    // home on phones: Framer shows a picture carousel above the reel; only the reel stays
    '@media(max-width:809px){html[data-xp="home"] [data-framer-name="Hero"]>[data-xhg]{display:none!important}html[data-xp="home"] [data-framer-name="Hero"]{height:auto!important}}',
    '[data-xmr] [data-xmh]{display:none!important}',
    '[data-xmr] iframe.x-mreel{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}',
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
  // home cards: find the card under a point (their own boxes ignore the pointer) and follow its link
  function homeCardAt(x, y) {
    var m = document.querySelector('main[data-xhome]');
    if (!m) return null;
    var ks = m.querySelectorAll('[data-xhi]'), i;
    for (i = ks.length - 1; i >= 0; i--) {
      var a = ks[i].querySelector('a[href]');
      var pic = a && a.getBoundingClientRect(), cap = ks[i].querySelector('[data-xcap]');
      if (!pic) continue;
      var bottom = cap ? Math.max(pic.bottom, cap.getBoundingClientRect().bottom) : pic.bottom;
      if (x >= pic.left && x <= pic.right && y >= pic.top && y <= bottom) return a;
    }
    return null;
  }
  addEventListener('click', function (e) {
    if (!e.isTrusted || e.button || !e.target.closest) return;
    var m = e.target.closest('main[data-xhome]');
    if (!m || e.target.closest('[data-xhi]')) return;
    var a = homeCardAt(e.clientX, e.clientY);
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.metaKey || e.ctrlKey || e.shiftKey) window.open(a.href, '_blank'); else a.click();
  }, true);
  addEventListener('pointermove', function (e) {
    var m = pageKey() === 'home' && document.querySelector('main[data-xhome]');
    if (!m || e.pointerType === 'touch') return;
    var c = homeCardAt(e.clientX, e.clientY) ? 'pointer' : '';
    if (m.style.cursor !== c) m.style.cursor = c;
  }, { passive: true });

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
  // phones: hide the hero's picture carousel; Framer's phone reel component only makes its YouTube player on some devices, so if no
  // player shows up the same muted, looping, autoplaying embed as on desktop is put in its place (it then gets the sound button)
  function mobileHero() {
    var hero = document.querySelector('[data-framer-name="Hero"]');
    if (!hero) return;
    var vbox = hero.querySelector('[data-framer-name^="V\u00eddeo YouTube"]') || hero.querySelector('[data-framer-name*="YouTube"]');
    for (var i = 0; i < hero.children.length; i++) {
      var c = hero.children[i];
      if (c !== vbox && !c.contains(vbox) && !c.querySelector('iframe,video') && c.querySelector('img,section')) setAttr(c, 'data-xhg', '');
    }
    if (!vbox || innerWidth > 809) return;
    var player = vbox.querySelector('[aria-label="YouTube video player"]');
    if (!player || player.querySelector('iframe.x-mreel')) return;
    if (player.querySelector('iframe')) return;            // Framer made its own player: keep it
    if (!mobileHero.t0) mobileHero.t0 = performance.now();
    if (performance.now() - mobileHero.t0 < 1500) { setTimeout(schedule, 1600); return; }
    setAttr(player, 'data-xmr', '');
    for (i = 0; i < player.children.length; i++) setAttr(player.children[i], 'data-xmh', '');
    var host = vbox.querySelector('button[aria-label]');
    if (host) setAttr(host, 'data-xmh', '');
    var f = document.createElement('iframe');
    f.className = 'x-mreel';
    f.src = 'https://www.youtube.com/embed/NrxFBp4bl2Q?autoplay=1&mute=1&loop=1&playlist=NrxFBp4bl2Q&controls=0&disablekb=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin);
    f.title = 'Martamon reel'; f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture'); f.setAttribute('playsinline', '');
    var holder = document.createElement('div'); holder.style.cssText = 'position:absolute;inset:0';
    holder.appendChild(f);
    if (getComputedStyle(player).position === 'static') player.style.position = 'relative';
    player.appendChild(holder);
  }

  function setupReel(on) {
    var fs = on ? document.querySelectorAll('iframe[src*="youtube.com/embed/NrxFBp4bl2Q"]') : [], f = null;
    for (var fi = 0; fi < fs.length; fi++) if (fs[fi].getBoundingClientRect().width > 0) { f = fs[fi]; break; }
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

  // ---- the little blue creature (the blob of extras/blob-model.js, pre-rendered to extras/blob-sprite.webp: 10 frames, eyes looking
  // up-left ... down-right and a blink). On the Contact page only, it swims about the page like a jellyfish: it pulses (squeezes,
  // shoots on a little towards where it is heading, then glides and sinks), wanders between spots, drifts towards and away from the
  // viewer (bigger, with its shadow further off), its eyes follow the pointer, a click sends it over, and it can be caught and carried.
  // Plain DOM, so any browser.
  var JF = { el: null, on: false, raf: 0, last: 0, next: 0, held: false, tx: 0, ty: 0, tT: 0, act: null, last_act: '', rot: 0, km: 1, fo: -1 };
  var JF_W = 224, JF_H = 183;
  function jfSize() { return innerWidth < 600 ? 50 : 64; }
  function jfEnsureEl() {
    if (JF.el && JF.el.isConnected) return JF.el;
    // only ever one on the page
    var old = document.querySelectorAll('.x-drift');
    for (var oi = 0; oi < old.length; oi++) old[oi].parentNode.removeChild(old[oi]);
    var e = document.createElement('div');
    e.className = 'x-drift'; e.setAttribute('aria-hidden', 'true');
    e.addEventListener('pointerdown', function (ev) {
      if (ev.button) return;
      ev.preventDefault();
      try { e.setPointerCapture(ev.pointerId); } catch (err) {}
      JF.held = true; JF.gx = ev.clientX - JF.x; JF.gy = ev.clientY - JF.y; JF.px = ev.clientX; JF.py = ev.clientY;
      JF.hx = JF.x; JF.hy = JF.y; e.classList.add('x-grab');
      JF.dx0 = ev.clientX; JF.dy0 = ev.clientY; JF.d0 = performance.now(); JF.act = null;
    });
    e.addEventListener('pointermove', function (ev) { if (JF.held) { JF.px = ev.clientX; JF.py = ev.clientY; } });
    var drop = function (ev) {
      if (!JF.held) return;
      JF.held = false; e.classList.remove('x-grab');
      try { e.releasePointerCapture(ev.pointerId); } catch (err) {}
      JF.vx = Math.max(-500, Math.min(500, JF.vx)); JF.vy = Math.max(-500, Math.min(500, JF.vy));
      if (Math.abs(JF.vx) > 60) JF.dir = JF.vx > 0 ? 1 : -1;
      JF.pulse = 0.6; JF.since = 1;
      // a tap (not a drag) makes it react, in a different way each time
      // a double tap/click (not a drag) makes it react, in a different way each time
      if (ev.type === 'pointerup' && Math.hypot(ev.clientX - JF.dx0, ev.clientY - JF.dy0) < 8 && performance.now() - JF.d0 < 500) {
        var nowT = performance.now();
        if (JF.tapAt && nowT - JF.tapAt < 400) { JF.tapAt = 0; jfReact(); } else JF.tapAt = nowT;
      }
    };
    e.addEventListener('pointerup', drop); e.addEventListener('pointercancel', drop);
    document.body.appendChild(e);
    JF.el = e;
    return e;
  }
  function jfLaunch() {
    var e = jfEnsureEl(), w = jfSize();
    JF.w = w; JF.h = w * JF_H / JF_W;
    JF.dir = Math.random() < 0.5 ? 1 : -1;
    JF.x = JF.dir > 0 ? -w : innerWidth + w;
    JF.y = innerHeight * (0.25 + Math.random() * 0.5);
    JF.vx = JF.dir * 60; JF.vy = 0; JF.t = 0; JF.pulse = 0.2; jfPick(); JF.since = 1; JF.sq = 0; JF.blink = 2 + Math.random() * 2; JF.blinkT = 0;
    JF.on = true;
    e.style.width = w + 'px'; e.style.height = JF.h + 'px';
    e.style.display = 'block';
  }
  // the next spot it swims to: anywhere on the page, not too close to the edges
  function jfPick() {
    JF.tx = innerWidth * (0.08 + Math.random() * 0.84); JF.ty = innerHeight * (0.12 + Math.random() * 0.76); JF.tT = 4 + Math.random() * 4;
  }
  // what it does when tapped: one of these, chosen at random (never the same twice in a row)
  var JF_ACTS = [
    { n: 'sleep', d: 4.2 },   // shuts its eyes, falls asleep and drops to the bottom of the screen, bounces, dozes, then swims back up
    { n: 'flee', d: 0 },     // dashes away from you off the screen, then swims back in a few seconds later
    { n: 'spin', d: 1.4 },   // spins round and round with a hop
    { n: 'dizzy', d: 2.3 },  // eyes roll about and it wobbles
    { n: 'puff', d: 1.1 },   // squeezes, then pops up bigger and settles
    { n: 'shy', d: 2.6 },    // shrinks and looks away
    { n: 'chase', d: 4.5 }   // swims after the pointer
  ];
  function jfReact() {
    var a;
    do { a = JF_ACTS[Math.floor(Math.random() * JF_ACTS.length)]; } while (a.n === JF.last_act);
    JF.last_act = a.n;
    JF.act = { n: a.n, d: a.d, t: 0, gone: false };
    if (a.n === 'flee') {
      var fx = JF.x - jfPtr.x, fy = JF.y - jfPtr.y, fd = Math.hypot(fx, fy);
      if (fd < 1) { fx = Math.random() < 0.5 ? 1 : -1; fy = -0.3; fd = 1; }
      JF.act.ux = fx / fd; JF.act.uy = fy / fd;
    } else if (a.n === 'puff') { JF.vy -= 160; }
    JF.pulse = 1.5;
  }
  // it comes back in from a random edge after fleeing
  function jfEnter() {
    JF.dir = Math.random() < 0.5 ? 1 : -1;
    JF.x = JF.dir > 0 ? -JF.w : innerWidth + JF.w; JF.y = innerHeight * (0.25 + Math.random() * 0.5);
    JF.vx = JF.dir * 80; JF.vy = 0; JF.sq = 0; JF.since = 1; JF.pulse = 0.2; JF.act = null; jfPick();
    JF.el.style.display = 'block';
  }
  function jfActStep(dt) {
    var a = JF.act, u = a.d ? Math.min(1, a.t / a.d) : 0, k = Math.min(1, dt * 10), dr;
    a.t += dt;
    if (a.n === 'flee') {
      if (a.gone) { if (a.t > 2.5) jfEnter(); return; }
      var sp = Math.min(1, a.t / 0.5) * 760;
      JF.vx += (a.ux * sp - JF.vx) * Math.min(1, dt * 6); JF.vy += (a.uy * sp - JF.vy) * Math.min(1, dt * 6);
      JF.x += JF.vx * dt; JF.y += JF.vy * dt;
      JF.sq += (0.1 * Math.sin(a.t * 26) - JF.sq) * k; JF.fo = a.t < 0.12 ? 9 : -1;
      if (JF.x < -JF.w * 1.5 || JF.x > innerWidth + JF.w * 1.5 || JF.y < -JF.h * 1.5 || JF.y > innerHeight + JF.h * 1.5) { a.gone = true; a.t = 0; JF.el.style.display = 'none'; }
      return;
    }
    if (a.n === 'chase') {
      if (a.t > a.d) { JF.act = null; return; }
      JF.tx = jfPtr.x; JF.ty = jfPtr.y; JF.tT = 2; JF.pulse = Math.min(JF.pulse, 0.7);
      return;    // swims as usual, towards the pointer and quicker
    }
    if (a.n === 'sleep') {
      // eyes shut; it drops like a stone (gravity), lands on the bottom of the screen with a squash and a little bounce, lies a
      // little on its side and dozes, breathing; when it wakes it pushes off upwards and swims on
      if (a.t > a.d) { JF.act = null; JF.vy = -260; JF.pulse = 0.1; return; }
      var floor = innerHeight - JF.h * 0.55;
      JF.fo = 9; JF.vx *= Math.exp(-3 * dt);
      if (!a.landed) {
        JF.vy += 1500 * dt; JF.y += JF.vy * dt; JF.x += JF.vx * dt;
        JF.sq += (-0.06 - JF.sq) * k;                   // stretched a little as it falls
        if (JF.y >= floor) {
          JF.y = floor;
          if (JF.vy > 240) { JF.vy = -JF.vy * 0.28; JF.sq = 0.3; }
          else { JF.vy = 0; a.landed = true; a.lt = 0; }
        }
      } else {
        a.lt += dt; JF.y = floor;
        JF.sq += (0.12 + 0.04 * Math.sin(a.lt * 2.6) - JF.sq) * Math.min(1, dt * 6);   // squashed on the floor, breathing
        a.tilt = (a.tilt || 0) + ((JF.dir > 0 ? -1 : 1) * 18 - (a.tilt || 0)) * Math.min(1, dt * 3);
      }
      JF.rot = a.tilt || 0;
      return;
    }
    if (a.t > a.d) { JF.act = null; return; }
    dr = Math.exp(-1.6 * dt); JF.vx *= dr; JF.vy *= dr;
    JF.x += JF.vx * dt; JF.y += JF.vy * dt;
    if (a.n === 'spin') {
      JF.rot = 720 * (1 - Math.pow(1 - u, 3)); JF.fo = Math.floor(a.t * 14) % 9;
      JF.km = 1 + 0.15 * Math.sin(u * Math.PI); if (a.t < 0.3) JF.vy -= 420 * dt;
    } else if (a.n === 'dizzy') {
      JF.fo = Math.floor(a.t * 11) % 9; JF.rot = Math.sin(a.t * 9) * 16 * (1 - u); JF.sq += (0.05 * Math.sin(a.t * 12) - JF.sq) * k;
    } else if (a.n === 'puff') {
      if (u < 0.25) JF.sq += (0.34 - JF.sq) * k;
      else { var q = (u - 0.25) / 0.75; JF.km = 1 + 0.55 * Math.sin(Math.min(1, q * 1.15) * Math.PI); JF.sq += (0 - JF.sq) * k; if (q < 0.15) JF.vy -= 520 * dt; }
    } else if (a.n === 'shy') {
      var e = u < 0.15 ? u / 0.15 : u > 0.85 ? (1 - u) / 0.15 : 1;
      JF.km = 1 - 0.45 * e;
      var sdx = JF.x - jfPtr.x, sdy = JF.y - jfPtr.y, sd = Math.hypot(sdx, sdy) || 1;   // looks away from the pointer
      JF.fo = (sdy < -sd * 0.45 ? 0 : sdy > sd * 0.45 ? 2 : 1) * 3 + (sdx < -sd * 0.45 ? 0 : sdx > sd * 0.45 ? 2 : 1);
    }
  }
  var jfPtr = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', function (ev) { jfPtr.x = ev.clientX; jfPtr.y = ev.clientY; }, { passive: true });
  function jfFrame(now) {
    JF.raf = requestAnimationFrame(jfFrame);
    var dt = Math.min(0.05, (now - (JF.last || now)) / 1000); JF.last = now;
    if (document.hidden) return;
    if (!JF.on) { if (now > JF.next) jfLaunch(); else return; }
    var slow = matchMedia('(prefers-reduced-motion:reduce)').matches ? 0.5 : 1;
    JF.t += dt;
    if (JF.held) {
      var k = Math.min(1, dt * 16), ox = JF.x, oy = JF.y;
      JF.x += (JF.px - JF.gx - JF.x) * k; JF.y += (JF.py - JF.gy - JF.y) * k;
      JF.vx = (JF.x - ox) / Math.max(dt, 0.001); JF.vy = (JF.y - oy) / Math.max(dt, 0.001);
      JF.sq += ((0.08 * Math.sin(JF.t * 18)) - JF.sq) * Math.min(1, dt * 10);
    } else if (JF.act && JF.act.n !== 'chase') {
      JF.rot = 0; JF.km = 1; JF.fo = -1;
      jfActStep(dt);
    } else {
      if (JF.act) jfActStep(dt);
      JF.rot = 0; JF.km = 1; JF.fo = -1;
      // jellyfish swimming: a pulse every ~1.7 s; the squeeze shoots it on towards the spot it is heading for, then it glides and sinks slowly
      JF.tT -= dt;
      var ddx = JF.tx - JF.x, ddy = JF.ty - JF.y, dd = Math.hypot(ddx, ddy) || 1;
      if (!JF.act && (dd < JF.w * 1.2 || JF.tT < 0)) jfPick();
      JF.pulse -= dt * slow;
      if (JF.pulse <= 0) {
        JF.pulse = 1.4 + Math.random() * 0.6; JF.since = 0;
        var pw = (85 + Math.min(70, dd * 0.12)) * slow;
        JF.vx += ddx / dd * pw; JF.vy += ddy / dd * pw - 18 * slow;
        if (Math.abs(ddx) > JF.w * 0.4) JF.dir = ddx > 0 ? 1 : -1;
      }
      JF.since += dt * slow;
      var squeeze = JF.since < 0.4 ? Math.sin(JF.since / 0.4 * Math.PI) : 0;
      JF.sq += (Math.max(0, squeeze) * 0.16 - JF.sq) * Math.min(1, dt * 12);
      var dr = Math.exp(-0.9 * dt); JF.vx *= dr; JF.vy *= dr;
      JF.vy += 12 * slow * dt;
      JF.vx += Math.sin(JF.t * 0.7) * 6 * slow * dt;
      JF.x += JF.vx * dt; JF.y += JF.vy * dt;
      // stay on the page: turn back softly at the edges
      var mx = JF.w * 0.6, my = JF.h * 0.6;
      if (JF.x < mx) JF.vx += (mx - JF.x) * 3 * dt; else if (JF.x > innerWidth - mx) JF.vx -= (JF.x - (innerWidth - mx)) * 3 * dt;
      if (JF.y < my) JF.vy += (my - JF.y) * 3 * dt; else if (JF.y > innerHeight - my) JF.vy -= (JF.y - (innerHeight - my)) * 3 * dt;
    }
    // eyes: nine frames for the pointer direction, one for the blink
    JF.blink -= dt; if (JF.blink < 0) { JF.blinkT = 0.14; JF.blink = 2.5 + Math.random() * 3; }
    var fr;
    if (JF.fo >= 0) fr = JF.fo;
    else if (JF.blinkT > 0) { JF.blinkT -= dt; fr = 9; }
    else {
      var dx = jfPtr.x - JF.x, dy = jfPtr.y - JF.y, d = Math.hypot(dx, dy);
      var cx = d < 30 ? 1 : (dx < -d * 0.45 ? 0 : dx > d * 0.45 ? 2 : 1), cy = d < 30 ? 1 : (dy < -d * 0.45 ? 0 : dy > d * 0.45 ? 2 : 1);
      fr = cy * 3 + cx;
    }
    if (JF.fr !== fr) { JF.fr = fr; JF.el.style.backgroundPosition = (fr / 9 * 100) + '% 0'; }
    var sway = Math.sin(JF.t * 1.3) * 5 + Math.max(-16, Math.min(16, JF.vx * 0.06));
    var near = Math.sin(JF.t * 0.45) * 0.7 + Math.sin(JF.t * 1.1 + 1) * 0.3;   // -1 far ... 1 near the viewer
    var sx = (1 - JF.sq * 0.9) * (1 + 0.1 * near) * JF.km, sy = (1 + JF.sq) * (1 + 0.1 * near) * JF.km;
    JF.el.style.setProperty('--sd', (0.5 + 0.5 * near).toFixed(2));
    JF.el.style.transform = 'translate3d(' + (JF.x - JF.w / 2).toFixed(1) + 'px,' + (JF.y - JF.h / 2).toFixed(1) + 'px,0) rotate(' + (sway + JF.rot).toFixed(1) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
  }
  // a click or tap on the page sends it swimming over there
  addEventListener('pointerdown', function (ev) {
    if (!JF.on || JF.held || ev.target.closest('a,button,input,textarea,select,[role=button],.x-drift')) return;
    JF.tx = ev.clientX; JF.ty = ev.clientY; JF.tT = 6; JF.pulse = Math.min(JF.pulse, 0.05);
  }, { passive: true });
  function setupDrifter(on) {
    if (!on) {
      // left the Contact page: remove it
      if (JF.raf) { cancelAnimationFrame(JF.raf); JF.raf = 0; }
      JF.on = false; JF.held = false; JF.last = 0;
      var old = document.querySelectorAll('.x-drift');
      for (var oi = 0; oi < old.length; oi++) old[oi].parentNode.removeChild(old[oi]);
      JF.el = null;
      if (window.__xDrift === JF) window.__xDrift = null;
      return;
    }
    // one creature per page, even if this script happened to run twice
    if (JF.raf || (window.__xDrift && window.__xDrift !== JF)) return;
    window.__xDrift = JF;
    JF.next = performance.now() + 600;
    JF.raf = requestAnimationFrame(jfFrame);
  }


  // ---- contact: the plain page. The texts are read from Framer's own blocks (so they stay what the page says); the e-mail and phone
  // links are rebuilt from the text shown, since Framer's links point to placeholder addresses
  function setupContact(on) {
    var m = document.querySelector('main');
    var cur = document.querySelector('.x-contact');
    if (!on || !m) { if (cur) cur.parentNode.removeChild(cur); unset('[data-xcw]', 'data-xcw'); return; }
    if (m.parentElement) setAttr(m.parentElement, 'data-xcw', '');
    var info = m.querySelector('[data-framer-name="Contact Info"]');
    if (!info) return;
    if (cur && cur.parentNode === m && m.firstChild === cur) return;
    var txt = function (el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
    var title = txt(info.querySelector('[data-framer-name="GET IN TOUCH"]')) || 'Get in touch';
    var ep = info.querySelectorAll('[data-framer-name="Email and Phone"] a'), lines = [];
    for (var i = 0; i < ep.length; i++) {
      var t = txt(ep[i]);
      if (!t) continue;
      if (t.indexOf('@') > -1) lines.push('<a href="mailto:' + t + '">' + t + '</a>');
      else lines.push('<a href="tel:' + t.replace(/[^+\d]/g, '') + '">' + t + '</a>');
    }
    var so = info.querySelectorAll('[data-framer-name="Social Media"] a[href]'), soc = [], seen = {};
    for (i = 0; i < so.length; i++) {
      var h = so[i].getAttribute('href'), n = txt(so[i]);
      if (!n || seen[h]) continue; seen[h] = 1;
      soc.push('<a href="' + h + '" target="_blank" rel="noopener">' + n + ' ↗</a>');
    }
    var esc = function (x) { return x.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var c = cur || document.createElement('section');
    c.className = 'x-contact';
    c.innerHTML = '<svg class="x-ct-arc" viewBox="0 0 300 120" aria-hidden="true"><path id="x-ct-arcp" d="M20,112 A132,132 0 0 1 280,112" fill="none"/><text><textPath href="#x-ct-arcp" startOffset="50%" text-anchor="middle">' + esc(title) + '</textPath></text></svg>' +
      '<h1 class="x-ct-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">' + esc(title) + '</h1>' +
      '<div class="x-ct-text">' + lines.join('<br>') + (soc.length ? '<div class="x-ct-social">' + soc.join('') + '</div>' : '') + '</div>';
    m.insertBefore(c, m.firstChild);
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

  // ---- theme: a time-of-day dial (copy of the "Local Time" dial of brandonyasin.com): dragging it around turns the page
  // from the light blue (noon, top of the dial) to a dark blue with light type (midnight, bottom), through dusk and dawn
  var HOUR_R = [[0, 44], [4, 44], [5, 96], [6, 133], [7, 165], [8, 206], [9, 248], [16, 248], [17, 206], [18, 165], [19, 124], [20, 83], [21, 44], [24, 44]];
  var DAY_HOUR = 12;   // the dial's top
  // Like the original, the dial shows the visitor's own time and the page takes the colours of that hour; dragging the
  // dial "time travels" (kept for the visit in sessionStorage) and the \u2715 brings it back to the real time.
  function localHour() { var n = new Date(); return n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600; }
  var theme = { hour: localHour(), travel: false, raf: 0 };
  try { var savedHour = parseFloat(sessionStorage.getItem('xt-travel')); if (isFinite(savedHour)) { theme.hour = ((savedHour % 24) + 24) % 24; theme.travel = true; } } catch (e) {}
  function darkness(h) {
    var i = 0;
    while (i < HOUR_R.length - 2 && HOUR_R[i + 1][0] <= h) i++;
    var a = HOUR_R[i], b = HOUR_R[i + 1], r = a[1] + (b[1] - a[1]) * ((h - a[0]) / (b[0] - a[0]));
    return Math.max(0, Math.min(1, 1 - (r - 44) / (248 - 44)));
  }
  function paintTheme() {
    var t = darkness(theme.hour), tt = Math.max(0, Math.min(1, (t - 0.575) / 0.03)), td = Math.max(0, Math.min(1, t / 0.45));
    var st = document.documentElement.style;
    st.setProperty('--xt', t.toFixed(3)); st.setProperty('--xtt', tt.toFixed(3)); st.setProperty('--xtd', td.toFixed(3)); st.setProperty('--xglow', Math.max(0, Math.min(1, (t - 0.55) / 0.4)).toFixed(3));
    if (t > 0.3 && t < 0.98) { if (!document.documentElement.hasAttribute('data-xdusk')) document.documentElement.setAttribute('data-xdusk', ''); } else document.documentElement.removeAttribute('data-xdusk');
    if (t >= 0.98) { if (!document.documentElement.hasAttribute('data-xnight')) document.documentElement.setAttribute('data-xnight', ''); } else document.documentElement.removeAttribute('data-xnight');
    if (t > 0.15) { if (!document.documentElement.hasAttribute('data-xmid')) document.documentElement.setAttribute('data-xmid', ''); } else document.documentElement.removeAttribute('data-xmid');
    if (tt > 0.5) { if (!document.documentElement.hasAttribute('data-xdark')) document.documentElement.setAttribute('data-xdark', ''); } else document.documentElement.removeAttribute('data-xdark');
    var d = document.querySelector('.x-dial');
    if (d) {
      // lit part of the moon: all of it by day, a sliver (12%) in the night; the shadow comes in from the right in the evening (the sliver left on the left) and
      // goes the other way in the morning
      var lit = 1 - 0.88 * darkness(theme.hour), side = theme.hour >= 12 ? -1 : 1;
      var lc = d.querySelector('.x-lit');
      if (lc) lc.setAttribute('cx', (side * (1 - lit) * 2 * 24.25).toFixed(2));
      var tot = Math.floor(theme.hour * 60 + 0.01), hh = Math.floor(tot / 60) % 24, mm = tot % 60;
      d.querySelector('.x-h').textContent = (hh < 10 ? '0' : '') + hh;
      d.querySelector('.x-m').textContent = (mm < 10 ? '0' : '') + mm;
      var lab = theme.travel ? 'Time travel \u2715' : 'Local time', lEl = d.querySelector('.x-dial-label');
      if (lEl.textContent !== lab) lEl.textContent = lab;
      d.classList.toggle('x-trav', theme.travel);
    }
  }
  function setHour(h, travel) {
    theme.hour = ((h % 24) + 24) % 24;
    if (travel) { theme.travel = true; try { sessionStorage.setItem('xt-travel', String(theme.hour)); } catch (e) {} }
    paintTheme();
  }
  // back to the real time, turning the dial the short way round
  function tweenHour(to) {
    cancelAnimationFrame(theme.raf);
    var from = theme.hour, delta = ((to - from + 36) % 24) - 12, t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - p, 3);
      if (p < 1) { setHour(from + delta * e, false); theme.raf = requestAnimationFrame(step); return; }
      theme.raf = 0;
      theme.travel = false;
      try { sessionStorage.removeItem('xt-travel'); } catch (err) {}
      setHour(localHour(), false);
    };
    theme.raf = requestAnimationFrame(step);
  }
  setInterval(function () { if (!theme.travel && !theme.raf) { theme.hour = localHour(); paintTheme(); } }, 15000);
  function ensureDial() {
    var d = document.querySelector('.x-dial');
    if (!d) {
      d = document.createElement('div');
      d.className = 'x-dial';
      d.innerHTML = '<div class="x-dial-txt"><span class="x-dial-label"></span><span class="x-dial-time"><b class="x-h"></b><i>.</i><b class="x-m"></b></span></div><div class="x-dial-ring" role="slider" aria-label="Time of day: drag to switch between light and dark" aria-valuemin="0" aria-valuemax="24" tabindex="0"><svg class="x-dial-face" viewBox="-26 -26 52 52" aria-hidden="true"><defs><clipPath id="x-moon"><circle r="23.2"/></clipPath></defs><circle class="x-lit" r="23.2" clip-path="url(#x-moon)"/><circle class="x-rim" r="24.25"/></svg></div>';
      var ring = d.querySelector('.x-dial-ring');
      var fromPointer = function (e) {
        var r = ring.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (Math.abs(dx) + Math.abs(dy) < 3) return;
        var ang = Math.atan2(dx, -dy) * 180 / Math.PI;      // 0 = top (noon), clockwise
        cancelAnimationFrame(theme.raf); theme.raf = 0;
        setHour(DAY_HOUR + ang / 15, true);
      };
      ring.addEventListener('pointerdown', function (e) { e.preventDefault(); ring.setPointerCapture(e.pointerId); ring.__drag = true; fromPointer(e); });
      ring.addEventListener('pointermove', function (e) { if (ring.__drag) fromPointer(e); });
      var end = function (e) { ring.__drag = false; try { ring.releasePointerCapture(e.pointerId); } catch (err) {} };
      ring.addEventListener('pointerup', end); ring.addEventListener('pointercancel', end);
      ring.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.5 : 0;
        if (k) { e.preventDefault(); setHour(theme.hour + k, true); }
      });
      var reset = function (e) { e.preventDefault(); tweenHour(localHour()); };
      d.querySelector('.x-dial-txt').addEventListener('click', function (e) { if (theme.travel) reset(e); });
      document.body.appendChild(d);
      paintTheme();
    }
    // sit just left of the menu links
    var link = document.querySelector('a[data-xn]');
    if (link) {
      var l = link.getBoundingClientRect().left;
      if (l > 0) d.style.right = Math.round(innerWidth - l + 18) + 'px';
    }
  }
  paintTheme();
  var themeSeen = typeof WeakMap === 'function' ? new WeakMap() : null, gradSeen = typeof WeakSet === 'function' ? new WeakSet() : null;
  var NAVY_A = [52, 74, 110], NAVY_B = [31, 45, 70];
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function parseRgb(str) { var m = /rgba?\(([^)]+)\)/.exec(str); if (!m) return null; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return p.length < 3 ? null : [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  function darkOf(c) {
    var k = Math.max(0, Math.min(1, (lum(c) - 0.5) / 0.45));
    return 'rgba(' + [0, 1, 2].map(function (i) { return Math.round(NAVY_A[i] + (NAVY_B[i] - NAVY_A[i]) * k); }).join(',') + ',' + c[3] + ')';
  }
  // tag the page background (gradient) and the dark text, once each; the colours then follow --xt / --xtt from css
  function themeTag() {
    var i, e, cs, nodes = [document.body], q;
    var top = document.body.children;
    for (i = 0; i < top.length; i++) { nodes.push(top[i]); for (q = 0; q < top[i].children.length && q < 4; q++) nodes.push(top[i].children[q]); }
    for (i = 0; i < nodes.length; i++) {
      e = nodes[i];
      if (e.hasAttribute('data-xbgm') || e.classList.contains('x-dial')) continue;
      cs = getComputedStyle(e);
      if (cs.backgroundImage.indexOf('gradient') < 0 || e.offsetWidth < innerWidth * 0.9 || e.offsetHeight < 300) continue;
      var g = cs.backgroundImage.replace(/rgba?\([^)]*\)/g, function (c) {
        var rgb = parseRgb(c);
        return rgb ? 'color-mix(in srgb,' + c + ' calc((1 - var(--xt)) * 100%),' + darkOf(rgb) + ' calc(var(--xt) * 100%))' : c;
      });
      e.style.setProperty('--xbgimg', g);
      e.setAttribute('data-xbgm', '');
    }
    var faces = document.querySelectorAll('a[data-xf]');
    for (i = 0; i < faces.length; i++) for (e = faces[i].parentElement; e && e !== document.body; e = e.parentElement) {
      if (/invert/.test(getComputedStyle(e).filter) && !e.hasAttribute('data-xfi')) e.setAttribute('data-xfi', '');
    }
    var all = document.body.querySelectorAll('*');
    for (i = 0; i < all.length; i++) {
      e = all[i];
      if (e.hasAttribute('data-xtc')) continue;
      var gradDone = gradSeen && gradSeen.has(e);
      if (gradSeen) gradSeen.add(e);
      // other light gradients (fades over the hero, the bar of the intro...): faded ones turn into the dark page colour,
      // solid ones into a muted blue that still shows against it
      if (!gradDone && !e.hasAttribute('data-xbgm') && !e.closest('.x-dial')) {
        cs = getComputedStyle(e);
        if (cs.backgroundImage.indexOf('gradient') > -1 && e.offsetWidth > 0) {
          var faded = /rgba\([^)]*,\s*0(\.\d+)?\)/.test(cs.backgroundImage), any = false;
          var g2 = cs.backgroundImage.replace(/rgba?\([^)]*\)/g, function (c) {
            var rgb = parseRgb(c);
            if (!rgb || lum(rgb) < 0.5) return c;
            any = true;
            var dk = faded ? darkOf(rgb) : (function () { var k = Math.max(0, Math.min(1, (lum(rgb) - 0.55) / 0.45)); return 'rgba(' + [0, 1, 2].map(function (n) { return Math.round([120, 138, 168][n] + ([96, 112, 142][n] - [120, 138, 168][n]) * k); }).join(',') + ',' + rgb[3] + ')'; })();
            return 'color-mix(in srgb,' + c + ' calc((1 - var(--xt)) * 100%),' + dk + ' calc(var(--xt) * 100%))';
          });
          if (any) { e.style.setProperty('--xbgimg', g2); e.setAttribute('data-xbgm', ''); }
        }
      }
      var own = false;
      for (q = 0; q < e.childNodes.length; q++) if (e.childNodes[q].nodeType === 3 && e.childNodes[q].nodeValue.trim()) { own = true; break; }
      if (!own) continue;      // text that has not been rendered yet (the intro's captions) is looked at again on the next pass
      // captions fade/animate in with another colour at first (white on the intro, say): look again a few times, a second apart
      var ts = themeSeen && themeSeen.get(e), nowT = performance.now();
      if (ts && (ts.n >= 8 || nowT - ts.t < 1000)) continue;
      if (themeSeen) themeSeen.set(e, { n: ts ? ts.n + 1 : 1, t: nowT });
      if (e.closest('.x-dial,button,[data-xn]')) continue;
      cs = getComputedStyle(e);
      var c = parseRgb(cs.color);
      // white type of the About page (the big "Martamon" and its text) goes soft too; white type elsewhere sits on pictures and stays
      var bigWhite = c && lum(c) > 0.9 && (parseFloat(cs.fontSize) >= 60 || pageKey() === 'about');
      var gray = c && lum(c) > 0.45 && lum(c) < 0.85 && Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) < 40;
      if (!c || c[3] === 0 || (lum(c) > 0.45 && !bigWhite && !gray)) continue;
      for (var an = e.parentElement; an && an !== document.body; an = an.parentElement) {
        if (getComputedStyle(an).mixBlendMode !== 'normal') { an.setAttribute('data-xbl', ''); break; }
      }
      e.style.setProperty('--xo', cs.color);
      e.style.setProperty('--xd', gray ? 'rgba(58,68,86,' + c[3] + ')' : cs.color);
      e.style.setProperty('--xl', gray ? 'rgba(176,189,209,' + c[3] + ')' : 'rgba(194,207,224,' + c[3] + ')');
      e.setAttribute('data-xtc', '');
    }
  }

  // About: the frame that hides the video's light backdrop at night (see the css)
  function ensureVideoFade(on) {
    var heroes = document.querySelectorAll('[data-framer-name="Hero Video"]'), i;
    for (i = 0; i < heroes.length; i++) {
      var h = heroes[i], f = h.querySelector(':scope > .x-vfade');
      if (!on || !h.querySelector('video')) { if (f) h.removeChild(f); continue; }
      if (!f) {
        f = document.createElement('div');
        f.className = 'x-vfade';
        var vids = h.querySelectorAll(':scope > [data-framer-name^="Video"]');
        var last = vids.length ? vids[vids.length - 1] : null;
        h.insertBefore(f, last ? last.nextSibling : h.firstChild);
      }
    }
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
    themeTag();
    ensureDial();
    ensureVideoFade(p === 'about');
    styleMenu();
    styleCaptions(p === 'home');
    applyHome(p === 'home');
    setupTilt(p === 'contact');
    if (p === 'home') mobileHero();
    setupReel(p === 'home');
    setupDrifter(p === 'contact');
    setupContact(p === 'contact');

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
