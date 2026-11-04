// A drive along the coast of the ría de Muros e Noia: a tiny, very cute car on a Galician road in the soft low-poly "summer afternoon" look.
// Arrow keys (or the buttons on a phone) drive it anywhere: through the villages (O Freixo, Esteiro, Outes, Muros, Louro), over the grass and
// into the sea, where the world turns turquoise and the car keeps rolling along the seabed, past fish and an old wreck. Glowing orbs hold
// information about the ría; press E (or tap the button) next to one to read it.
import * as THREE from './three.module.min.js';
import { INFO, getLang, tr } from './i18n.js?v=8';

const PI = Math.PI, LI = ['en', 'es', 'gl'];
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const noise = (x, z) => Math.sin(x * .35 + 1.3) * Math.cos(z * .28 - .4) * .6 + Math.sin(x * .9 + z * .7) * .22 + Math.sin(x * .17 - z * .13 + 2) * .8;
const rng = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

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
// a soft, felted finish on everything: a fine fibre bump and a velvet sheen
let FELT = null; const feltTexD = () => { if (FELT) return FELT; const N = 192, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, N, N); let sd = 3; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; for (let i = 0; i < 1500; i++) { const x = r() * N, y = r() * N, a = r() * 6.28, l = 3 + r() * 6, v = r() < .5 ? 20 : 235; g.strokeStyle = `rgba(${v},${v},${v},${.16 + r() * .2})`; g.lineWidth = .8 + r() * .8; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); } } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; FELT = t; return t; };
const matCache = new Map();
const std = (color, extra) => { const k = extra ? null : color; if (k !== null && matCache.has(k)) return matCache.get(k); const base = PASTEL(color), m = new THREE.MeshPhysicalMaterial(Object.assign({ color: base, roughness: .95, map: paintTex(), bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenRoughness: .55, sheenColor: base.clone().lerp(new THREE.Color(0xfff3e4), .6) }, extra || {})); if (k !== null) matCache.set(k, m); return m; };
let OUT = null;
const outlineMat = () => OUT || (OUT = (() => { const m = new THREE.MeshBasicMaterial({ color: 0x2f5a66, side: THREE.BackSide }); m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * .016;'); }; return m; })());
const outline = (root) => { const list = []; root.traverse((o) => { if (o.isMesh && !o.userData.ol && !o.isInstancedMesh && o.material && !o.material.transparent && o.geometry && o.geometry.attributes.normal) list.push(o); }); for (const o of list) { const sh = new THREE.Mesh(o.geometry, outlineMat()); sh.userData.ol = 1; o.add(sh); } return root; };
const mesh = (geo, color, extra) => new THREE.Mesh(geo, std(color, extra));

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


// ---------------------------------------------------------------- the land and the sea
const COAST = (z) => 40 + 13 * Math.sin(z * .045 + 1) + 6 * Math.sin(z * .115);          // where the ría begins
const ROADX = (z) => COAST(z) - 18 + 3 * Math.sin(z * .09);                                // the coast road runs along it, inland of the beach
const ROADH = (z) => 1.1 + Math.sin(z * .03) * .45;
const VILLAGES = [['O Freixo', -66], ['Esteiro', -34], ['Outes', -2], ['Muros', 30], ['Louro', 62]];
const FLATS = VILLAGES.map(([, z]) => [ROADX(z) - 9, z, 21, ROADH(z)]);
function H(x, z) {
  const c = COAST(z), hills = sstep(c - 24, c - 70, x) * (3.2 + noise(x * .5 + 9, z * .4) * 1.6) + noise(x * .6, z * .6) * .35 * (1 + sstep(c - 20, c - 60, x) * 2);
  let h = ROADH(z) + hills; const k = sstep(c - 4, c + 5, x);
  const bz = sstep(44, 54, z) * (1 - sstep(78, 88, z)); h += Math.exp(-Math.pow(x - (c - 11), 2) / 34) * bz * (1.7 + noise(x * .3, z * .3) * .6) * (1 - k);                     // the dunes behind the beach of Area Maior
  h = h * (1 - k) + (-5.4 + noise(x * .4, z * .4) * .45 + sstep(c + 3, c + 40, x) * -2.2) * k;
  const rx = ROADX(z), dr = Math.abs(x - rx); h += (ROADH(z) - h) * sstep(9, 3.2, dr) * (1 - k);
  for (const f of FLATS) { const d = Math.hypot(x - f[0], z - f[1]); if (d < f[2] * 1.6) h += (f[3] - h) * (1 - sstep(f[2] * .7, f[2] * 1.6, d)) * (1 - k); }
  return h;
}

// ---------------------------------------------------------------- the car
function rbox(w, h, d, r) {
  const g = new THREE.BoxGeometry(w, h, d, 5, 5, 5), p = g.attributes.position, v = new THREE.Vector3(), lim = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.copy(v).clamp(new THREE.Vector3(-lim.x, -lim.y, -lim.z), lim); v.sub(c); if (v.lengthSq() > 1e-10) v.normalize().multiplyScalar(r); p.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z); }
  g.computeVertexNormals(); return g;
}
function buildCar() {
  const g = new THREE.Group(), body = 0xf6cf68, cream = 0xfff3dc, dark = 0x3a3f4a, coral = 0xf0907a;
  const m = (geo, col, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.castShadow = true; return o; };
  const lower = m(rbox(3.5, 1.0, 2.1, .42), body); lower.position.set(0, .85, 0); g.add(lower);
  const cab = m(rbox(1.95, 1.0, 1.85, .45), body); cab.position.set(-.25, 1.62, 0); g.add(cab);
  const roof = m(rbox(1.9, .22, 1.75, .1), cream); roof.position.set(-.25, 2.12, 0); g.add(roof);
  const glass = m(rbox(2.0, .6, 1.9, .28), 0x8bc3d6, { roughness: .25, metalness: .1 }); glass.position.set(-.25, 1.62, 0); glass.scale.set(1.0, 1, .96); g.add(glass);
  const pill = m(rbox(1.55, .45, 1.93, .2), cream); pill.position.set(-.25, 1.62, 0); pill.scale.set(.2, 1, 1); g.add(pill);                     // the post between the windows
  for (const sz of [-1, 1]) {
    const hl = m(new THREE.SphereGeometry(.34, 14, 10), cream, { emissive: 0xffeaa0, emissiveIntensity: .25 }); hl.scale.set(.55, 1, 1); hl.position.set(1.72, .95, sz * .68); g.add(hl);
    const pu = m(new THREE.SphereGeometry(.14, 10, 8), dark); pu.scale.set(.5, 1, 1); pu.position.set(1.88, .95, sz * .68); g.add(pu);
    const ck = m(new THREE.SphereGeometry(.2, 10, 8), 0xf7a9a6); ck.scale.set(.35, .7, 1); ck.position.set(1.7, .6, sz * .95); g.add(ck);
    const tl = m(new THREE.SphereGeometry(.2, 10, 8), coral); tl.scale.set(.5, .9, 1); tl.position.set(-1.72, .95, sz * .75); g.add(tl);
    const mir = m(new THREE.SphereGeometry(.17, 8, 6), body); mir.position.set(.6, 1.45, sz * 1.1); g.add(mir);
  }
  const bump = m(rbox(.4, .32, 1.8, .14), cream); bump.position.set(1.8, .45, 0); g.add(bump); const bump2 = bump.clone(); bump2.position.x = -1.8; g.add(bump2);
  const wheels = [];
  for (const [wx, wz] of [[1.15, 1.02], [1.15, -1.02], [-1.15, 1.02], [-1.15, -1.02]]) {
    const w = new THREE.Group(); w.position.set(wx, .52, wz); const tire = m(new THREE.CylinderGeometry(.52, .52, .46, 16), dark); tire.rotation.x = PI / 2; w.add(tire); const hub = m(new THREE.CylinderGeometry(.27, .27, .5, 12), cream); hub.rotation.x = PI / 2; w.add(hub); const cap = m(new THREE.CylinderGeometry(.1, .1, .54, 8), coral); cap.rotation.x = PI / 2; w.add(cap); g.add(w); wheels.push(w);
  }
  const flower = m(new THREE.SphereGeometry(.12, 8, 6), 0xf59ab8); flower.position.set(.3, 2.34, .5); g.add(flower);       // a little flower on the roof
  const stem = m(new THREE.CylinderGeometry(.02, .02, .2, 5), 0x5fae8a); stem.position.set(.3, 2.22, .5); g.add(stem);
  g.userData.wheels = wheels; return g;
}

// ---------------------------------------------------------------- buildings
const WALLS = [0xd9aeb0, 0xe9cbb6, 0xf3e4ca, 0xcaa3a8, 0xe7c1b0, 0xf1ddc2, 0xd4b2b8, 0xc9c0b0];
const ROOFS = [0xe36d57, 0xd95f4e, 0xea866c, 0xcb5a4e, 0xe5785e];
const WINM = new THREE.MeshStandardMaterial({ color: 0x5d7488, roughness: .35, emissive: 0xffc46b, emissiveIntensity: 0 });          // the windows light up at night
function houseMesh(w, d, floors, wall, roof, stone) {
  const g = new THREE.Group(), fh = 2.6, bh = floors * fh;
  const add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(rbox(w, bh, d, .18), stone ? 0xbdb6a6 : wall, 0, bh / 2, 0);
  // a gabled roof: a prism that overhangs a little
  const rh = Math.min(2.6, d * .42), sh = new THREE.Shape(); sh.moveTo(-d / 2 - .5, 0); sh.lineTo(0, rh); sh.lineTo(d / 2 + .5, 0); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 1.0, bevelEnabled: false }); rg.translate(0, 0, -(w + 1.0) / 2); rg.rotateY(PI / 2);
  add(rg, roof, 0, bh - .05, 0);
  add(rbox(.7, 1.7, .7, .1), stone ? 0x9d978a : 0xe9dcc2, w * .25, bh + rh * .55, -d * .15);
  for (let f = 0; f < floors; f++) {                                                        // long dark window bands with pale mullions, and a door
    const y = f * fh + fh * .62, bands = f === 0 ? [[-w * .27, w * .32], [w * .27, w * .32]] : [[0, w * .8]];
    for (const [bx, bw] of bands) { const wm = new THREE.Mesh(new THREE.BoxGeometry(bw, fh * .36, .12), WINM); wm.position.set(bx, y, d / 2 + .02); g.add(wm); const nm = Math.max(1, Math.round(bw / 1.2)); for (let q = 0; q <= nm; q++) add(new THREE.BoxGeometry(.1, fh * .42, .16), 0xf6efe0, bx - bw / 2 + q * bw / nm, y, d / 2 + .04); }
  }
  add(rbox(.95, 1.8, .2, .06), 0x8a5a44, 0, .9, d / 2 + .06); add(new THREE.BoxGeometry(1.5, .12, .7), roof, 0, 2.0, d / 2 + .3).rotation.x = .2;
  g.userData.r = Math.max(w, d) * .5 + .8; g.userData.hx = w / 2 + .35; g.userData.hz = d / 2 + .35; return g;
}
// a traditional Galician hórreo: a long, narrow granary of wooden slats raised on granite pillars with flat "rat-stopper" caps, a tiled roof, a cross and stone steps
function horreo() {
  const g = new THREE.Group(), L = 7, Wd = 1.7, gran = 0xbab3a3, wood = 0xa5835c;
  const add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  for (const x of [-L * .4, -L * .13, L * .13, L * .4]) for (const z of [-Wd * .36, Wd * .36]) { add(rbox(.46, 1.45, .46, .08), gran, x, .72, z); add(rbox(1.0, .16, 1.0, .05), 0xcfc8b8, x, 1.55, z); }       // the pillars (pés) and their flat caps (tornarratos)
  add(rbox(L, .2, Wd, .06), 0x8d6f4d, 0, 1.72, 0);
  add(new THREE.BoxGeometry(L * .96, 1.1, Wd * .86), 0x4a3828, 0, 2.38, 0);
  for (const sz of [-1, 1]) for (let q = 0; q < 21; q++) add(new THREE.BoxGeometry(.2, 1.12, .08), wood, -L * .46 + q * (L * .92 / 20), 2.38, sz * Wd * .44);
  for (const sx of [-1, 1]) for (let q = 0; q < 5; q++) add(new THREE.BoxGeometry(.08, 1.12, .2), wood, sx * L * .48, 2.38, -Wd * .34 + q * Wd * .17);
  const sh = new THREE.Shape(); sh.moveTo(-Wd / 2 - .5, 0); sh.lineTo(0, 1.0); sh.lineTo(Wd / 2 + .5, 0); sh.closePath(); const rg = new THREE.ExtrudeGeometry(sh, { depth: L + .9, bevelEnabled: false }); rg.translate(0, 0, -(L + .9) / 2); rg.rotateY(PI / 2); add(rg, 0xc9674f, 0, 2.9, 0);
  add(new THREE.BoxGeometry(L + .95, .14, .3), 0xb9553f, 0, 3.92, 0);
  for (const sx of [-1, 1]) { add(new THREE.BoxGeometry(.14, .75, .14), gran, sx * (L / 2 + .3), 4.2, 0); add(new THREE.BoxGeometry(.5, .14, .14), gran, sx * (L / 2 + .3), 4.4, 0); }       // a stone cross at each end of the ridge
  add(new THREE.BoxGeometry(.06, 1.0, .7), 0x3a2c1f, L / 2 + .02, 2.3, 0);
  for (let q = 0; q < 5; q++) { const h = .34 * (q + 1); add(new THREE.BoxGeometry(.6, h, 1.0), gran, L / 2 + .55 + (4 - q) * .6, h / 2, 0); }       // stone steps up to the door
  g.userData.hx = L / 2 + 3.6; g.userData.hz = Wd / 2 + .6; g.userData.r = 5; return g;
}
// a cruceiro: the stone cross on steps that stands in the middle of Galician crossroads and squares
function cruceiro() {
  const g = new THREE.Group(), gran = 0xcfc8b8, add = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(rbox(3.2, .35, 3.2, .06), 0xbdb6a6, 0, .17, 0); add(rbox(2.4, .35, 2.4, .06), gran, 0, .52, 0); add(rbox(1.6, .35, 1.6, .06), 0xbdb6a6, 0, .87, 0);
  add(new THREE.CylinderGeometry(.38, .46, .7, 8), gran, 0, 1.4, 0); add(new THREE.CylinderGeometry(.2, .27, 3.4, 8), gran, 0, 3.4, 0);
  add(rbox(.75, .24, .75, .05), 0xbdb6a6, 0, 5.15, 0); add(new THREE.BoxGeometry(.3, 1.9, .26), gran, 0, 6.2, 0); add(new THREE.BoxGeometry(1.4, .3, .26), gran, 0, 6.65, 0);
  add(new THREE.SphereGeometry(.2, 8, 6), 0xe0d9c8, 0, 6.5, .2); add(new THREE.BoxGeometry(.18, .7, .1), 0xe0d9c8, 0, 6.05, .2);
  g.userData.r = 2.3; return g;
}
function fonte() {
  const g = new THREE.Group(), gran = 0xcfc8b8, add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.CylinderGeometry(2.5, 2.7, .8, 20), gran, 0, .4, 0); const wt = add(new THREE.CylinderGeometry(2.25, 2.25, .1, 20), 0x74cfdb, 0, .78, 0, { transparent: true, opacity: .85, roughness: .2 }); wt.castShadow = false;
  add(new THREE.CylinderGeometry(.34, .44, 2.3, 8), gran, 0, 1.6, 0); add(new THREE.CylinderGeometry(1.0, .5, .4, 12), gran, 0, 2.7, 0); add(new THREE.SphereGeometry(.32, 8, 6), gran, 0, 3.05, 0);
  g.userData.r = 3.2; return g;
}
function person(shirt, skin) {
  const g = new THREE.Group(), m = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const body = m(new THREE.IcosahedronGeometry(.5, 2), shirt, 0, .95, 0); body.scale.set(1, 1.15, .9);
  for (const sz of [-1, 1]) { m(new THREE.IcosahedronGeometry(.2, 1), 0x3a4a63, .05, .22, sz * .22).scale.set(1.3, .8, 1); const arm = m(new THREE.IcosahedronGeometry(.17, 1), skin, 0, .95, sz * .5); arm.userData.arm = sz; }
  m(new THREE.IcosahedronGeometry(.4, 2), skin, 0, 1.85, 0);
  for (const sz of [-1, 1]) { m(new THREE.IcosahedronGeometry(.05, 1), 0x2b2530, .36, 1.9, sz * .14); m(new THREE.IcosahedronGeometry(.07, 1), 0xf08a8a, .33, 1.76, sz * .26).scale.set(.5, .8, 1); }
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 6, 0, PI * 2, 0, PI * .55), std([0x4a3326, 0x2b2530, 0xb5651d, 0xe0b45a, 0x7a4a2a][Math.floor(rng() * 5)])); hair.position.set(-.03, 1.9, 0); hair.rotation.z = .1; g.add(hair);
  return g;
}
// small pictures for the information cards (pastel drawings, labelled in the language of the visitor)
function artFor(id, lang) {
  const T = (a) => a[lang], bg = '<rect width="340" height="190" rx="18" fill="#eef6f4"/>';
  if (id === 0) { const pts = [...Array(5)].map((_, k) => { const a = -PI / 2 + k * PI * 2 / 5; return [170 + Math.cos(a) * 66, 100 + Math.sin(a) * 66]; }), names = ['Muros', 'Outes', 'Noia', 'Lousame', 'Porto do Son'], star = [...Array(10)].map((_, k) => { const a = -PI / 2 + k * PI / 5, r = k % 2 ? 26 : 70; return (170 + Math.cos(a) * r).toFixed(1) + ',' + (100 + Math.sin(a) * r).toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 340 190">' + bg + '<polygon points="' + star + '" fill="#8fd3dd" stroke="#5fb4c4" stroke-width="3" stroke-linejoin="round"/>' + pts.map((q, k) => '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="6" fill="#e36d57"/><text x="' + (q[0] + (k === 0 ? 0 : k < 3 ? 12 : -12)).toFixed(1) + '" y="' + (q[1] + (k === 0 ? -12 : 4)).toFixed(1) + '" font-size="12" font-weight="600" fill="#4a3340" text-anchor="' + (k === 0 ? 'middle' : k < 3 ? 'start' : 'end') + '" font-family="system-ui,sans-serif">' + names[k] + '</text>').join('') + '<text x="170" y="104" font-size="11" font-weight="700" fill="#2f6f80" text-anchor="middle" font-family="system-ui,sans-serif">A Ría da Estrela</text></svg>'; }
  if (id === 5) return '<svg viewBox="0 0 340 190">' + '<rect width="340" height="190" rx="18" fill="#cfe9f4"/><circle cx="270" cy="46" r="22" fill="#ffe9a8"/><path d="M0 120 Q60 70 120 100 T250 92 T340 110 V190 H0Z" fill="#f2d9a8"/><path d="M0 150 Q80 128 170 146 T340 140 V190 H0Z" fill="#e9c98f"/><path d="M0 168 Q60 156 120 166 T240 164 T340 166 V190 H0Z" fill="#74cfdb"/><path d="M0 178 Q50 170 110 177 T230 176 T340 178 V190 H0Z" fill="#9fe0e8"/><path d="M62 104 l16 -18 l16 18z" fill="#c8b8a6"/><text x="170" y="30" font-size="15" font-weight="700" fill="#4a3340" text-anchor="middle" font-family="system-ui,sans-serif">Area Maior</text></svg>';
  if (id === 6) { const L = { roof: ['Roof', 'Tejado', 'Tellado'], body: ['Slatted body', 'Cuerpo de listones', 'Corpo de listóns'], caps: ['Rat-stoppers', 'Tornarratos', 'Tornarratos'], pil: ['Pillars', 'Pilares', 'Pés'], cross: ['Cross', 'Cruz', 'Cruz'] };
    return '<svg viewBox="0 0 340 190">' + bg + '<polygon points="64,66 170,38 276,66" fill="#c9674f"/><rect x="74" y="66" width="192" height="42" fill="#a5835c"/>' + [...Array(13)].map((_, k) => '<rect x="' + (78 + k * 14.6) + '" y="68" width="5" height="38" fill="#c9a57a"/>').join('') + '<rect x="70" y="108" width="200" height="8" fill="#8d6f4d"/>' + [92, 138, 202, 248].map((x) => '<rect x="' + (x - 7) + '" y="124" width="14" height="44" fill="#bab3a3"/><rect x="' + (x - 13) + '" y="116" width="26" height="8" fill="#d8d1c1"/>').join('') + '<rect x="268" y="40" width="5" height="22" fill="#bab3a3"/><rect x="262" y="46" width="17" height="5" fill="#bab3a3"/>' + [[20, 'roof', 150, 54, 120, 50], [20, 'body', 150, 88, 100, 86], [20, 'caps', 150, 120, 80, 120], [20, 'pil', 150, 146, 92, 146]].map(([, k, x, y, ax, ay]) => '').join('') +
      '<g font-size="11" font-weight="600" fill="#4a3340" font-family="system-ui,sans-serif"><text x="12" y="30">' + T(L.roof) + '</text><line x1="14" y1="34" x2="110" y2="55" stroke="#4a3340" stroke-width="1"/><text x="12" y="86">' + T(L.body) + '</text><line x1="14" y1="90" x2="72" y2="90" stroke="#4a3340" stroke-width="1"/><text x="12" y="150">' + T(L.pil) + '</text><line x1="14" y1="146" x2="85" y2="146" stroke="#4a3340" stroke-width="1"/><text x="328" y="120" text-anchor="end">' + T(L.caps) + '</text><line x1="200" y1="120" x2="260" y2="120" stroke="#4a3340" stroke-width="1"/><text x="328" y="30" text-anchor="end">' + T(L.cross) + '</text><line x1="270" y1="34" x2="270" y2="42" stroke="#4a3340" stroke-width="1"/></g></svg>'; }
  if (id === 8) return '<svg viewBox="0 0 340 190"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9e6ee"/><stop offset="1" stop-color="#4fa5b8"/></linearGradient></defs><rect width="340" height="190" rx="18" fill="url(#sg)"/><path d="M0 40 Q40 32 85 40 T170 40 T255 40 T340 40" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M0 160 Q70 146 140 158 T340 150 V190 H0Z" fill="#f0d9ae"/><g transform="translate(150,108) rotate(-18)"><path d="M-70 0 L-58 14 H52 L78 -4 L52 -10 H-60Z" fill="#7f93a6"/><rect x="-30" y="-24" width="18" height="16" fill="#d9cdb8"/><rect x="-4" y="-34" width="9" height="26" fill="#d0875f"/><rect x="22" y="-28" width="9" height="20" fill="#d0875f"/><rect x="40" y="-36" width="2" height="26" fill="#8f7455"/></g><path d="M226 158 l14 -22 l12 10 l10 -14 l16 26z" fill="#9d978a"/><text x="170" y="22" font-size="14" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif" style="paint-order:stroke;stroke:#2f7f94;stroke-width:3">Cardenal Cisneros · 1905</text></svg>';
  return '';
}

function church() {
  const g = new THREE.Group(), st = 0xc7bfae;
  const add = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(rbox(6, 6, 11, .2), st, 0, 3, 0); add(rbox(3, 11, 3, .2), st, 0, 5.5, -5.6);
  const sh = new THREE.Shape(); sh.moveTo(-3.3, 0); sh.lineTo(0, 2.6); sh.lineTo(3.3, 0); sh.closePath(); const rg = new THREE.ExtrudeGeometry(sh, { depth: 11.4, bevelEnabled: false }); rg.translate(0, 0, -5.7); add(rg, 0xd95f4e, 0, 6, 0);
  add(new THREE.ConeGeometry(2.3, 2.8, 4), 0xd95f4e, 0, 12.4, -5.6).rotation.y = PI / 4; add(new THREE.BoxGeometry(.2, 1.2, .2), 0x4a4540, 0, 14.4, -5.6); add(new THREE.BoxGeometry(.7, .2, .2), 0x4a4540, 0, 14.5, -5.6);
  add(new THREE.BoxGeometry(1.6, 2.6, .2), 0x7a5a44, 0, 1.3, 5.55); add(new THREE.BoxGeometry(.9, 2.2, .2), 0x4f6b82, -1.8, 3.6, 5.55); add(new THREE.BoxGeometry(.9, 2.2, .2), 0x4f6b82, 1.8, 3.6, 5.55);
  g.userData.r = 7.5; return g;
}
function signPost(name) {
  const g = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const c = cv.getContext('2d');
  c.fillStyle = '#fbf3df'; c.beginPath(); c.roundRect ? c.roundRect(6, 6, 500, 148, 34) : c.rect(6, 6, 500, 148); c.fill(); c.lineWidth = 8; c.strokeStyle = '#e36d57'; c.stroke();
  c.fillStyle = '#4a3340'; c.font = '700 70px "Switzer","Inter",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, 256, 84);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), new THREE.MeshStandardMaterial({ map: t, roughness: .9, side: THREE.DoubleSide })); board.position.y = 3.1; board.castShadow = true; g.add(board);
  for (const sx of [-1.7, 1.7]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 3.2, 6), std(0x8a6a4c)); p.position.set(sx, 1.6, -.05); p.castShadow = true; g.add(p); }
  return g;
}

// ---------------------------------------------------------------- sound
function makeSound() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(), out = ctx.createGain(); out.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 18000; out.connect(lp); lp.connect(ctx.destination);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), nd = nb.getChannelData(0); { let l = 0; for (let i = 0; i < nd.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = l * 3.5; } }
  const ir = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.8); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const wet = ctx.createGain(); wet.gain.value = .4; rev.connect(wet); wet.connect(out); const bus = ctx.createGain(); bus.connect(out); bus.connect(rev);
  const sea = ctx.createBufferSource(); sea.buffer = nb; sea.loop = true; const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 700; sf.Q.value = .4; const sg = ctx.createGain(); sg.gain.value = 0; sea.connect(sf); sf.connect(sg); sg.connect(out); sea.start();
  const sl = ctx.createOscillator(), slg = ctx.createGain(); sl.frequency.value = .12; slg.gain.value = .35; sl.connect(slg); const swell = ctx.createGain(); swell.gain.value = .65; slg.connect(swell.gain); sl.start(); // slow swell of the waves
  const eng = ctx.createOscillator(), eg = ctx.createGain(), ef = ctx.createBiquadFilter(); eng.type = 'triangle'; eng.frequency.value = 62; ef.type = 'lowpass'; ef.frequency.value = 260; eg.gain.value = 0; eng.connect(ef); ef.connect(eg); eg.connect(out); eng.start();
  const note = (m, v, d, when) => { const t = when || ctx.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = .25; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0004, t + d); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + d + .1); o2.stop(t + d + .1); };
  const bubble = (v) => { const t = ctx.currentTime, f = 380 + Math.random() * 700, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.8, t + .11); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0004, t + .15); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .2); };
  const gull = () => { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(2100, t + .12); o.frequency.exponentialRampToValueAtTime(1400, t + .38); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .05); g.gain.exponentialRampToValueAtTime(.0004, t + .45); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .5); };
  let alive = true, muted = false, under = false; const timers = [];
  const SC = [60, 62, 64, 67, 69, 72, 74, 76];                                   // a warm major pentatonic, plucked like a ukulele
  const tune = () => { if (!alive) return; if (!muted && !under) { const n = 2 + Math.floor(Math.random() * 3); let i = Math.floor(Math.random() * 5); for (let k = 0; k < n; k++) { note(SC[i], .035, 1.8, ctx.currentTime + k * .32); i = clamp(i + (Math.random() < .5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2)), 0, 7); } } timers.push(setTimeout(tune, 4200 + Math.random() * 4200)); };
  const bub = () => { if (!alive) return; if (!muted && under) { const n = 1 + Math.floor(Math.random() * 3); for (let k = 0; k < n; k++) setTimeout(() => alive && bubble(.02 + Math.random() * .02), k * 90); } timers.push(setTimeout(bub, 600 + Math.random() * 1500)); };
  const gulls = () => { if (!alive) return; if (!muted && !under) gull(); timers.push(setTimeout(gulls, 9000 + Math.random() * 12000)); };
  return {
    start() { if (ctx.state === 'suspended') ctx.resume(); out.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, 1.2); tune(); bub(); timers.push(setTimeout(gulls, 6000)); },
    mute(m) { muted = m; out.gain.setTargetAtTime(m ? 0 : .9, ctx.currentTime, .3); if (!m && ctx.state === 'suspended') ctx.resume(); }, get muted() { return muted; },
    update(speed, nearSea, underwater) {
      if (underwater !== under) { under = underwater; lp.frequency.setTargetAtTime(under ? 520 : 18000, ctx.currentTime, .25); }
      eg.gain.setTargetAtTime(Math.min(.05, .012 + Math.abs(speed) * .0032), ctx.currentTime, .15); eng.frequency.setTargetAtTime(58 + Math.abs(speed) * 5.5, ctx.currentTime, .12);
      sg.gain.setTargetAtTime(under ? .05 : nearSea * .09 * (.6 + .4 * Math.sin(ctx.currentTime * .7)), ctx.currentTime, .6);
    },
    gull() { if (!muted && !under) { gull(); setTimeout(() => !muted && !under && gull(), 330); } },
    chime() { if (muted) return; [76, 79, 83, 88].forEach((m, k) => note(m, .04 - k * .005, 2.4, ctx.currentTime + k * .09)); },
    splash() { if (muted) return; const t = ctx.currentTime, b = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); b.buffer = nb; f.type = 'bandpass'; f.frequency.setValueAtTime(2200, t); f.frequency.exponentialRampToValueAtTime(600, t + .6); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .04); g.gain.exponentialRampToValueAtTime(.0005, t + .7); b.connect(f); f.connect(g); g.connect(bus); b.start(t, Math.random() * 2); b.stop(t + .8); },
    stop() { alive = false; timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); out.gain.setTargetAtTime(0, ctx.currentTime, .3); setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1200); }
  };
}

// ---------------------------------------------------------------- the drive
export function open(opts) {
  opts = opts || {};
  const lang = Math.max(0, LI.indexOf(getLang())), touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const root = document.createElement('div'); root.className = 'x-dr';
  root.innerHTML = '<canvas class="x-dr-cv"></canvas><div class="x-dr-uw"></div>' +
    '<div class="x-dr-top"><div class="x-dr-t"><b>Ría de Muros e Noia</b><span class="x-dr-sub"></span></div><div class="x-dr-btns"><button type="button" class="x-dr-dn" aria-label="' + tr('Day / night') + '"></button><button type="button" class="x-dr-mu" aria-label="' + tr('Sound') + '"></button><button type="button" class="x-dr-x" aria-label="' + tr('Back to the map') + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<div class="x-dr-count"><i class="x-dr-arrow"></i><span></span></div><div class="x-dr-help">' + tr('Drive with the arrow keys') + '</div>' +
    '<button type="button" class="x-dr-prompt"></button><div class="x-dr-card"><div class="x-dr-art"></div><b></b><p></p><button type="button">' + tr('Close') + '</button></div>' +
    (touch ? '<div class="x-dr-pad"><div><button data-k="left">◀</button><button data-k="right">▶</button></div><div><button data-k="up">▲</button><button data-k="down">▼</button></div></div>' : '');
  document.body.appendChild(root);
  const css = document.createElement('style'); css.textContent = [
    '.x-dr{position:fixed;inset:0;z-index:95;background:#cfe6f2;opacity:0;transition:opacity 1.1s ease;color:#4a3340;font:500 13px/1.45 "Switzer","Switzer Placeholder",system-ui,sans-serif;overscroll-behavior:contain;touch-action:none;user-select:none;-webkit-user-select:none}',
    '.x-dr.x-in{opacity:1}.x-dr-cv{position:absolute;inset:0;width:100%;height:100%;display:block}',
    '.x-dr-uw{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .6s ease;background:radial-gradient(ellipse at 50% 30%,rgba(120,220,225,.12),rgba(40,150,170,.4))}.x-dr.x-uw .x-dr-uw{opacity:1}',
    '.x-dr-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:18px;pointer-events:none}.x-dr-top>*{pointer-events:auto}',
    '.x-dr-t b{display:block;font-size:17px;font-weight:700;letter-spacing:-.01em}.x-dr-t span{font-size:12px;opacity:.75}',
    '.x-dr-btns{display:flex;gap:10px}.x-dr-btns button{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,252,246,.85);color:#4a3340;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .3s cubic-bezier(.3,1.5,.5,1),background .2s}.x-dr-btns button:hover{transform:scale(1.08);background:#fff}',
    '.x-dr-count{position:absolute;left:50%;top:18px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:8px 16px;border-radius:22px;background:rgba(255,252,246,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;pointer-events:none}',
    '.x-dr-arrow{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid #e36d57;transition:transform .15s linear}',
    '.x-dr-help{position:absolute;left:18px;bottom:18px;padding:9px 14px;border-radius:16px;background:rgba(255,252,246,.78);font:500 11px/1.2 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;pointer-events:none;transition:opacity 1s}.x-dr.x-drove .x-dr-help{opacity:.0}',
    '.x-dr-prompt{position:absolute;left:50%;bottom:48px;transform:translate(-50%,14px);padding:16px 30px;border:0;border-radius:20px;background:rgba(255,253,248,.96);color:#4a3340;font:500 13px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .4s,transform .5s cubic-bezier(.22,.8,.24,1);box-shadow:0 10px 30px rgba(60,70,80,.25)}.x-dr.x-near .x-dr-prompt{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
    '.x-dr-card{position:absolute;left:50%;bottom:36px;width:min(480px,calc(100% - 32px));padding:20px 24px 18px;border-radius:26px;background:rgba(255,253,248,.96);box-shadow:0 14px 44px rgba(60,70,80,.3);opacity:0;pointer-events:none;transform:translate(-50%,18px);transition:opacity .45s,transform .6s cubic-bezier(.22,.8,.24,1)}.x-dr.x-card .x-dr-card{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
    '.x-dr-art svg{width:100%;height:auto;display:block;border-radius:16px;margin-bottom:12px}.x-dr-art:empty{display:none}.x-dr-card b{display:block;font-size:20px;line-height:1.2;font-weight:700;margin-bottom:8px}.x-dr-card p{margin:0 0 14px;font-size:16px;line-height:1.5}.x-dr-card button{border:0;border-radius:14px;padding:11px 20px;background:#e36d57;color:#fff;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
    '.x-dr-pad{position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:space-between;padding:0 18px;pointer-events:none}.x-dr-pad>div{display:flex;gap:10px;pointer-events:auto}.x-dr-pad button{width:62px;height:62px;border:0;border-radius:50%;background:rgba(255,252,246,.7);color:#4a3340;font-size:20px;touch-action:none;-webkit-tap-highlight-color:transparent}.x-dr-pad button.x-on{background:#fff;transform:scale(.94)}',
    '.x-dr.x-touch .x-dr-help{display:none}',
    '@media(max-width:600px){.x-dr-t span{display:none}.x-dr-count{top:74px}}'
  ].join('\n'); root.appendChild(css);
  if (touch) root.classList.add('x-touch');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('x-in')));
  const cv = root.querySelector('.x-dr-cv');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); } catch (e) { root.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), FOG_AIR = new THREE.Color(0xdbe9ef), FOG_SEA = new THREE.Color(0x5fc3cf); scene.background = FOG_AIR.clone(); scene.fog = new THREE.FogExp2(0xdbe9ef, .0065);
  const camera = new THREE.PerspectiveCamera(55, 1, .3, 420);
  const hemi = new THREE.HemisphereLight(0xdcebff, 0xdcc9a4, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 140 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .05; scene.add(sun, sun.target);

  // ---- sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 20, 14), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); { const p = sky.geometry.attributes.position, c = new Float32Array(p.count * 3), top = new THREE.Color(0x5fb0ee), hz = new THREE.Color(0xeaf3f4), tmp = new THREE.Color(); for (let i = 0; i < p.count; i++) { tmp.copy(hz).lerp(top, sstep(.0, .75, p.getY(i) / 300)); c[i * 3] = tmp.r; c[i * 3 + 1] = tmp.g; c[i * 3 + 2] = tmp.b; } sky.geometry.setAttribute('color', new THREE.BufferAttribute(c, 3)); } sky.renderOrder = -1; scene.add(sky);
  const clouds = []; for (let i = 0; i < 12; i++) { const g = new THREE.Group(), n = 4 + Math.floor(rng() * 3); for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: k % 2 ? 0xffefd9 : 0xfff6e8, fog: false })); s.position.set((k - n / 2) * 4.5 + rng() * 2, rng() * 2, rng() * 3); s.scale.set(5 + rng() * 3, 3 + rng() * 2, 4 + rng() * 2); g.add(s); } g.position.set(-120 + rng() * 260, 50 + rng() * 30, -110 + rng() * 220); g.userData.v = 1.2 + rng() * 1.5; scene.add(g); clouds.push(g); }

  // ---- terrain
  const TX = 210, TZ = 200, CX = 5, NX = 170, NZ = 160, geo = new THREE.PlaneGeometry(TX, TZ, NX, NZ); geo.rotateX(-PI / 2); geo.translate(CX, 0, 0);
  { const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), A = new THREE.Color(0x8fcd9d), B = new THREE.Color(0x74b88a), SAND = new THREE.Color(0xeed3a0), ROCK = new THREE.Color(0xc8b8a6), SEAB = new THREE.Color(0xe9d3a9), DEEP = new THREE.Color(0x8ec9b8);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = H(x, z); p.setY(i, h); const n = noise(x * .8, z * .8) * .5 + .5;
      c.copy(A).lerp(B, n).lerp(ROCK, sstep(3.2, 5.2, h) * .75); c.lerp(SAND, (1 - sstep(.45, 1.15, h)) * sstep(-1.2, .0, h)); { const bzz = sstep(44, 54, z) * (1 - sstep(78, 88, z)); c.lerp(SAND, bzz * sstep(COAST(z) - 18, COAST(z) - 13, x) * (h > 0 ? 1 : 0)); } if (h < 0) c.copy(SEAB).lerp(DEEP, sstep(-.5, -4.8, h)); c.offsetHSL(0, 0, (hash(Math.round(x * 2), Math.round(z * 2)) - .5) * .025); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); }
  const ttex = paintTex().clone(); ttex.repeat.set(30, 30); ttex.wrapS = ttex.wrapT = THREE.RepeatWrapping; ttex.needsUpdate = true;
  const terrain = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, map: ttex, roughness: 1, bumpMap: feltTexD(), bumpScale: 1.2, sheen: 1, sheenRoughness: .6, sheenColor: new THREE.Color(0xfff0dc) })); terrain.receiveShadow = true; scene.add(terrain);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, 52, 52), new THREE.MeshStandardMaterial({ color: 0x74cfdb, transparent: true, opacity: .62, roughness: .25, metalness: .05, side: THREE.DoubleSide, depthWrite: false })); sea.rotation.x = -PI / 2; sea.position.set(120, 0, 0); sea.renderOrder = 3; scene.add(sea);
  const seaP = sea.geometry.attributes.position, seaBase = new Float32Array(seaP.count * 2); for (let i = 0; i < seaP.count; i++) { seaBase[i * 2] = seaP.getX(i); seaBase[i * 2 + 1] = seaP.getY(i); }
  const colliders = [];

  // ---- roads: one calm coast road, and in every village narrow lanes (rueiros) between stone walls
  const ribbon = (pts, width, color, lift, order) => {
    const pos = [], idx = [], n = pts.length; for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l; for (const sd of [-1, 1]) { const x = pts[i][0] + nx * width / 2 * sd, z = pts[i][1] + nz * width / 2 * sd; pos.push(x, H(x, z) + lift, z); } if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: PASTEL(color), roughness: 1, bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenRoughness: .6, sheenColor: PASTEL(color).lerp(new THREE.Color(0xfff3e4), .5), polygonOffset: true, polygonOffsetFactor: -order, polygonOffsetUnits: -order, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); return m;
  };
  const road = (pts, w) => { ribbon(pts, w + 1.8, 0xe2cba0, .05, 2); ribbon(pts, w, 0x8d96a4, .08, 4); };
  const main = []; for (let z = -98; z <= 98; z += 2) main.push([ROADX(z), z]); road(main, 5.6);
  for (let z = -96; z < 96; z += 7) ribbon([[ROADX(z), z], [ROADX(z + 3.4), z + 3.4]], .2, 0xf6f0e2, .11, 6);
  // rueiros: narrow winding lanes of beaten stone that branch off the road, with a dry-stone wall on both sides
  const lanes = []; const laneDefs = [];
  VILLAGES.forEach(([, z0], vi) => { const rx = ROADX(z0); laneDefs.push([rx - 3, z0 - 13, -1, .12 * vi, 34, 0], [rx - 3, z0 + 11, -1, 1.3 + vi, 36, 1]); if (vi === 3) laneDefs.push([rx - 3, z0 - 2, -1, 2.6, 30, 2]); laneDefs.push([rx + 3, z0 + 2, 1, 4 + vi, 11, 3]); });
  laneDefs.forEach(([x0, z0, dir, ph, len, id]) => { const pts = []; for (let t = 0; t <= len; t += 2) { const x = x0 + dir * t, z = z0 + Math.sin(t * .17 + ph) * 3.2 + Math.sin(t * .05 + ph * 2) * 2; if (H(x, z) < .3) break; pts.push([x, z]); } if (pts.length > 3) lanes.push(pts); });
  for (const pts of lanes) { ribbon(pts, 5.0, 0xd6c9ae, .05, 2); ribbon(pts, 3.7, 0xb9ad98, .08, 4); }
  // ---- houses, with room between them, facing the lanes; walls, hórreos, cruceiros, squares
  const addTo = (o, x, z, yaw, r) => { o.position.set(x, H(x, z), z); o.rotation.y = yaw; scene.add(o); if (r) { const u = o.userData; colliders.push(u.hx ? [x, z, r, u.hx, u.hz, yaw] : [x, z, r]); } return o; };
  const infoSpots = [], solid = (x, z, rr) => colliders.some((c) => Math.hypot(c[0] - x, c[1] - z) < c[2] + rr), laneNear = (x, z, d) => lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - x, q[1] - z) < d)) || Math.abs(x - ROADX(z)) < d + 2.6;
  const plazas = [], walkers = [];
  VILLAGES.forEach(([name, z0], vi) => {
    const rx = ROADX(z0), cnt = vi === 3 ? 12 : 8; let made = 0;
    // houses along the road and the lanes: set well back, spaced out, each turned to face its way
    const spots = []; for (const pts of lanes) if (Math.abs(pts[0][1] - z0) < 16 && Math.abs(pts[0][0] - (rx - 3)) < 7) for (let q = 2; q < pts.length - 1; q += 3) for (const sd of [-1, 1]) { const a = pts[q - 1], b = pts[q + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l; spots.push([pts[q][0] + nx * 7.2 * sd, pts[q][1] + nz * 7.2 * sd, -nx * sd, -nz * sd]); }
    for (let k = -3; k <= 3; k++) for (const sd of [-1, 1]) { const zz = z0 + k * 9 + sd * 2; spots.push([ROADX(zz) + sd * 8.6, zz, -sd, 0]); }
    for (let i = spots.length - 1; i > 0; i--) { const j2 = Math.floor(rng() * (i + 1)); [spots[i], spots[j2]] = [spots[j2], spots[i]]; }
    for (const [xx, zz, fx, fz] of spots) {
      if (made >= cnt || H(xx, zz) < .35 || solid(xx, zz, 6.5) || Math.hypot(xx - (rx - 12), zz - (z0 + 1)) < 11) continue;
      if (lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - xx, q[1] - zz) < 5.2))) continue;
      const w = 6.6 + rng() * 2, d = 5.4 + rng() * 1.5, fl = 1 + Math.floor(rng() * (vi === 3 ? 3 : 2)), stone = vi === 3 && rng() < .4;
      const h = houseMesh(w, d, fl, WALLS[(vi * 3 + made) % WALLS.length], ROOFS[(made + vi) % ROOFS.length], stone); addTo(h, xx, zz, Math.atan2(fx, fz), h.userData.r); made++;
    }
    // the square of stone: paving, a fountain or a cruceiro, benches, pruned trees
    if (vi === 3 || vi === 2) { const pr = vi === 3 ? 10 : 7, pcx = rx - 13, pcz = z0 + 1; plazas.push([pcx, pcz, pr]); }
    const sc = ROADX(z0 - 2) - 7.5, cr = cruceiro(); addTo(cr, sc, z0 - 14, 0, 2.3);
    for (const dz of [-23, 23]) { const sp = signPost(name); sp.scale.setScalar(.78); addTo(sp, ROADX(z0 + dz) + 5.4, z0 + dz, dz < 0 ? PI : 0, 0); }
    for (let k = 0; k < 3; k++) { const hx = rx - 19 - rng() * 7, hzz = z0 - 12 + k * 12 + (rng() - .5) * 4; if (H(hx, hzz) < .4 || solid(hx, hzz, 7) || lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - hx, q[1] - hzz) < 6.5))) continue; const hr = horreo(); const yaw = rng() * PI * 2; addTo(hr, hx, hzz, yaw, hr.userData.r); if (vi === 1 && !infoSpots.length) infoSpots.push(['horreo', hx + Math.cos(yaw) * 0 + 6.5, hzz]); }
    if (vi === 3 || vi === 2) { const ch = church(); const cx = rx - 13, cz = z0 + (vi === 3 ? -16 : 16); if (!solid(cx, cz, 9)) addTo(ch, cx, cz, PI / 2, 8); }
  });
  for (const [px, pz, pr] of plazas) {
    const g = new THREE.Group(), cvp = document.createElement('canvas'); cvp.width = cvp.height = 256; const c2 = cvp.getContext('2d'); c2.fillStyle = '#9d9585'; c2.fillRect(0, 0, 256, 256); let ry = 0; while (ry < 256) { const rh = 22 + rng() * 14; let rx2 = -rng() * 40; while (rx2 < 256) { const sw = 34 + rng() * 40, tone = 190 + rng() * 40; c2.fillStyle = `rgb(${tone},${tone - 6},${tone - 20})`; c2.beginPath(); c2.roundRect ? c2.roundRect(rx2 + 1.5, ry + 1.5, sw - 3, rh - 3, 6) : c2.rect(rx2 + 1.5, ry + 1.5, sw - 3, rh - 3); c2.fill(); rx2 += sw; } ry += rh; }
    const pt = new THREE.CanvasTexture(cvp); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(pr / 3, pr / 3); pt.colorSpace = THREE.SRGBColorSpace;
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(pr, pr, .22, 40), new THREE.MeshPhysicalMaterial({ map: pt, roughness: 1, bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenColor: new THREE.Color(0xfff3e4), sheenRoughness: .6 })); slab.position.y = .04; slab.receiveShadow = true; slab.castShadow = true; g.add(slab);
    const kerb = new THREE.Mesh(new THREE.TorusGeometry(pr + .1, .28, 8, 56), std(0xbdb6a6)); kerb.rotation.x = PI / 2; kerb.position.y = .12; g.add(kerb);
    g.position.set(px, H(px, pz), pz); scene.add(g);
    if (pr > 8) { const f = fonte(); addTo(f, px, pz, 0, 3.2); } else addTo(cruceiro(), px, pz, 0, 2.3);
    for (let k = 0; k < 6; k++) { const a = k * PI / 3 + .3, bx = px + Math.cos(a) * pr * .72, bz = pz + Math.sin(a) * pr * .72, bn = new THREE.Group(); const seat = new THREE.Mesh(rbox(2.4, .2, .8, .06), std(0xa5835c)); seat.position.y = .55; const back = new THREE.Mesh(rbox(2.4, .6, .14, .05), std(0xa5835c)); back.position.set(0, .95, -.34); bn.add(seat, back); for (const sx of [-1, 1]) { const lg = new THREE.Mesh(rbox(.18, .55, .6, .04), std(0xbab3a3)); lg.position.set(sx * 1.05, .27, 0); bn.add(lg); } bn.traverse((o) => { if (o.isMesh) o.castShadow = true; }); addTo(bn, bx, bz, -a - PI / 2, 0); colliders.push([bx, bz, 1.0]); }
    for (let k = 0; k < 5; k++) { const a = k * PI * 2 / 5 + .9, tx = px + Math.cos(a) * pr * .9, tz = pz + Math.sin(a) * pr * .9, tg = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, 2.6, 6), std(0x8a6a4c)); tk.position.y = 1.3; const cw = new THREE.Mesh(rbox(3.2, 2.2, 3.2, .8), std(0x5aa88a, { flatShading: false })); cw.position.y = 3.6; tg.add(tk, cw); tg.traverse((o) => { if (o.isMesh) o.castShadow = true; }); addTo(tg, tx, tz, a, 0); colliders.push([tx, tz, .8]); }
    const n = pr > 8 ? 5 : 3; for (let k = 0; k < n; k++) { const w2 = person([0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xc9a0e8, 0xf0907a][k % 6], [0xf0c9a0, 0xe3b185, 0xf5d6b5][k % 3]); scene.add(w2); const pts = []; const a0 = rng() * 6, rr = pr * (.35 + rng() * .3); for (let q = 0; q <= 16; q++) pts.push([px + Math.cos(a0 + q * .4) * rr, pz + Math.sin(a0 + q * .4) * rr]); walkers.push({ p: w2, pts, d: rng() * 20, sp: .8 + rng() * .5, dir: 1, lift: .22 }); }
  }
  // dry-stone walls along both sides of every lane
  { const wallG = rbox(1.7, .95, .6, .14), nW = lanes.reduce((a, p) => a + p.length * 2, 0), walls = new THREE.InstancedMesh(wallG, std(0xffffff, { flatShading: false }), nW), wo = new THREE.Object3D(), wc = new THREE.Color(); let wi = 0;
    for (const pts of lanes) for (let q = 1; q < pts.length - 1; q++) for (const sd of [-1, 1]) { const a = pts[q - 1], b = pts[q + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, x = pts[q][0] + nx * 2.75 * sd, z = pts[q][1] + nz * 2.75 * sd;
      if (q < 3 || colliders.some((c) => c.length === 6 ? Math.hypot(c[0] - x, c[1] - z) < c[2] : Math.hypot(c[0] - x, c[1] - z) < c[2] + .4) || rng() < .22) { wo.scale.set(0, 0, 0); wo.updateMatrix(); walls.setMatrixAt(wi++, wo.matrix); continue; }
      wo.position.set(x, H(x, z) + .38, z); wo.rotation.set(0, -Math.atan2(dz, dx), 0); wo.scale.set(1, .8 + rng() * .5, 1); wo.updateMatrix(); walls.setMatrixAt(wi, wo.matrix); wc.set([0xbdb6a6, 0xaaa393, 0xcfc8b8, 0xb2ab9b][wi % 4]); walls.setColorAt(wi, wc); wi++; if (q % 2) colliders.push([x, z, .85]); }
    walls.count = wi; walls.castShadow = true; walls.receiveShadow = true; scene.add(walls); }
  // the people of the villages: on the pavements, in the lanes and on the beach
  { const skins = [0xf0c9a0, 0xe3b185, 0xf5d6b5, 0xc58c5e], shirts = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xc9a0e8, 0xf0907a, 0xf4e6d0, 0x7aa6d8];
    const mk = (pts, i) => { const w2 = person(shirts[i % shirts.length], skins[i % skins.length]); scene.add(w2); walkers.push({ p: w2, pts, d: rng() * 30, sp: .85 + rng() * .6, dir: rng() < .5 ? 1 : -1, lift: .08 }); };
    let wk = 0; VILLAGES.forEach(([, z0]) => { for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { const pts = []; for (let z = z0 - 20 + k * 6; z <= z0 + 20; z += 2) pts.push([ROADX(z) + sd * (3.9 + k * .4), z]); mk(pts, wk++); } });
    for (const pts of lanes) { mk(pts.map((q) => [q[0] + .7, q[1]]), wk++); }
    { const bz = 66; const pts = []; for (let z = bz - 16; z <= bz + 16; z += 2) pts.push([COAST(z) - 4.2 + Math.sin(z * .3) * .8, z]); mk(pts, wk++); mk(pts.slice().reverse(), wk++); } }
  // the beach of Area Maior at Louro: parasols, towels and a sign
  { const bz = 66, parC = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xe9a0c0, 0xf4e6d0];
    for (let k = 0; k < 7; k++) { const z = bz - 14 + k * 4.6, x = COAST(z) - 7 + Math.sin(k * 2.1) * 2.2, g = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 5), std(0xf4eadb)); pole.position.y = 1.3; const top = new THREE.Mesh(new THREE.ConeGeometry(1.7, .7, 8), std(parC[k % 6])); top.position.y = 2.75; const tw = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, 2.4), std(parC[(k + 2) % 6])); tw.position.set(.3, .05, 1.3); g.add(pole, top, tw); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); addTo(g, x, z, (k - 3) * .25, 0); }
    const sp = signPost('Area Maior'); sp.scale.setScalar(.85); addTo(sp, COAST(bz - 19) - 14, bz - 19, PI / 2, 0); }
  // lamp posts along the main road, joined by cables
  const glowTexL = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, 'rgba(255,247,214,1)'); gr.addColorStop(.25, 'rgba(255,222,150,.7)'); gr.addColorStop(.55, 'rgba(255,184,112,.28)'); gr.addColorStop(.8, 'rgba(255,150,120,.08)'); gr.addColorStop(1, 'rgba(255,140,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glowMat = new THREE.SpriteMaterial({ map: glowTexL, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), lampM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .5 });
  { const dk = std(0x2f3a45), cm = std(0x2b3036), tops = [];
    for (let z = -92, k = 0; z <= 92; z += 15, k++) {
      const side = k % 2 ? 1 : -1, x = ROADX(z) + side * 4.6, g = new THREE.Group(); g.position.set(x, H(x, z), z); g.rotation.y = side < 0 ? 0 : PI;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.11, .17, 7.4, 6), dk); pole.position.y = 3.7; pole.castShadow = true; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(.14, .14, 3.4), dk); arm.position.set(0, 7.4, 0); g.add(arm);
      for (const s of [-1, 1]) { const hd = new THREE.Mesh(new THREE.CylinderGeometry(.22, .4, .22, 8), dk); hd.position.set(0, 7.5, s * 1.7); g.add(hd); const bu = new THREE.Mesh(new THREE.IcosahedronGeometry(.2, 1), lampM); bu.position.set(0, 7.3, s * 1.7); g.add(bu); const gl = new THREE.Sprite(glowMat); gl.scale.set(4.2, 4.2, 1); gl.position.set(0, 7.2, s * 1.7); g.add(gl); }
      scene.add(g); tops.push(new THREE.Vector3(x, H(x, z) + 7.5, z));
    }
    for (let i = 1; i < tops.length; i++) { const a = tops[i - 1], b = tops[i], mid = a.clone().add(b).multiplyScalar(.5); mid.y -= 1.1; for (const off of [-.35, .35]) scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(0, 0, off)), mid.clone().add(new THREE.Vector3(0, 0, off)), b.clone().add(new THREE.Vector3(0, 0, off))]), 10, .035, 4), cm)); } }
  // ---- trees, bushes, hydrangeas
  const lowpoly = (g, a) => { const ps = g.attributes.position; for (let q = 0; q < ps.count; q++) { const x = ps.getX(q), y = ps.getY(q), z = ps.getZ(q), k = 1 + (hash(x * 37.1 + y * 11.3, z * 53.7 + y * 5.1) - .5) * a; ps.setXYZ(q, x * k, y * k, z * k); } g.computeVertexNormals(); return g; };
  const crownG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .34), trunkG = new THREE.CylinderGeometry(.18, .3, 1, 6); trunkG.translate(0, .5, 0);
  const trees = []; for (let i = 0; i < 6000 && trees.length < 330; i++) { const x = -98 + rng() * 150, z = -96 + rng() * 192, c = COAST(z); if (x > c - 8 || Math.abs(x - ROADX(z)) < 8) continue; if (FLATS.some((f) => Math.hypot(x - f[0], z - f[1]) < 17) || colliders.some((q) => Math.hypot(q[0] - x, q[1] - z) < q[2] + 3)) continue; trees.push([x, z, 1.2 + rng() * 1.5, rng() < .22]); }
  const crowns = new THREE.InstancedMesh(crownG, std(0xffffff, { flatShading: true, roughness: .9 }), trees.length), trunks = new THREE.InstancedMesh(trunkG, std(0x8a6a4c), trees.length), tc = new THREE.Color(), to = new THREE.Object3D(); const TCOL = [0x3c8c6c, 0x4a9a78, 0x4e9e7a, 0x2f7a62, 0x5aa88a], ECOL = [0x7fb48a, 0x8cc095];
  trees.forEach(([x, z, s, euc], i) => { const y = H(x, z); to.position.set(x, y, z); to.rotation.set(0, rng() * 6, 0); to.scale.set(s * .4, s * (euc ? 3.2 : 1.4), s * .4); to.updateMatrix(); trunks.setMatrixAt(i, to.matrix); to.position.set(x, y + s * (euc ? 3.4 : 1.8), z); to.scale.set(s * (euc ? 1 : 1.5), s * (euc ? 2.3 : 1.35), s * (euc ? 1 : 1.5)); to.updateMatrix(); crowns.setMatrixAt(i, to.matrix); tc.set(euc ? ECOL[i % 2] : TCOL[i % 5]).offsetHSL((rng() - .5) * .02, (rng() - .5) * .08, (rng() - .5) * .06); crowns.setColorAt(i, tc); });
  crowns.castShadow = true; trunks.castShadow = true; scene.add(crowns, trunks); for (const [x, z, sz] of trees) colliders.push([x, z, .4 * sz]);
  const bushG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .3), HC = [0x8fa9e8, 0xe9a0c0, 0x9ab8f0, 0xc9a5e8, 0x5fae8a], bushes = new THREE.InstancedMesh(bushG, std(0xffffff, { flatShading: true }), 160);
  for (let i = 0; i < 160; i++) { const vz = VILLAGES[i % 5][1] + (rng() - .5) * 40, side = rng() < .5 ? -1 : 1, x = ROADX(vz) + side * (7.2 + rng() * 6), s = .5 + rng() * .8; to.position.set(x, H(x, vz) + s * .3, vz); to.rotation.set(0, rng() * 6, 0); to.scale.set(s * 1.3, s, s * 1.3); to.updateMatrix(); bushes.setMatrixAt(i, to.matrix); tc.set(HC[i % 5]); tc.offsetHSL(0, 0, (rng() - .5) * .06); bushes.setColorAt(i, tc); }
  bushes.castShadow = true; scene.add(bushes);

  // ---- the sea: boats, gulls, and everything under it
  const boats = []; [[-60, 8], [-30, 12], [4, 9], [34, 14], [58, 10]].forEach(([z, off], i) => { const b = new THREE.Group(), col = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0xe36d57, 0x5fae8a][i]; const hull = new THREE.Mesh(rbox(5, 1.1, 2, .4), std(col)); hull.position.y = .3; b.add(hull); const cab = new THREE.Mesh(rbox(1.6, 1.3, 1.4, .25), std(0xf7f0e0)); cab.position.set(-.6, 1.2, 0); b.add(cab); const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3, 5), std(0x8a6a4c)); mast.position.set(.8, 2, 0); b.add(mast); b.userData = { x: COAST(z) + off, z, ph: i * 1.7 }; b.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(b); boats.push(b); });
  // seagulls fly past from time to time: a little flock crosses the sky above the car, calling
  const gulls = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(.4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfffaf0 })); body.scale.set(1.9, .8, .8); g.add(body); const hd = new THREE.Mesh(new THREE.SphereGeometry(.2, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfffaf0 })); hd.position.x = .72; g.add(hd); const bk = new THREE.Mesh(new THREE.ConeGeometry(.07, .26, 4), new THREE.MeshBasicMaterial({ color: 0xf2a94a })); bk.rotation.z = -PI / 2; bk.position.x = .94; g.add(bk); g.userData.w = []; for (const sd of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.8, .05, 1.7), new THREE.MeshBasicMaterial({ color: 0xffffff })); w.position.z = sd * .85; w.userData.s = sd; g.add(w); g.userData.w.push(w); } g.visible = false; scene.add(g); gulls.push(g); }
  const a0 = (k) => k * 1.3 + 2; const flock = { next: 4, t: -1, p0: new THREE.Vector3(), dir: new THREE.Vector3() };
  const sx0 = COAST(0), under = new THREE.Group(); scene.add(under);
  const kelpG = new THREE.CylinderGeometry(.06, .22, 1, 5, 6); kelpG.translate(0, .5, 0); const kuni = { uTime: { value: 0 } };
  const kelpM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, map: paintTex() }); kelpM.onBeforeCompile = (sh) => { sh.uniforms.uTime = kuni.uTime; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float ph = instanceMatrix[3].x * .7 + instanceMatrix[3].z * .5; transformed.x += sin(uTime * 1.1 + ph + position.y * 2.2) * position.y * position.y * .5; transformed.z += cos(uTime * .9 + ph * 1.3 + position.y * 1.8) * position.y * position.y * .4;'); };
  { const NK = 160, kelp = new THREE.InstancedMesh(kelpG, kelpM, NK); for (let i = 0; i < NK; i++) { const z = -95 + rng() * 190, x = COAST(z) + 2 + rng() * 26, h = 2 + rng() * 4; to.position.set(x, H(x, z) - .1, z); to.rotation.set(0, rng() * 6, 0); to.scale.set(1, h, 1); to.updateMatrix(); kelp.setMatrixAt(i, to.matrix); tc.set([0x56ad8a, 0x6fc29a, 0x4a9f86, 0x8bcf9c, 0xd88aa0][i % 5]); kelp.setColorAt(i, tc); } under.add(kelp); }
  { const rockG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .35), rocks = new THREE.InstancedMesh(rockG, std(0xffffff, { flatShading: true }), 90); for (let i = 0; i < 90; i++) { const z = -95 + rng() * 190, x = COAST(z) + 3 + rng() * 40, s = .7 + rng() * rng() * 3; to.position.set(x, H(x, z) + s * .2, z); to.rotation.set(rng(), rng() * 6, rng() * .4); to.scale.set(s, s * (.6 + rng() * .5), s); to.updateMatrix(); rocks.setMatrixAt(i, to.matrix); tc.set([0xb8aab8, 0xa9b7bd, 0xc9b9a6, 0x9fb0b4][i % 4]); rocks.setColorAt(i, tc); } rocks.castShadow = true; under.add(rocks); }
  { const cG = new THREE.ConeGeometry(.35, 1.8, 6), co = new THREE.InstancedMesh(cG, std(0xffffff, { flatShading: true }), 200); for (let i = 0; i < 200; i++) { const b = Math.floor(i / 5), bz = -95 + hash(b, 5) * 190, bx = COAST(bz) + 3 + hash(b, 9) * 30, x = bx + (rng() - .5) * 2.4, z = bz + (rng() - .5) * 2.4, s = .6 + rng() * 1.1; to.position.set(x, H(x, z) + s * .1, z); to.rotation.set((rng() - .5) * .8, rng() * 6, (rng() - .5) * .8); to.scale.set(s, s * (.7 + rng() * .7), s); to.updateMatrix(); co.setMatrixAt(i, to.matrix); tc.set([0xf0959c, 0xf4b36e, 0xc5a0e8, 0xf7d27a, 0xe97f8e][b % 5]).offsetHSL(0, 0, (rng() - .5) * .06); co.setColorAt(i, tc); } under.add(co); }
  const wz = 68, wx = COAST(wz) + 16, W = wreck(); W.scale.setScalar(1.7); W.position.set(wx, H(wx, wz) + .8, wz); W.rotation.set(.05, -.7, -.38); under.add(W);
  const animals = []; const sch = [school(40, COAST(-50) + 12, -50, -2.6, 6, 4, [0xdfe9ef, 0xcfe0ea, 0xe9eef2], .8, .8), school(34, COAST(-10) + 14, -10, -2.8, 6, 5, [0xf1c27a, 0xe9b46a, 0xf4d08c], 1.0, .65), school(46, COAST(36) + 12, 36, -2.4, 6, 4.5, [0xdfe9ef, 0xbcd8e4, 0xcfe0ea], .8, .85), school(10, wx - 6, wz - 8, -3.4, 5, 3, [0xf29a7c, 0xf4b08c], 1.3, .5)]; sch.forEach((s) => { under.add(s); animals.push(s); });
  const dolphins = [dolphin(), dolphin()]; dolphins.forEach((d, i) => { d.scale.setScalar(1.4 - i * .2); under.add(d); });
  const jellies = []; [[COAST(-70) + 8, -2.2, -70], [COAST(-30) + 16, -2.6, -30], [COAST(10) + 10, -2.0, 10], [COAST(30) + 20, -2.8, 30], [COAST(56) + 9, -2.2, 56], [wx - 7, -3.0, wz + 10]].forEach(([x, y, z], i) => { const j = jelly([0xf3b7d6, 0xcbb4f0, 0xf7c9a3][i % 3]); j.scale.setScalar(1.6 + (i % 3) * .4); j.userData.base = [x, y, z]; j.userData.ph = i * 1.7; under.add(j); jellies.push(j); });
  const oct = octopus(); { const ox = wx - 8, oz = wz + 4; oct.position.set(ox, H(ox, oz) - .1, oz); oct.scale.setScalar(1.7); under.add(oct); }
  const crb = crab(); { const cx0 = wx - 14, cz0 = wz - 3; crb.position.set(cx0, H(cx0, cz0) - .1, cz0); crb.scale.setScalar(2.1); crb.userData.c = [cx0, cz0]; under.add(crb); }
  for (let i = 0; i < 14; i++) { const z = -90 + rng() * 180, x = COAST(z) + 3 + rng() * 16, s = starfish([0xf2956e, 0xf4c26e, 0xe97f9a, 0xc9a2e8][i % 4]); s.position.set(x, H(x, z) + .03, z); s.scale.setScalar(1.4 + rng()); s.rotation.y = rng() * 6; under.add(s); }
  // bubbles around the car when under the water
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const bub = (() => { const g = new THREE.BufferGeometry(), n = 140, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (rng() - .5) * 26; a[i * 3 + 1] = rng() * 10; a[i * 3 + 2] = (rng() - .5) * 26; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size: .5, map: dotTex, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff })); p.frustumCulled = false; p.visible = false; return p; })(); scene.add(bub);
  const ripples = [];

  // ---- the car
  const car = buildCar(), carW = new THREE.Group(); carW.add(car); scene.add(carW);
  const S = { x: ROADX(-90), z: -90, yaw: 0, v: 0, steer: 0, y: 0, pitch: 0, roll: 0, cyaw: 0, uw: false };
  S.y = H(S.x, S.z); carW.position.set(S.x, S.y, S.z);
  // ---- the orbs of information
  const orbs = []; const IDX = { welcome: 0, freixo: 1, esteiro: 2, outes: 3, muros: 4, louro: 5, horreo: 6, tambre: 7, wreck: 8 };
  const place = { welcome: [ROADX(-78) - 4, -78], freixo: [ROADX(-66) + 5, -63], esteiro: [ROADX(-34) + 8, -32], outes: [ROADX(-2) - 6.5, -4], muros: [ROADX(30) - 5, 26], louro: [COAST(66) - 8, 66], tambre: [COAST(2) - 5.5, 2], wreck: [wx - 2, wz - 4] };
  const hs = infoSpots.find((q) => q[0] === 'horreo'); if (hs) place.horreo = [hs[1], hs[2]]; else place.horreo = [ROADX(-34) - 18, -28];
  const orbMat = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xffd98a, emissiveIntensity: .9, roughness: .3 }), beamMat = new THREE.MeshBasicMaterial({ color: 0xffe3a0, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  Object.keys(IDX).forEach((k) => { const [x, z] = place[k], g = new THREE.Group(), ball = new THREE.Mesh(new THREE.IcosahedronGeometry(.75, 2), orbMat.clone()), ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, .07, 6, 24), new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: .8 })), beam = new THREE.Mesh(new THREE.CylinderGeometry(.35, .7, 11, 10, 1, true), beamMat);
    const sea0 = k === 'wreck' ? H(x, z) + 2.4 : H(x, z) + 2.6; ball.position.y = 0; ring.rotation.x = PI / 2; beam.position.y = 5; g.add(ball, ring, beam); g.position.set(x, sea0, z); g.userData = { id: IDX[k], base: sea0, ball, ring, beam, done: false }; scene.add(g); orbs.push(g); });
  const dots = root.querySelector('.x-dr-count span'), arrow = root.querySelector('.x-dr-arrow'), prompt = root.querySelector('.x-dr-prompt'), card = root.querySelector('.x-dr-card');
  let seen = 0, cardOn = false, nearOrb = null; const paintCount = () => { dots.textContent = '★ ' + seen + ' / ' + orbs.length; }; paintCount();
  prompt.textContent = tr('Press E to read');
  const openCard = (o) => { if (!o) return; cardOn = true; card.querySelector('.x-dr-art').innerHTML = artFor(o.userData.id, lang); card.querySelector('b').textContent = INFO[o.userData.id].h[lang]; card.querySelector('p').textContent = INFO[o.userData.id].p[lang]; root.classList.add('x-card'); if (!o.userData.done) { o.userData.done = true; seen++; paintCount(); } if (snd) snd.chime(); };
  const closeCard = () => { cardOn = false; root.classList.remove('x-card'); };
  card.querySelector('button').addEventListener('click', closeCard); prompt.addEventListener('click', () => openCard(nearOrb));

  // ---- sound and controls
  const snd = makeSound(); const muBtn = root.querySelector('.x-dr-mu');
  const paintMu = () => { const m = snd && snd.muted; muBtn.innerHTML = m ? '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'; };
  paintMu(); muBtn.addEventListener('click', () => { if (snd) { snd.mute(!snd.muted); paintMu(); } }); if (snd) snd.start();
  // ---- day and night: it starts at the hour of the planet, and the button changes it
  let night = opts.getDark ? opts.getDark() : 0, nightT = night > .5 ? 1 : 0, nightGoal = nightT;
  const dnBtn = root.querySelector('.x-dr-dn');
  const paintDn = () => { dnBtn.innerHTML = nightGoal > .5 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; };
  paintDn(); dnBtn.addEventListener('click', () => { nightGoal = nightGoal > .5 ? 0 : 1; paintDn(); if (snd) snd.chime(); });
  const stars = (() => { const g = new THREE.BufferGeometry(), n = 380, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = rng() * 6.28, v = .12 + rng() * .85, r = 280; a[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r; a[i * 3 + 1] = v * r; a[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p2 = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, color: 0xfff6e0, transparent: true, opacity: 0, depthWrite: false, fog: false, sizeAttenuation: false })); p2.frustumCulled = false; scene.add(p2); return p2; })();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff1cf, fog: false, transparent: true, opacity: 0 })); scene.add(moon);
  const NIGHT_FOG = new THREE.Color(0x1b2547), NIGHT_SEA = new THREE.Color(0x14405a), WARM = new THREE.Color(0xffe2b8), MOON = new THREE.Color(0x9db4ff);
  const K = { up: 0, down: 0, left: 0, right: 0 }; let closed = false, raf = 0;
  const MAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  const onKey = (e) => {
    const k = MAP[e.key];
    if (k) { K[k] = e.type === 'keydown' ? 1 : 0; if (e.type === 'keydown') root.classList.add('x-drove'); e.preventDefault(); e.stopPropagation(); return; }
    if (e.type !== 'keydown') return;
    if (e.key === 'Escape') { if (cardOn) closeCard(); else close(); }
    else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') { if (cardOn) closeCard(); else if (nearOrb) openCard(nearOrb); }
    else return; e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true);
  root.querySelectorAll('.x-dr-pad button').forEach((b) => { const k = b.dataset.k, on = (e) => { K[k] = 1; b.classList.add('x-on'); root.classList.add('x-drove'); e.preventDefault(); }, off = () => { K[k] = 0; b.classList.remove('x-on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off); });
  const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 70 : 55; camera.updateProjectionMatrix(); }; size(); addEventListener('resize', size);

  // ---- the loop
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(); let last = performance.now(), t = 0, uwMix = 0, firstUw = true;
  const subEl = root.querySelector('.x-dr-sub'); let nearName = '';
  const frame = (now) => {
    if (closed) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    // driving: arcade physics
    const throttle = (cardOn ? 0 : K.up - K.down), steerIn = cardOn ? 0 : (K.left - K.right);
    if (throttle > 0) S.v += (S.v < 0 ? 18 : 10) * dt; else if (throttle < 0) S.v -= (S.v > 0 ? 18 : 8) * dt; else S.v -= Math.sign(S.v) * Math.min(Math.abs(S.v), 6 * dt);
    const vmax = S.uw ? 10 : 17; S.v = clamp(S.v, -6, vmax);
    S.steer += (steerIn - S.steer) * Math.min(1, dt * 7); S.yaw += S.steer * 1.75 * Math.min(1, Math.abs(S.v) / 4.5) * Math.sign(S.v || 1) * dt;
    S.x += Math.sin(S.yaw) * S.v * dt; S.z += Math.cos(S.yaw) * S.v * dt;
    for (const c of colliders) {
      const dx = S.x - c[0], dz = S.z - c[1], CR = 1.3;
      if (c.length === 6) {                                                               // a building: an oriented box, the car is pushed out of it
        if (dx * dx + dz * dz > (c[2] + 3) * (c[2] + 3)) continue; const ca = Math.cos(c[5]), sa = Math.sin(c[5]), lx = dx * ca - dz * sa, lz = dx * sa + dz * ca, qx = clamp(lx, -c[3], c[3]), qz = clamp(lz, -c[4], c[4]), ex = lx - qx, ez = lz - qz, ed = Math.hypot(ex, ez);
        let ox, oz; if (ed > 1e-4) { if (ed >= CR) continue; ox = ex / ed * (CR - ed); oz = ez / ed * (CR - ed); } else { const px = c[3] - Math.abs(lx), pz = c[4] - Math.abs(lz); if (px < pz) { ox = Math.sign(lx || 1) * (px + CR); oz = 0; } else { oz = Math.sign(lz || 1) * (pz + CR); ox = 0; } }
        S.x += ox * ca + oz * sa; S.z += -ox * sa + oz * ca; S.v *= .8; continue;
      }
      const d = Math.hypot(dx, dz), r = c[2] + CR; if (d < r && d > 1e-4) { S.x = c[0] + dx / d * r; S.z = c[1] + dz / d * r; S.v *= .8; }
    }
    S.x = clamp(S.x, -97, 108); S.z = clamp(S.z, -96, 96);
    const gy = H(S.x, S.z); S.y += (gy - S.y) * Math.min(1, dt * 14);
    const fx = Math.sin(S.yaw), fz = Math.cos(S.yaw), rxx = fz, rzz = -fx;                                    // forward and left
    const hF = H(S.x + fx * 1.7, S.z + fz * 1.7), hB = H(S.x - fx * 1.7, S.z - fz * 1.7), hL = H(S.x + rxx * 1.1, S.z + rzz * 1.1), hR = H(S.x - rxx * 1.1, S.z - rzz * 1.1);
    S.pitch += (Math.atan2(hF - hB, 3.4) - S.pitch) * Math.min(1, dt * 8); S.roll += (Math.atan2(hL - hR, 2.2) - S.roll) * Math.min(1, dt * 8);
    carW.position.set(S.x, S.y + Math.sin(t * 9) * Math.min(.03, Math.abs(S.v) * .003), S.z); carW.rotation.set(0, 0, 0); carW.rotation.y = S.yaw - PI / 2; car.rotation.set(0, 0, -S.pitch * .9); car.rotation.x = S.roll * .8; car.rotation.z += -Math.sin(S.steer) * 0 ;
    car.userData.wheels.forEach((w, i) => { w.rotation.order = 'YZX'; w.rotation.z -= S.v * dt / .52; w.rotation.y = i < 2 ? S.steer * .45 : 0; });
    // water: in and out
    const uwNow = S.y < -.6; if (uwNow !== S.uw) { S.uw = uwNow; if (snd) snd.splash(); ripples.push({ x: S.x, z: S.z, t: 0 }); }
    uwMix += ((camera.position.y < -.15 ? 1 : 0) - uwMix) * Math.min(1, dt * 5);
    root.classList.toggle('x-uw', camera.position.y < -.15);
    // camera
    let dy = S.yaw - S.cyaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); S.cyaw += dy * Math.min(1, dt * 3.2);
    const cd = 9.5 + Math.min(3, Math.abs(S.v) * .2), cp = _v.set(S.x - Math.sin(S.cyaw) * cd, 0, S.z - Math.cos(S.cyaw) * cd); cp.y = Math.max(S.y, 0) + 4.4 + (S.uw ? -S.y * .35 : 0);
    camera.position.lerp(cp, Math.min(1, dt * 6)); camera.position.y = Math.max(camera.position.y, H(camera.position.x, camera.position.z) + 1.2);
    camera.lookAt(S.x + Math.sin(S.yaw) * 3, S.y + 1.7, S.z + Math.cos(S.yaw) * 3);
    // atmosphere
    nightT += (nightGoal - nightT) * Math.min(1, dt * .7); const nz = nightT;
    sun.intensity = 2.5 * (1 - nz) + .5 * nz; sun.color.copy(WARM).lerp(MOON, nz); hemi.intensity = 1.25 * (1 - nz) + .45 * nz; hemi.color.set(0xdcebff).lerp(new THREE.Color(0x6b7fc0), nz); hemi.groundColor.set(0xdcc9a4).lerp(new THREE.Color(0x2b3358), nz);
    stars.material.opacity = nz * (1 - uwMix); moon.material.opacity = nz * (1 - uwMix); moon.position.set(camera.position.x - 120, 160, camera.position.z - 180);
    lampM.emissiveIntensity = .5 + nz * 3.2; WINM.emissiveIntensity = nz * 1.4; glowMat.opacity = Math.min(.85, nz * 1.1);
    sky.material.color.setScalar(1 - nz * .86).lerp(new THREE.Color(0x4b5b9a), nz * .25);
    scene.fog.color.copy(FOG_AIR).lerp(NIGHT_FOG, nz).lerp(FOG_SEA.clone().lerp(NIGHT_SEA, nz), uwMix); scene.background.copy(scene.fog.color); scene.fog.density = (.0065 + .003 * nz) + .05 * uwMix; sky.visible = uwMix < .5; sky.position.copy(camera.position);
    sun.position.set(S.x + 32, 48, S.z + 22); sun.target.position.set(S.x, 0, S.z); sun.target.updateMatrixWorld();
    for (const c of clouds) { c.position.x += c.userData.v * dt; if (c.position.x > 140) c.position.x = -140; }
    kuni.uTime.value = t;
    // the sea surface, boats, gulls
    for (let i = 0; i < seaP.count; i++) { const x = seaBase[i * 2] + sea.position.x, z = -seaBase[i * 2 + 1] + sea.position.z; seaP.setZ(i, Math.sin(x * .18 + t * .9) * .09 + Math.cos(z * .21 + t * .7) * .08); } seaP.needsUpdate = true;
    boats.forEach((b) => { const u = b.userData; b.position.set(u.x + Math.sin(t * .15 + u.ph) * 2, Math.sin(t * 1.1 + u.ph) * .12, u.z); b.rotation.set(Math.sin(t * .9 + u.ph) * .04, Math.sin(t * .15 + u.ph) * .3 + PI / 2, Math.cos(t * 1.1 + u.ph) * .05); });
    if (flock.t < 0 && t > flock.next) { const a = S.yaw + (rng() < .5 ? 1 : -1) * (PI / 2 + (rng() - .5) * .6); flock.dir.set(Math.sin(a + PI), 0, Math.cos(a + PI)).normalize(); flock.p0.set(S.x + Math.sin(a) * 70, 0, S.z + Math.cos(a) * 70); flock.t = 0; if (snd) snd.gull(); }
    if (flock.t >= 0) { flock.t += dt; const dist = flock.t * 15; gulls.forEach((g, k) => { g.visible = true; g.position.set(flock.p0.x + flock.dir.x * dist + Math.sin(a0(k)) * 2.2, 17 + Math.sin(t * .8 + k) * .8 + Math.abs(k - 2) * .5, flock.p0.z + flock.dir.z * dist + Math.cos(a0(k)) * 2.2 - Math.abs(k - 2) * 2.4); g.rotation.y = Math.atan2(-flock.dir.z, flock.dir.x); g.userData.w.forEach((w) => { w.rotation.x = w.userData.s * Math.sin(t * 9 + k * 1.3) * .6; }); }); if (flock.t > 9.5) { flock.t = -1; flock.next = t + 14 + rng() * 22; gulls.forEach((g) => { g.visible = false; }); } }
    // life under the sea
    for (const s of animals) s.userData.update(t);
    dolphins.forEach((d, i) => { const a = t * (.2 - i * .03) + i * 2.4, rx = 16, rz = 12, cx = sx0 + 24, cz = 18 + i * 10; d.position.set(cx + Math.cos(a) * rx, -2.2 + Math.sin(a * 2 + i) * 1.1, cz + Math.sin(a) * rz); const dx = -Math.sin(a) * rx, dz = Math.cos(a) * rz; d.rotation.set(0, Math.atan2(-dz, dx), Math.cos(a * 2 + i) * .25); d.userData.tail.rotation.z = Math.sin(t * 3.4 + i) * .35; });
    jellies.forEach((j) => { const u = j.userData, p = t * .6 + u.ph, pulse = Math.sin(p * 2.2); j.position.set(u.base[0] + Math.sin(p * .4) * 1.2, u.base[1] + Math.sin(p) * .9, u.base[2]); u.bell.scale.set(1 - pulse * .1, 1 + pulse * .16, 1 - pulse * .1); u.ten.forEach((tn, k) => { tn.rotation.z = Math.sin(p * 2 + k) * .18; tn.rotation.x = Math.cos(p * 1.7 + k) * .18; }); });
    oct.userData.arms.forEach((arm) => { arm.userData.segs.forEach((sg, k) => { sg.position.y = -k * .04 + Math.sin(t * 1.4 + arm.userData.ph + k * .7) * .06 * k; sg.position.z = Math.cos(t * 1.1 + arm.userData.ph + k * .6) * .07 * k; }); }); oct.userData.head.scale.y = 1.15 + Math.sin(t * 1.5) * .03;
    { const u = crb.userData, cx = u.c[0] + Math.sin(t * .18) * 3; crb.position.x = cx; crb.position.y = H(cx, crb.position.z) - .1; crb.rotation.y = Math.cos(t * .18) > 0 ? 0 : PI; u.legs.forEach((l) => { l.rotation.z = Math.sin(t * 7 + l.userData.i * 1.3 + (l.userData.sz > 0 ? PI : 0)) * .25; }); }
    bub.visible = uwMix > .3; if (bub.visible) { bub.position.set(camera.position.x, camera.position.y - 4, camera.position.z); const a = bub.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (.8 + hash(i, 3)); if (y > 10) y = 0; a.setY(i, y); } a.needsUpdate = true; }
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; if (!r.m) { r.m = new THREE.Mesh(new THREE.RingGeometry(.8, 1.2, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); r.m.rotation.x = -PI / 2; r.m.position.set(r.x, .08, r.z); scene.add(r.m); } r.m.scale.setScalar(1 + r.t * 6); r.m.material.opacity = Math.max(0, .8 - r.t * .9); if (r.t > .9) { scene.remove(r.m); ripples.splice(i, 1); } }
    for (const w of walkers) {
      const pts = w.pts; if (!w.cum) { w.cum = [0]; for (let i = 1; i < pts.length; i++) w.cum.push(w.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); w.len = w.cum[w.cum.length - 1] || 1; w.d = (w.d % w.len + w.len) % w.len; }
      w.d += w.sp * w.dir * dt; if (w.d > w.len) { w.d = w.len; w.dir = -1; } else if (w.d < 0) { w.d = 0; w.dir = 1; }
      let i = 1; while (i < pts.length - 1 && w.cum[i] < w.d) i++; const u = (w.d - w.cum[i - 1]) / Math.max(.001, w.cum[i] - w.cum[i - 1]), x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, z = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
      const hd = Math.atan2(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) + (w.dir < 0 ? PI : 0); let dh = hd - (w.yaw === undefined ? hd : w.yaw); dh = Math.atan2(Math.sin(dh), Math.cos(dh)); w.yaw = (w.yaw === undefined ? hd : w.yaw) + dh * Math.min(1, dt * 6);
      w.p.position.set(x, H(x, z) + (w.lift || .08) + Math.abs(Math.sin(t * 7 + w.d)) * .1, z); w.p.rotation.set(0, w.yaw - PI / 2, Math.sin(t * 7 + w.d) * .06);
    }
    // the orbs
    let best = null, bd = 6.5, tgt = null, td = 1e9;
    for (const o of orbs) { const u = o.userData; o.position.y = u.base + Math.sin(t * 1.6 + u.id) * .3; u.ring.rotation.z = t * 1.2 + u.id; u.ring.rotation.x = PI / 2 + Math.sin(t + u.id) * .4; u.ball.material.emissiveIntensity = u.done ? .15 : .9 + Math.sin(t * 3 + u.id) * .3; u.ring.material.opacity = u.done ? .25 : .8; u.beam.visible = !u.done; const dx = o.position.x - S.x, dz = o.position.z - S.z, d = Math.hypot(dx, dz); if (d < bd && Math.abs(o.position.y - S.y) < 7) { bd = d; best = o; } if (!u.done && d < td) { td = d; tgt = o; } }
    nearOrb = best; root.classList.toggle('x-near', !!best && !cardOn);
    if (tgt) { const b = Math.atan2(tgt.position.x - S.x, tgt.position.z - S.z); arrow.style.transform = 'rotate(' + ((S.cyaw - b) * 180 / PI).toFixed(1) + 'deg)'; arrow.style.opacity = 1; } else arrow.style.opacity = .2;
    let vn = '', vd = 40; VILLAGES.forEach(([n, z0]) => { const d = Math.hypot(S.x - (ROADX(z0) - 9), S.z - z0); if (d < vd) { vd = d; vn = n; } }); if (vn !== nearName) { nearName = vn; subEl.textContent = vn; }
    if (snd) snd.update(S.v, sstep(26, 4, COAST(S.z) - S.x) * (S.uw ? 0 : 1), S.uw);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);
  function close() {
    if (closed) return; closed = true; cancelAnimationFrame(raf);
    removeEventListener('keydown', onKey, true); removeEventListener('keyup', onKey, true); removeEventListener('resize', size);
    if (snd) snd.stop(); root.classList.remove('x-in');
    setTimeout(() => { try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); root.remove(); }, 1200);
    opts.onClose && opts.onClose();
  }
  root.querySelector('.x-dr-x').addEventListener('click', close);
  return { close, state: S };
}
