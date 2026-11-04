// About: the head that used to be a video is now a cut-out turntable with a transparent background.
// 84 frames of one full turn (no backdrop, edges cleaned) are blended into each other, so it turns exactly as the video did (a full turn every 14 s, looping),
// it sits straight on the page colour (day and night) and it can be grabbed and turned by hand.
const N = 84, FW = 562, FH = 518, CW = 960, CH = 540, OX = 202, OY = 23, TURN = 14.04;   // seconds per turn, as in the footage
let frames = null;
const load = () => frames || (frames = Promise.all(Array.from({ length: N }, (_, i) => new Promise((ok) => {
  const im = new Image(); im.decoding = 'async'; im.onload = () => { if (self.createImageBitmap) createImageBitmap(im).then(ok, () => ok(im)); else ok(im); }; im.onerror = () => ok(null);   // kept as decoded bitmaps: the browser never has to decode a frame again while it turns
  im.src = '/extras/head/h' + String(i).padStart(2, '0') + '.webp?v=2';
}))));

export function mount(cv) {
  const ctx = cv.getContext('2d', { alpha: true }); let ang = 0, last = 0, vis = true, raf = 0, shown = '', imgs = null;
  const fade = ctx.createLinearGradient(0, 0, 0, CH); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(.09, '#000'); fade.addColorStop(.78, '#000'); fade.addColorStop(1, 'rgba(0,0,0,0)');   // the soft top and foot, drawn into the picture itself
  const draw = () => {
    const f = (((ang / 360) % 1) + 1) % 1 * N, i = Math.floor(f) % N, k = f - Math.floor(f), a = imgs[i], b = imgs[(i + 1) % N];
    const key = i + ':' + k.toFixed(3); if (key === shown || !a) return; shown = key;
    ctx.clearRect(0, 0, CW, CH); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1 - k; ctx.drawImage(a, OX, OY, FW, FH);
    if (b && k > .002) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k; ctx.drawImage(b, OX, OY, FW, FH); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = fade; ctx.fillRect(0, 0, CW, CH); ctx.globalCompositeOperation = 'source-over';
  };
  const tick = (now) => {
    raf = 0; if (!cv.isConnected) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (vis && cv.offsetWidth > 0 && document.visibilityState === 'visible') {
      ang += 360 / TURN * dt;                                                                      // the same turn as the video: one full turn every 14 s, on a loop
      draw();
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (vis) start(); }).observe(cv);
  document.addEventListener('visibilitychange', start);
  load().then((l) => { imgs = l; cv.classList.add('x-on'); start(); });
}
