// Under the sea of the ría de Muros e Noia: a scroll-driven dive through a soft turquoise 3D seabed, in the pastel, hand-painted look of the
// little planet. Text floats in the space itself, the camera glides from stop to stop (the ría's name, the wreck of the Cardenal Cisneros,
// the animals of the ría, a goodbye), and a calm underwater soundscape (hum, bubbles, soft chimes, a distant whale) goes with it.
import * as THREE from './three.module.min.js';
import { TOUR, getLang, tr } from './i18n.js?v=6';

const PI = Math.PI, LI = ['en', 'es', 'gl'];
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const noise = (x, z) => Math.sin(x * .35 + 1.3) * Math.cos(z * .28 - .4) * .6 + Math.sin(x * .9 + z * .7) * .22 + Math.sin(x * .17 - z * .13 + 2) * .8;
const rng = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
const SEA_Y = (x, z) => -5.3 + noise(x, z) * .55 + Math.sin(x * 2.2 + z * .4) * .04;      // the sand, with soft dunes and ripples

// ---------------------------------------------------------------- sound
function makeSound() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(), out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), nd = nb.getChannelData(0); { let l = 0; for (let i = 0; i < nd.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = l * 3.5; } }
  // a soft room of water: a short decaying noise as a reverb
  const ir = ctx.createBuffer(2, ctx.sampleRate * 2.8, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const wet = ctx.createGain(); wet.gain.value = .55; rev.connect(wet); wet.connect(out);
  const dry = ctx.createGain(); dry.gain.value = .8; dry.connect(out);
  const bus = ctx.createGain(); bus.connect(dry); bus.connect(rev);
  // the hum of deep water: brown noise through a slowly moving low-pass, with a low swell
  const hum = ctx.createBufferSource(); hum.buffer = nb; hum.loop = true; const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 340; hf.Q.value = .6; const hg = ctx.createGain(); hg.gain.value = .26;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .09; lg.gain.value = 120; lfo.connect(lg); lg.connect(hf.frequency); hum.connect(hf); hf.connect(hg); hg.connect(out); hum.start(); lfo.start();
  // a faint, higher shimmer of water
  const sh = ctx.createBufferSource(); sh.buffer = nb; sh.loop = true; sh.playbackRate.value = 1.7; const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1900; sf.Q.value = .5; const sg = ctx.createGain(); sg.gain.value = .02; sh.connect(sf); sf.connect(sg); sg.connect(out); sh.start();
  const note = (m, v, d, when) => { const t = (when || ctx.currentTime), f = 440 * Math.pow(2, (m - 69) / 12), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2.003; const g2 = ctx.createGain(); g2.gain.value = .12; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .05); g.gain.exponentialRampToValueAtTime(.0004, t + d); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + d + .1); o2.stop(t + d + .1); };
  const bubble = (vol) => { const t = ctx.currentTime, f = 380 + Math.random() * 700, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.6 + Math.random() * .6), t + .11); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0004, t + .15); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .2); };
  let alive = true, muted = false; const timers = [];
  const SC = [57, 60, 62, 64, 67, 69, 72, 76];            // a gentle pentatonic: whatever is chosen sounds calm
  const pad = () => { if (!alive || muted) return; const base = SC[Math.floor(Math.random() * 5)], n = 2 + Math.floor(Math.random() * 2); for (let k = 0; k < n; k++) note(SC[(SC.indexOf(base) + k * 2) % SC.length] + (k ? 0 : -12), .028, 4.5, ctx.currentTime + k * .5); };
  const bubbles = () => { if (!alive || muted) return; const n = 1 + Math.floor(Math.random() * 4); for (let k = 0; k < n; k++) setTimeout(() => alive && bubble(.02 + Math.random() * .02), k * (60 + Math.random() * 90)); timers.push(setTimeout(bubbles, 700 + Math.random() * 2300)); };
  const whale = () => { if (!alive) return; if (!muted) { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(210, t + 1.6); o.frequency.exponentialRampToValueAtTime(90, t + 4.2); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 1.4); g.gain.exponentialRampToValueAtTime(.0004, t + 5); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 5.2); } timers.push(setTimeout(whale, 20000 + Math.random() * 20000)); };
  const api = {
    start() { if (ctx.state === 'suspended') ctx.resume(); out.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, 1.8); pad(); timers.push(setInterval(pad, 5200)); bubbles(); timers.push(setTimeout(whale, 9000)); },
    mute(m) { muted = m; out.gain.setTargetAtTime(m ? 0 : .9, ctx.currentTime, .4); if (!m && ctx.state === 'suspended') ctx.resume(); },
    get muted() { return muted; },
    arrive(i) { if (muted) return; const r = [72, 76, 79, 84]; [0, 2, 4].forEach((q, k) => note(r[i % 4] - 12 + [0, 4, 7][k], .035, 3.4, ctx.currentTime + k * .11)); if (i === 1) setTimeout(() => !muted && note(81, .03, 5), 700); },         // a soft chime for each stop (and a sonar-like ping at the wreck)
    swim(v) { hg.gain.setTargetAtTime(.26 + Math.min(.16, v * 14), ctx.currentTime, .3); sg.gain.setTargetAtTime(.02 + Math.min(.05, v * 8), ctx.currentTime, .3); },
    stop() { alive = false; timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); out.gain.setTargetAtTime(0, ctx.currentTime, .4); setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1600); }
  };
  return api;
}

// ---------------------------------------------------------------- painted textures
let PAINT = null;
const paintTex = () => {
  if (PAINT) return PAINT; const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.fillStyle = '#f6f1e8'; g.fillRect(0, 0, N, N);
  let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  for (let i = 0; i < 24; i++) { const x = r() * N, y = r() * N, rad = 30 + r() * 60; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, `rgba(${r() < .5 ? '255,236,214' : '214,236,240'},.22)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); } }
  for (let i = 0; i < 90; i++) { const x = r() * N, y = r() * N, a = -.6 + (r() - .5) * .4, l = 20 + r() * 50; g.strokeStyle = `rgba(150,130,130,${.04 + r() * .05})`; g.lineWidth = 1 + r() * 2; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); } }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; PAINT = t; return t;
};
const PASTEL = (h) => { const c = new THREE.Color(h), hsl = {}; c.getHSL(hsl); hsl.s *= .96; hsl.l += (1 - hsl.l) * .12; return c.setHSL(hsl.h, hsl.s, hsl.l); };
const matCache = new Map();
const std = (color, extra) => { const k = extra ? null : color; if (k !== null && matCache.has(k)) return matCache.get(k); const m = new THREE.MeshStandardMaterial(Object.assign({ color: PASTEL(color), roughness: .95, map: paintTex() }, extra || {})); if (k !== null) matCache.set(k, m); return m; };
let OUT = null;
const outlineMat = () => OUT || (OUT = (() => { const m = new THREE.MeshBasicMaterial({ color: 0x2f5a66, side: THREE.BackSide }); m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * .016;'); }; return m; })());
const outline = (root) => { const list = []; root.traverse((o) => { if (o.isMesh && !o.userData.ol && !o.isInstancedMesh && o.material && !o.material.transparent && o.geometry && o.geometry.attributes.normal) list.push(o); }); for (const o of list) { const sh = new THREE.Mesh(o.geometry, outlineMat()); sh.userData.ol = 1; o.add(sh); } return root; };
const mesh = (geo, color, extra) => new THREE.Mesh(geo, std(color, extra));

// text on a plane in the scene, with a few darker copies behind it so it reads as thick, solid lettering
function textPlane(stop, lang, i) {
  const W = 1100, H = 640, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const k = stop.k[lang], h = stop.h[lang], p = stop.p[lang];
  const wrap = (txt, maxW, font) => { g.font = font; const words = txt.split(' '), lines = []; let ln = ''; for (const w of words) { const t = ln ? ln + ' ' + w : w; if (g.measureText(t).width > maxW && ln) { lines.push(ln); ln = w; } else ln = t; } if (ln) lines.push(ln); return lines; };
  const draw = (col, ox, oy, blur) => {
    g.save(); g.translate(ox, oy); g.fillStyle = col; g.shadowColor = blur ? 'rgba(20,90,110,.55)' : 'transparent'; g.shadowBlur = blur; g.textBaseline = 'top';
    g.font = '500 26px "IBM Plex Mono", ui-monospace, monospace'; g.letterSpacing = '3px'; g.fillText(k.toUpperCase(), 40, 40); g.letterSpacing = '0px';
    const hf = '700 78px "Switzer", "Inter Display", "Inter", system-ui, sans-serif', hl = wrap(h, W - 100, hf); g.font = hf; let y = 100; for (const l of hl) { g.fillText(l, 40, y); y += 88; }
    y += 18; const pf = '500 33px "Switzer", "Inter", system-ui, sans-serif', pl = wrap(p, W - 130, pf); g.font = pf; for (const l of pl) { g.fillText(l, 40, y); y += 47; }
    g.restore();
  };
  draw('rgba(28,98,118,.55)', 7, 7, 0); draw('rgba(45,120,140,.7)', 4, 4, 0); draw('#fff8ea', 0, 0, 18);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4 * H / W), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true, opacity: 0 }));
  m.renderOrder = 6; m.userData.stop = i; return m;
}

// ---------------------------------------------------------------- the animals
function fishGeo() { const g = new THREE.SphereGeometry(.5, 10, 8); g.scale(1, .52, .3); return g; }
function tailGeo() { const g = new THREE.ConeGeometry(.3, .5, 4); g.rotateZ(PI / 2); g.translate(-.62, 0, 0); g.scale(1, 1, .25); return g; }
function school(n, cx, cz, cy, rx, rz, cols, size, speed) {
  const bodyG = fishGeo(), tailG = tailGeo(), mat = std(0xffffff, { roughness: .6 }), grp = new THREE.Group();
  const bm = new THREE.InstancedMesh(bodyG, mat, n), tm = new THREE.InstancedMesh(tailG, mat, n); const c = new THREE.Color();
  const fish = []; for (let i = 0; i < n; i++) { fish.push({ a: rng() * 6.28, o: (rng() - .5) * 1.2, h: (rng() - .5) * 1.6, s: .8 + rng() * .5, p: rng() * 9 }); c.set(cols[i % cols.length]); c.offsetHSL(0, 0, (rng() - .5) * .06); bm.setColorAt(i, c); tm.setColorAt(i, c); }
  grp.add(bm, tm);
  const o = new THREE.Object3D(), t2 = new THREE.Object3D();
  grp.userData.update = (t) => {
    fish.forEach((f, i) => {
      const a = f.a + t * speed * f.s * .18, x = cx + Math.cos(a) * (rx + f.o), z = cz + Math.sin(a) * (rz + f.o * .6), y = cy + f.h + Math.sin(t * .8 + f.p) * .18;
      const dx = -Math.sin(a) * rx, dz = Math.cos(a) * rz, yaw = Math.atan2(-dz, dx);
      o.position.set(x, y, z); o.rotation.set(0, yaw, Math.sin(t * 6 + f.p) * .05); o.scale.setScalar(size * f.s); o.updateMatrix(); bm.setMatrixAt(i, o.matrix);
      t2.position.copy(o.position); t2.rotation.set(0, yaw + Math.sin(t * 11 + f.p) * .5, 0); t2.scale.setScalar(size * f.s); t2.updateMatrix(); tm.setMatrixAt(i, t2.matrix);
    });
    bm.instanceMatrix.needsUpdate = true; tm.instanceMatrix.needsUpdate = true;
  };
  return grp;
}
function dolphin() {
  const g = new THREE.Group(), sk = 0x9db3c8, bel = 0xf2ece4;
  const body = mesh(new THREE.SphereGeometry(.5, 14, 10), sk); body.scale.set(2.3, .62, .6); g.add(body);
  const belly = mesh(new THREE.SphereGeometry(.5, 12, 8), bel); belly.scale.set(2.1, .4, .5); belly.position.set(.04, -.12, 0); g.add(belly);
  const head = mesh(new THREE.SphereGeometry(.34, 12, 8), sk); head.scale.set(1.2, .8, .85); head.position.set(1.1, .02, 0); g.add(head);
  const beak = mesh(new THREE.ConeGeometry(.12, .5, 8), sk); beak.rotation.z = -PI / 2; beak.position.set(1.52, -.02, 0); g.add(beak);
  const dorsal = mesh(new THREE.ConeGeometry(.16, .42, 6), sk); dorsal.position.set(-.1, .45, 0); dorsal.rotation.z = .35; g.add(dorsal);
  for (const sz of [-1, 1]) { const fl = mesh(new THREE.ConeGeometry(.12, .5, 5), sk); fl.position.set(.75, -.28, sz * .32); fl.rotation.set(sz * .9, 0, .9); g.add(fl); }
  const tail = new THREE.Group(); tail.position.x = -1.1; g.add(tail);
  const peduncle = mesh(new THREE.ConeGeometry(.2, .9, 8), sk); peduncle.rotation.z = PI / 2; peduncle.position.x = -.3; tail.add(peduncle);
  const fluke = mesh(new THREE.SphereGeometry(.3, 8, 6), sk); fluke.scale.set(.35, .08, 1.2); fluke.position.x = -.78; tail.add(fluke);
  for (const sz of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(.035, 6, 5), 0x24323c); e.position.set(1.2, .1, sz * .24); g.add(e); }
  g.userData.tail = tail; outline(g); return g;
}
function jelly(col) {
  const g = new THREE.Group(), bell = new THREE.Mesh(new THREE.SphereGeometry(.5, 14, 8, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ color: PASTEL(col), transparent: true, opacity: .78, roughness: .5, emissive: PASTEL(col), emissiveIntensity: .22, side: THREE.DoubleSide })); g.add(bell);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.5, .035, 6, 20), new THREE.MeshStandardMaterial({ color: PASTEL(col), transparent: true, opacity: .9, emissive: PASTEL(col), emissiveIntensity: .3 })); rim.rotation.x = PI / 2; g.add(rim);
  const ten = []; for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.012, .006, 1, 4), new THREE.MeshStandardMaterial({ color: PASTEL(col), transparent: true, opacity: .7 })); const a = i / 7 * PI * 2; t.userData.a = a; t.position.set(Math.cos(a) * .34, -.5, Math.sin(a) * .34); g.add(t); ten.push(t); }
  g.userData.bell = bell; g.userData.ten = ten; g.userData.rim = rim; return g;
}
function octopus() {
  const g = new THREE.Group(), col = 0xe9937e, head = mesh(new THREE.SphereGeometry(.42, 12, 10), col); head.scale.set(1, 1.15, 1); head.position.y = .55; g.add(head);
  const arms = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2, arm = new THREE.Group(); arm.position.set(Math.cos(a) * .22, .3, Math.sin(a) * .22); arm.rotation.y = -a; let px = 0, py = 0, r = .15; const segs = []; for (let s = 0; s < 5; s++) { const sp = mesh(new THREE.SphereGeometry(r, 8, 6), col); sp.position.set(px, py, 0); arm.add(sp); segs.push(sp); px += r * 1.6; py -= (s < 1 ? .12 : .03); r *= .78; } arm.userData.segs = segs; arm.userData.ph = i * .8; g.add(arm); arms.push(arm); }
  for (const sz of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(.09, 8, 6), 0xfff6ea); e.position.set(.34, .62, sz * .17); g.add(e); const pu = mesh(new THREE.SphereGeometry(.045, 6, 5), 0x24323c); pu.position.set(.41, .62, sz * .17); g.add(pu); }
  g.userData.arms = arms; g.userData.head = head; outline(g); return g;
}
function crab() {
  const g = new THREE.Group(), col = 0xe47f5e, body = mesh(new THREE.SphereGeometry(.4, 12, 8), col); body.scale.set(1, .6, .85); body.position.y = .32; g.add(body);
  const legs = []; for (const sz of [-1, 1]) for (let i = 0; i < 4; i++) { const leg = mesh(new THREE.CylinderGeometry(.025, .018, .7, 5), col); leg.position.set(-.2 + i * .14, .28, sz * .42); leg.rotation.x = sz * 1.0; leg.userData.sz = sz; leg.userData.i = i; g.add(leg); legs.push(leg); }
  const claws = []; for (const sz of [-1, 1]) { const arm = mesh(new THREE.CylinderGeometry(.04, .03, .5, 5), col); arm.position.set(.42, .36, sz * .32); arm.rotation.set(sz * .7, 0, -1.0); g.add(arm); const cl = mesh(new THREE.SphereGeometry(.14, 8, 6), col); cl.scale.set(1.3, .8, .8); cl.position.set(.64, .5, sz * .52); g.add(cl); claws.push(cl); }
  for (const sz of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(.05, 6, 5), 0x24323c); e.position.set(.34, .52, sz * .14); g.add(e); }
  g.userData.legs = legs; g.userData.claws = claws; g.scale.setScalar(.9); outline(g); return g;
}
function seahorse() {
  const g = new THREE.Group(), col = 0xf2c466; let y = 0;
  for (let i = 0; i < 7; i++) { const s = mesh(new THREE.SphereGeometry(.13 - i * .008, 8, 6), col); s.position.set(Math.sin(i * .5) * .05, y, 0); s.scale.set(.9, 1.1, .8); g.add(s); y += .16; }
  const head = mesh(new THREE.SphereGeometry(.13, 8, 6), col); head.position.set(.05, y + .06, 0); g.add(head); const snout = mesh(new THREE.CylinderGeometry(.03, .04, .22, 6), col); snout.rotation.z = -PI / 2; snout.position.set(.21, y + .05, 0); g.add(snout);
  let cx = 0, cy = -.05, r = .1; for (let i = 0; i < 6; i++) { const t = mesh(new THREE.SphereGeometry(r, 6, 5), col); const a = i * .6; cx = -Math.sin(a) * .12 - .02; cy = -.08 - i * .06 + Math.cos(a) * .02; t.position.set(-.05 + cx * .6, cy, 0); g.add(t); r *= .82; }
  const e = mesh(new THREE.SphereGeometry(.03, 6, 5), 0x24323c); e.position.set(.12, y + .1, .1); g.add(e); const e2 = e.clone(); e2.position.z = -.1; g.add(e2);
  g.scale.setScalar(1.15); outline(g); return g;
}
function starfish(col) {
  const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2 - PI / 2, r = i % 2 ? .13 : .34; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: .07, bevelEnabled: true, bevelSize: .035, bevelThickness: .035, bevelSegments: 2 }); g.rotateX(-PI / 2); return mesh(g, col);
}

// the wreck of the Cardenal Cisneros: an old armoured cruiser lying on its side, worn and covered in sea life
function wreck() {
  const g = new THREE.Group(), hullC = 0x7f93a6, rust = 0xc58467, deck = 0xb99b7a, red = 0xd0875f, dark = 0x34414c;
  const sh = new THREE.Shape(); const L = 9.5, Wd = 1.5; sh.moveTo(-L / 2, -Wd * .55); sh.lineTo(-L / 2 + .6, -Wd); sh.lineTo(L / 2 - 2.6, -Wd); sh.quadraticCurveTo(L / 2 - .5, -Wd * .55, L / 2 + .4, 0); sh.quadraticCurveTo(L / 2 - .5, Wd * .55, L / 2 - 2.6, Wd); sh.lineTo(-L / 2 + .6, Wd); sh.lineTo(-L / 2, Wd * .55); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: true, bevelSize: .09, bevelThickness: .09, bevelSegments: 2, curveSegments: 10 }); hg.rotateX(-PI / 2);
  const hull = mesh(hg, hullC); g.add(hull);
  const band = mesh(new THREE.BoxGeometry(L * .92, .16, Wd * 2.02), rust); band.position.set(-.1, .25, 0); g.add(band);
  const dk = mesh(new THREE.BoxGeometry(L * .86, .1, Wd * 1.8), deck); dk.position.set(-.1, 1.1, 0); g.add(dk);
  for (let i = 0; i < 12; i++) for (const sz of [-1, 1]) { const ph = mesh(new THREE.CylinderGeometry(.07, .07, .05, 8), dark); ph.rotation.x = PI / 2; ph.position.set(-3.6 + i * .64, .62, sz * (Wd + .13)); g.add(ph); }
  const bridge = mesh(new THREE.BoxGeometry(1.7, .8, 1.5), 0xd9cdb8); bridge.position.set(1.6, 1.55, 0); g.add(bridge);
  const bridge2 = mesh(new THREE.BoxGeometry(1.2, .55, 1.1), 0xcdbfa6); bridge2.position.set(1.6, 2.2, 0); g.add(bridge2);
  for (const [x, tilt, h] of [[-.4, .12, 1.7], [-2.1, -.55, 1.5]]) { const f = mesh(new THREE.CylinderGeometry(.42, .5, h, 12), red); f.position.set(x, 1.1 + h / 2 - (tilt < -.3 ? .15 : 0), 0); f.rotation.z = tilt; g.add(f); const top = mesh(new THREE.CylinderGeometry(.43, .43, .2, 12), dark); top.position.set(x + Math.sin(-tilt) * (h / 2), 1.1 + h - (tilt < -.3 ? .15 : 0), 0); top.rotation.z = tilt; g.add(top); }
  for (const [x, h, lean] of [[2.9, 3.4, -.1], [-3.1, 2.4, -.7]]) { const m = mesh(new THREE.CylinderGeometry(.045, .07, h, 6), 0x8f7455); m.position.set(x + Math.sin(-lean) * h / 2, 1.1 + Math.cos(lean) * h / 2, 0); m.rotation.z = lean; g.add(m); const yd = mesh(new THREE.CylinderGeometry(.03, .03, 1.5, 5), 0x8f7455); yd.rotation.x = PI / 2; yd.position.set(x + Math.sin(-lean) * h * .75, 1.1 + Math.cos(lean) * h * .75, 0); g.add(yd); }
  for (const x of [3.5, -2.9]) { const tu = mesh(new THREE.CylinderGeometry(.5, .56, .4, 12), 0x8b97a3); tu.position.set(x, 1.3, 0); g.add(tu); for (const sz of [-.1, .1]) { const bar = mesh(new THREE.CylinderGeometry(.06, .06, 1.1, 7), dark); bar.rotation.z = PI / 2; bar.position.set(x + .75 * (x > 0 ? 1 : -1) * .9, 1.4, sz); g.add(bar); } }
  const rail = mesh(new THREE.BoxGeometry(L * .8, .05, .05), 0x9aa6b0); rail.position.set(-.1, 1.45, Wd * .86); g.add(rail); const rail2 = rail.clone(); rail2.position.z = -Wd * .86; g.add(rail2);
  // a broken gash in the side, and what grew on the old ship
  const gash = mesh(new THREE.BoxGeometry(1.1, .55, .1), dark); gash.position.set(1.0, .55, Wd + .1); g.add(gash);
  const grow = [0x5faf8f, 0x7cc59a, 0xe4879a, 0xf0a870, 0xb69be0];
  for (let i = 0; i < 46; i++) { const c = mesh(new THREE.IcosahedronGeometry(.1 + rng() * .2, 1), grow[i % grow.length], { flatShading: true }); c.position.set((rng() - .5) * L * .9, 1.15 + rng() * .18 - (i % 3 === 0 ? .55 : 0), (rng() - .5) * Wd * 2.1); c.scale.y = .6 + rng() * .6; g.add(c); }
  outline(g); g.userData.hullL = L; return g;
}

// ---------------------------------------------------------------- the dive
export function open(opts) {
  opts = opts || {};
  const lang = Math.max(0, LI.indexOf(getLang()));
  const root = document.createElement('div'); root.className = 'x-ab';
  root.innerHTML = '<canvas class="x-ab-cv"></canvas><div class="x-ab-top"><div class="x-ab-t"><b>Ría de Muros e Noia</b><span>' + tr('Under the sea') + '</span></div><div class="x-ab-btns"><button type="button" class="x-ab-mu" aria-label="' + tr('Sound') + '"></button><button type="button" class="x-ab-x" aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<div class="x-ab-dots"></div><div class="x-ab-hint"><span>' + tr('Scroll to dive') + '</span><i></i></div><button type="button" class="x-ab-back">' + tr('Back to the map') + '</button>';
  document.body.appendChild(root);
  const css = document.createElement('style'); css.textContent = [
    '.x-ab{position:fixed;inset:0;z-index:95;background:#7cc9d2;opacity:0;transition:opacity 1.1s ease;color:#fff8ea;font:500 13px/1.45 "Switzer","Switzer Placeholder",system-ui,sans-serif;overscroll-behavior:contain;touch-action:none;user-select:none;-webkit-user-select:none}',
    '.x-ab.x-in{opacity:1}.x-ab-cv{position:absolute;inset:0;width:100%;height:100%;display:block}',
    '.x-ab-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:18px;pointer-events:none}.x-ab-top>*{pointer-events:auto}',
    '.x-ab-t b{display:block;font-size:17px;font-weight:700;letter-spacing:-.01em;text-shadow:0 1px 10px rgba(20,100,120,.5)}.x-ab-t span{font-size:12px;opacity:.85;text-shadow:0 1px 8px rgba(20,100,120,.5)}',
    '.x-ab-btns{display:flex;gap:10px}.x-ab-btns button{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,252,246,.82);color:#2f5a66;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .3s cubic-bezier(.3,1.5,.5,1),background .2s}.x-ab-btns button:hover{transform:scale(1.08);background:#fff}',
    '.x-ab-dots{position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px}.x-ab-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,248,234,.45);transition:transform .4s,background .4s}.x-ab-dots i.x-on{background:#fff8ea;transform:scale(1.5)}',
    '.x-ab-hint{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;font:500 11px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;text-shadow:0 1px 8px rgba(20,100,120,.6);transition:opacity .8s;pointer-events:none}',
    '.x-ab-hint i{width:7px;height:7px;border-right:1.5px solid #fff8ea;border-bottom:1.5px solid #fff8ea;transform:rotate(45deg);animation:x-ab-nudge 1.5s ease-in-out infinite}@keyframes x-ab-nudge{50%{transform:translateY(6px) rotate(45deg)}}.x-ab.x-moved .x-ab-hint{opacity:0}',
    '.x-ab-back{position:absolute;left:50%;bottom:62px;transform:translate(-50%,16px);padding:18px 38px;border:0;border-radius:20px;background:rgba(255,253,248,.95);color:#2f5a66;font:500 14px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .8s,transform .8s cubic-bezier(.22,.8,.24,1),box-shadow .3s;box-shadow:0 12px 34px rgba(20,90,110,.3)}',
    '.x-ab.x-end .x-ab-back{opacity:1;pointer-events:auto;transform:translate(-50%,0)}.x-ab-back:hover{box-shadow:0 14px 40px rgba(20,90,110,.45)}'
  ].join('\n'); root.appendChild(css);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('x-in')));
  const cv = root.querySelector('.x-ab-cv');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { root.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), BG = new THREE.Color(0x76c7d0); scene.background = BG; scene.fog = new THREE.FogExp2(0x76c7d0, .042);
  const camera = new THREE.PerspectiveCamera(52, 1, .1, 160);
  scene.add(new THREE.HemisphereLight(0xe6fbff, 0x4fa0aa, 1.55)); const sun = new THREE.DirectionalLight(0xfff0cf, 2.1); sun.position.set(5, 14, 6); scene.add(sun);

  // ---- the path of the dive
  const camPts = [[0, -1.7, 9], [-.6, -1.9, -2], [-2.2, -2.5, -12], [-4.0, -3.0, -22], [-3.8, -3.1, -31], [-1.2, -2.7, -41], [1.2, -2.3, -51], [0, -2.0, -62]].map((a) => new THREE.Vector3(...a));
  const lookPts = [[1.2, -1.9, -2], [1.5, -2.0, -12], [.8, -2.6, -22], [3.2, -4.3, -32], [2.8, -3.8, -39], [1.5, -3.0, -50], [0, -2.4, -60], [0, -2.2, -72]].map((a) => new THREE.Vector3(...a));
  const camC = new THREE.CatmullRomCurve3(camPts), lookC = new THREE.CatmullRomCurve3(lookPts);
  const STOPS = [.03, .42, .72, 1];

  // ---- the seabed
  const SX = 70, SZ = 150, geo = new THREE.PlaneGeometry(SX, SZ, 110, 230); geo.rotateX(-PI / 2); const pp = geo.attributes.position, col = new Float32Array(pp.count * 3), tmp = new THREE.Color();
  for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = pp.getZ(i) - 50; pp.setXYZ(i, x, SEA_Y(x, z), z); const n = hash(Math.round(x * 3), Math.round(z * 3)); tmp.set(0xf0d9ae).lerp(new THREE.Color(0xe4c7a0), noise(x * .7, z * .7) * .5 + .5).lerp(new THREE.Color(0xb9d5c4), sstep(8, 24, Math.abs(x)) * .55).offsetHSL(0, 0, (n - .5) * .02); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const tex = paintTex().clone(); tex.repeat.set(14, 30); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.needsUpdate = true;
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: tex, roughness: 1 })));
  const ground = (x, z) => SEA_Y(x, z);
  // rocks
  const rockG = new THREE.IcosahedronGeometry(1, 1); { const ps = rockG.attributes.position; for (let q = 0; q < ps.count; q++) { const x = ps.getX(q), y = ps.getY(q), z = ps.getZ(q), k = 1 + (hash(x * 9.1 + y * 3, z * 7.7) - .5) * .35; ps.setXYZ(q, x * k, y * k * .75, z * k); } rockG.computeVertexNormals(); }
  const rocks = new THREE.InstancedMesh(rockG, std(0xffffff, { flatShading: true }), 120), ro = new THREE.Object3D(), rc = new THREE.Color();
  for (let i = 0; i < 120; i++) { const x = (rng() - .5) * 60, z = -rng() * 130 + 12; if (Math.abs(x) < 3.2 && z > -75) { i--; continue; } const s = .3 + rng() * rng() * 1.8; ro.position.set(x, ground(x, z) + s * .15, z); ro.rotation.set(rng(), rng() * 6, rng() * .4); ro.scale.set(s, s * (.6 + rng() * .5), s); ro.updateMatrix(); rocks.setMatrixAt(i, ro.matrix); rc.set([0xb8aab8, 0xa9b7bd, 0xc9b9a6, 0x9fb0b4][i % 4]); rocks.setColorAt(i, rc); }
  scene.add(rocks);
  // kelp, swaying
  const kelpG = new THREE.CylinderGeometry(.025, .09, 1, 5, 7); kelpG.translate(0, .5, 0);
  const kuni = { uTime: { value: 0 } };
  const kelpM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, map: paintTex() }); kelpM.onBeforeCompile = (sh) => { sh.uniforms.uTime = kuni.uTime; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float ph = instanceMatrix[3].x * .7 + instanceMatrix[3].z * .5; transformed.x += sin(uTime * 1.1 + ph + position.y * 2.2) * position.y * position.y * .35; transformed.z += cos(uTime * .9 + ph * 1.3 + position.y * 1.8) * position.y * position.y * .25;'); };
  const NK = 200, kelp = new THREE.InstancedMesh(kelpG, kelpM, NK), kc = new THREE.Color(); const KC = [0x56ad8a, 0x6fc29a, 0x4a9f86, 0x8bcf9c, 0xd88aa0];
  for (let i = 0; i < NK; i++) { const x = (rng() - .5) * 56, z = -rng() * 130 + 12; if (Math.abs(x) < 1.8 && z > -75) { i--; continue; } const h = 1.2 + rng() * 2.8; ro.position.set(x, ground(x, z) - .1, z); ro.rotation.set(0, rng() * 6, 0); ro.scale.set(1, h, 1); ro.updateMatrix(); kelp.setMatrixAt(i, ro.matrix); kc.set(KC[i % KC.length]); kelp.setColorAt(i, kc); }
  scene.add(kelp);
  // corals
  const cG = new THREE.ConeGeometry(.16, .9, 6), corals = new THREE.InstancedMesh(cG, std(0xffffff, { flatShading: true }), 260), cc = new THREE.Color(); const CC = [0xf0959c, 0xf4b36e, 0xc5a0e8, 0xf7d27a, 0xe97f8e];
  for (let i = 0; i < 260; i++) { const base = Math.floor(i / 5), bx = (hash(base, 3) - .5) * 52, bz = 12 - hash(base, 8) * 130; if (Math.abs(bx) < 2.4 && bz > -75) { corals.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0)); continue; } const x = bx + (rng() - .5) * 1.1, z = bz + (rng() - .5) * 1.1, s = .5 + rng() * 1.1; ro.position.set(x, ground(x, z) + .1 * s, z); ro.rotation.set((rng() - .5) * .8, rng() * 6, (rng() - .5) * .8); ro.scale.set(s, s * (.7 + rng() * .7), s); ro.updateMatrix(); corals.setMatrixAt(i, ro.matrix); cc.set(CC[base % CC.length]); cc.offsetHSL(0, 0, (rng() - .5) * .06); corals.setColorAt(i, cc); }
  scene.add(corals);
  // starfish
  const stars = []; for (let i = 0; i < 16; i++) { const x = (rng() - .5) * 30, z = -rng() * 80 + 4; if (Math.abs(x) < 1.5) continue; const s = starfish([0xf2956e, 0xf4c26e, 0xe97f9a, 0xc9a2e8][i % 4]); s.position.set(x, ground(x, z) + .02, z); s.rotation.y = rng() * 6; s.scale.setScalar(.7 + rng() * .6); outline(s); scene.add(s); stars.push(s); }

  // ---- the wreck, put where the camera looks at it
  const wl = lookC.getPoint(STOPS[1]), W = wreck(); W.position.set(wl.x + 1.5, ground(wl.x + 1.5, wl.z) + .55, wl.z); W.rotation.set(.05, -.5, -.42); scene.add(W);
  { const dg = new THREE.Mesh(new THREE.CylinderGeometry(.2, 2.3, 24, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3c9, transparent: true, opacity: .09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); dg.position.set(W.position.x, W.position.y + 9.5, W.position.z); scene.add(dg); }
  // ---- animals
  const animals = [];
  const sardines = [school(46, 5.5, -10, -2.0, 3.2, 3.0, [0xdfe9ef, 0xcfe0ea, 0xe9eef2], .34, .9), school(30, 6.5, -24, -2.8, 3.0, 2.6, [0xf1c27a, 0xe9b46a, 0xf4d08c], .42, .7), school(50, 5, -45, -2.4, 3.4, 3.2, [0xdfe9ef, 0xbcd8e4, 0xcfe0ea], .34, .85), school(8, -6.5, -50, -2.2, 2.6, 2.2, [0xf29a7c, 0xf4b08c], .62, .5)]; sardines.forEach((s) => { scene.add(s); animals.push(s); });
  const dolphins = [dolphin(), dolphin()]; const dc = lookC.getPoint(STOPS[2]); dolphins.forEach((d, i) => { d.scale.setScalar(.78 - i * .12); d.userData.i = i; scene.add(d); });
  const jellies = []; [[4.5, -2.2, -6, 0xf3b7d6], [-4, -1.4, -15, 0xcbb4f0], [5, -2.6, -22, 0xf7c9a3], [-5.5, -2, -36, 0xf3b7d6], [4, -1.8, -47, 0xcbb4f0], [-3, -1.5, -56, 0xf7c9a3]].forEach(([x, y, z, c], i) => { const j = jelly(c); j.position.set(x, y, z); j.userData.base = [x, y, z]; j.userData.ph = i * 1.7; j.scale.setScalar(.8 + (i % 3) * .25); scene.add(j); jellies.push(j); });
  const oct = octopus(); { const ox = W.position.x - 3.6, oz = W.position.z + 1.8; oct.position.set(ox, ground(ox, oz) - .05, oz); oct.rotation.y = -.9; oct.scale.setScalar(.9); scene.add(oct); }
  const crb = crab(); { const cx0 = dc.x - 2.5, cz0 = dc.z + 1; crb.position.set(cx0, ground(cx0, cz0) - .05, cz0); crb.userData.c = [cx0, cz0]; scene.add(crb); }
  const sea = seahorse(); { const sx = dc.x + 1.8, sz = dc.z + 2; sea.position.set(sx, ground(sx, sz) + 1.1, sz); sea.userData.b = [sx, sz]; scene.add(sea); const kk = new THREE.Mesh(new THREE.CylinderGeometry(.025, .05, 2.2, 5), std(0x4a9f86)); kk.position.set(sx - .2, ground(sx, sz) + 1.0, sz); scene.add(kk); }
  // light shafts, bubbles and drifting specks follow the camera
  const shafts = new THREE.Group(); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.15 + rng() * .3, 1.6 + rng(), 26, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3c9, transparent: true, opacity: .03 + rng() * .025, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set((rng() - .5) * 18, 8, -rng() * 22); m.rotation.z = .12 + (rng() - .5) * .12; m.userData.p = rng() * 9; shafts.add(m); } scene.add(shafts);
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const mkPts = (n, size, op) => { const g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (rng() - .5) * 26; a[i * 3 + 1] = (rng() - .5) * 12; a[i * 3 + 2] = (rng() - .5) * 26; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: dotTex, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, color: 0xffffff })); p.frustumCulled = false; return p; };
  const bubbles = mkPts(160, .22, .5), specks = mkPts(380, .06, .5); scene.add(bubbles, specks);

  // ---- the words
  const planes = TOUR.map((s, i) => { const m = textPlane(s, lang, i); const cp = camC.getPoint(STOPS[i]), lp = lookC.getPoint(STOPS[i]), fwd = lp.clone().sub(cp).normalize(); m.userData.cp = cp; m.userData.fwd = fwd; m.userData.right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(); m.userData.side = i === 1 ? -1 : (i === 3 ? 0 : 1); scene.add(m); return m; });
  const layout = () => {                                          // beside the way on a wide screen, in the middle and smaller on a phone
    const portrait = innerWidth / innerHeight < .9;
    planes.forEach((m, i) => { const u = m.userData, d = portrait ? 4.6 : 5.6, side = portrait ? 0 : u.side * 1.35, sc = portrait ? .6 : 1;
      m.scale.setScalar(sc); m.position.copy(u.cp).addScaledVector(u.fwd, d).addScaledVector(u.right, side).add(new THREE.Vector3(0, portrait ? 1.0 : (i === 3 ? .5 : .15), 0)); u.base = m.position.clone(); m.lookAt(u.cp); m.rotation.y += portrait ? 0 : u.side * -.16; });
  };
  layout();
  const dots = root.querySelector('.x-ab-dots'); TOUR.forEach(() => dots.appendChild(document.createElement('i')));

  // ---- sound, input and loop
  const snd = makeSound(); const muBtn = root.querySelector('.x-ab-mu');
  const paintMu = () => { const m = snd && snd.muted; muBtn.innerHTML = m ? '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'; };
  paintMu(); muBtn.addEventListener('click', () => { if (snd) { snd.mute(!snd.muted); paintMu(); } }); if (snd) snd.start();
  let target = 0, prog = 0, closed = false, raf = 0, last = performance.now(), idle = 0, at = -1, mx = 0, my = 0;
  const bump = (d) => { target = Math.max(0, Math.min(1, target + d)); idle = 0; root.classList.add('x-moved'); };
  const onWheel = (e) => { e.preventDefault(); bump(e.deltaY * (e.deltaMode ? .03 : .00032)); };
  let ty = null; const onTS = (e) => { ty = e.touches[0].clientY; }, onTM = (e) => { if (ty === null) return; const y = e.touches[0].clientY; bump((ty - y) * .0016); ty = y; e.preventDefault(); }, onTE = () => { ty = null; };
  const onKey = (e) => { if (e.key === 'Escape') { close(); } else if (/^(ArrowDown|PageDown| |ArrowRight)$/.test(e.key)) bump(.05); else if (/^(ArrowUp|PageUp|ArrowLeft)$/.test(e.key)) bump(-.05); else return; e.preventDefault(); e.stopPropagation(); };
  const onMove = (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
  root.addEventListener('wheel', onWheel, { passive: false }); root.addEventListener('touchstart', onTS, { passive: true }); root.addEventListener('touchmove', onTM, { passive: false }); root.addEventListener('touchend', onTE); addEventListener('keydown', onKey, true); addEventListener('pointermove', onMove);
  const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 66 : 52; camera.updateProjectionMatrix(); if (typeof layout === 'function' && typeof planes !== 'undefined') layout(); }; size(); addEventListener('resize', size);
  const fogA = new THREE.Color(0x7ccfd6), fogB = new THREE.Color(0x58a9c4), cp0 = new THREE.Vector3(), lp0 = new THREE.Vector3(), cr = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const t0 = performance.now();
  const frame = (now) => {
    if (closed) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000; idle += dt;
    if (idle > 1.3) { let best = 1, bd = 9; for (const s of STOPS) { const d = Math.abs(target - s); if (d < bd) { bd = d; best = s; } } if (bd < .07) target += (best - target) * Math.min(1, dt * 1.2); }        // after a pause it settles gently on the nearest stop
    const before = prog; prog += (target - prog) * (1 - Math.exp(-dt * 2.4)); const vel = Math.abs(prog - before) / Math.max(dt, .001); if (snd) snd.swim(vel);
    camC.getPoint(prog, cp0); lookC.getPoint(prog, lp0);
    camera.position.copy(cp0).add(new THREE.Vector3(Math.sin(t * .5) * .08, Math.sin(t * .7) * .1, 0)); cr.copy(lp0).sub(cp0).normalize(); camera.lookAt(lp0);
    camera.rotateY(-mx * .22); camera.rotateX(-my * .12); camera.rotateZ(Math.sin(t * .4) * .012);
    scene.fog.color.copy(fogA).lerp(fogB, sstep(.35, 1, prog)); BG.copy(scene.fog.color); scene.fog.density = .04 + .012 * sstep(.3, 1, prog);
    kuni.uTime.value = t;
    for (const s of sardines) s.userData.update(t);
    dolphins.forEach((d, i) => { const a = t * (.22 - i * .03) + i * 2.4, rx = 11, rz = 7, cx = dc.x, cz = dc.z - 2; d.position.set(cx + Math.cos(a) * rx, -2.4 + Math.sin(a * 2 + i) * .9, cz + Math.sin(a) * rz); const dx = -Math.sin(a) * rx, dz = Math.cos(a) * rz; d.rotation.set(0, Math.atan2(-dz, dx), Math.cos(a * 2 + i) * .25); d.userData.tail.rotation.z = Math.sin(t * 3.4 + i) * .35; });
    jellies.forEach((j) => { const u = j.userData, p = t * .6 + u.ph, pulse = Math.sin(p * 2.2); j.position.y = u.base[1] + Math.sin(p) * .6; j.position.x = u.base[0] + Math.sin(p * .4) * .5; u.bell.scale.set(1 - pulse * .1, 1 + pulse * .16, 1 - pulse * .1); u.ten.forEach((tn, k) => { tn.rotation.z = Math.sin(p * 2 + k) * .18; tn.rotation.x = Math.cos(p * 1.7 + k) * .18; tn.scale.y = 1 + pulse * .1; }); });
    oct.userData.arms.forEach((arm) => { const segs = arm.userData.segs; segs.forEach((s, k) => { s.position.y = -k * .04 + Math.sin(t * 1.4 + arm.userData.ph + k * .7) * .06 * k; s.position.z = Math.cos(t * 1.1 + arm.userData.ph + k * .6) * .07 * k; }); });
    oct.userData.head.scale.y = 1.15 + Math.sin(t * 1.5) * .03;
    { const u = crb.userData, cx = u.c[0] + Math.sin(t * .18) * 2.4; crb.position.x = cx; crb.position.y = ground(cx, crb.position.z) - .05; crb.rotation.y = Math.cos(t * .18) > 0 ? 0 : PI; u.legs.forEach((l) => { l.rotation.z = Math.sin(t * 7 + l.userData.i * 1.3 + (l.userData.sz > 0 ? PI : 0)) * .25; }); u.claws.forEach((c, k) => { c.position.y = .5 + Math.sin(t * 1.3 + k * 2) * .05; }); }
    sea.position.y = ground(sea.userData.b[0], sea.userData.b[1]) + 1.1 + Math.sin(t * 1.2) * .12; sea.rotation.z = Math.sin(t * .9) * .06; sea.rotation.y = Math.sin(t * .35) * .5;
    shafts.children.forEach((m) => { m.rotation.z = .12 + Math.sin(t * .2 + m.userData.p) * .05; m.material.opacity = .028 + .02 * (Math.sin(t * .5 + m.userData.p) * .5 + .5); });
    shafts.position.set(camera.position.x, 0, camera.position.z - 6);
    for (const pts of [bubbles, specks]) { pts.position.set(camera.position.x, camera.position.y, camera.position.z - 6); if (pts === bubbles) { const a = pts.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (.35 + hash(i, 4) * .6); if (y > 6) y = -6; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t + i) * .002); } a.needsUpdate = true; } else pts.rotation.y = t * .01; }
    // the words: each fades in as the camera comes up to it, drifts a little, and turns towards you
    let cur = 0, cd = 9; planes.forEach((m, i) => { const d = Math.abs(prog - STOPS[i]); if (d < cd) { cd = d; cur = i; } const dist = camera.position.distanceTo(m.userData.base), a = (1 - sstep(5.5, 10.5, dist)) * sstep(1.6, 3.4, dist); m.material.opacity += (a - m.material.opacity) * Math.min(1, dt * 5); m.position.copy(m.userData.base); m.position.y += Math.sin(t * .6 + i) * .06; m.position.x += Math.sin(t * .4 + i * 2) * .04; m.visible = m.material.opacity > .01; });
    if (cur !== at && cd < .06) { at = cur; if (snd) snd.arrive(cur); dots.childNodes.forEach((d, i) => d.classList.toggle('x-on', i === cur)); }
    root.classList.toggle('x-end', prog > .93);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  function close() {
    if (closed) return; closed = true; cancelAnimationFrame(raf);
    removeEventListener('keydown', onKey, true); removeEventListener('resize', size); removeEventListener('pointermove', onMove);
    if (snd) snd.stop(); root.classList.remove('x-in');
    setTimeout(() => { try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); root.remove(); }, 1200);
    opts.onClose && opts.onClose();
  }
  root.querySelector('.x-ab-x').addEventListener('click', close); root.querySelector('.x-ab-back').addEventListener('click', close);
  return { close, get sound() { return snd; } };
}
