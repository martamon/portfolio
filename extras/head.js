// About: the head that used to be a video is now a cut-out turntable with a transparent background.
// 84 frames of one full turn (no backdrop, edges cleaned) are blended into each other, so it turns as smoothly as the video did,
// it sits straight on the page colour (day and night) and it can be grabbed and turned by hand.
const N = 84, FW = 562, FH = 518, CW = 960, CH = 540, OX = 202, OY = 23, TURN = 14.04;   // seconds per turn, as in the footage
let frames = null;
const load = () => frames || (frames = Promise.all(Array.from({ length: N }, (_, i) => new Promise((ok) => {
  const im = new Image(); im.decoding = 'async'; im.onload = () => ok(im); im.onerror = () => ok(null);
  im.src = '/extras/head/h' + String(i).padStart(2, '0') + '.webp?v=1';
}))));

export function mount(cv) {
  const ctx = cv.getContext('2d'); let ang = 0, vel = 0, drag = null, last = 0, vis = true, raf = 0, shown = '', imgs = null;
  const base = 360 / TURN;                                      // degrees per second, auto turn
  const draw = () => {
    const f = (((ang / 360) % 1) + 1) % 1 * N, i = Math.floor(f) % N, k = f - Math.floor(f), a = imgs[i], b = imgs[(i + 1) % N];
    const key = i + ':' + k.toFixed(3); if (key === shown || !a) return; shown = key;
    ctx.clearRect(0, 0, CW, CH); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1 - k; ctx.drawImage(a, OX, OY, FW, FH);
    if (b && k > .002) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k; ctx.drawImage(b, OX, OY, FW, FH); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
  const tick = (now) => {
    raf = 0; if (!cv.isConnected) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (vis && cv.offsetWidth > 0 && document.visibilityState === 'visible') {
      if (drag) vel *= Math.exp(-dt * 12); else vel += (base - vel) * (1 - Math.exp(-dt * 1.6));      // after a drag the turn glides back to its own pace
      if (!drag) ang += vel * dt;
      draw();
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) start(); }).observe(cv);
  document.addEventListener('visibilitychange', start);
  // grab it: horizontal drags turn it (a vertical swipe still scrolls the page)
  const hero = cv.closest('[data-framer-name="Hero Video"]') || cv.parentNode;
  hero.style.touchAction = 'pan-y';
  hero.addEventListener('pointerdown', (e) => { if (e.target.closest('a,button')) return; drag = { x: e.clientX, id: e.pointerId, ang0: ang, t: performance.now(), px: e.clientX }; });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, now = performance.now();
    ang = drag.ang0 - dx * .45; const dtm = Math.max(8, now - drag.t); vel = -(e.clientX - drag.px) * .45 / dtm * 1000 * .5 + vel * .5; drag.t = now; drag.px = e.clientX;
  });
  const up = (e) => { if (drag && e.pointerId === drag.id) { drag = null; vel = Math.max(-420, Math.min(420, vel)); } };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  load().then((l) => { imgs = l; cv.classList.add('x-on'); start(); });
}
