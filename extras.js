// Site-specific additions on top of the mirrored Framer pages. Loaded on every page (see add-root-shim.py).
//  - about: the hair video fades into the page background at the top and bottom edges
//  - lexus-singapore: Instagram reel appended to the image column
//  - schweppes: YouTube video below the text, with a sound button
//  - project pages: toggle between the single-column list and a grid, like nolan-barret.framer.website/playground
// Framer re-renders on navigation, so everything is applied by an idempotent apply() that is re-run on DOM changes.
(function () {
  'use strict';

  // ?xdebug on any page prints what the browser reports (errors, sizes) on the page itself, for in-app browsers that can't be inspected
  var XDBG = false;
  try { if (/[?&]xdebug\b/.test(location.search)) sessionStorage.setItem('xdebug', '1'); if (/[?&]xdebug=0\b/.test(location.search)) sessionStorage.removeItem('xdebug'); XDBG = sessionStorage.getItem('xdebug') === '1'; } catch (e) { XDBG = /[?&]xdebug\b/.test(location.search); }
  var xlog = function () {};
  if (XDBG) {
    (function () {
      var box = document.createElement('pre'), lines = [];
      try { lines = JSON.parse(sessionStorage.getItem('xdbg-lines') || '[]'); lines.push('---- ' + location.pathname); } catch (e) {}
      box.style.cssText = 'position:fixed;left:0;right:0;top:0;max-height:60vh;overflow:auto;margin:0;padding:8px;background:#000;color:#0f0;font:11px/1.35 monospace;white-space:pre-wrap;word-break:break-all;z-index:2147483647';
      var show = function () { box.textContent = lines.join('\n'); if (!box.parentNode && document.documentElement) document.documentElement.appendChild(box); };
      var log = function (t) { lines.push(t); if (lines.length > 60) lines.shift(); try { sessionStorage.setItem('xdbg-lines', JSON.stringify(lines)); } catch (e) {} show(); };
      xlog = log;
      box.addEventListener('dblclick', function () { lines = []; try { sessionStorage.removeItem('xdbg-lines'); } catch (e) {} show(); });
      var cs = document.currentScript; log('script ' + (cs && cs.src ? cs.src.split('/').pop() : '?') + ' sw-ctrl ' + !!(navigator.serviceWorker && navigator.serviceWorker.controller));
      addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) log('tap ' + a.getAttribute('href') + ' xl=' + a.hasAttribute('data-xl') + ' "' + a.textContent.trim().slice(0, 20) + '" prevented=' + e.defaultPrevented); }, true);
      addEventListener('pagehide', function () { log('leave -> ' + location.href); });
      log('xdebug ' + new Date().toISOString().slice(11, 19) + ' ' + navigator.userAgent);
      log('view ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio + ' sw ' + ('serviceWorker' in navigator) + ' ref ' + (document.referrer || '-'));
      addEventListener('error', function (e) { log('ERR ' + (e.message || (e.target && (e.target.src || e.target.href)) || '?') + (e.filename ? ' @' + e.filename.split('/').pop() + ':' + e.lineno : '')); }, true);
      addEventListener('unhandledrejection', function (e) { log('REJ ' + (e.reason && (e.reason.message || e.reason))); });
      var rep = function (tag) { try { var m = document.querySelector('main'); log(tag + ' inapp ' + INAPP + ' text ' + document.body.innerText.length + ' main ' + (m ? m.getBoundingClientRect().height | 0 : '-') + ' body ' + document.body.scrollHeight + ' imgs ' + document.images.length + ' bg ' + getComputedStyle(document.body).backgroundColor); } catch (err) { log('rep ' + err.message); } };
      ['error', 'warn'].forEach(function (k) { var o = console[k]; console[k] = function () { try { log('c.' + k + ' ' + [].slice.call(arguments).map(function (a) { return a && a.message ? a.message : String(a); }).join(' ').slice(0, 220)); } catch (e) {} return o.apply(console, arguments); }; });
      var res = function (tag) {
        try {
          var m = document.getElementById('main'), rs = performance.getEntriesByType('resource'), bad = [], mjs = 0, i;
          for (i = 0; i < rs.length; i++) { if (/\.mjs/.test(rs[i].name)) mjs++; if (rs[i].responseStatus >= 400 || (rs[i].responseStatus === 0 && rs[i].transferSize === 0 && rs[i].decodedBodySize === 0 && /\.(mjs|js|json|framercms)/.test(rs[i].name))) bad.push(rs[i].name.split('/').pop().slice(0, 40) + ':' + rs[i].responseStatus); }
          log(tag + ' main#' + (m ? m.children.length + ' kids ' + m.innerHTML.length + 'b' : 'none') + ' body kids ' + document.body.children.length + ' res ' + rs.length + ' mjs ' + mjs + ' bad ' + (bad.slice(0, 6).join(',') || '-'));
        } catch (err) { log('res ' + err.message); }
      };
      setTimeout(function () { res('2s'); }, 2000); setTimeout(function () { res('6s'); }, 6000);
      setTimeout(function () { rep('1s'); }, 1000); setTimeout(function () { rep('4s'); }, 4000); setTimeout(function () { rep('9s'); }, 9000);
      show();
    })();
  }


  // ?xoff switches every addition of this file off (to tell whether a problem comes from it or from the mirrored page)
  if (/[?&]xoff\b/.test(location.search)) return;

  // language of the site (English, Spanish, Galician): the switch in the corner and the translation of every text
  try { import('/extras/i18n.js?v=26').catch(function () {}); } catch (e) {}

  // In-app browsers (LinkedIn, Instagram, ...) end up on a blank page as soon as the YouTube player of the home page is created, so
  // there every YouTube iframe shows its still picture with a link to YouTube instead (?xinapp forces this in any browser).
  var INAPP = /LinkedInApp|FBAN|FBAV|Instagram|MicroMessenger|Twitter/i.test(navigator.userAgent) || (/iP(hone|ad|od)/.test(navigator.userAgent) && !/Safari\//.test(navigator.userAgent)) || /[?&]xinapp\b/.test(location.search);
  if (INAPP) {
    document.documentElement.setAttribute('data-xinapp', '');
    (function () {
      var YT = /^(https?:)?\/\/([a-z0-9-]+\.)?(youtube|youtube-nocookie)\.com\//i;
      var card = function (src) {
        var m = /\/embed\/([\w-]{6,})/.exec(src), id = m && m[1];
        if (!id) return '<!doctype html><body style="margin:0;background:#000">';
        // in these browsers a tap (or, for the home reel, the page itself) starts the video right here in the page: nothing sends you to YouTube
        var reelId = id === 'NrxFBp4bl2Q';
        return '<!doctype html><meta name="viewport" content="width=device-width"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#p{display:block;position:absolute;inset:0;background:#000 url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg) center/cover no-repeat;cursor:pointer}#p:after{content:"";position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px;border-radius:50%;background:rgba(0,0,0,.55) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23fff\' d=\'M9 7l8 5-8 5z\'/%3E%3C/svg%3E") center/60% no-repeat}#s{position:absolute;right:12px;bottom:12px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:none;padding:0}#s svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}</style><a id="p" role="button" aria-label="Play"></a><button id="s" aria-label="Sound"></button>' +
          '<script>(function(){var id="' + id + '",reel=' + (reelId ? 'true' : 'false') + ',f=null,muted=true,on=\'<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>\',off=\'<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>\',s=document.getElementById("s"),p=document.getElementById("p");' +
          'function cmd(fn,a){try{f.contentWindow.postMessage(JSON.stringify({event:"command",func:fn,args:a||[]}),"*")}catch(e){}}' +
          'function go(){if(f)return;f=document.createElement("iframe");f.src="https://www.youtube.com/embed/"+id+"?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"+(reel?"&mute=1&loop=1&playlist="+id+"&controls=0&disablekb=1":"");f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.setAttribute("allowfullscreen","");f.style.cssText="position:absolute;inset:0;width:100%;height:100%;border:0";document.body.insertBefore(f,s);p.style.display="none";' +
          'if(reel){s.style.display="block";s.innerHTML=off;[800,2000,4000].forEach(function(t){setTimeout(function(){cmd("mute");cmd("playVideo")},t)})}}' +
          'p.addEventListener("click",go);' +
          's.addEventListener("click",function(){muted=!muted;if(muted)cmd("mute");else{cmd("unMute");cmd("setVolume",[100])}cmd("playVideo");s.innerHTML=muted?off:on});' +
          'if(reel)go();})()</script>';
      };
      var d = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
      if (d && d.set) {
        Object.defineProperty(HTMLIFrameElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { if (YT.test(String(v)) && !this.__xraw) { sa.call(this, 'data-xytsrc', String(v)); this.srcdoc = card(String(v)); } else d.set.call(this, v); } });
      }
      var sa = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (n, v) {
        if (this.tagName === 'IFRAME' && !this.__xraw && String(n).toLowerCase() === 'src' && YT.test(String(v))) { sa.call(this, 'data-xytsrc', String(v)); return sa.call(this, 'srcdoc', card(String(v))); }
        return sa.call(this, n, v);
      };
    })();
  }

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
    // about: no photo tiles over the hero (Framer's "Tile" blocks), only the head video and the text
    'html[data-xp="about"] [data-framer-name="Tile"]{display:none!important}',
    'html[data-xp="about"] [data-framer-name="Hero Video"] video{will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden;contain:paint}',
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
    'html[data-xnight] [data-xn]{color:rgb(201,220,249)!important}',
    'html[data-xnight] .x-dial{color:rgb(201,220,249)}',
    // the face is never blended once the page leaves the light blue (its inversion only makes it natural against that)
    'html[data-xmid] [data-xfi]{filter:none!important;mix-blend-mode:normal!important}',
    '[data-xn],[data-xcap]{font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;font-size:14px!important;font-weight:500!important;letter-spacing:.025em!important;text-transform:uppercase!important;line-height:1.6em!important;text-decoration:none!important}',
    '[data-xcap]{color:#888!important}',
    // previous / next project links: a finger-sized tap area around the small type (the same look), above anything drifting by
    'a[data-xl],a[data-xpn]{position:relative;z-index:12}a[data-xpn]::after,a[data-xl]::after{content:"";position:absolute;left:-14px;right:-14px;top:-16px;bottom:-16px}',
    '.x-drift.x-thru{pointer-events:none!important}',
    'a[data-xpnsrc]{display:none!important}',
    '[data-xgone]{display:none!important}',
    // the language switch: the same negative/positive type as the menu (white with the difference blend, plain page colour through dusk and dawn,
    // the light blue at night), full strength, and the same rolling letters on hover
    'html .x-lang{opacity:1;color:#fff;mix-blend-mode:difference}html[data-xdusk] .x-lang{mix-blend-mode:normal;color:var(--xfg)}html[data-xnight] .x-lang{color:rgb(201,220,249)}',
    'html .x-lang button{opacity:1}html .x-lang>i,html .x-lang .x-roll i{opacity:1;font-style:normal}',
    '.x-lang button:hover .x-roll .x-a i,.x-lang button:focus-visible .x-roll .x-a i{transform:translateY(-112%)}.x-lang button:hover .x-roll .x-b i,.x-lang button:focus-visible .x-roll .x-b i{transform:translateY(0)}',
    '.x-roll{position:relative;display:inline-grid;overflow:hidden;white-space:pre;vertical-align:top}',
    '.x-roll>span{grid-area:1/1;display:inline-flex}',
    '.x-roll i{font-style:normal;display:inline-block;transition:transform .9s cubic-bezier(.22,.8,.24,1);transition-delay:calc(var(--i) * 45ms)}',
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
    // (no colour shift on the way, which went through a mint green at dusk: only a little dimmer and slightly see-through, so the page's blue tints it)
    'img[src*="X22mGNitGaY93ZEObiQgYak"]{filter:brightness(calc(1 - .12 * var(--xtt)));opacity:calc(1 - .3 * var(--xtt))}',
    // the hair/face video of About has a light-blue backdrop of its own: at night a soft frame in the page colour (that of the
    // page at the video's edges, so it follows the theme) covers the backdrop around the head, and the head itself stays untouched
    '.x-vfade{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;opacity:var(--xt);background:color-mix(in srgb,rgb(181,197,217) calc((1 - var(--xt)) * 100%),rgb(41,60,89) calc(var(--xt) * 100%));-webkit-mask-image:radial-gradient(ellipse 40% 70% at 50% 47%,transparent 0,transparent 50%,#000 100%);mask-image:radial-gradient(ellipse 40% 70% at 50% 47%,transparent 0,transparent 50%,#000 100%)}',
    // phones: the hero box is tall and narrow, and covering it blew the head up and cut it at the sides; show the whole frame,
    // a little enlarged, and fit the night fade to it
    '@media(max-width:809px){html[data-xp="about"] [data-framer-name="Hero Video"] video{object-fit:contain!important;transform:scale(var(--xhs,2.25)) translate(var(--xhx,0px),var(--xhy,5px));transform-origin:50% 47%;-webkit-mask-image:linear-gradient(to bottom,transparent calc(50% - 28.125vw),#000 calc(50% - 22.5vw),#000 calc(50% + 22.5vw),transparent calc(50% + 28.125vw)),radial-gradient(ellipse 42.3vw 38.5vw at 50% 50%,#000 0,#000 66%,rgba(0,0,0,.5) 84%,transparent 100%)!important;mask-image:linear-gradient(to bottom,transparent calc(50% - 28.125vw),#000 calc(50% - 22.5vw),#000 calc(50% + 22.5vw),transparent calc(50% + 28.125vw)),radial-gradient(ellipse 42.3vw 38.5vw at 50% 50%,#000 0,#000 66%,rgba(0,0,0,.5) 84%,transparent 100%)!important;-webkit-mask-composite:source-in!important;mask-composite:intersect!important}html[data-xp="about"] .x-vfade{display:none!important}}',
    // text that sits on that video is blended with it (exclusion): in the dark it is plain light type instead, or it would vanish
    'html[data-xdark] [data-xbl]{mix-blend-mode:normal!important}',
    // contact portrait: its tilt shadow turns from blue to black
    '[data-x3d][data-hot]{box-shadow:0 28px 55px color-mix(in srgb,rgba(20,60,100,.32) calc((1 - var(--xtt)) * 100%),rgba(0,0,0,.55) calc(var(--xtt) * 100%))}',
    // type colour: original -> (greys only) a darker grey while the page darkens, so they stay readable on the mid blues -> light type
    '[data-xtc]{color:color-mix(in srgb,color-mix(in srgb,var(--xo) calc((1 - var(--xtd)) * 100%),var(--xd) calc(var(--xtd) * 100%)) calc((1 - var(--xtt)) * 100%),var(--xl) calc(var(--xtt) * 100%))!important}',
    // the dial, as in the original: "LOCAL TIME" over the hours and minutes (a blinking dot between them) and a round dial with a ring inside
    '.x-dial{position:fixed;top:12px;right:150px;z-index:12;display:flex;align-items:center;gap:22px;color:#fff;mix-blend-mode:difference;font:500 14px/1.25 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.025em;text-transform:uppercase;user-select:none;-webkit-user-select:none}',
    '@keyframes x-blink{50%{opacity:0}}',
    /* the head cut out of its background (transparent clips): no halo, no page-coloured veil, only the foot of the frame fades */
    'html[data-xalpha] .x-vfade{display:none!important}',
    'html[data-xp="about"][data-xalpha] [data-framer-name="Hero Video"] video{-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 80%,transparent 100%)!important;mask-image:linear-gradient(to bottom,#000 0,#000 80%,transparent 100%)!important}',
    '@media(max-width:809px){html[data-xp="about"][data-xalpha] [data-framer-name="Hero Video"] video{-webkit-mask-image:linear-gradient(to bottom,transparent calc(50% - 28.125vw),#000 calc(50% - 22.5vw),#000 calc(50% + 17vw),transparent calc(50% + 28.125vw))!important;mask-image:linear-gradient(to bottom,transparent calc(50% - 28.125vw),#000 calc(50% - 22.5vw),#000 calc(50% + 17vw),transparent calc(50% + 28.125vw))!important}}',
    /* no flat colour behind the head: the layer must not be its own stacking context, so the text blends with the real page gradient and the head */
    'html[data-xp="about"] [data-framer-name="Hero Video"]{z-index:auto!important}',
    '.x-dial{top:auto!important;right:auto!important;left:14px;bottom:46px;gap:6px;font-size:11px;opacity:.72}',
    '.x-dn svg{width:15px;height:15px}.x-dn{position:fixed;left:122px;bottom:11px;z-index:12;width:28px;height:28px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;cursor:pointer;color:#1f1f1f;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 2px 10px rgba(20,50,80,.12);transition:background .5s ease,color .5s ease,transform .4s cubic-bezier(.2,.8,.2,1)}.x-dn:hover{transform:scale(1.06)}.x-dn:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    'html[data-xdark] .x-dn{background:rgba(20,34,66,.65);color:rgb(203,237,255)}',
    '.x-dial-time{display:inline-flex;align-items:center;font-variant-numeric:tabular-nums;letter-spacing:.06em}.x-dial-time b{font-weight:500}.x-dial-time i{font-style:normal;margin:0 .12em;animation:x-blink 1s step-end infinite}.x-dial-an{flex:none;overflow:visible}',
    '@media(prefers-reduced-motion:reduce){.x-dial-time i{animation:none}}',
    // a slow, small swell so it invites a click; still while hovered or dragged
    // every now and then (not all the time) it swells and dims softly, like a slow blink, to invite a click
    '@keyframes x-blink{0%,72%,100%{transform:scale(1);opacity:1}82%{transform:scale(1.09);opacity:.55}92%{transform:scale(1.02);opacity:.9}}',
    // view toggle
    // the view toggle is the first row of the image column (not floating), so it can never cover the text or the images
    '.x-toggle{display:flex;justify-content:flex-end;align-items:center;align-self:center;gap:4px;width:100%;height:32px;padding:0;box-sizing:border-box;flex:none}',
    '.x-toggle button{width:32px;height:32px;display:grid;place-items:center;padding:0;border:0;background:none;color:var(--xfg,#1b1b1b);opacity:.35;cursor:pointer;transition:opacity .45s ease}',
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
    'main[data-xm]~section a,main[data-xm]~section p,main[data-xm]~section span,main[data-xm]~*:not(.x-yt) footer a,main[data-xm]~*:not(.x-yt) footer p,main[data-xm]~*:not(.x-yt) footer span{color:var(--xfg55,rgba(20,20,20,.55))!important;transition:color .5s ease}',
    'main[data-xm]~section a:hover,main[data-xm]~section a:hover *,main[data-xm]~*:not(.x-yt) footer a:hover,main[data-xm]~*:not(.x-yt) footer a:hover *{color:var(--xfg,#141414)!important}',
    // home: the project list is a masonry like the project galleries (each card goes under the shortest column)
    'main[data-xhome]{display:block!important;position:relative!important;height:var(--hh)!important;min-height:0!important}',
    'main[data-xhome] [data-xhi]{position:absolute!important;left:var(--mx);top:var(--my);width:var(--mw)!important;margin:0!important}',
    'main[data-xhome] [data-xhi][data-xs]{display:none!important}',
    'main[data-xhome] [data-xhi]{overflow:hidden}',
    // every card's picture fills its card (Framer gave some of them a fixed width at some sizes, so they showed smaller and centred)
    'main[data-xhome] [data-xhi] a[href]{width:100%!important;max-width:none!important}main[data-xhome] [data-xhi] a[href]>:first-child{width:100%!important;max-width:none!important;height:auto!important}',
    // Framer's own hover effect on the cards (a zoom of the card or its picture) would pile up on ours and push the card past its column
    // the cards can't be hovered at all (so neither Framer's script nor css can react to the pointer); clicks are routed by position, see below
    // (only where there is a mouse: on phones the cards stay real links, so a tap always opens the project)
    '@media(hover:hover) and (pointer:fine){main[data-xhome] [data-xhi],main[data-xhome] [data-xhi] *{pointer-events:none!important}}',
    '@media(hover:hover) and (pointer:fine){main[data-xhome]{cursor:pointer}}',
    // no hover effect at all on the home cards: nothing inside them moves, zooms, rotates, fades or animates (the play button of the video thumbnails keeps its centring)
    'main[data-xhome] [data-xhi]:hover,main[data-xhome] [data-xhi]:hover *:not(button):not(button *){transform:none!important;scale:none!important;rotate:none!important;translate:none!important;filter:none!important}',
    'main[data-xhome] [data-xhi] a,main[data-xhome] [data-xhi] a *:not(button):not(button *){transform:none!important;scale:none!important;rotate:none!important;filter:none!important;transition:none!important;animation:none!important}',
    // hover: see placeHome (the layout is animated from script)
    // lexus extras: instagram video (cropped to the media only) and the RZ image
    '.x-insta,.x-img{position:relative;flex:none;overflow:hidden}',
    '.x-insta iframe{position:absolute;left:0;top:-' + IG_HEAD + 'px;width:100%;height:calc(100% + ' + (IG_HEAD + IG_FOOT) + 'px);border:0}',
    '.x-img img{display:block;width:100%;height:100%;object-fit:cover}',
    // contact portrait: 3D tilt on hover
    '[data-x3d]{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s,1))!important;transition:transform .5s cubic-bezier(.22,.8,.24,1),box-shadow .6s ease;will-change:transform;box-shadow:0 0 0 rgba(20,60,100,0)}',
    '[data-x3d][data-hot]{transition:transform .18s ease-out,box-shadow .6s ease}',
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
    '.x-ct-text a{color:inherit!important;text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .7s cubic-bezier(.22,.8,.24,1)}',
    '.x-ct-text a:hover,.x-ct-text a:focus-visible{background-size:100% 1px}',
    '.x-ct-social{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:18px;text-transform:uppercase}',
    '@media(max-width:600px){.x-contact{height:400px}.x-ct-arc{width:250px;transform:translateX(-30%) rotate(12deg)}.x-ct-text{font-size:12px}}',
    // the little creature that drifts by now and then (see setupDrifter); a drop shadow behind it
    '.x-drift{position:fixed;left:0;top:0;z-index:9;display:none;transition:opacity .5s ease;background:url(/extras/blob-sprite.webp) 0 0/1000% 100% no-repeat;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;will-change:transform}',
    // its shadow: a soft blurred oval behind and below it (a gradient, not a copy of its silhouette, so it can never look like a second one)
    '.x-drift::before{content:"";position:absolute;left:8%;right:-4%;top:62%;height:52%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,rgba(20,32,80,.32),rgba(20,32,80,.14) 55%,rgba(20,32,80,0));transform:translate(calc(6% + var(--sd,.5) * 12%),calc(10% + var(--sd,.5) * 22%));pointer-events:none}',
    '.x-drift.x-grab{cursor:grabbing}',
    '.x-hint{position:fixed;left:0;top:0;z-index:8;pointer-events:none;opacity:0;transition:opacity .5s ease;color:var(--xfg,#1b1b1b)}',
    '.x-hint.x-on{opacity:.95}',
    '.x-hint svg{width:100%;height:100%;overflow:visible;animation:x-hint-spin 14s linear infinite}',
    '.x-hint text{fill:currentColor;font:500 14.5px "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.06em}',
    '@keyframes x-hint-spin{to{transform:rotate(360deg)}}',
    'html[data-xnight] .x-hint,html[data-xdark] .x-hint{color:rgb(203,237,255)}',
    // it follows the time of day like the type: as the page darkens it turns paler and lighter (towards the light grey-blue of the night type)
    '.x-drift{-webkit-filter:brightness(calc(1 + .22 * var(--xt))) saturate(calc(1 - .25 * var(--xt))) hue-rotate(calc(-8deg * var(--xt))) drop-shadow(0 0 calc(10px * var(--xglow,0)) rgba(185,215,255,calc(.95 * var(--xglow,0)))) drop-shadow(0 0 calc(26px * var(--xglow,0)) rgba(120,170,255,calc(.8 * var(--xglow,0))));filter:brightness(calc(1 + .22 * var(--xt))) saturate(calc(1 - .25 * var(--xt))) hue-rotate(calc(-8deg * var(--xt))) drop-shadow(0 0 calc(10px * var(--xglow,0)) rgba(185,215,255,calc(.95 * var(--xglow,0)))) drop-shadow(0 0 calc(26px * var(--xglow,0)) rgba(120,170,255,calc(.8 * var(--xglow,0))))}',
    // at night it glows: a soft halo around it that breathes
    '.x-drift::after{content:"";position:absolute;left:-60%;top:-60%;width:220%;height:220%;z-index:-2;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgba(150,190,255,.42),rgba(110,155,255,.18) 45%,rgba(120,165,255,0) 72%);opacity:var(--xglow,0)}html[data-xnight] .x-drift::after,html[data-xdark] .x-drift::after{animation:x-glow 2.8s ease-in-out infinite}',
    '@keyframes x-glow{50%{transform:scale(1.18);filter:brightness(1.25)}}',
    // home on phones: the "Regular Studio" caption under the reel reads "Martamon", centred
    '@media(max-width:809px){html[data-xp="home"] [data-framer-name="Info"]{left:0!important;right:0!important;width:100%!important;text-align:center!important;align-items:center!important;justify-content:center!important}html[data-xp="home"] [data-framer-name="Info"]>*{width:100%!important;text-align:center!important}html[data-xp="home"] [data-framer-name="Info"] p{text-align:center!important;--framer-text-alignment:center!important}}',
    // home on phones: Framer shows a picture carousel above the reel; only the reel stays
    '@media(max-width:809px){html[data-xp="home"] [data-framer-name="Hero"]>[data-xhg]{display:none!important}html[data-xp="home"] [data-framer-name="Hero"]{height:auto!important}}',
    '[data-xmr] [data-xmh]{display:none!important}',
    '[data-xmr] iframe.x-mreel{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none}',
    // home reel: our own sound button
    'html[data-xinapp] .x-reel-ctl{display:none!important}',
    '.x-vp{isolation:isolate;position:relative;width:100%;aspect-ratio:var(--r);background:#000;overflow:hidden;border-radius:0;color:#fff;user-select:none;-webkit-user-select:none;touch-action:manipulation;cursor:pointer}',
    '.x-vp.x-vp-v{width:100%}',
    '[data-gal="grid"] .x-vp.x-vp-v{width:100%}',
    '.x-vp-bar button{white-space:nowrap}[data-gal="grid"] .x-vp-lb,[data-gal="grid"] .x-vp-bar button{font-size:12px}[data-gal="grid"] .x-vp-bar{gap:12px;flex-wrap:wrap;padding-bottom:8px}',
    // when the phone refuses to autoplay (Low Power Mode, data saver...): a play button, and YouTube's own player becomes tappable
    '.x-vp-anim{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;pointer-events:none}',
    '.x-vp-big{display:none;position:absolute;z-index:4;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border:0;background:none;color:#fff;place-items:center;cursor:pointer;padding:0;opacity:.88;filter:drop-shadow(0 1px 6px rgba(0,0,0,.45));-webkit-tap-highlight-color:transparent}.x-vp-big svg{width:30px;height:30px;fill:currentColor;margin-left:3px}',
    '.x-vp-cur{display:none;position:absolute;z-index:5;left:var(--cx,50%);top:var(--cy,50%);width:44px;height:44px;transform:translate(-50%,-50%);pointer-events:none;color:#fff;filter:drop-shadow(0 2px 8px rgba(20,40,70,.45))}.x-vp-cur svg{display:block;width:100%;height:100%;fill:currentColor;stroke:currentColor;stroke-width:2.4;stroke-linejoin:round}',
    '@media(hover:hover) and (pointer:fine){.x-vp.x-blocked:not(.x-play){cursor:none!important}.x-vp.x-blocked:not(.x-play) .x-vp-big{display:none!important}.x-vp.x-blocked.x-hov:not(.x-play) .x-vp-cur{display:block}}',
    '[data-xcurhide]{opacity:0!important;transition:opacity .15s!important}',
    '.x-vp.x-blocked:not(.x-play) .x-vp-big{display:grid}',
    '.x-vp-fill{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto}',
    '.x-vp-st{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100%;height:100%;overflow:hidden;background:#000}',
    '.x-vp-fill .x-vp-st{width:min(100%,calc(100vh * 4));height:auto;aspect-ratio:var(--r)}',
    '.x-vp-po{position:absolute;inset:0;width:100%;height:100%;background:#000 center/cover no-repeat;z-index:1;transition:opacity .6s ease}.x-vp.x-play:not(.x-ytp) .x-vp-po,.x-vp.x-ytp.x-shown .x-vp-po{opacity:0;pointer-events:none}',
    // YouTube's player stays invisible (no title, logo, play button or "Watch on YouTube" ever shows): it fades in only once it has been playing for a moment, and out as soon as it stops
    '.x-vp-if{opacity:0;transition:opacity .5s ease}.x-vp.x-shown .x-vp-if{opacity:1}',
    '.x-vp-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}',
    '.x-vp-if{position:absolute;left:0;top:-16%;width:100%;height:132%;border:0;pointer-events:none;background:#000}',
    '.x-vp-lb,.x-vp-bar button{border:0;background:none;padding:0;color:#fff;font:700 15px/1.2 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:0;text-transform:none;cursor:pointer;mix-blend-mode:difference}',
    '.x-vp-lb{position:absolute;z-index:3;left:14px;bottom:50px;opacity:1;transition:opacity .25s}',
    '.x-vp.x-seen.x-play .x-vp-lb{opacity:0}.x-vp.x-seen.x-play.x-ptr .x-vp-lb,.x-vp.x-touch .x-vp-lb{opacity:1}',
    '@media(hover:hover) and (pointer:fine){.x-vp{cursor:none}.x-vp.x-ptr .x-vp-lb{left:var(--px);top:var(--py);bottom:auto;pointer-events:none}.x-vp:not(.x-ptr) .x-vp-lb{opacity:1}.x-vp:not(.x-seen):not(.x-ptr) .x-vp-lb{opacity:1}}',
    '.x-vp-auto .x-vp-lb{display:none}.x-vp-auto{cursor:default!important}.x-vp-auto .x-vp-bar{justify-content:flex-end;gap:6px;padding:0 10px 10px}',
    '.x-vp-auto .x-vp-bar button{width:38px;height:38px;display:grid;place-items:center;mix-blend-mode:normal;color:#fff;filter:drop-shadow(0 1px 3px rgba(0,0,0,.55));opacity:.92;transition:opacity .2s,transform .25s}.x-vp-auto .x-vp-bar button:hover{opacity:1;transform:scale(1.1);text-decoration:none}',
    '.x-vp-auto .x-vp-bar svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.x-vp-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:18px;padding:0 14px 12px;z-index:2}',
    '.x-vp-bar button{padding:6px 0}.x-vp-bar button:hover{text-decoration:underline;text-underline-offset:4px}.x-vp.x-nofs .x-vp-fs{display:none}',
    '.x-vp:fullscreen{width:100vw!important;height:100vh!important;max-height:none;aspect-ratio:auto;background:#000}.x-vp:fullscreen .x-vp-st{width:min(100vw,calc(100vh * var(--r)));height:min(100vh,calc(100vw / var(--r)))}',
    '.x-vp:-webkit-full-screen{width:100vw!important;height:100vh!important;max-height:none;aspect-ratio:auto;background:#000}.x-vp:-webkit-full-screen .x-vp-st{width:min(100vw,calc(100vh * var(--r)));height:min(100vh,calc(100vw / var(--r)))}',
    '[data-xvh]{display:none!important}[data-xvhost]{height:auto!important;max-height:none!important}',
    '.x-reel-ctl{position:absolute;right:16px;bottom:16px;z-index:5;width:44px;height:44px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.45);color:#fff;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);pointer-events:auto;transition:background .5s ease}',
    '.x-reel-ctl:hover{background:rgba(0,0,0,.65)}',
    '.x-reel-ctl svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    // schweppes: text on top like the other projects, the video below it (16:9, full width) with some air and its own sound button
    '[data-xr]{isolation:isolate}',
    // its height is set by apply() so that it ends at the bottom edge of the screen (at least 16:9); the video covers its box
    // schweppes: the video and the campaign stills are items of the project's image column, like the pictures of every other project
    '.x-si{position:relative;flex:none;width:100%;overflow:hidden;background:#101010}',
    '.x-si>img{display:block;width:100%;height:100%;object-fit:cover}',
    '.x-si>iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
    // transition from the home gallery into a project: the page blurs and tints, the project clears from the blur
    '.x-tr{position:fixed;inset:0;z-index:80;pointer-events:none;background:color-mix(in srgb,rgba(180,215,245,0) calc((1 - var(--xt)) * 100%),rgba(31,45,70,0) calc(var(--xt) * 100%));-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);transition:background .8s cubic-bezier(.4,0,.2,1),-webkit-backdrop-filter .8s cubic-bezier(.4,0,.2,1),backdrop-filter .8s cubic-bezier(.4,0,.2,1),opacity 1.1s cubic-bezier(.4,0,.2,1)}',
    '.x-tr.x-go,.x-tr.x-in{background:color-mix(in srgb,rgba(180,215,245,.9) calc((1 - var(--xt)) * 100%),rgba(31,45,70,.93) calc(var(--xt) * 100%));-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px)}',
    '.x-tr.x-in.x-out{opacity:0}',
    // on arrival the project's blocks rise out of the blur one after another
    '@keyframes x-rise{from{opacity:0;transform:translate3d(0,26px,0);filter:blur(12px)}to{opacity:1;transform:none;filter:blur(0)}}',
    'html[data-xarr] main[data-xm]>*,html[data-xarr] main[data-xm]~*{animation:x-rise 1.1s cubic-bezier(.22,.8,.24,1) backwards}',
    'html[data-xarr] main[data-xm]>:nth-child(2){animation-delay:.12s}html[data-xarr] main[data-xm]>:nth-child(3){animation-delay:.24s}html[data-xarr] main[data-xm]>:nth-child(n+4){animation-delay:.36s}html[data-xarr] main[data-xm]~*{animation-delay:.5s}',
    'html[data-xarr] [data-xg]>*{animation:x-rise 1.2s cubic-bezier(.22,.8,.24,1) backwards}',
    'html[data-xarr] [data-xg]>:nth-child(2){animation-delay:.2s}html[data-xarr] [data-xg]>:nth-child(3){animation-delay:.3s}html[data-xarr] [data-xg]>:nth-child(4){animation-delay:.4s}html[data-xarr] [data-xg]>:nth-child(n+5){animation-delay:.5s}',
    // project pictures open full screen over the blurred page (see the lightbox below)
    '[data-xg] img{cursor:zoom-in}',
    '.x-lb{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;background:rgba(214,232,250,.35);-webkit-backdrop-filter:blur(22px) saturate(1.1);backdrop-filter:blur(22px) saturate(1.1);opacity:0;transition:opacity .6s cubic-bezier(.4,0,.2,1);touch-action:pan-y}',
    'html[data-xmid] .x-lb{background:rgba(22,32,56,.5)}',
    '.x-lb.x-open{opacity:1}',
    '.x-lb-img{max-width:min(94vw,1800px);max-height:88vh;max-height:88dvh;width:auto;height:auto;object-fit:contain;box-shadow:0 20px 70px rgba(10,20,50,.35);transform:scale(.97);transition:transform .7s cubic-bezier(.22,.8,.24,1),opacity .5s ease;user-select:none;-webkit-user-select:none;-webkit-user-drag:none}',
    '.x-lb.x-open .x-lb-img{transform:scale(1)}',
    '.x-lb button{position:absolute;width:44px;height:44px;border:0;border-radius:50%;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.55);color:#1b1b1b;cursor:pointer;transition:background .5s ease}',
    '.x-lb button:hover{background:rgba(255,255,255,.9)}',
    '.x-lb button svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.x-lb-close{top:18px;right:18px}',
    '.x-lb-prev{left:18px;top:50%;margin-top:-22px}',
    '.x-lb-next{right:18px;top:50%;margin-top:-22px}',
    '.x-lb-count{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);font:500 12px/1 "IBM Plex Mono",monospace;letter-spacing:.08em;color:var(--xfg)}',
    '@media(max-width:809px){.x-lb-prev,.x-lb-next{display:none}.x-lb-img{max-width:96vw}}',
    // face of the menu: turns around on hover
    '[data-xfc]{z-index:11!important}',
    // the link itself stays still (a turning link is edge-on half-way, the pointer leaves it and the click is lost): only its picture turns
    '[data-xf]>div{transition:transform 1.2s cubic-bezier(.22,.8,.24,1);transform-origin:center}',
    '[data-xf]:hover>div{transform:perspective(500px) rotateY(360deg)}',
    // About on phones: title and text sit over the turning head as negative/positive type (difference blend), white so it inverts against the head and the page
    // ...and the same on computers, by day and by night: no shadow, always the negative/positive (difference) type
    'html[data-xp="about"] [data-framer-name="Caption"],html[data-xp="about"] [data-framer-name="Wordmark"],html[data-xp="about"] [data-xbl]{mix-blend-mode:difference!important;isolation:auto!important}html[data-xp="about"] [data-framer-name="Caption"] *,html[data-xp="about"] [data-framer-name="Wordmark"] *,html[data-xp="about"] [data-xbl],html[data-xp="about"] [data-xbl] *,html[data-xp="about"] [data-framer-name="Caption"] [data-xtc]{color:#fff!important;text-shadow:none!important}',
    /* that block is sticky, so it is a layer of its own and the type could only blend with the head: a copy of the page gradient
       (fixed to the screen like the page's own) sits at the back of the block, so the type also inverts against the page */
    'html[data-xp="about"] [data-framer-name="Content"]::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:var(--xbgimg);background-repeat:no-repeat;background-size:100% var(--xgh,100vh);background-position:0 var(--xgy,0px)}',
    '@media(max-width:809px){html[data-xp="about"] [data-framer-name="Caption"],html[data-xp="about"] [data-framer-name="Wordmark"]{mix-blend-mode:difference!important;isolation:auto!important}html[data-xp="about"] [data-framer-name="Caption"] *,html[data-xp="about"] [data-framer-name="Wordmark"] *{text-shadow:none!important}html[data-xp="about"] [data-framer-name="Hero Video"]{isolation:auto!important}html[data-xp="about"] [data-framer-name="Hero Video"]>div[class*="framer-"]:not([data-framer-name^="Video"]){mix-blend-mode:difference}}',
    // About on phones: the intro text a little wider (fewer, longer lines) so it is not a tall thin column
    '@media(max-width:809px){html[data-xp="about"] [data-framer-name="Caption"]{width:var(--xcw,min(62vw,250px))!important;max-width:none!important}html[data-xp="about"] [data-framer-name="Caption"] p{width:100%!important}}',
    '[data-xs]{display:none!important}',
    // project pages in the style of onseis.com/project/penry-psychology: title in capitals, details and text in small capital mono type, justified, with fine rules
    'main[data-xm] [data-framer-name="Project Title"] p{text-transform:uppercase!important;font-size:34px!important;line-height:1!important;letter-spacing:-.035em!important;font-weight:700!important}',
    'main[data-xm] [data-framer-name="Project Type & Year"]{display:flex!important;flex-direction:row!important;flex-wrap:wrap;align-items:baseline!important;gap:0 10px!important;height:auto!important;padding-bottom:14px;border-bottom:1px solid var(--xink,#fff)}',
    'main[data-xm] [data-framer-name="Project Type"] p,main[data-xm] [data-framer-name="Year Completed"] p,main[data-xm] [data-framer-name="Project Writeup"] p{font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;font-weight:500!important;font-size:12.5px!important;line-height:1.35em!important;letter-spacing:.03em!important;text-transform:uppercase!important}',
    'main[data-xm] [data-framer-name="Year Completed"] p::before{content:"\\2013\\00a0\\00a0"}',
    'main[data-xm] [data-framer-name="Project Writeup"] p{text-align:justify!important;text-justify:inter-word;hyphens:auto}',
    'main[data-xm] [data-framer-name="Project Writeup"]{padding-top:2px}',
    'main[data-xm] [data-framer-name="Project Type"],main[data-xm] [data-framer-name="Year Completed"]{width:auto!important;flex:none!important}',
    // the same contrast everywhere: big heavy capital titles against small capital mono text
    'html[data-xp="about"] [data-framer-name="Caption"] p{font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;font-weight:500!important;font-size:12.5px!important;line-height:1.35em!important;letter-spacing:.03em!important;text-transform:uppercase!important;text-align:justify!important}',
    'html[data-xp="home"] [data-framer-name="Info"] [data-framer-name="Title"] p{text-transform:uppercase!important;font-weight:700!important;letter-spacing:-.03em!important}',
    'html[data-xp="home"] [data-framer-name="Info"] [data-framer-name="Subtitle"] p,html[data-xp="home"] [data-framer-name="Info"] p:not([data-framer-name="Title"] p){font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;font-weight:500!important;font-size:12.5px!important;letter-spacing:.04em!important;text-transform:uppercase!important}',
    'html main[data-xm]~section a,html main[data-xm]~section p,html main[data-xm]~section span,html main[data-xm]~*:not(.x-yt) footer a,html main[data-xm]~*:not(.x-yt) footer p,html main[data-xm]~*:not(.x-yt) footer span{font-family:"IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;text-transform:uppercase!important;letter-spacing:.04em!important}',
    // every text of the site in the tones of the MARTAMON wordmark (see paintInk)
    // negative/positive type everywhere: Framer's root box isolated the page, so a blended text had nothing behind it; it no longer does.
    // Sticky boxes are layers of their own, so there the whole box carries the blend; elsewhere the text itself does.
    'html [data-framer-root]{isolation:auto!important}',
    'html main[data-xm] [data-framer-name="Info"]{mix-blend-mode:difference!important;isolation:auto!important}',
    'html main[data-xm] [data-framer-name="Info"] *{color:var(--xink,#fff)!important;mix-blend-mode:normal!important}html main[data-xm] [data-framer-name="Info"] [data-framer-name="Project Type & Year"]{border-bottom-color:var(--xink,#fff)}',
    'html [data-xcap]{color:var(--xink,#fff)!important;mix-blend-mode:difference}',
    'html main[data-xm]~section a,html main[data-xm]~section p,html main[data-xm]~section span,html main[data-xm]~*:not(.x-yt) footer a,html main[data-xm]~*:not(.x-yt) footer p,html main[data-xm]~*:not(.x-yt) footer span{color:var(--xinkb,#fff)!important;mix-blend-mode:difference}',
    '.x-contact{color:var(--xink,#fff)!important;mix-blend-mode:difference}',
    'html footer a,html footer p,html footer span{color:var(--xinkb,#fff)!important;opacity:1!important;mix-blend-mode:difference}html [data-xmore],html [data-xmore] *{color:var(--xinkb,#fff)!important;opacity:1!important}',
    'html [class*="rolling-text"],html [class*="rolling-text"] *{color:var(--xinkb)!important;--text:var(--xinkb)!important}html a[data-framer-name="Primary"],html a[data-framer-name="Primary"] *{border-color:var(--xtoneb)!important}',
    // negative/positive in every tone: menu, clock, languages and About always blend, with the worked-out colour
    'html [data-xnc],html[data-xdusk] [data-xnc]{mix-blend-mode:difference!important}html [data-xn],html[data-xdusk] [data-xn],html[data-xnight] [data-xn]{color:var(--xink,#fff)!important}',
    'html .x-dial,html[data-xdusk] .x-dial,html[data-xnight] .x-dial{mix-blend-mode:difference!important;color:var(--xinkb,#fff)!important;opacity:1!important}',
    'html .x-lang,html[data-xdusk] .x-lang,html[data-xnight] .x-lang{mix-blend-mode:difference!important;color:var(--xinkb,#fff)!important;opacity:1!important}',
    'html[data-xp="about"] [data-framer-name="Caption"],html[data-xp="about"] [data-framer-name="Wordmark"],html[data-xp="about"] [data-xbl],html[data-xdusk][data-xp="about"] [data-framer-name="Caption"],html[data-xdusk][data-xp="about"] [data-framer-name="Wordmark"],html[data-xdusk][data-xp="about"] [data-xbl]{mix-blend-mode:difference!important}',
    'html[data-xp="about"] [data-framer-name="Caption"] *,html[data-xp="about"] [data-framer-name="Wordmark"] *,html[data-xp="about"] [data-xbl] *,html[data-xp] [data-framer-name="Caption"] [data-xtc]{color:var(--xink,#fff)!important}'
  ].join('\n');
  // the canvas that shows the transparent head where WebM transparency is missing (Safari) gets the same styling as the head's <video>
  css += '\n' + css.split('\n').filter(function (l) { return /Hero Video"\] video|\[data-xp="about"\] video/.test(l); }).map(function (l) { return l.replace(/Hero Video"\] video/g, 'Hero Video"] .x-hc').replace(/\[data-xp="about"\] video/g, '[data-xp="about"] .x-hc'); }).join('\n');
  css += '\nhtml[data-xp="about"] [data-framer-name="Hero Video"] video.x-hid{opacity:0!important}html[data-xp="about"][data-xalpha] .x-vfade{display:none!important}';
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
    for (var i = 0; i < g.children.length; i++) if (!g.children[i].classList.contains('x-toggle') && !g.children[i].hasAttribute('data-xgone')) out.push(g.children[i]);
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

  // If /extras/video/lexus.mp4 has been uploaded, the Instagram embed (which cannot autoplay) gives way to the site's own player:
  // autoplay, muted, looping, with the sound and full screen icons like the other videos
  function lexusVideo(ig) {
    var url = '/extras/video/lexus.mp4';
    fetch(url, { method: 'HEAD', cache: 'no-cache' }).then(function (rs) {
      if (!rs.ok || !/video|octet/.test(rs.headers.get('content-type') || 'video')) return;
      var t = document.createElement('video'); t.preload = 'metadata'; t.muted = true;
      t.addEventListener('loadedmetadata', function () {
        if (!t.videoWidth || !ig.isConnected) return;
        var r = t.videoHeight / t.videoWidth;
        ig.setAttribute('data-r', String(r)); VP_RATIO.lexus = t.videoWidth / t.videoHeight; VP_FILE.lexus = 'lexus';
        ig.setAttribute('data-xvid', '');
        vpMount(ig, 'lexus', { autoplay: true, loop: true, title: 'Lexus' });
        sizeExtras(ig.parentNode); if (mode === 'grid') schedule();
      });
      t.src = url;
    }).catch(function () {});
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
      lexusVideo(ig);
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
    var vpw = c.querySelector('.x-vp');       /* a video of the site's player: its frame decides, never its cover picture */
    if (vpw) { var rr0 = parseFloat(vpw.style.getPropertyValue('--r')); return rr0 ? 1 / rr0 : 9 / 16; }
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
    var rowFlow = !!g.querySelector(':scope > .x-yt'), rowCol = 0, rowTop = 0;
    for (i = 0; i < kids.length; i++) {
      c = kids[i];
      var cr = parseFloat(c.getAttribute('data-r')) || 1;
      if (c.classList.contains('x-yt') || (narrow && cr < 1 && c.querySelector('.x-vp'))) {   /* a horizontal video spans the whole row (on phones too) */     /* the Schweppes video: one big tile across the whole width, the pictures follow below in the grid */
        var VW = W, fh = Math.round(VW * (parseFloat(c.getAttribute('data-r')) || 9 / 16)), top0 = Math.max.apply(null, heights);
        c.style.setProperty('--mx', (pad + Math.round((W - VW) / 2)) + 'px'); c.style.setProperty('--my', (top + top0) + 'px');
        c.style.setProperty('--mw', VW + 'px'); c.style.setProperty('--gh', fh + 'px');
        for (k = 0; k < cols; k++) heights[k] = top0 + fh + gap;
        continue;
      }
      var r = parseFloat(c.getAttribute('data-r')) || 1, h = Math.round(colW * r), col = 0;
      if (rowFlow) {     /* Schweppes: the pictures fill each row from the left, so the last row is never left with a hole in the middle */
        if (rowCol === 0) rowTop = Math.max.apply(null, heights);
        col = rowCol; rowCol = (rowCol + 1) % cols;
        c.style.setProperty('--mx', (pad + col * (colW + gap)) + 'px'); c.style.setProperty('--my', (top + rowTop) + 'px');
        c.style.setProperty('--mw', colW + 'px'); c.style.setProperty('--gh', h + 'px');
        heights[col] = rowTop + h + gap;
        for (k = 0; k < cols; k++) if (k !== col && heights[k] < rowTop) heights[k] = rowTop;
        continue;
      }
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
  // ---- opening a project from the home gallery: the page blurs and tints, the project page opens under the same veil and it clears
  function goPage(href) {
    var go = function () { location.href = href; };
    if (matchMedia('(prefers-reduced-motion:reduce)').matches || document.querySelector('.x-tr')) { go(); return; }
    var o = document.createElement('div');
    o.className = 'x-tr';
    document.body.appendChild(o);
    try { sessionStorage.setItem('xt-tr', String(Date.now())); } catch (err) {}
    void o.offsetWidth;
    o.classList.add('x-go');
    setTimeout(go, 750);
  }
  (function () {
    var t = 0;
    try { t = parseInt(sessionStorage.getItem('xt-tr'), 10); sessionStorage.removeItem('xt-tr'); } catch (e) {}
    if (!t || Date.now() - t > 7000) return;
    document.documentElement.setAttribute('data-xarr', '');
    setTimeout(function () { document.documentElement.removeAttribute('data-xarr'); }, 3000);
    var o = document.createElement('div');
    o.className = 'x-tr x-in';
    var add = function () { if (!document.body) return setTimeout(add, 10); document.body.appendChild(o); setTimeout(function () { o.classList.add('x-out'); setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 1200); }, 200); };
    add();
  })();

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
  // phones: Safari on iOS does not send a click to elements that are not themselves clickable, so a tap on a card (which ignores the
  // pointer) never arrived; taps are followed on touchend instead
  var homeTap = null, homeTapAt = 0;
  addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    homeTap = e.touches.length === 1 && e.target.closest && e.target.closest('main[data-xhome]') && !e.target.closest('[data-xhi]') ? { x: t.clientX, y: t.clientY, t: performance.now() } : null;
  }, { passive: true });
  addEventListener('touchend', function (e) {
    var s0 = homeTap; homeTap = null;
    if (!s0 || e.changedTouches.length !== 1) return;
    var t = e.changedTouches[0];
    if (Math.hypot(t.clientX - s0.x, t.clientY - s0.y) > 10 || performance.now() - s0.t > 600) return;
    var a = homeCardAt(t.clientX, t.clientY);
    if (!a) return;
    e.preventDefault(); homeTapAt = performance.now();
    a.click();
  }, { passive: false });
  addEventListener('click', function (e) {
    if (!e.isTrusted || e.button || !e.target.closest) return;
    var m = e.target.closest('main[data-xhome]');
    if (!m || e.target.closest('[data-xhi]')) return;
    var a = homeCardAt(e.clientX, e.clientY);
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (performance.now() - homeTapAt < 800) return;   // already followed on touchend
    if (e.metaKey || e.ctrlKey || e.shiftKey) window.open(a.href, '_blank'); else goPage(a.href);
  }, true);
  // phones: the cards are real links; a tap on one gets the same transition
  addEventListener('click', function (e) {
    if (!e.isTrusted || e.button || e.metaKey || e.ctrlKey || e.shiftKey || !e.target.closest) return;
    var a = e.target.closest('main[data-xhome] [data-xhi] a[href]');
    if (!a) return;
    e.preventDefault(); e.stopImmediatePropagation();
    goPage(a.href);
  }, true);
  addEventListener('pointermove', function (e) {
    var m = pageKey() === 'home' && document.querySelector('main[data-xhome]');
    if (!m || e.pointerType === 'touch') return;
    var c = homeCardAt(e.clientX, e.clientY) ? 'pointer' : 'default';
    if (m.style.cursor !== c) m.style.cursor = c;
  }, { passive: true });

  function ensureYoutube(m) {
    var g = galleryEl(m);
    if (!g) return;
    // the empty image column gets the video (with its sound button) and the five stills (extras/schweppes/1-5.webp, 2000 px wide,
    // near-lossless): the whole page then works like any other project (column beside the text, single / grid view)
    if (!g.querySelector(':scope > .x-yt')) {
      var sec = document.createElement('div');
      sec.className = 'x-si x-yt';
      sec.setAttribute('data-r', String(9 / 16)); sec.style.aspectRatio = '16 / 9';
      sec.style.position = 'relative'; g.appendChild(sec); vpMount(sec, YOUTUBE, { fill: true, autoplay: true, loop: true, title: 'Schweppes' });
      var ALT = ['Schweppes leopard at the party', 'Schweppes leopard, portrait', 'The leopard\'s paw on a brass door handle', 'The paw opening a Schweppes tonic water', 'Win a NYE party, Schweppes.com'];
      var HGT = [1135, 1168, 1130, 1113, 1126];
      for (var gi = 1; gi <= 5; gi++) {
        var box = document.createElement('div');
        box.className = 'x-si';
        box.setAttribute('data-r', String(HGT[gi - 1] / 2000)); box.style.aspectRatio = '2000 / ' + HGT[gi - 1];
        var gim = document.createElement('img');
        gim.src = '/extras/schweppes/' + gi + '.webp'; gim.alt = ALT[gi - 1]; gim.width = 2000; gim.height = HGT[gi - 1];
        gim.loading = gi > 2 ? 'lazy' : 'eager'; gim.decoding = 'async';
        box.appendChild(gim);
        g.appendChild(box);
      }
    }
    // the small copy of the video further down the page is not needed
    var img = document.querySelector('img[src*="' + YOUTUBE + '"]');
    if (img && !g.contains(img)) {
      var blk = img;
      while (blk.parentElement && blk.parentElement !== m.parentNode) blk = blk.parentElement;
      if (blk !== m && blk !== g) setAttr(blk, 'data-xh', '');
    }
  }


  // China: two more pictures (extras/china-1.webp, china-2.webp) that become the 4th and the 8th of the project's column
  var CHINA = [[1080, 1805, 'Girl in a white dress running through a forest, motion blur', 4], [1080, 1620, 'Close-up of the girl running, forest in motion blur', 8]];
  function ensureChina(m) {
    var g = galleryEl(m);
    if (!g || g.querySelector(':scope > .x-si')) return;
    var its = items(g), i;
    if (its.length < 3) return;
    for (i = 0; i < CHINA.length; i++) {
      var box = document.createElement('div');
      box.className = 'x-si';
      box.setAttribute('data-r', String(CHINA[i][1] / CHINA[i][0])); box.style.aspectRatio = CHINA[i][0] + ' / ' + CHINA[i][1];
      var im = document.createElement('img');
      im.src = '/extras/china-' + (i + 1) + '.webp'; im.alt = CHINA[i][2]; im.width = CHINA[i][0]; im.height = CHINA[i][1];
      im.loading = 'lazy'; im.decoding = 'async';
      box.appendChild(im);
      // CHINA[i][3] is its final place (1 = first): it goes after the original item that precedes that place
      var before = its[CHINA[i][3] - 2 - i];
      if (before) g.insertBefore(box, before.nextSibling); else g.appendChild(box);
    }
  }

  // ---- lightbox: a click on a project picture shows it full screen over the blurred page; arrows / swipe go through the pictures,
  // the cross, Esc, the up arrow or a click outside the picture close it
  var LB = { el: null, list: [], i: 0, open: false, tx: 0, ty: 0 };
  function lbList() {
    var out = [], gs = document.querySelectorAll('[data-xg]'), i, k, ims;
    for (i = 0; i < gs.length; i++) {
      ims = gs[i].querySelectorAll('img');
      for (k = 0; k < ims.length; k++) if (!ims[k].closest('.x-insta,.x-toggle,.x-vp,button') && ims[k].getBoundingClientRect().width > 40) out.push(ims[k]);
    }
    return out;
  }
  function lbSrc(im) { return im.getAttribute('src') || im.currentSrc; }
  function lbShow(n) {
    LB.i = (n + LB.list.length) % LB.list.length;
    var im = LB.list[LB.i], v = LB.el.querySelector('.x-lb-img');
    v.style.opacity = '0';
    v.onload = function () { v.style.opacity = ''; };
    v.src = lbSrc(im); v.alt = im.alt || '';
    LB.el.querySelector('.x-lb-count').textContent = (LB.i + 1) + ' / ' + LB.list.length;
    var multi = LB.list.length > 1;
    LB.el.querySelector('.x-lb-prev').style.visibility = multi ? '' : 'hidden';
    LB.el.querySelector('.x-lb-next').style.visibility = multi ? '' : 'hidden';
    // warm up the neighbours
    [LB.i - 1, LB.i + 1].forEach(function (j) { var q = LB.list[(j + LB.list.length) % LB.list.length]; if (q) new Image().src = lbSrc(q); });
  }
  function lbClose() {
    if (!LB.open) return;
    LB.open = false;
    LB.el.classList.remove('x-open');
    document.documentElement.style.overflow = '';
    removeEventListener('keydown', lbKey, true);
    var el = LB.el;
    setTimeout(function () { if (!LB.open) el.style.display = 'none'; }, 650);
  }
  function lbKey(e) {
    if (e.key === 'Escape' || e.key === 'ArrowUp') { e.preventDefault(); lbClose(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); lbShow(LB.i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); lbShow(LB.i - 1); }
  }
  function lbOpen(im) {
    LB.list = lbList();
    var n = LB.list.indexOf(im);
    if (n < 0) return;
    if (!LB.el) {
      var o = document.createElement('div');
      o.className = 'x-lb';
      o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Picture');
      var ar = function (d) { return '<svg viewBox="0 0 24 24"><path d="' + d + '"/></svg>'; };
      o.innerHTML = '<img class="x-lb-img" alt="" draggable="false"><button type="button" class="x-lb-close" aria-label="Close">' + ar('M6 6l12 12M18 6L6 18') + '</button><button type="button" class="x-lb-prev" aria-label="Previous">' + ar('M15 5l-7 7 7 7') + '</button><button type="button" class="x-lb-next" aria-label="Next">' + ar('M9 5l7 7-7 7') + '</button><span class="x-lb-count"></span>';
      o.addEventListener('click', function (e) {
        if (e.target.closest('.x-lb-close') || e.target === o) lbClose();
        else if (e.target.closest('.x-lb-prev')) lbShow(LB.i - 1);
        else if (e.target.closest('.x-lb-next')) lbShow(LB.i + 1);
      });
      o.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { LB.tx = e.touches[0].clientX; LB.ty = e.touches[0].clientY; } }, { passive: true });
      o.addEventListener('touchend', function (e) {
        var t = e.changedTouches[0], dx = t.clientX - LB.tx, dy = t.clientY - LB.ty;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) lbShow(LB.i + (dx < 0 ? 1 : -1));
        else if (dy < -70 && Math.abs(dy) > Math.abs(dx) * 1.4) lbClose();
      }, { passive: true });
      document.body.appendChild(o);
      LB.el = o;
    }
    LB.open = true;
    lbShow(n);
    LB.el.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { LB.el.classList.add('x-open'); });
    addEventListener('keydown', lbKey, true);
  }
  addEventListener('click', function (e) {
    if (LB.open || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var im = e.target.closest && e.target.closest('[data-xg] img');
    if (!im || im.closest('.x-insta,.x-toggle,.x-vp,button,a')) return;
    e.preventDefault(); e.stopPropagation();
    lbOpen(im);
  }, true);
  // leaving the page (or going to another project) closes it
  addEventListener('popstate', lbClose);

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


  // ---- the video player of the site: every YouTube video is shown with its own controls (play, sound, full screen) and nothing of YouTube
  // around it: no logo, no title or channel, no timeline. The YouTube player sits in a box taller than the picture and the picture is
  // cropped to the video, so whatever the player draws at its top and bottom edges stays outside the visible window.
  var VP_RATIO = { 'NSqkOhJESYo': 9 / 16 };      // Soap&Glory is a vertical video
  var VP_IC = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13M16 5.5v13"/></svg>',
    fs: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    fsx: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
  };
  var VP_FS = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled) && !/iPhone|iPod/.test(navigator.userAgent);
  var vpAll = [];
  window.addEventListener('message', function (e) {
    if (typeof e.data !== 'string' || e.data.charAt(0) !== '{') return;
    var d; try { d = JSON.parse(e.data); } catch (er) { return; }
    for (var i = 0; i < vpAll.length; i++) {
      var p = vpAll[i]; if (!p.f || e.source !== p.f.contentWindow) continue;
      var st = d.event === 'onStateChange' ? d.info : (d.info && typeof d.info.playerState === 'number' ? d.info.playerState : null);
      if (st !== null && st !== p.lastSt) { p.lastSt = st; xlog('yt ' + p.id + ' state ' + st); }
      if (st === 1) vpCmd(p, 'setPlaybackQuality', ['hd1080']);
      if (st === 1 || st === 3) { p.on = true; p.el.classList.add('x-play'); p.el.classList.add('x-seen'); }
      else if (st === 2 || st === 0 || st === 5 || st === -1) { p.on = false; p.el.classList.remove('x-play'); }
      if (st === 1 && !p.el.classList.contains('x-shown') && !p.showT) p.showT = setTimeout(function (q) { return function () { q.showT = 0; if (q.lastSt === 1 || q.lastSt === 3) q.el.classList.add('x-shown'); }; }(p), 2800);
      if (st === 2 || st === 0 || st === 5 || st === -1) { clearTimeout(p.showT); p.showT = 0; p.el.classList.remove('x-shown'); }
    }
  });
  // the videos you upload to /extras/video/ (name.mp4 and, optionally, name.jpg as its cover) play from the site itself instead of YouTube
  var VP_FILE = { 'NSqkOhJESYo': 'soapglory', 'CCBU84Ma-gE': 'schweppes', '6LFyBTCP7ig': 'china', 'NrxFBp4bl2Q': 'inicio', 'dyls5U16TLE': 'portugal' };
  // Safari (and phones) may refuse to start a video without a gesture: the first tap / key / click anywhere starts every autoplaying video that is on screen
  var vpGest = function () {
    for (var i = 0; i < vpAll.length; i++) {
      var p = vpAll[i]; if (!p.auto || p.on || !p.el.isConnected) continue;
      var rc = p.el.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > innerHeight || !rc.width) continue;
      if (p.muted) vpCmd(p, 'mute'); vpCmd(p, 'playVideo');
    }
  };
  ['touchend', 'pointerup', 'click', 'keydown'].forEach(function (ev) { addEventListener(ev, vpGest, { passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () {
    for (var i = 0; i < vpAll.length; i++) {
      var p = vpAll[i]; if (!p.auto || (!p.f && !p.v)) continue;
      if (document.hidden) { if (p.on) { p.wasOn = true; vpCmd(p, 'pauseVideo'); } }
      else if (p.wasOn) { p.wasOn = false; var r = p.el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) { if (p.muted) vpCmd(p, 'mute'); vpCmd(p, 'playVideo'); } }
    }
  });
  function vpCmd(p, fn, args) {
    if (p.v) { var v = p.v; if (fn === 'playVideo') { var pr = v.play(); if (pr && pr.catch) pr.catch(function (er) { xlog('video ' + p.id + ' play refused: ' + (er && er.name)); if (er && er.name === 'NotAllowedError' && p.auto) p.el.classList.add('x-blocked'); }); } else if (fn === 'pauseVideo') v.pause(); else if (fn === 'mute') v.muted = true; else if (fn === 'unMute') v.muted = false; else if (fn === 'setVolume') v.volume = Math.max(0, Math.min(1, (args[0] || 100) / 100)); return; }
    if (p.f && p.f.contentWindow) p.f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: args || [] }), '*'); }
  function vpMount(host, id, o) {
    o = o || {};
    if (!host || host.querySelector(':scope > .x-vp')) return null;
    var r = VP_RATIO[id] || 16 / 9, p = { id: id, on: false, muted: true, f: null, auto: !!o.autoplay, loop: !!o.loop };
    var olds = host.querySelectorAll('iframe'); for (var oi = 0; oi < olds.length; oi++) { try { olds[oi].removeAttribute('srcdoc'); olds[oi].src = 'about:blank'; } catch (er) {} }
    for (var i = 0; i < host.children.length; i++) setAttr(host.children[i], 'data-xvh', '');
    var el = document.createElement('div'); el.className = 'x-vp' + (r < 1 ? ' x-vp-v' : '') + (o.fill ? ' x-vp-fill' : '') + (o.autoplay ? ' x-vp-auto' : '') + (VP_FS ? '' : ' x-nofs'); el.style.setProperty('--r', String(r));
    el.innerHTML = '<div class="x-vp-st"><div class="x-vp-po" aria-hidden="true"></div></div><button type="button" class="x-vp-lb"></button><span class="x-vp-cur" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M11 8.6c0-2 2.1-3.1 3.8-2.1l17 10.9c1.5 1 1.5 3.2 0 4.2l-17 10.9c-1.7 1-3.8-.1-3.8-2.1z"/></svg></span><button type="button" class="x-vp-big" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></button><div class="x-vp-bar"><button type="button" class="x-vp-sd"></button><button type="button" class="x-vp-fs"></button></div>';
    p.el = el; p.st = el.querySelector('.x-vp-st'); var po = el.querySelector('.x-vp-po');
    var setPo = function (url, next) { var t = new Image(); t.onload = function () { if (t.naturalWidth > 130) po.style.backgroundImage = 'url("' + url + '")'; else if (next) next(); }; t.onerror = function () { if (next) next(); }; t.src = url; };
    var ytPo = function () { setPo('https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg', function () { setPo('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'); }); };
    if (VP_FILE[id]) setPo('/extras/video/' + VP_FILE[id] + '.jpg', ytPo); else ytPo();
    var pp = el.querySelector('.x-vp-lb'), sd = el.querySelector('.x-vp-sd'), fs = el.querySelector('.x-vp-fs');
    var paint = function () {
      var full = document.fullscreenElement === el || document.webkitFullscreenElement === el;
      if (p.auto) { sd.innerHTML = p.muted ? ICON_OFF : ICON_ON; sd.setAttribute('aria-label', p.muted ? 'Turn sound on' : 'Turn sound off'); fs.innerHTML = full ? VP_IC.fsx : VP_IC.fs; fs.setAttribute('aria-label', full ? 'Exit full screen' : 'Full screen'); return; }
      pp.textContent = p.on ? 'Pause' : 'Play'; sd.textContent = p.muted ? 'Sound: off' : 'Sound: on';
      fs.textContent = full ? 'Exit full screen' : 'Full screen';
    };
    var name = VP_FILE[id], fileUrl = name ? '/extras/video/' + name + '.mp4' : '';
    p.check = fileUrl ? fetch(fileUrl, { method: 'HEAD', cache: 'no-cache' }).then(function (rs) { if (rs.ok && /video|octet/.test(rs.headers.get('content-type') || 'video')) p.file = fileUrl; }).catch(function () {}) : Promise.resolve();
    var make = function (auto) {
      if (p.f || p.v) return;
      if (!p.ready) { if (!p.waiting) { p.waiting = true; p.check.then(function () { p.ready = true; make(auto); }); } return; }
      var go = auto || p.auto || p.wantPlay; p.wantPlay = false;
      if (p.file) {
        var v = document.createElement('video'); p.v = v; v.className = 'x-vp-vid'; v.src = p.file; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.preload = 'auto'; v.muted = true; v.defaultMuted = true; v.setAttribute('muted', ''); v.autoplay = !!(o.autoplay || o.loop); v.loop = !!p.loop; v.disablePictureInPicture = true;
        v.setAttribute('aria-label', o.title || 'Video');
        v.addEventListener('loadedmetadata', function () { if (v.videoWidth && v.videoHeight) { var rr = v.videoWidth / v.videoHeight; el.style.setProperty('--r', String(rr)); el.classList.toggle('x-vp-v', rr < 1); try { schedule(); } catch (er) {} if (rr < 1 && host.parentElement && !host.hasAttribute('data-xvhost')) { setAttr(host, 'data-xvhost', ''); var up2 = host.parentElement; if (up2 && /deo/i.test(up2.getAttribute('data-framer-name') || '')) setAttr(up2, 'data-xvhost', ''); } } });
        v.addEventListener('playing', function () { p.on = true; el.classList.add('x-play', 'x-seen'); if (el.classList.contains('x-hov')) { el.classList.remove('x-hov'); faces(false); } paint(); });
        v.addEventListener('pause', function () { p.on = false; el.classList.remove('x-play'); paint(); });
        p.st.appendChild(v);
        if (go) { var pr2 = v.play(); if (pr2 && pr2.catch) pr2.catch(function (er) { xlog('video ' + p.id + ' autoplay refused: ' + (er && er.name)); if (er && er.name === 'NotAllowedError') el.classList.add('x-blocked'); }); }
        return;
      }
      var f = document.createElement('iframe'); f.__xraw = true; p.f = f; el.classList.add('x-ytp');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&fs=0&cc_load_policy=0&vq=hd1080&enablejsapi=1&origin=' + encodeURIComponent(location.origin) + ((auto || go) ? '&autoplay=1&mute=1' : '') + (p.loop ? '&loop=1&playlist=' + id : '');
      f.title = o.title || 'Video'; f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture'); f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true'); f.className = 'x-vp-if';
      f.addEventListener('load', function () { try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (er) {} [300, 1200, 3000].forEach(function (ms) { setTimeout(function () { vpCmd(p, 'addEventListener', ['onStateChange']); vpCmd(p, 'setPlaybackQuality', ['hd1080']); if (p.auto || go) { if (p.muted) vpCmd(p, 'mute'); vpCmd(p, 'playVideo'); } }, ms); }); });
      p.st.appendChild(f);   /* if the player never reports back, the picture is uncovered anyway */
    };
    /* the home reel only: when the phone plays no video (Low Power Mode), a high-quality moving picture (5 s loop, no sound) runs
       in place of the still cover until the video plays or is started */
    var showAnim = function () {
      if (id !== 'NrxFBp4bl2Q' || p.anim || !el.isConnected) return;
      var fallback = function () {
        if (p.anim || p.on) return;
        var im = new Image(); im.className = 'x-vp-anim'; im.alt = ''; im.decoding = 'async';
        im.onload = function () { if (p.on) return; p.anim = im; p.st.appendChild(im); el.classList.add('x-anim'); xlog('reel -> animated picture'); };
        im.src = '/extras/video/inicio-anim.webp?v=1';
      };
      if (!('VideoDecoder' in window) || !('EncodedVideoChunk' in window)) { fallback(); return; }
      /* smooth: the browser decodes the clip itself (WebCodecs, frame by frame at the clip's own timing) onto a canvas */
      p.anim = { stop: function () { this.dead = true; try { if (this.dec && this.dec.state !== 'closed') this.dec.close(); } catch (er) {} (this.q || []).forEach(function (f) { f.close(); }); if (this.cv && this.cv.parentNode) this.cv.parentNode.removeChild(this.cv); } };
      var A = p.anim; A.q = [];
      Promise.all([fetch('/extras/video/inicio-loop.json?v=1').then(function (r) { return r.json(); }), fetch('/extras/video/inicio-loop.bin?v=1').then(function (r) { return r.arrayBuffer(); })]).then(function (a) {
        if (A.dead) return;
        var m = a[0], bin = new Uint8Array(a[1]), desc = Uint8Array.from(atob(m.desc), function (c) { return c.charCodeAt(0); });
        var cfg = { codec: m.codec, description: desc, codedWidth: m.w, codedHeight: m.h, optimizeForLatency: true };
        return VideoDecoder.isConfigSupported(cfg).then(function (sup) {
          if (A.dead) return;
          if (!sup || !sup.supported) { p.anim = null; fallback(); return; }
          var cv = document.createElement('canvas'); cv.className = 'x-vp-anim'; cv.width = m.w; cv.height = m.h; A.cv = cv; var cx = cv.getContext('2d');
          A.dec = new VideoDecoder({ output: function (f) { if (A.dead) f.close(); else A.q.push(f); }, error: function () { A.stop(); p.anim = null; fallback(); } });
          A.dec.configure(cfg);
          var next = 0, loopN = 0, t0 = 0, shown = false, frame = null;
          var tick = function () {
            if (A.dead) return; requestAnimationFrame(tick);
            if (document.hidden) { t0 = 0; return; }
            while (A.dec.decodeQueueSize < 4 && A.q.length < 8) { var sm = m.s[next]; A.dec.decode(new EncodedVideoChunk({ type: sm[3] ? 'key' : 'delta', timestamp: loopN * m.dur + sm[2], data: bin.subarray(sm[0], sm[0] + sm[1]) })); if (++next >= m.s.length) { next = 0; loopN++; } }
            var now = performance.now();
            if (!t0 && A.q.length) t0 = now - A.q[0].timestamp / 1000;
            var t = (now - t0) * 1000, fresh = false;
            if (A.q.length && A.q[0].timestamp < t - 300000) { t0 = now - A.q[0].timestamp / 1000; t = A.q[0].timestamp; }
            while (A.q.length && A.q[0].timestamp <= t) { if (frame) frame.close(); frame = A.q.shift(); fresh = true; }
            if (fresh && frame) { cx.drawImage(frame, 0, 0); if (!shown) { shown = true; p.st.appendChild(cv); el.classList.add('x-anim'); xlog('reel -> smooth moving picture'); } }
          };
          requestAnimationFrame(tick);
        });
      }).catch(function () { if (!A.dead) { p.anim = null; fallback(); } });
    };
    var hideAnim = function () { if (p.anim) { if (p.anim.stop) p.anim.stop(); else if (p.anim.parentNode) p.anim.parentNode.removeChild(p.anim); p.anim = null; el.classList.remove('x-anim'); } };
    new MutationObserver(function () { if (el.classList.contains('x-blocked') && !el.classList.contains('x-play')) showAnim(); else if (el.classList.contains('x-play')) hideAnim(); }).observe(el, { attributes: true, attributeFilter: ['class'] });
    var big = el.querySelector('.x-vp-big');
    /* computers: over a video that is waiting for a click, the face cursor is swapped for a "Play" label that follows the pointer */
    var faces = function (hide) { var fs2 = document.querySelectorAll('img[src*="KM43sXSqqRGv3zMTaUBwiGVBiA"]'); for (var fi = 0; fi < fs2.length; fi++) { var fc = fs2[fi].closest('.framer-pointer-events-none'); if (!fc) continue; if (hide) fc.setAttribute('data-xcurhide', ''); else fc.removeAttribute('data-xcurhide'); } };
    el.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var rc = el.getBoundingClientRect(); el.style.setProperty('--cx', (e.clientX - rc.left) + 'px'); el.style.setProperty('--cy', (e.clientY - rc.top) + 'px'); var w = el.classList.contains('x-blocked') && !p.on; if (w !== el.classList.contains('x-hov')) { el.classList.toggle('x-hov', w); faces(w); } }, { passive: true });
    el.addEventListener('pointerleave', function () { if (el.classList.contains('x-hov')) { el.classList.remove('x-hov'); faces(false); } });
    el.addEventListener('click', function () { if (el.classList.contains('x-hov') && p.f && !p.on) { vpCmd(p, 'mute'); vpCmd(p, 'playVideo'); } });
    big.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (p.v) { p.muted = true; vpCmd(p, 'playVideo'); } else { vpCmd(p, 'mute'); vpCmd(p, 'playVideo'); setTimeout(function () { if (!p.on) big.style.display = 'none'; }, 1800); } });
    if (o.autoplay) { var chk = function () { if (!el.isConnected) return; if (!p.f && !p.v) { setTimeout(chk, 3000); return; } if (!p.loadedAt) { p.loadedAt = 1; setTimeout(chk, 4500); return; } xlog('player ' + id + (p.v ? ' file' : ' youtube') + ' playing=' + p.on); if (!p.on) el.classList.add('x-blocked'); }; setTimeout(chk, 1000); }
    var play = function () { if (!p.f && !p.v) { p.wantPlay = true; make(false); return; } if (p.muted) vpCmd(p, 'mute'); else { vpCmd(p, 'unMute'); vpCmd(p, 'setVolume', [100]); } vpCmd(p, 'playVideo'); [400, 1200, 2500].forEach(function (ms) { setTimeout(function () { if (!p.on) vpCmd(p, 'playVideo'); }, ms); }); };
    var toggle = function () { if (!p.f || !p.on) { p.on = true; el.classList.add('x-play', 'x-seen'); play(); } else { p.on = false; el.classList.remove('x-play'); vpCmd(p, 'pauseVideo'); } paint(); };
    p.toggle = toggle;
    pp.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggle(); });
    p.st.addEventListener('click', function () { if (p.v && !p.on) { var tp = p.v.play(); if (tp && tp.catch) tp.catch(function () {}); return; } if (p.auto) return; toggle(); el.classList.add('x-touch'); clearTimeout(p.tt); p.tt = setTimeout(function () { el.classList.remove('x-touch'); }, 2600); });
    sd.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); p.muted = !p.muted; if (p.v) { p.v.muted = p.muted; if (!p.muted) { p.v.volume = 1; vpCmd(p, 'playVideo'); } } if (p.f) { if (p.muted) vpCmd(p, 'mute'); else { vpCmd(p, 'unMute'); vpCmd(p, 'setVolume', [100]); } } paint(); });
    fs.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var full = document.fullscreenElement === el || document.webkitFullscreenElement === el; if (full) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (el.requestFullscreen || el.webkitRequestFullscreen).call(el); });
    var ptr = function (e) { if (e.pointerType !== 'mouse') return; var rc = el.getBoundingClientRect(); el.style.setProperty('--px', Math.max(8, Math.min(rc.width - pp.offsetWidth - 8, e.clientX - rc.left + 16)) + 'px'); el.style.setProperty('--py', Math.max(8, Math.min(rc.height - pp.offsetHeight - 52, e.clientY - rc.top + 16)) + 'px'); el.classList.add('x-ptr'); };
    p.st.addEventListener('pointerenter', ptr); p.st.addEventListener('pointermove', ptr); p.st.addEventListener('pointerleave', function () { el.classList.remove('x-ptr'); });
    document.addEventListener('fullscreenchange', paint); document.addEventListener('webkitfullscreenchange', paint);
    paint(); host.appendChild(el); vpAll.push(p); try { schedule(); } catch (er) {}
    if (o.autoplay) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { if (!p.f) make(true); else { if (p.muted) vpCmd(p, 'mute'); vpCmd(p, 'playVideo'); } } else if (p.f && p.on) vpCmd(p, 'pauseVideo'); }); }, { threshold: .25 });
      io.observe(el); p.io = io;
      var near = new IntersectionObserver(function (en) { for (var k = 0; k < en.length; k++) if (en[k].isIntersecting) { near.disconnect(); make(true); return; } }, { rootMargin: '120% 0px' });
      near.observe(el);   /* the player starts loading at once, so it is already playing when it comes into view */
    }
    return p;
  }
  // the YouTube embeds that Framer puts on the project pages: the player replaces them (Soap&Glory gets its vertical frame)
  var NO_VIDEO = ['6LFyBTCP7ig'];   /* videos taken off the site (China) */
  function upgradeEmbeds() {
    var fr = document.querySelectorAll('iframe[src*="youtube.com/embed/"],iframe[src*="youtube-nocookie.com/embed/"],iframe[data-xytsrc]');
    for (var i = 0; i < fr.length; i++) {
      var f = fr[i]; if (f.closest('.x-vp,.x-yt,.x-mreel') || f.classList.contains('x-vp-if')) continue;
      var m = /\/embed\/([\w-]{6,})/.exec(f.getAttribute('data-xytsrc') || f.src), id = m && m[1];
      if (id && NO_VIDEO.indexOf(id) > -1) { var gi = f; while (gi.parentElement && !gi.parentElement.hasAttribute('data-xg')) gi = gi.parentElement; if (gi.parentElement) { try { f.removeAttribute('srcdoc'); f.src = 'about:blank'; } catch (er) {} setAttr(gi, 'data-xgone', ''); } continue; } if (!id || id === 'NrxFBp4bl2Q') continue;
      var host = f.closest('article') || f.parentElement; if (!host || !host.getBoundingClientRect().width) continue;
      vpMount(host, id, { title: document.title, autoplay: true, loop: true });
      if (VP_RATIO[id]) { setAttr(host, 'data-xvhost', ''); var up = host.parentElement; if (up && /deo/i.test(up.getAttribute('data-framer-name') || '')) setAttr(up, 'data-xvhost', ''); }
    }
  }

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
    if (player.querySelector('.x-vp')) return;            // ours is already there; Framer's own YouTube player (with its controls) is replaced
    if (!mobileHero.t0) mobileHero.t0 = performance.now();
    if (performance.now() - mobileHero.t0 < 1500) { setTimeout(schedule, 1600); return; }
    if (getComputedStyle(player).position === 'static') player.style.position = 'relative';
    vpMount(player, 'NrxFBp4bl2Q', { fill: true, autoplay: true, loop: true, title: 'Martamon reel' });
    for (var sb = player.parentElement && player.parentElement.firstElementChild; sb; sb = sb.nextElementSibling) if (sb !== player && sb.tagName === 'BUTTON') setAttr(sb, 'data-xvh', '');   /* Framer's own sound button */
  }

  function setupReel(on) {
    var fs = on ? document.querySelectorAll('iframe[src*="youtube.com/embed/NrxFBp4bl2Q"],iframe[data-xytsrc*="NrxFBp4bl2Q"]') : [], f = null;
    for (var fi = 0; fi < fs.length; fi++) if (fs[fi].getBoundingClientRect().width > 0) { f = fs[fi]; break; }
    if (!f || !f.parentElement || !f.parentElement.parentElement) {
      if (reel.f || reel.btn) teardownReel();
      return;
    }
    if (reel.f === f && reel.btn && reel.btn.isConnected) return;
    teardownReel();
    reel.f = f; reel.wrap = f.parentElement.parentElement; reel.muted = true;
    reel.btn = null; vpMount(reel.wrap, 'NrxFBp4bl2Q', { fill: true, autoplay: true, loop: true, title: 'Martamon reel' });
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
      if (JF.walk) { JF.vx = 0; JF.vy = 0; JF.tx = JF.x; JF.wp = 1.2; }      // at the bottom of the page it is simply let go: it drops straight down and stays where it lands
      JF.pulse = 0.6; JF.since = 1;
      // a tap (not a drag) makes it react, in a different way each time
      // a double tap/click (not a drag) makes it react, in a different way each time
      if (ev.type === 'pointerup' && Math.hypot(ev.clientX - JF.dx0, ev.clientY - JF.dy0) < 8 && performance.now() - JF.d0 < 500) {
        var nowT = performance.now();
        // 2 taps in a row make it react (a moment after the second, in case a third follows), 3 open the planet of O Freixo
        JF.tapN = JF.tapAt && nowT - JF.tapAt < 450 ? (JF.tapN || 0) + 1 : 1; JF.tapAt = nowT;
        clearTimeout(JF.tapT);
        if (JF.tapN >= 3) { JF.tapN = 0; JF.tapAt = 0; openPlanet(); }
        else { if (JF.tapN === 1) jfHint(2200); JF.tapT = setTimeout(function () { if (JF.tapN === 2) jfReact(); JF.tapN = 0; }, 460); }
      }
    };
    e.addEventListener('pointerup', drop); e.addEventListener('pointercancel', drop);
    e.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') jfHint(-1); });
    e.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') jfHint(0); });
    document.body.appendChild(e);
    JF.el = e;
    return e;
  }
  // the message that turns round the creature: "click 3 times" (on hover with a mouse, a moment after a first tap on touch screens)
  function jfHint(ms) {
    var h = JF.hint;
    if (!h || !h.isConnected) {
      if (!ms) return;
      h = JF.hint = document.createElement('div');
      h.className = 'x-hint'; h.setAttribute('aria-hidden', 'true');
      var t = 'CLICK 3 TIMES \u00b7 ', txt = t + t + t;
      h.innerHTML = '<svg viewBox="0 0 200 200"><defs><path id="x-hint-p" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"/></defs><text><textPath href="#x-hint-p" textLength="505" lengthAdjust="spacing">' + txt + '</textPath></text></svg>';
      document.body.appendChild(h);
    }
    clearTimeout(JF.hintT);
    h.classList.toggle('x-on', !!ms);
    if (ms > 0) JF.hintT = setTimeout(function () { h.classList.remove('x-on'); }, ms);
  }
  // opened on top of the page (nothing else changes): 3D module loaded the first time it is needed
  var planet = null;
  function openPlanet() {
    if (planet) return;
    planet = { loading: true };
    jfHint(0);
    import('/extras/freixo.js?v=232').then(function (m) {
      planet = m.open({ getDark: function () { return darkness(theme.hour); }, getHour: function () { return theme.hour; }, onClose: function () { planet = null; } });
    }).catch(function () { planet = null; });
  }
  function jfLaunch() {
    var e = jfEnsureEl(), w = jfSize();
    JF.w = w; JF.h = w * JF_H / JF_W;
    JF.dir = Math.random() < 0.5 ? 1 : -1;
    JF.x = JF.dir > 0 ? -w : innerWidth + w;
    JF.y = innerHeight * (0.25 + Math.random() * 0.5);
    if (JF.walk) { JF.y = innerHeight - JF.h * 0.55; JF.wp = 0; JF.wT = 10; JF.ph = 0; JF.shown = null; JF.gr = false; JF.el.style.opacity = '0'; } else { e.style.opacity = ''; e.style.pointerEvents = ''; }
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
    if (JF.walk) JF.y = innerHeight - JF.h * 0.55;
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
      var floor = JF.walk && JF.fl ? JF.fl : innerHeight - JF.h * 0.55;
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
    if (JF.sleepUntil && now < JF.sleepUntil) return;   /* out of sight: look again in a moment, no work meanwhile */
    var dt = Math.min(0.05, (now - (JF.last || now)) / 1000); JF.last = now;
    if (document.hidden) return;
    if (!JF.on) { if (now > JF.next) jfLaunch(); else return; }
    var slow = matchMedia('(prefers-reduced-motion:reduce)').matches ? 0.5 : 1;
    JF.t += dt;
    if (JF.walk) {                        // it shows once the page is scrolled to the footer and walks along just above the "© 2025 · Made by Martamon" row
      if (!JF.fe || !JF.fe.isConnected || (JF.fc = (JF.fc || 0) + 1) % 90 === 0) {
        JF.fe = null; var fa = document.querySelectorAll('a');
        for (var fi = 0; fi < fa.length; fi++) if (/(Made by|Hecho por|Feito por)\s+Martamon/.test(fa[fi].textContent)) { JF.fe = fa[fi]; break; }
      }
      if (!JF.ftT || now - JF.ftT > 250 || scrollY !== JF.ftY) {
        JF.ftT = now; JF.ftY = scrollY; JF.ftop = JF.fe ? JF.fe.getBoundingClientRect().top : document.documentElement.scrollHeight - scrollY - 140;
        /* never in the way of a link: near one, taps go through the creature */
        var dr = JF.el.getBoundingClientRect(), near = false, ls = document.querySelectorAll('a[data-xl],footer a,section a');
        for (var li = 0; li < ls.length && !near; li++) { var lr = ls[li].getBoundingClientRect(); if (lr.width && lr.right > dr.left - 30 && lr.left < dr.right + 30 && lr.bottom > dr.top - 30 && lr.top < dr.bottom + 30) near = true; }
        if (near !== JF.el.classList.contains('x-thru')) JF.el.classList.toggle('x-thru', near);
      }   /* measured a few times a second (or on scroll), not every frame
      */ var ftop = JF.ftop, show = ftop < innerHeight - 6 && ftop > 24;
      if (show) JF.fl = Math.max(JF.h * 0.5 + 4, ftop - JF.h * 0.5 - 4);      // it only shows at the very bottom of the page, standing right on top of the "© 2025 · Made by Martamon" row
      if (show !== JF.shown) { JF.shown = show; JF.el.style.opacity = show ? '1' : '0'; JF.el.style.pointerEvents = show ? '' : 'none'; if (show && !JF.held) { JF.y = JF.fl + JF.h * 0.9; JF.vy = -260; } }
      if (!show) { JF.hid = true; if (JF.hint && JF.hint.isConnected && JF.hint.style.visibility !== 'hidden') JF.hint.style.visibility = 'hidden'; JF.last2 = now; JF.sleepUntil = now + 250; return; }
      JF.hid = false;
    }
    if (JF.held) {
      var k = Math.min(1, dt * 16), ox = JF.x, oy = JF.y;
      JF.x += (JF.px - JF.gx - JF.x) * k; JF.y += (JF.py - JF.gy - JF.y) * k;
      JF.vx = (JF.x - ox) / Math.max(dt, 0.001); JF.vy = (JF.y - oy) / Math.max(dt, 0.001);
      JF.sq += ((0.08 * Math.sin(JF.t * 18)) - JF.sq) * Math.min(1, dt * 10);
    } else if (JF.act && JF.act.n !== 'chase') {
      JF.rot = 0; JF.km = 1; JF.fo = -1;
      jfActStep(dt);
    } else if (JF.walk) {
      // Home and About: it walks to and fro along the bottom of the screen, stops now and then, and still answers taps, drags and 3 clicks
      if (JF.act) jfActStep(dt);
      JF.rot = 0; JF.km = 1; JF.fo = -1;
      var chasing = !!JF.act, wdx = JF.tx - JF.x, want = 0, fl = JF.fl || innerHeight - JF.h * 0.55, spd = innerWidth < 600 ? 30 : 38;
      if (JF.wp > 0 && !chasing) { JF.wp -= dt; if (JF.wp <= 0) { JF.tx = innerWidth * (0.06 + Math.random() * 0.88); JF.wT = 10; } }
      else if (!chasing && (Math.abs(wdx) < 6 || (JF.wT -= dt) < 0)) JF.wp = 1.6 + Math.random() * 3.2;
      else if (Math.abs(wdx) >= 6) want = (wdx > 0 ? 1 : -1) * (chasing ? 95 : spd);
      JF.vx += (want - JF.vx) * Math.min(1, dt * 3.5);
      if (Math.abs(JF.vx) > 8) JF.dir = JF.vx > 0 ? 1 : -1;
      JF.x = Math.max(JF.w * 0.6, Math.min(innerWidth - JF.w * 0.6, JF.x + JF.vx * dt));
      JF.vy += 1500 * dt; JF.y += JF.vy * dt;
      var ground = false;
      if (JF.gr && !JF.held && JF.y < fl + 30) JF.y = fl;       // glued to the row while the page scrolls
      if (JF.y >= fl) { if (JF.vy > 240) { JF.vy = -JF.vy * 0.28; JF.sq = 0.25; } else { JF.vy = 0; ground = true; } JF.y = fl; }
      JF.gr = ground;
      JF.ph += Math.abs(JF.vx) * dt / (JF.w * 0.55) * Math.PI; JF.bob = ground ? Math.abs(Math.sin(JF.ph)) : 0;
      if (ground) JF.sq += ((want ? 0.07 * (1 - JF.bob) - 0.01 : 0.02 + 0.02 * Math.sin(JF.t * 2.2)) - JF.sq) * Math.min(1, dt * 12);
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
    var lift = 0;
    if (JF.walk) { near = 0; lift = (JF.bob || 0) * JF.h * 0.14; if (!JF.act && !JF.held) sway = Math.sin(JF.ph || 0) * 4 * Math.min(1, Math.abs(JF.vx) / 20); }
    var mob = innerWidth < 600, bp = (JF.t % 1.15) / 1.15, beat = mob ? 1 + 0.07 * (Math.exp(-Math.pow((bp - 0.1) / 0.06, 2)) + 0.65 * Math.exp(-Math.pow((bp - 0.3) / 0.07, 2))) : 1;   // on phones it beats like a heart, a little bigger and smaller
    var sx = (1 - JF.sq * 0.9) * (1 + 0.1 * near) * JF.km * beat, sy = (1 + JF.sq) * (1 + 0.1 * near) * JF.km * beat;
    JF.el.style.setProperty('--sd', (0.5 + 0.5 * near).toFixed(2));
    JF.el.style.transform = 'translate3d(' + (JF.x - JF.w / 2).toFixed(1) + 'px,' + (JF.y - JF.h / 2 - lift).toFixed(1) + 'px,0) rotate(' + (sway + JF.rot).toFixed(1) + 'deg) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
    if (mob && !planet && !(JF.hint && JF.hint.isConnected && JF.hint.classList.contains('x-on')) && !JF.held) jfHint(86400000);   // on phones the message around it is always there
    if (JF.hint && JF.hint.isConnected) JF.hint.style.visibility = JF.el.style.display === 'none' ? 'hidden' : '';
    if (JF.hint && JF.hint.isConnected) { var hs = Math.max(112, JF.w * 2.05);                    /* the ring hugs the creature */ JF.hint.style.width = JF.hint.style.height = hs.toFixed(0) + 'px'; JF.hint.style.transform = 'translate3d(' + (JF.x - hs / 2).toFixed(1) + 'px,' + (JF.y - hs / 2 - (JF.walk ? hs * 0.2 : 0)).toFixed(1) + 'px,0)'; }
  }
  // a click or tap on the page sends it swimming over there
  addEventListener('pointerdown', function (ev) {
    if (!JF.on || JF.held || ev.target.closest('a,button,input,textarea,select,[role=button],.x-drift')) return;
    JF.tx = ev.clientX; JF.ty = ev.clientY; JF.tT = 6; JF.pulse = Math.min(JF.pulse, 0.05);
  }, { passive: true });
  function setupDrifter(on) {
    var wk = on === 'walk';
    if (on && JF.walk !== wk) { JF.walk = wk; JF.on = false; JF.next = performance.now() + 600; if (JF.el) JF.el.style.display = 'none'; }
    if (!on) {
      // left the Contact page: remove it
      if (JF.raf) { cancelAnimationFrame(JF.raf); JF.raf = 0; }
      JF.on = false; JF.held = false; JF.last = 0;
      var old = document.querySelectorAll('.x-drift');
      for (var oi = 0; oi < old.length; oi++) old[oi].parentNode.removeChild(old[oi]);
      JF.el = null;
      if (JF.hint) { JF.hint.parentNode && JF.hint.parentNode.removeChild(JF.hint); JF.hint = null; }
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
    var lb = document.querySelectorAll('.x-lang button'); for (var li = 0; li < lb.length; li++) rollify(lb[li]);   /* the language switch rolls like the menu */
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

  // A tap on a leftover "Coming soon" link (the page is still showing Framer's own markup, or an older copy of this script ran)
  // goes straight to the real neighbour project with a normal page load, never to the home page.
  addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href$="coming-soon"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var cur = location.pathname.replace(/\/+$/, '').split('/').pop();
    var next = /^\s*\u21b3/.test(a.textContent);
    var slug = cur === 'lexus-singapore' ? (next ? 'china' : 'soapglory') : cur === 'china' ? (next ? 'schweppes' : 'lexus-singapore') : '';
    if (!slug) return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.href = '/' + slug;
  }, true);

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
    // the previous/next links of a project page: go there with a normal page load (Framer's own client-side hop to a CMS page
    // ended on the wrong page or on the home page on phones)
    if (p !== 'home' && NOT_PROJECTS.indexOf(p) === -1) {
      var pn = document.querySelectorAll('section a[href^="./"]');
      for (i = 0; i < pn.length; i++) if (/^\.\/[a-z0-9-]+$/.test(pn[i].getAttribute('href')) && pn[i].closest('[data-framer-name="Previous/Next"]')) setAttr(pn[i], 'data-xl', '');
      plainPrevNext();
    }
  }
  // the previous / next project links are replaced by plain links of our own (same look): Framer's own link kept its original
  // target in its code (the removed "Coming soon"), and on some phones its router went there and ended on the home page
  function plainPrevNext() {
    var olds = document.querySelectorAll('a[data-xpn]'), i;
    for (i = 0; i < olds.length; i++) { var pv = olds[i].previousElementSibling; if (!pv || !pv.hasAttribute('data-xpnsrc')) olds[i].parentNode.removeChild(olds[i]); }
    var ls = document.querySelectorAll('section a[href^="./"]');
    for (i = 0; i < ls.length; i++) {
      var a = ls[i], h = a.getAttribute('href'), txt = a.textContent.trim();
      if (!/^\.\/[a-z0-9-]+$/.test(h) || h === './coming-soon' || !/[\u21b3\u21b5]/.test(txt)) continue;
      var to = '/' + h.slice(2) + '/', c = a.nextElementSibling;
      if (!c || !c.hasAttribute('data-xpn')) { c = document.createElement('a'); c.setAttribute('data-xpn', ''); a.parentNode.insertBefore(c, a.nextSibling); }
      if (c.getAttribute('href') !== to) c.setAttribute('href', to);
      if (c.className !== a.className) c.className = a.className;
      if (c.textContent !== txt) c.textContent = txt;
      setAttr(a, 'data-xpnsrc', '');
    }
  }

  // ---- theme: a time-of-day dial (copy of the "Local Time" dial of brandonyasin.com): dragging it around turns the page
  // from the light blue (noon, top of the dial) to a dark blue with light type (midnight, bottom), through dusk and dawn
  var HOUR_R = [[0, 44], [4, 44], [5, 96], [6, 133], [7, 165], [8, 206], [9, 248], [16, 248], [17, 206], [18, 165], [19, 124], [20, 83], [21, 44], [24, 44]];
  var DAY_HOUR = 12;   // the dial's top
  // The dial shows the visitor's own time (with the same little clock as the planet) and the page takes the colours of that hour.
  function localHour() { var n = new Date(); return n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600; }
  var theme = { hour: localHour(), travel: false, raf: 0 };
  try { sessionStorage.removeItem('xt-travel'); } catch (e) {}
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
      var tot = Math.floor(localHour() * 60 + 0.01), hh = Math.floor(tot / 60) % 24, mm = tot % 60;   /* the clock always shows the real time */
      d.querySelector('.x-h').textContent = (hh < 10 ? '0' : '') + hh;
      d.querySelector('.x-m').textContent = (mm < 10 ? '0' : '') + mm;
      d.querySelector('.x-ah').setAttribute('transform', 'rotate(' + ((hh % 12 + mm / 60) * 30).toFixed(1) + ' 12 12)');
      d.querySelector('.x-am').setAttribute('transform', 'rotate(' + (mm * 6) + ' 12 12)');
      paintDn();
    }
  }
  setInterval(function () { if (!theme.travel && !theme.raf) { theme.hour = localHour(); paintTheme(); } }, 15000);
  /* the type of the whole site takes the tones of the MARTAMON wordmark: a deep slate blue-grey over the light blues and a pale
     blue-grey over the dark ones (--xtone). Type that crosses pictures (menu, clock, languages, About) is negative/positive
     (difference blend): its colour (--xink) is worked out from the page colour behind it so that over the page it shows exactly
     that tone, and over pictures it inverts them */
  var TONE_D = [30, 40, 58], TONE_L = [178, 184, 198];
  var lumOf = function (c) { return [0, 1, 2].map(function (i) { var v = c[i] / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); };
  var contrast = function (a, b) { var x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  function toneFor(c) {
    /* dark: the page colour taken down to a deep slate of the same hue; light: the wordmark's pale blue-grey (as light as the blend allows) */
    var d = c.map(function (v) { return Math.round(v * 0.22); }), k = 1, i;
    for (i = 0; i < 3; i++) k = Math.min(k, (255 - c[i]) / TONE_L[i]);
    var l = TONE_L.map(function (v) { return Math.round(v * k); });
    var dark = contrast(d, c) >= contrast(l, c), t = dark ? d : l;
    var ink = dark ? c.map(function (v, i) { return v - t[i]; }) : c.map(function (v, i) { return v + t[i]; });
    return { tone: 'rgb(' + t.join(',') + ')', ink: 'rgb(' + ink.join(',') + ')' };
  }
  function paintInk() {
    try {
      var bi = getComputedStyle(document.body).backgroundImage, cols = [], m, re = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)[^)]*\)|rgba?\((\d+),\s*(\d+),\s*(\d+)/g;
      while ((m = re.exec(bi))) cols.push(m[1] ? [Math.round(m[1] * 255), Math.round(m[2] * 255), Math.round(m[3] * 255)] : [+m[4], +m[5], +m[6]]);
      if (!cols.length) { var bc = /(\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(document.body).backgroundColor); if (bc) cols.push([+bc[1], +bc[2], +bc[3]]); }
      if (!cols.length) return;
      if (!paintInk.more || !paintInk.more.isConnected) { var ps = document.querySelectorAll('a,button'); for (var pi = 0; pi < ps.length; pi++) if (/^(more projects|m\u00e1s proyectos|m\u00e1is proxectos)$/i.test(ps[pi].textContent.trim()) && ps[pi].getBoundingClientRect().width) { var bx = ps[pi]; bx.setAttribute('data-xmore', ''); paintInk.more = bx; break; } }
      var a = toneFor(cols[0]), z = toneFor(cols[cols.length - 1]), mid = toneFor(cols[Math.floor(cols.length / 2)]), st = document.documentElement.style;
      st.setProperty('--xtone', mid.tone); st.setProperty('--xtonet', a.tone); st.setProperty('--xtoneb', z.tone);
      st.setProperty('--xink', a.ink); st.setProperty('--xinkb', z.ink);
    } catch (e) {}
  }
  setInterval(paintInk, 1000);
  var paintTheme0 = paintTheme; paintTheme = function () { paintTheme0(); paintInk(); };
  // the day / night button, as on the planet: the page is in the tone of the real hour until you pick the other one (and back)
  var DN_MOON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  var DN_SUN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';
  function paintDn() { var b = document.querySelector('.x-dn'); if (!b) return; var night = darkness(theme.hour) > 0.5; b.innerHTML = night ? DN_SUN : DN_MOON; b.setAttribute('aria-label', night ? 'Light mode' : 'Dark mode'); }
  function goHour(to, auto) {
    cancelAnimationFrame(theme.raf);
    var from = theme.hour, delta = ((to - from + 36) % 24) - 12, t0 = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      theme.hour = ((from + delta * e) % 24 + 24) % 24; paintTheme();
      if (p < 1) { theme.raf = requestAnimationFrame(step); return; }
      theme.raf = 0; theme.travel = !auto; theme.hour = auto ? localHour() : to; paintTheme();
      try { if (auto) sessionStorage.removeItem('xt-mode'); else sessionStorage.setItem('xt-mode', String(to)); } catch (e2) {}
    };
    theme.raf = requestAnimationFrame(step);
  }
  function toggleDn() {
    var wantDark = darkness(theme.hour) < 0.5, realDark = darkness(localHour()) > 0.5;
    if (wantDark === realDark) goHour(localHour(), true); else goHour(wantDark ? 22 : 12, false);
  }
  function ensureDial() {
    if (!document.querySelector('.x-dn')) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'x-dn'; b.addEventListener('click', toggleDn); document.body.appendChild(b);
      try { var sm = parseFloat(sessionStorage.getItem('xt-mode')); if (isFinite(sm)) { theme.hour = sm; theme.travel = true; paintTheme(); } } catch (e) {}
      paintDn();
    }
    var d = document.querySelector('.x-dial');
    if (!d) {
      d = document.createElement('div');
      d.className = 'x-dial';
      d.innerHTML = '<span class="x-dial-time" role="timer"><b class="x-h"></b><i>:</i><b class="x-m"></b></span><svg class="x-dial-an" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><line class="x-ah" x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line class="x-am" x1="12" y1="12" x2="12" y2="4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
      document.body.appendChild(d);
      paintTheme();
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
      if (e.closest('.x-dial,button,[data-xn],.x-pl,.x-dr')) continue;
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

  // About on phones / narrow windows: size and place the head from the screen itself, so it neither crowds the top nor leaves a gap
  // under it at any shape: its height is the smaller of 1.16 x the width and 58% of the screen, and its foot sits 22 px above the bottom
  // the head clips come with a transparent copy (the sky cut away): used wherever the browser shows WebM transparency (not Safari / iOS)
  var HEAD_IDS = ['jPmsdRIE0vlfbsluwT59xxxwp7k', '2jNDbcQEsXgQm7SBTNGCPwcAL8', '2N6eSRRMavPTSQcVgQoxcLF0vmg', 'VbzyX92zHKlr5jcCuyQzl6sgXA'];
  var HEAD_ALPHA = (function () { try { var ua = navigator.userAgent; return /Chrome|Chromium|Firefox|Edg/.test(ua) && !/iPhone|iPad|iPod|CriOS|FxiOS|EdgiOS/.test(ua) && !!document.createElement('video').canPlayType('video/webm; codecs="vp9"'); } catch (e) { return false; } })();
  // Safari / iOS cannot show transparent WebM: the same clips come as one H.264 video with the picture on the left half and its
  // transparency (grey) on the right; a WebGL canvas combines them every frame. If anything fails the plain video stays as it was.
  var HEADLPM = false;   /* the phone refused to play a head clip: it will refuse the others too */
  function safariHead(v, id) {
    if (v.__xc !== undefined) return; v.__xc = null;
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true });
      if (!gl) return;
      var sh = function (t, src) { var o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      var pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 u;void main(){u=vec2(p.x*.5+.5,p.y*.5+.5);gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 u;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(u.x*.5,1.-u.y)).rgb;float a=texture2D(t,vec2(.5+u.x*.5,1.-u.y)).r;gl_FragColor=vec4(c*a,a);}'));
      gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
      gl.useProgram(pr);
      var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.clearColor(0, 0, 0, 0);
      c.width = 896; c.height = 504; c.className = 'x-hc ' + v.className; c.style.cssText = v.style.cssText + ';position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block'; c.setAttribute('aria-hidden', 'true');
      var pv = document.createElement('video');
      pv.muted = true; pv.defaultMuted = true; pv.loop = true; pv.setAttribute('muted', ''); pv.setAttribute('playsinline', ''); pv.setAttribute('webkit-playsinline', ''); pv.preload = 'auto'; pv.disablePictureInPicture = true;
      pv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;opacity:0;pointer-events:none';   /* full size (Safari pauses muted videos it thinks are not shown), invisible */
      pv.src = '/extras/head/' + id + '.pack.mp4?v=1';
      v.parentNode.insertBefore(pv, v.nextSibling); v.parentNode.insertBefore(c, pv.nextSibling); v.__xc = c; v.__xpv = pv; v.__xid = id;
      /* the original clip (about 10 MB each) is no longer needed: stop its download */
      try { v.pause(); v.removeAttribute('src'); v.load(); } catch (er) {} xlog('head ' + id.slice(0, 6) + ' webgl ok');
      pv.addEventListener('seeked', function () { lastT = -1; });   /* the new frame is there now: paint it */
      pv.addEventListener('error', function () { xlog('head pack error ' + (pv.error && pv.error.code)); });
      var kick = function () { if (pv.paused && getComputedStyle(v).visibility !== 'hidden') { var kp = pv.play(); if (kp && kp.catch) kp.catch(function (er) { if (er && er.name === 'NotAllowedError') HEADLPM = true; xlog('head play refused ' + (er && er.name)); }); } };
      ['touchend', 'click', 'scroll', 'keydown'].forEach(function (t) { addEventListener(t, kick, { passive: true }); });
      var drawn = false, lastSeek = 0;
      var lost = false; c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      var paint = function (src) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.viewport(0, 0, c.width, c.height); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (v.__xa) { if (v.__xa.parentNode) v.__xa.parentNode.removeChild(v.__xa); v.__xa = null; }
        c.style.display = ''; v.classList.add('x-hid'); setAttr(document.documentElement, 'data-xalpha', ''); if (!drawn) { drawn = true; xlog('head drawn'); }
      };
      /* Low Power Mode lets no <video> play without a tap, but the browser can still decode the clip itself (WebCodecs): the
         frames (/extras/head/<id>.frames.bin: the packed clip, every frame a key frame, plus an index) are decoded here and painted
         in time, and any single frame can be shown at once, so the head also turns with the pointer */
      var GEN = 1e9, cd = null;
      var idx = function (t) { var ss = cd.meta.s, us = t * 1e6, lo = 0, hi = ss.length - 1; while (lo < hi) { var mi = (lo + hi + 1) >> 1; if (ss[mi][2] <= us) lo = mi; else hi = mi - 1; } return lo; };
      var codecGo = function (mode, t) {
        if (!cd) return; cd.pend = { mode: mode, t: t || 0 }; if (!cd.on) return;
        if (mode === 'scrub' && cd.mode === 'scrub') { cd.want = t || 0; return; }   /* following the pointer: just aim at the new frame */
        cd.gen++; cd.q.forEach(function (f) { f.close(); }); cd.q = []; cd.mode = mode; cd.ended = false; cd.t0 = 0; cd.loopN = 0;
        if (mode === 'play') cd.next = idx(t || 0); else { cd.want = t || 0; cd.sent = -1; }
      };
      v.__xcodec = function () {
        if (cd) return true;
        if (!('VideoDecoder' in window) || !('EncodedVideoChunk' in window)) return false;
        cd = { on: false, q: [], next: 0, loopN: 0, t0: 0, gen: 1, cur: 0, mode: 'play', cv: null };
        var base = '/extras/head/' + id + '.frames';
        Promise.all([fetch(base + '.json?v=2').then(function (r) { return r.json(); }), fetch(base + '.bin?v=2').then(function (r) { return r.arrayBuffer(); })]).then(function (a) {
          if (!cd) return;
          var meta = a[0], desc = Uint8Array.from(atob(meta.desc), function (ch) { return ch.charCodeAt(0); });
          var cfg = { codec: meta.codec, description: desc, codedWidth: meta.w, codedHeight: meta.h, optimizeForLatency: true };
          return VideoDecoder.isConfigSupported(cfg).then(function (sup) {
            if (!sup || !sup.supported || !cd) { xlog('head codec unsupported'); cd = null; headAnim(v, id); return; }
            cd.dec = new VideoDecoder({ output: function (f) { if (cd && Math.floor(f.timestamp / GEN) === cd.gen) cd.q.push(f); else f.close(); }, error: function (e) { xlog('head codec error ' + (e && e.message)); stopCodec(); headAnim(v, id); } });
            cd.dec.configure(cfg); cd.meta = meta; cd.bin = new Uint8Array(a[1]); cd.on = true; xlog('head codec on');
            var pd = cd.pend || (ctl ? { mode: 'scrub', t: proxyT } : { mode: 'play', t: 0 }); codecGo(pd.mode, pd.t);
          });
        }).catch(function (e) { xlog('head codec load failed ' + (e && e.message)); cd = null; headAnim(v, id); });
        return true;
      };
      var stopCodec = function () {
        if (!cd) return; var k = cd; cd = null;
        try { k.q.forEach(function (f) { f.close(); }); if (k.frame) k.frame.close(); if (k.dec && k.dec.state !== 'closed') k.dec.close(); } catch (er) {}
      };
      var show = function (f) {
        try { paint(f); }
        catch (er) {   /* this browser cannot hand a decoded frame to WebGL directly: go through a small 2D canvas */
          if (!cd.cv) { cd.cv = document.createElement('canvas'); cd.cv.width = f.displayWidth; cd.cv.height = f.displayHeight; cd.cx = cd.cv.getContext('2d'); }
          cd.cx.drawImage(f, 0, 0); paint(cd.cv);
        }
      };
      var chunk = function (sm, ts) { return new EncodedVideoChunk({ type: 'key', timestamp: ts, data: cd.bin.subarray(sm[0], sm[0] + sm[1]) }); };
      var codecFrame = function () {
        var m = cd.meta, d = cd.dec, base = cd.gen * GEN, f;
        if (cd.mode === 'scrub') {
          if (cd.want !== cd.sent && d.decodeQueueSize === 0) { cd.sent = cd.want; var k = idx(cd.want); d.decode(chunk(m.s[k], base + m.s[k][2])); }
          if (cd.q.length) { f = cd.q.pop(); cd.q.forEach(function (o) { o.close(); }); cd.q = []; cd.cur = (f.timestamp - base) / 1e6; show(f); if (cd.frame) cd.frame.close(); cd.frame = f; }
          return;
        }
        while (d.decodeQueueSize < 3 && cd.q.length < 5 && cd.next < m.s.length) {
          var sm = m.s[cd.next]; d.decode(chunk(sm, base + cd.loopN * m.dur + sm[2]));
          if (++cd.next >= m.s.length && v.loop) { cd.next = 0; cd.loopN++; }
        }
        var now = performance.now();
        if (!cd.t0 && cd.q.length) cd.t0 = now - (cd.q[0].timestamp - base) / 1000;
        var t = (now - cd.t0) * 1000 + base, fresh = false;
        if (cd.q.length && cd.q[0].timestamp < t - 400000) { cd.t0 = now - (cd.q[0].timestamp - base) / 1000; t = cd.q[0].timestamp; }   /* fell behind: carry on from here */
        while (cd.q.length && cd.q[0].timestamp <= t) { if (cd.frame) cd.frame.close(); cd.frame = cd.q.shift(); fresh = true; }
        if (fresh) { cd.cur = ((cd.frame.timestamp - base) % m.dur) / 1e6; show(cd.frame); }
        if (!v.loop && cd.next >= m.s.length && !cd.q.length && d.decodeQueueSize === 0 && !cd.ended) { cd.ended = true; try { v.dispatchEvent(new Event('ended')); v.dispatchEvent(new Event('pause')); } catch (er) {} }
      };
      /* Framer's video turns the head by setting currentTime from the pointer (and plays / pauses it): the hidden original
         <video> passes all of that on to the clip that is really shown (the packed video, or the decoded frames) */
      var ctl = false, proxyT = 0, lastT = -1;
      var take = function () { if (!ctl) { ctl = true; pv.loop = !!v.loop; } };
      try {
        Object.defineProperty(v, 'currentTime', { configurable: true, get: function () { return cd && cd.on ? (cd.mode === 'scrub' ? cd.want : cd.cur) : (pv.readyState ? pv.currentTime : proxyT); }, set: function (t) { take(); proxyT = +t || 0; if (cd) codecGo(cd.on && cd.mode === 'play' && !cd.ended ? 'play' : 'scrub', proxyT); else { try { pv.currentTime = proxyT; } catch (er) {} } } });
        Object.defineProperty(v, 'duration', { configurable: true, get: function () { return cd && cd.meta ? cd.meta.dur / 1e6 : pv.duration; } });
        Object.defineProperty(v, 'paused', { configurable: true, get: function () { return cd ? !(cd.mode === 'play' && !cd.ended) : pv.paused; } });
        Object.defineProperty(v, 'ended', { configurable: true, get: function () { return cd ? !!cd.ended : pv.ended; } });
        Object.defineProperty(v, 'readyState', { configurable: true, get: function () { return cd && cd.on ? 4 : pv.readyState; } });
        v.play = function () { if (cd) { codecGo('play', cd.ended ? 0 : cd.cur); return Promise.resolve(); } return pv.play(); };
        v.pause = function () { take(); if (cd) { codecGo('scrub', cd.cur); return; } pv.pause(); };
      } catch (er) {}
      var loop = function () {
        if (!c.isConnected || !v.isConnected) { stopCodec(); try { pv.pause(); pv.removeAttribute('src'); pv.load(); if (pv.parentNode) pv.parentNode.removeChild(pv); } catch (er) {} return; }
        requestAnimationFrame(loop);
        var vv = getComputedStyle(v).visibility; if (c.style.visibility !== vv) c.style.visibility = vv;   /* the canvas shows and hides with its clip */
        var vis = vv !== 'hidden' && document.visibilityState === 'visible';
        if (!vis) { if (!pv.paused && !ctl) pv.pause(); if (cd) cd.t0 = 0; return; }
        /* until Framer takes over (the pointer turns the head), the clip simply plays */
        if (!ctl && pv.paused && !pv.__tried) { pv.__tried = 1; setTimeout(function () { pv.__tried = 0; }, 1500); var pp = pv.play(); if (pp && pp.catch) pp.catch(function (er) { if (er && er.name === 'NotAllowedError') HEADLPM = true; xlog('head play refused ' + (er && er.name)); }); }
        if (lost) { v.classList.remove('x-hid'); return; }
        try {
          if (pv.readyState >= 2 && (!pv.paused || ctl && !cd)) {
            if (cd && !pv.paused) { stopCodec(); xlog('head: real video after a tap'); }
            if (!pv.paused || pv.currentTime !== lastT) { lastT = pv.currentTime; paint(pv); }
            return;
          }
          if (cd && cd.on) codecFrame();
        } catch (er) { v.classList.remove('x-hid'); if (!lost) { lost = true; xlog('head draw failed ' + er.message); } }
      };
      requestAnimationFrame(loop);
    } catch (er) { v.__xc = null; }
  }
  // the head clips as animated WebP with transparency (/extras/head/<id>.webp): shown when the phone plays no video (Low Power Mode)
  function headAnim(v, id) {
    if (v.__xa || !v.parentNode) return;
    var im = new Image(); v.__xa = im;
    im.className = 'x-hc x-hanim ' + v.className.replace(/\bx-hid\b/g, ''); im.alt = ''; im.decoding = 'async';
    im.style.cssText = v.style.cssText + ';position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block';
    im.onload = function () {
      if (!v.isConnected || v.__xa !== im) return;
      v.classList.add('x-hid'); if (v.__xc) v.__xc.style.display = 'none';
      setAttr(document.documentElement, 'data-xalpha', ''); xlog('head ' + id.slice(0, 6) + ' -> still picture until a tap');
    };
    im.src = '/extras/head/' + id + '-still.webp?v=1';
    v.parentNode.insertBefore(im, v.nextSibling);
    var sync = function () { if (!im.isConnected || !v.isConnected) { if (im.parentNode && !v.isConnected) im.parentNode.removeChild(im); return; } im.style.visibility = getComputedStyle(v).visibility; setTimeout(sync, 250); };
    sync();
  }
  // About: keep the copy of the page gradient behind the sticky block lined up with the page's own gradient (it spans the whole page)
  function aboutBg() {
    if (pageKey() !== 'about') return;
    var cs = document.querySelectorAll('[data-framer-name="Content"]'), H = document.documentElement.scrollHeight, i;
    for (i = 0; i < cs.length; i++) { var r = cs[i].getBoundingClientRect(); if (!r.width) continue; cs[i].style.setProperty('--xgh', H + 'px'); cs[i].style.setProperty('--xgy', (-(r.top + scrollY)).toFixed(1) + 'px'); }
  }
  var aboutBgRaf = 0;
  addEventListener('scroll', function () { if (!aboutBgRaf && pageKey() === 'about') aboutBgRaf = requestAnimationFrame(function () { aboutBgRaf = 0; aboutBg(); }); }, { passive: true });
  addEventListener('resize', function () { aboutBg(); });
  function aboutHead() {
    aboutBg();
    var vids = [], i, v, hero = null, heroes = document.querySelectorAll('[data-framer-name="Hero Video"]');
    for (i = 0; i < heroes.length; i++) if (heroes[i].getBoundingClientRect().width > 0) { hero = heroes[i]; break; }
    var all = document.querySelectorAll('[data-framer-name="Hero Video"] video');
    for (i = 0; i < all.length; i++) vids.push(all[i]);
    if (!hero || !vids.length) return;
    if (innerWidth <= 809 && hero.offsetHeight) {
      var W = innerWidth, H = innerHeight, frame = W * 9 / 16, top = hero.offsetTop, height = hero.offsetHeight;
      /* narrow screens, the same picture as on a wide one: a big head behind the text, which turns negative / positive over it */
      var Hw = Math.min(W * 0.9, 560), Ht = Hw / 0.79, sc = Math.max(1, Math.min(4.2, Ht / (0.92 * frame))), xc = W * 0.5, yc = Math.min(H * 0.6, H - 44 - Ht / 2);
      var originY = top + 0.47 * height, centre = top + height / 2, ty = (yc - originY) / sc - (centre - originY), tx = (xc - W / 2) / sc;
      document.documentElement.style.removeProperty('--xcw');
      var st = document.documentElement.style;
      st.setProperty('--xhs', sc.toFixed(3)); st.setProperty('--xhy', ty.toFixed(1) + 'px'); st.setProperty('--xhx', tx.toFixed(1) + 'px');
    }
    // the footage must keep playing: browsers on phones are strict about it (and reloading used to leave the head blank)
    for (i = 0; i < vids.length; i++) {
      v = vids[i];
      if (HEAD_ALPHA) { var hm = /assets\/([A-Za-z0-9_-]+)\.mp4/.exec(v.getAttribute('src') || ''); if (hm && HEAD_IDS.indexOf(hm[1]) > -1) { v.setAttribute('src', '/extras/head/' + hm[1] + '.webm?v=1'); v.__xk = 0; setAttr(document.documentElement, 'data-xalpha', ''); } }
      if (!HEAD_ALPHA) { var sm = /assets\/([A-Za-z0-9_-]+)\.mp4/.exec(v.getAttribute('src') || ''); if (sm && HEAD_IDS.indexOf(sm[1]) > -1) safariHead(v, sm[1]); else if (!v.__xl && !/\/extras\/head\//.test(v.getAttribute('src') || '')) { v.__xl = 1; xlog('head src not matched: ' + String(v.currentSrc || v.getAttribute('src')).slice(-60)); } }
      if (!v.__xk) {
        v.__xk = 1; v.disablePictureInPicture = true; v.disableRemotePlayback = true; v.muted = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.preload = 'auto';
      }
      var hid = /assets\/([A-Za-z0-9_-]+)\.mp4|\/extras\/head\/([A-Za-z0-9_-]+)\.webm/.exec(v.getAttribute('src') || ''), hidv = hid && (hid[1] || hid[2]);
      if (v.__xa && !v.__xpv && !v.paused && v.currentTime > 0.2) { if (v.__xa.parentNode) v.__xa.parentNode.removeChild(v.__xa); v.__xa = null; v.classList.remove('x-hid'); }
      if (v.__xpv && !v.__xcd && HEADLPM && getComputedStyle(v).visibility !== 'hidden') { v.__xcd = 1; if (v.__xcodec) v.__xcodec(); }
      if (v.__xpv && !v.__xa) { var tv = v.__xpv; if (!v.__xt0) v.__xt0 = performance.now(); else if (performance.now() - v.__xt0 > 2500 && tv.paused && tv.currentTime < 0.5 && getComputedStyle(v).visibility !== 'hidden' && document.visibilityState === 'visible') { if (!v.__xcd) { v.__xcd = 1; headAnim(v, v.__xid); if (v.__xcodec) v.__xcodec(); } } else if (performance.now() - v.__xt0 <= 2500) setTimeout(schedule, 2700); continue; }
      if (hidv && HEAD_IDS.indexOf(hidv) > -1 && !v.__xa) {
        if (!v.__xt0) v.__xt0 = performance.now();
        else if (performance.now() - v.__xt0 > 2500 && v.paused && v.currentTime < 0.5 && getComputedStyle(v).visibility !== 'hidden' && document.visibilityState === 'visible') headAnim(v, hidv);
        else if (performance.now() - v.__xt0 <= 2500) setTimeout(schedule, 2700);
      }
      if (v.paused && getComputedStyle(v).visibility !== 'hidden' && document.visibilityState === 'visible') { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }
  }
  (function () {
    var kick = function () { if (pageKey() === 'about') { var all = document.querySelectorAll('[data-framer-name="Hero Video"] video'); for (var i = 0; i < all.length; i++) if (getComputedStyle(all[i]).visibility !== 'hidden') { var p = all[i].play(); if (p && p.catch) p.catch(function () {}); } } };
    ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (t) { addEventListener(t, kick, { once: true, passive: true }); });
    document.addEventListener('visibilitychange', kick);
    // a reload keeps the scroll position, and on this page that can leave the head scrolled away: start from the top
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; if (pageKey() === 'about') scrollTo(0, 0); }
    } catch (e) {}
  })();

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
    if (p === 'about') aboutHead();
    if (p === 'home') {
      mobileHero();
      var ti = document.querySelectorAll('[data-framer-name="Info"] [data-framer-name="Title"] p');
      for (var tq = 0; tq < ti.length; tq++) if (ti[tq].textContent.trim() === 'Regular Studio') ti[tq].textContent = 'Martamon';
    }
    setupReel(p === 'home');
    setupDrifter(p === 'contact' ? 'swim' : 'walk');
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

    if (p === 'china' && m) ensureChina(m);
    upgradeEmbeds();
    if (p === 'schweppes' && m) ensureYoutube(m);
    else { removeAll('.x-yt'); if (p !== 'china') removeAll('.x-si'); unset('[data-xh]', 'data-xh'); unset('[data-xy]', 'data-xy'); }
  }

  // the face in the menu: on project pages Framer only scrolls to #hero, so go to the home page ourselves
  addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="#hero"],a[data-xf]');
    if (!a || !a.querySelector('img') || a.closest('main') || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (pageKey() === 'home') return;
    e.preventDefault(); e.stopImmediatePropagation();
    goPage(location.origin + '/');
  }, true);

  // the menu links (About, Contact, ...): same veil, then a normal page load
  addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-xn][href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || u.hash || u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    goPage(u.href);
  }, true);
  // coming back with the browser's back button must not show the veil again
  addEventListener('pageshow', function (e) { if (e.persisted) { var v = document.querySelectorAll('.x-tr'); for (var i = 0; i < v.length; i++) v[i].parentNode.removeChild(v[i]); } });

  // phones: the previous / next project links go on the tap itself (touchend). iOS sometimes turns the first tap on a link
  // with a hover effect into a hover only, and Framer's own hop to a CMS page can end on the home page
  (function () {
    var t0 = null;
    var target = function (a) {
      var h = a.getAttribute('href') || '';
      if (/coming-soon$/.test(h)) {
        var cur = location.pathname.replace(/\/+$/, '').split('/').pop(), next = /^\s*\u21b3/.test(a.textContent);
        var slug = cur === 'lexus-singapore' ? (next ? 'china' : 'soapglory') : cur === 'china' ? (next ? 'schweppes' : 'lexus-singapore') : '';
        return slug ? '/' + slug + '/' : '';
      }
      return /^\.\/[a-z0-9-]+$/.test(h) ? '/' + h.slice(2) + '/' : '';
    };
    addEventListener('touchstart', function (e) { var t = e.touches && e.touches[0]; t0 = t ? { x: t.clientX, y: t.clientY, at: Date.now() } : null; }, { passive: true, capture: true });
    addEventListener('touchend', function (e) {
      var a = e.target.closest && e.target.closest('a[data-xl],a[href$="coming-soon"]');
      if (!a || !t0) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t || Math.abs(t.clientX - t0.x) > 10 || Math.abs(t.clientY - t0.y) > 10 || Date.now() - t0.at > 700) return;
      var to = target(a); if (!to) return;
      xlog('touch go ' + to);
      e.preventDefault(); goPage(to);
    }, { passive: false, capture: true });
  })();

  // links rewritten by dropComingSoon: Framer's router would still go to its own (original) target
  addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-xl]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); e.stopImmediatePropagation();
    goPage(a.href);
  }, true);

  if (/[?&]xplanet\b/.test(location.search)) setTimeout(openPlanet, 1200);   // ?xplanet opens the planet at once (to share or test)

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
