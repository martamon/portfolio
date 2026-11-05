// A drive along the coast of the ría de Muros e Noia: a tiny, very cute car on a Galician road in the soft low-poly "summer afternoon" look.
// Arrow keys (or the buttons on a phone) drive it anywhere: through the villages (O Freixo, Esteiro, Outes, Muros, Louro), over the grass and
// into the sea, where the world turns turquoise and the car keeps rolling along the seabed, past fish and an old wreck. Glowing orbs hold
// information about the ría; press E (or tap the button) next to one to read it.
import * as THREE from './three.module.min.js';
import { INFO, TALKERS, TALKER_NAMES, getLang, tr } from './i18n.js?v=22';
import { stall, KINDS } from './mercadillo.js?v=1';

const PI = Math.PI, LI = ['en', 'es', 'gl'];
// phones and weak devices get a lighter version: fewer pixels, no velvet sheen, cheaper shadows and fewer objects
const LOW = (typeof innerWidth !== 'undefined' && innerWidth < 760) || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const PM = (o) => { if (!LOW) return new THREE.MeshPhysicalMaterial(o); const q = Object.assign({}, o); delete q.sheen; delete q.sheenRoughness; delete q.sheenColor; delete q.bumpMap; delete q.bumpScale; return new THREE.MeshStandardMaterial(q); };

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
// painted-looking surfaces: speckled asphalt with fine cracks, and earthy, mottled sand for kerbs and lanes
const mkTex = (draw, N) => { const cv = document.createElement('canvas'); cv.width = cv.height = N || 256; const g = cv.getContext('2d'); draw(g, cv.width); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
let ASPH = null, SANDT = null;
const asphTex = () => ASPH || (ASPH = mkTex((g, N) => { g.fillStyle = '#f3f3f3'; g.fillRect(0, 0, N, N); let sd = 11; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; for (let i = 0; i < 2600; i++) { const v = 205 + r() * 50; g.fillStyle = `rgba(${v},${v},${v + 4},${.35 + r() * .4})`; g.fillRect(r() * N, r() * N, 1 + r() * 2.2, 1 + r() * 2.2); } g.strokeStyle = 'rgba(110,116,126,.35)'; g.lineWidth = 1.2; for (let k = 0; k < 4; k++) { let x = r() * N, y = r() * N; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (r() - .5) * 40; y += 14 + r() * 24; g.lineTo(x, y); } g.stroke(); } }));
const sandTex = () => SANDT || (SANDT = mkTex((g, N) => { g.fillStyle = '#f6f1e8'; g.fillRect(0, 0, N, N); let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; for (let i = 0; i < 70; i++) { const x = r() * N, y = r() * N, rad = 10 + r() * 30, c = r() < .5 ? '255,244,224' : '214,196,170'; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${c},.35)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(150,130,100,${.08 + r() * .12})`; g.fillRect(r() * N, r() * N, 1 + r() * 2, 1 + r() * 2); } }));
let CONT = null; const contactTex = () => CONT || (CONT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 6, 32, 32, 31); gr.addColorStop(0, 'rgba(30,45,55,.42)'); gr.addColorStop(.7, 'rgba(30,45,55,.2)'); gr.addColorStop(1, 'rgba(30,45,55,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })());
let FELT = null; const feltTexD = () => { if (FELT) return FELT; const N = 192, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, N, N); let sd = 3; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; for (let i = 0; i < 1500; i++) { const x = r() * N, y = r() * N, a = r() * 6.28, l = 3 + r() * 6, v = r() < .5 ? 20 : 235; g.strokeStyle = `rgba(${v},${v},${v},${.16 + r() * .2})`; g.lineWidth = .8 + r() * .8; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); } } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; FELT = t; return t; };
const matCache = new Map();
const std = (color, extra) => { const k = extra ? null : color; if (k !== null && matCache.has(k)) return matCache.get(k); const base = PASTEL(color), m = PM(Object.assign({ color: base, roughness: .95, map: paintTex(), bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenRoughness: .55, sheenColor: base.clone().lerp(new THREE.Color(0xfff3e4), .6) }, extra || {})); if (k !== null) matCache.set(k, m); return m; };
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
// a beach buoy (boya de playa): a round red-and-white float on a little chain, with a glowing lantern on top
function buoy() {
  const g = new THREE.Group(), glow = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffc34a, emissiveIntensity: 1.2, roughness: .5 });
  const add = (geo, col, x, y, z, ex) => { const o = new THREE.Mesh(geo, col && col.isMaterial ? col : std(col, ex)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const R = .95; add(new THREE.SphereGeometry(R, 20, 14), 0xf6f1e4, 0, 0, 0);
  for (let k = 0; k < 4; k++) { const st = add(new THREE.SphereGeometry(R * 1.012, 20, 14, k * PI / 2, PI / 4, 0, PI), 0xe0584a, 0, 0, 0); st.scale.set(1, 1, 1); }
  add(new THREE.TorusGeometry(R * .98, .06, 8, 28), 0x2f6fa8, 0, 0, 0).rotation.x = PI / 2;
  add(new THREE.CylinderGeometry(.14, .2, .5, 10), 0x3a3f47, 0, R + .1, 0); add(new THREE.CylinderGeometry(.34, .34, .06, 14), 0xe0584a, 0, R + .38, 0);
  const lamp = add(new THREE.SphereGeometry(.3, 12, 10), glow, 0, R + .72, 0); lamp.castShadow = false; add(new THREE.ConeGeometry(.36, .26, 10), 0x3a3f47, 0, R + 1.05, 0);
  add(new THREE.TorusGeometry(.16, .045, 6, 12), 0x8a8f96, 0, -R - .1, 0).rotation.x = PI / 2; for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(.09, .03, 5, 8), 0x8a8f96, 0, -R - .35 - k * .2, 0).rotation.y = k * PI / 2;
  g.userData.mat = glow; return g;
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
const ISL_Z = 6, ISL_X = COAST(ISL_Z) + 32, DECK_Y = 3.5;          // a little island out in the ría, joined to the coast by an old stone bridge
const FLATS = VILLAGES.map(([, z]) => [ROADX(z) - 9, z, 21, ROADH(z)]);
function H(x, z) {
  const c = COAST(z), hills = sstep(c - 24, c - 70, x) * (3.2 + noise(x * .5 + 9, z * .4) * 1.6) + noise(x * .6, z * .6) * .35 * (1 + sstep(c - 20, c - 60, x) * 2);
  let h = ROADH(z) + hills; const k = sstep(c - 4, c + 5, x);
  const bz = sstep(44, 54, z) * (1 - sstep(78, 88, z)); h += Math.exp(-Math.pow(x - (c - 11), 2) / 34) * bz * (1.7 + noise(x * .3, z * .3) * .6) * (1 - k);                     // the dunes behind the beach of Area Maior
  h = h * (1 - k) + (-5.4 + noise(x * .4, z * .4) * .45 + sstep(c + 3, c + 40, x) * -2.2) * k;
  const rx = ROADX(z), dr = Math.abs(x - rx); h += (ROADH(z) - h) * sstep(9, 3.2, dr) * (1 - k);
  for (const f of FLATS) { const d = Math.hypot(x - f[0], z - f[1]); if (d < f[2] * 1.6) h += (f[3] - h) * (1 - sstep(f[2] * .7, f[2] * 1.6, d)) * (1 - k); }
  { const di = Math.hypot((x - ISL_X) * .85, z - ISL_Z); if (di < 15) { const ih = -.9 + 5.2 * (1 - sstep(2.5, 12.5, di)) + noise(x * .5, z * .5) * .25 * (1 - sstep(2, 12, di)); h = Math.max(h, ih); } }
  return h;
}

// ---------------------------------------------------------------- the car
function rbox(w, h, d, r) {
  const g = new THREE.BoxGeometry(w, h, d, 5, 5, 5), p = g.attributes.position, v = new THREE.Vector3(), lim = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.copy(v).clamp(new THREE.Vector3(-lim.x, -lim.y, -lim.z), lim); v.sub(c); if (v.lengthSq() > 1e-10) v.normalize().multiplyScalar(r); p.setXYZ(i, c.x + v.x, c.y + v.y, c.z + v.z); }
  g.computeVertexNormals(); return g;
}
function buildBike() {
  // a little coral bicycle with a flower basket, and a very cute rider in a straw hat who pedals
  const g = new THREE.Group(), coral = 0xf08a76, cream = 0xfff3dc, dark = 0x3a3f4a, shirtC = 0x7fb8e0, skin = 0xf3cba5;
  const m = (geo, col, p, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); if (p) o.position.set(p[0], p[1], p[2]); o.castShadow = true; g.add(o); return o; };
  const tube = (a, b, r, col) => { const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), std(col)); o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); o.castShadow = true; g.add(o); return o; };
  const wheel = (x) => { const w = new THREE.Group(); w.position.set(x, .6, 0); const tire = new THREE.Mesh(new THREE.TorusGeometry(.56, .1, 8, 24), std(dark)); tire.castShadow = true; w.add(tire); const rim = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 6, 24), std(cream)); w.add(rim); for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.0, 4), std(0xe9e2d2)); sp.rotation.z = k * PI / 6; w.add(sp); } const hub = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .2, 8), std(coral)); hub.rotation.x = PI / 2; w.add(hub); g.add(w); return w; };
  const fw = wheel(1.05), bw = wheel(-1.05);
  // the frame, fork, bars, seat and basket
  const BB = [-.05, .7, 0], ST = [-.45, 1.45, 0], HT = [.62, 1.4, 0];
  tube([-1.05, .6, 0], BB, .05, coral); tube(BB, ST, .055, coral); tube(ST, HT, .05, coral); tube(BB, HT, .055, coral); tube([-1.05, .6, 0], ST, .045, coral);
  tube(HT, [.78, 1.7, 0], .05, cream);
  const fork = new THREE.Group(); fork.position.set(.7, 1.5, 0); g.add(fork); const fk = tube([0, 0, 0], [.35, -.9, 0], .05, cream); g.remove(fk); fork.add(fk);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.1, 6), std(dark)); bar.rotation.x = PI / 2; bar.position.set(-.02, .22, 0); fork.add(bar); for (const sz of [-1, 1]) { const gr = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 5), std(coral)); gr.position.set(-.02, .22, sz * .56); fork.add(gr); }
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(.42, .34, .38, 10, 1, true), std(0xd9b27a, { side: THREE.DoubleSide })); basket.position.set(.5, -.05, 0); fork.add(basket); const bb = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .04, 10), std(0xc9a066)); bb.position.set(.5, -.23, 0); fork.add(bb);
  [[0xf59ab8, 0, .2, .1], [0xffd86b, .12, .23, -.12], [0xffffff, -.1, .22, -.1], [0xc9a5e8, .05, .28, 0]].forEach(([c, x, y, z]) => { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 1), std(c)); f.position.set(.5 + x, y, z); fork.add(f); });
  m(rbox(.7, .14, .34, .06), dark, [-.5, 1.52, 0]); const crank = new THREE.Group(); crank.position.set(BB[0], BB[1], BB[2]); g.add(crank); const ring = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .05, 12), std(0xe9e2d2)); ring.rotation.x = PI / 2; ring.position.z = .1; crank.add(ring);
  const pedals = []; for (const sz of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(.4, .06, .06), std(dark)); arm.position.set(sz < 0 ? .2 : -.2, 0, sz * .16); crank.add(arm); const pd = new THREE.Mesh(new THREE.BoxGeometry(.3, .06, .18), std(dark)); pd.position.set(sz < 0 ? .4 : -.4, 0, sz * .22); crank.add(pd); pedals.push([arm, pd, sz]); }
  // the rider: an egg body, a big round head with dot eyes, pink cheeks and a straw hat
  const rider = new THREE.Group(); rider.position.set(-.45, 1.55, 0); g.add(rider);
  const rm = (geo, col, p, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(p[0], p[1], p[2]); o.castShadow = true; rider.add(o); return o; };
  const torso = rm(new THREE.IcosahedronGeometry(.5, 2), shirtC, [.1, .62, 0]); torso.scale.set(.95, 1.2, .9); torso.rotation.z = -.25;
  rm(new THREE.IcosahedronGeometry(.46, 2), skin, [.38, 1.55, 0]);
  for (const sz of [-1, 1]) { rm(new THREE.IcosahedronGeometry(.055, 1), 0x2b2530, [.8, 1.62, sz * .17]); rm(new THREE.IcosahedronGeometry(.08, 1), 0xf08a8a, [.74, 1.46, sz * .3]).scale.set(.5, .8, 1); }
  const RED = 0xc4472b;
  const hairCap = rm(new THREE.SphereGeometry(.5, 14, 10, 0, PI * 2, 0, PI * .64), RED, [.3, 1.56, 0]); hairCap.rotation.z = .22;
  const curtain = rm(new THREE.IcosahedronGeometry(.5, 2), RED, [-.02, 1.05, 0]); curtain.scale.set(.34, 1.05, .78);                      // long red hair falling down the back
  const locks = [-1, 1].map((sz) => { const l = rm(new THREE.IcosahedronGeometry(.3, 1), RED, [.2, 1.25, sz * .42]); l.scale.set(.5, 1.35, .42); return l; });
  const hatG = new THREE.Group(); rider.add(hatG);
  { const mk = (geo, col, p) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(p[0], p[1], p[2]); o.castShadow = true; hatG.add(o); return o; };
    mk(new THREE.CylinderGeometry(.78, .78, .06, 16), 0xe9cf8a, [.36, 1.93, 0]); const dome = mk(new THREE.SphereGeometry(.44, 12, 6, 0, PI * 2, 0, PI / 2), 0xe9cf8a, [.36, 1.93, 0]); dome.scale.y = .8; mk(new THREE.CylinderGeometry(.46, .46, .1, 14), 0xf08a9a, [.36, 2.0, 0]); }
  const hoodG = new THREE.Group(); hoodG.visible = false; rider.add(hoodG);
  { const hd = new THREE.Mesh(new THREE.SphereGeometry(.58, 14, 10, 0, PI * 2, 0, PI * .66), std(0xf4c64a)); hd.position.set(.28, 1.6, 0); hd.scale.set(1.0, 1.02, 1.08); hd.castShadow = true; hoodG.add(hd); const pk = new THREE.Mesh(new THREE.ConeGeometry(.3, .5, 8), std(0xf4c64a)); pk.rotation.z = -PI / 2; pk.position.set(.78, 1.86, 0); hoodG.add(pk); const tie = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 6, 16), std(0xfff3dc)); tie.rotation.x = PI / 2; tie.position.set(.34, 1.25, 0); hoodG.add(tie); }
  // ---- the wardrobe: cosy outfits for the rider (a hat, a knit or cardigan, a scarf, a skirt or dungarees); the button of the ride cycles through them
  const wad = new THREE.Group(); rider.add(wad);
  const wm = (geo, col, p, rot, sc) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(p[0], p[1], p[2]); if (rot) o.rotation.set(rot[0], rot[1], rot[2]); if (sc) o.scale.set(sc[0], sc[1], sc[2]); o.castShadow = true; return o; };
  const hats = [hatG];
  { const mk = () => { const h = new THREE.Group(); h.visible = false; rider.add(h); hats.push(h); return h; }, SP = (r, a, b) => new THREE.SphereGeometry(r, 14, 10, 0, PI * 2, a || 0, b || PI);
    const beanie = mk(); beanie.userData.cols = []; { const dome = wm(SP(.52, 0, PI * .56), 0xf3ead6, [.34, 1.7, 0]); const band = wm(new THREE.TorusGeometry(.47, .1, 8, 18).rotateX(PI / 2), 0xe9dcc2, [.34, 1.72, 0]); const pom = wm(new THREE.IcosahedronGeometry(.17, 1), 0xe9a0b4, [.3, 2.27, 0]); beanie.add(dome, band, pom); beanie.userData.cols = [dome, band, pom]; }
    const beret = mk(); { const b = wm(new THREE.SphereGeometry(.55, 14, 8), 0x8a4f5a, [.3, 1.95, .06], [0, 0, -.18], [1.1, .42, 1.1]); const stalk = wm(new THREE.CylinderGeometry(.04, .05, .12, 6), 0x6b3a44, [.28, 2.15, .06]); beret.add(b, stalk); }
    const bucket = mk(); { const crown = wm(new THREE.CylinderGeometry(.42, .5, .46, 14), 0xfff0cc, [.36, 1.98, 0]); const brim = wm(new THREE.CylinderGeometry(.74, .74, .05, 16), 0xfff0cc, [.38, 1.78, 0], [0, 0, .06]); const rib = wm(new THREE.CylinderGeometry(.505, .505, .09, 14), 0xe9a0b4, [.36, 1.84, 0]); bucket.add(crown, brim, rib); }
    const kerch = mk(); { const band = wm(new THREE.TorusGeometry(.47, .07, 8, 18).rotateX(PI / 2), 0xe9573a, [.34, 1.8, 0], [.1, 0, -.12]); const k1 = wm(new THREE.ConeGeometry(.15, .28, 6), 0xe9573a, [-.18, 1.93, .14], [0, 0, 1.5]); const k2 = wm(new THREE.ConeGeometry(.15, .28, 6), 0xe9573a, [-.18, 1.93, -.14], [0, 0, 1.5]); kerch.add(band, k1, k2); }
    const flowers = mk(); { const ring = wm(new THREE.TorusGeometry(.47, .05, 8, 20).rotateX(PI / 2), 0x7cc47a, [.34, 1.88, 0], [.08, 0, -.1]); flowers.add(ring); [0xf59ab8, 0xffffff, 0xf2c14a, 0xc9a0e8, 0xff8f7a, 0xf59ab8, 0xffffff, 0xf2c14a].forEach((c, k) => { const a = k / 8 * PI * 2; flowers.add(wm(new THREE.SphereGeometry(.1, 8, 6), c, [.34 + Math.cos(a) * .47, 1.9 + Math.sin(k * 1.7) * .02, Math.sin(a) * .47])); }); }
    const bow = mk(); { const l = wm(new THREE.ConeGeometry(.2, .42, 8), 0xe9a0b4, [.2, 2.12, .2], [PI / 2, 0, .6]), r = wm(new THREE.ConeGeometry(.2, .42, 8), 0xe9a0b4, [.2, 2.12, -.02], [PI / 2, 0, -.6]), kn = wm(new THREE.SphereGeometry(.1, 10, 8), 0xd9809a, [.2, 2.12, .1]); bow.add(l, r, kn); const band = wm(new THREE.TorusGeometry(.47, .04, 8, 20).rotateX(PI / 2), 0xe9a0b4, [.34, 1.84, 0], [.05, 0, -.1]); bow.add(band); }
    const sailor = mk(); { const top = wm(new THREE.CylinderGeometry(.46, .5, .26, 16), 0xfdf6e6, [.36, 1.96, 0]), disc = wm(new THREE.CylinderGeometry(.58, .5, .08, 16), 0xfdf6e6, [.36, 2.1, 0]), band = wm(new THREE.CylinderGeometry(.505, .505, .07, 16), 0x2f4f7a, [.36, 1.89, 0]), pom = wm(new THREE.SphereGeometry(.07, 8, 6), 0xc0453a, [.36, 2.17, 0]); sailor.add(top, disc, band, pom); } }
  const scarf = wm(new THREE.TorusGeometry(.31, .1, 8, 18).rotateX(PI / 2), 0xc9674f, [.27, 1.1, 0], [0, 0, -.25]); scarf.visible = false; wad.add(scarf);
  const tail = wm(new THREE.CylinderGeometry(.08, .1, .5, 8), 0xc9674f, [-.02, .92, .27], [0, 0, .25]); tail.visible = false; wad.add(tail);
  const skirt = wm(new THREE.CylinderGeometry(.3, .66, .62, 16, 1, true), 0xf2c14a, [.06, .12, 0], [0, 0, -.1], [1, 1, .95]); skirt.material.side = THREE.DoubleSide; skirt.visible = false; wad.add(skirt);
  const bib = wm(new THREE.BoxGeometry(.3, .5, .6), 0x5fae8a, [.3, .78, 0], [0, 0, -.25]); bib.visible = false; wad.add(bib);
  const FITS = [
    { n: ['Straw hat & coral jumper', 'Sombrero de paja y jersey coral', 'Sombreiro de palla e xersei coral'], torso: shirtC, sleeve: null, legs: 0x4f6b8c, shoe: 0xf08a76, hat: 0 },
    { n: ['Cream beanie & cable-knit scarf', 'Gorro crema y bufanda de punto', 'Gorro crema e bufanda de punto'], torso: 0xf0e2c8, sleeve: 0xf0e2c8, legs: 0x8a6a4c, shoe: 0x6b4a2e, hat: 1, scarf: 0xc9674f },
    { n: ['Lavender cardigan & beret', 'Cárdigan lavanda y boina', 'Cárdigan lavanda e boina'], torso: 0xc9b4e8, sleeve: 0xc9b4e8, legs: 0x6a7aa0, shoe: 0xf6efe0, hat: 2 },
    { n: ['Sunflower dress', 'Vestido girasol', 'Vestido xirasol'], torso: 0xf2c14a, sleeve: null, legs: 0xf6efe0, shoe: 0xc9674f, hat: 3, skirt: 0xf2c14a },
    { n: ['Green dungarees & bucket hat', 'Peto verde y gorro de pescador', 'Peto verde e gorro de pescador'], torso: 0xf6efe0, sleeve: 0xf6efe0, legs: 0x5fae8a, shoe: 0xf2c14a, hat: 3, bib: 0x5fae8a },
    { n: ['Galician check skirt & kerchief', 'Falda de cuadros y pañuelo gallego', 'Saia de cadros e pano galego'], torso: 0x3f6f98, sleeve: 0x3f6f98, legs: 0xf6efe0, shoe: 0x6b4a2e, hat: 4, skirt: 0xc0453a, scarf: 0xf6efe0 },
  ];
  FITS.push(
    { n: ['Flower crown & white linen dress', 'Corona de flores y vestido de lino', 'Coroa de flores e vestido de liño'], torso: 0xfdf6e6, sleeve: null, legs: 0xfdf6e6, shoe: 0xe9dcc2, hat: 5, skirt: 0xfdf6e6 },
    { n: ['Pink knit jumper & bow', 'Jersey rosa de punto y lazo', 'Xersei rosa de punto e lazo'], torso: 0xf2b6c8, sleeve: 0xf2b6c8, legs: 0x8a8fb0, shoe: 0xfdf6e6, hat: 6 },
    { n: ['Sailor top & cap', 'Marinera con gorra', 'Mariñeira con gorra'], torso: 0x2f4f7a, sleeve: 0x2f4f7a, legs: 0xfdf6e6, shoe: 0xc0453a, hat: 7, scarf: 0xc0453a },
    { n: ['Mustard wool coat & beanie', 'Abrigo de lana mostaza y gorro', 'Abrigo de la mostarda e gorro'], torso: 0xe0a63c, sleeve: 0xe0a63c, legs: 0x6b4a2e, shoe: 0x4a3324, hat: 1, hatCol: 0x8a5a3c, hatCol2: 0xe0a63c, scarf: 0xf6efe0 },
    { n: ['Peach sundress & straw hat', 'Vestido melocotón y sombrero de paja', 'Vestido pexego e sombreiro de palla'], torso: 0xf6c4a8, sleeve: null, legs: 0xf0e4d0, shoe: 0xf6c4a8, hat: 0, skirt: 0xf6c4a8 },
    { n: ['Forest-green poncho & kerchief', 'Poncho verde bosque y pañuelo', 'Poncho verde bosque e pano'], torso: 0x4f8a6a, sleeve: 0x4f8a6a, legs: 0x6b4a2e, shoe: 0xe9dcc2, hat: 4, hatCol: 0xe0a63c, skirt: 0x4f8a6a },
    { n: ['Sky-blue denim & cream cardigan', 'Vaqueros y cárdigan crema', 'Vaqueiros e cárdigan crema'], torso: 0xf3ead6, sleeve: 0xf3ead6, legs: 0x7aa6d8, shoe: 0xf3ead6, hat: 3, hatCol: 0x7aa6d8 },
  );
  let fit = 0;
  const arms = []; for (const sz of [-1, 1]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.09, .08, 1, 6), std(skin)); a.userData.skin = true; a.castShadow = true; rider.add(a); arms.push([a, sz]); }
  const legs = []; for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.13, .1, 1, 6), std(0x4f6b8c)); l.castShadow = true; rider.add(l); const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.14, 1), std(0xf08a76)); f.scale.set(1.6, .8, 1); rider.add(f); legs.push([l, f, sz]); }
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  const seg = (o, a, b) => { _b.copy(b).sub(a); const L = _b.length(); o.position.copy(a).addScaledVector(_b, .5); o.scale.set(1, L, 1); o.quaternion.setFromUnitVectors(_up, _b.normalize()); };
  let ang = 0;
  let wet = false;
  const hatBase = new Map(); hats.forEach((h) => { h.children.forEach((m, k) => hatBase.set(m, m.material)); });
  const dress = () => { const f = FITS[fit]; hats.forEach((h, i) => { h.visible = !wet && i === f.hat; if (i > 0) h.children.forEach((m, k) => { m.material = f.hat === i && f.hatCol ? (k === 0 || i === 3 && k < 2 || i === 4 ? std(f.hatCol) : (f.hatCol2 && i === 1 ? std(f.hatCol2) : hatBase.get(m))) : hatBase.get(m); }); }); hoodG.visible = wet; torso.material = std(wet ? 0xf4c64a : f.torso); for (const [a] of arms) a.material = std(wet ? 0xf4c64a : (f.sleeve || skin));
    legs.forEach(([l, ft]) => { l.material = std(f.legs); ft.material = std(f.shoe); }); scarf.visible = !!f.scarf && !wet; tail.visible = scarf.visible && fit === 1; if (f.scarf) { scarf.material = std(f.scarf); tail.material = std(f.scarf); }
    skirt.visible = !!f.skirt; if (f.skirt) { skirt.material = std(f.skirt); skirt.material.side = THREE.DoubleSide; } bib.visible = !!f.bib && !wet; if (f.bib) bib.material = std(f.bib); };
  g.userData.setRain = (on) => { if (on === wet) return; wet = on; dress(); };
  g.userData.setOutfit = (i) => { fit = ((i % FITS.length) + FITS.length) % FITS.length; dress(); return FITS[fit].n; }; g.userData.fits = FITS.length; g.userData.fitsData = FITS;
  g.userData.anim = (v, dt, steer) => {
    curtain.rotation.z = Math.min(.3, Math.abs(v) * .028) + Math.sin(ang * 2) * .02; locks.forEach((l, k) => { l.rotation.z = Math.min(.35, Math.abs(v) * .03) + Math.sin(ang * 2 + k) * .03; });
    fw.rotation.z -= v * dt / .56; bw.rotation.z -= v * dt / .56; fork.rotation.y = steer * .5; ang -= v * dt * .9;
    crank.rotation.z = ang; for (const [arm, pd, sz] of pedals) { /* the pedals stay flat as the cranks turn */ pd.rotation.z = -ang; }
    const R = (ph) => [Math.cos(ang + ph) * .4, Math.sin(ang + ph) * .4];
    legs.forEach(([l, f, sz], k) => { const [px, py] = R(k ? PI : 0), hip = _a.set(.05, .2, sz * .2).clone(), foot = new THREE.Vector3(BB[0] + px - rider.position.x + .02, BB[1] + py - rider.position.y, sz * .22); seg(l, hip, foot); f.position.copy(foot).add(new THREE.Vector3(.1, -.02, 0)); });
    arms.forEach(([a, sz]) => { const sh = new THREE.Vector3(.3, 1.0, sz * .36), hand = new THREE.Vector3(1.13, .17, sz * .56); seg(a, sh, hand); });
    rider.rotation.z = Math.sin(ang * 2) * .02;
  };
  g.userData.rider = rider; g.userData.legs = legs; g.userData.anim(0, 0, 0); return g;
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
  g.userData.r = Math.max(w, d) * .5 + .8; g.userData.hx = w / 2 + .35; g.userData.hz = d / 2 + .35; g.userData.porch = d / 2 + 1.6; return g;
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
const PEOPLE = [];
function person(shirt, skin, bagCol) {
  const g = new THREE.Group(), m = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const body = m(new THREE.IcosahedronGeometry(.5, 2), shirt, 0, .95, 0); body.scale.set(1, 1.15, .9);
  for (const sz of [-1, 1]) { m(new THREE.IcosahedronGeometry(.2, 1), 0x3a4a63, .05, .22, sz * .22).scale.set(1.3, .8, 1); const arm = m(new THREE.IcosahedronGeometry(.17, 1), skin, 0, .95, sz * .5); arm.userData.arm = sz; }
  m(new THREE.IcosahedronGeometry(.4, 2), skin, 0, 1.85, 0);
  for (const sz of [-1, 1]) { m(new THREE.IcosahedronGeometry(.05, 1), 0x2b2530, .36, 1.9, sz * .14); m(new THREE.IcosahedronGeometry(.07, 1), 0xf08a8a, .33, 1.76, sz * .26).scale.set(.5, .8, 1); }
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 6, 0, PI * 2, 0, PI * .55), std([0x4a3326, 0x2b2530, 0xb5651d, 0xe0b45a, 0x7a4a2a][Math.floor(rng() * 5)])); hair.position.set(-.03, 1.9, 0); hair.rotation.z = .1; g.add(hair);
  if (bagCol) { const bag = new THREE.Mesh(rbox(.42, .5, .3, .08), std(bagCol)); bag.position.set(.1, .5, .72); bag.castShadow = true; g.add(bag); const hd = new THREE.Mesh(new THREE.TorusGeometry(.12, .02, 5, 10, PI), std(0x4a4038)); hd.position.set(.1, .8, .72); g.add(hd); }
  const um = new THREE.Group(); const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 6, 0, PI * 2, 0, PI / 2), std([0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xe9a0c0][Math.floor(rng() * 5)])); dome.scale.y = .55; dome.position.y = 2.75; const hd = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.2, 5), std(0x4a4038)); hd.position.y = 2.15; um.add(dome, hd); um.visible = false; g.add(um); g.userData.um = um;
  g.userData.person = 1; PEOPLE.push(g);
  return g;
}
// a bus shelter: a coral roof, glass back and sides, a bench, a timetable and a round BUS sign
function busStop() {
  const g = new THREE.Group(), dk = 0x3a4452, add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  for (const sx of [-1.95, 1.95]) for (const sz of [-.9, .9]) add(new THREE.CylinderGeometry(.09, .09, 3.1, 6), dk, sx, 1.55, sz);
  add(rbox(4.4, .22, 2.3, .08), 0xe36d57, 0, 3.2, 0);
  add(new THREE.BoxGeometry(3.9, 2.2, .06), 0xbfe3ee, 0, 1.7, -.9, { transparent: true, opacity: .45, roughness: .2 });
  for (const sx of [-1.95, 1.95]) add(new THREE.BoxGeometry(.06, 2.2, 1.8), 0xbfe3ee, sx, 1.7, 0, { transparent: true, opacity: .4, roughness: .2 });
  add(rbox(3.2, .16, .7, .05), 0xa5835c, 0, .95, -.55); add(new THREE.BoxGeometry(.12, .9, .5), dk, -1.4, .45, -.55); add(new THREE.BoxGeometry(.12, .9, .5), dk, 1.4, .45, -.55);
  { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const c = cv.getContext('2d'); c.fillStyle = '#2f6fa8'; c.beginPath(); c.arc(48, 48, 44, 0, 6.3); c.fill(); c.fillStyle = '#fff6e4'; c.font = '700 38px "Switzer","Inter",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS', 48, 52); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const sg = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 1 })); sg.position.set(2.3, 2.6, 0); sg.rotation.y = PI / 2; g.add(sg); add(new THREE.CylinderGeometry(.05, .05, 2.6, 5), dk, 2.3, 1.3, 0); }
  add(new THREE.BoxGeometry(.9, 1.0, .05), 0xf6f0e2, 1.3, 1.9, -.86);
  g.userData.hx = 2.3; g.userData.hz = 1.25; g.userData.r = 2.6; return g;
}
// a supermarket: a wide pale building with a glass front, coral awning, a big sign, crates of fruit and a row of trolleys
function supermercado(label) {
  const g = new THREE.Group(), add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, std(col, extra)); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(rbox(14, 4.4, 8, .3), 0xf3e8d2, 0, 2.2, 0); add(rbox(14.6, .5, 8.6, .15), 0xe36d57, 0, 4.6, 0);
  add(new THREE.BoxGeometry(9.6, 2.2, .12), 0x7fb0c8, -1.2, 1.9, 4.04, { roughness: .2, transparent: true, opacity: .8 });
  for (let i = 0; i <= 6; i++) add(new THREE.BoxGeometry(.1, 2.3, .16), 0xf6efe0, -6 + i * 1.6, 1.9, 4.06);
  add(new THREE.BoxGeometry(2.4, 2.4, .14), 0x6f9db6, 5.2, 1.3, 4.05, { roughness: .2 }); add(new THREE.BoxGeometry(.1, 2.4, .18), 0xf6efe0, 5.2, 1.3, 4.07);
  for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(1.6, .14, 1.9), i % 2 ? 0xfff6e8 : 0xe36d57, -6.4 + i * 1.6, 3.35, 4.9).rotation.x = .28;        // a striped awning over the whole front
  { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#2f6fa8'; c.fillRect(0, 0, 1024, 256); c.strokeStyle = '#fff6e4'; c.lineWidth = 10; c.strokeRect(14, 14, 996, 228);
    let fs = 130; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6e4'; do { c.font = '700 ' + fs + 'px "Switzer","Inter",system-ui,sans-serif'; fs -= 4; } while (c.measureText(label).width > 900 && fs > 30); c.fillText(label, 512, 134);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const side = new THREE.MeshStandardMaterial({ color: 0x2f6fa8, roughness: 1 });
    const sg = new THREE.Mesh(new THREE.BoxGeometry(9, 2.25, .16), [side, side, side, side, new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), side]); sg.position.set(0, 5.9, 3.6); sg.castShadow = true; g.add(sg);
    for (const sx of [-3.6, 3.6]) add(new THREE.BoxGeometry(.18, 1.5, .18), 0xf6efe0, sx, 5.1, 3.6); }
  const fr = [0xe9577a, 0xf2a43a, 0x8fcf6a, 0xf5d66a]; for (let k = 0; k < 4; k++) { add(rbox(1.5, .6, 1.0, .08), 0xb98a5a, 6.8 + (k % 2) * 1.7, .3, 3.5 + Math.floor(k / 2) * 1.3); for (let q = 0; q < 6; q++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.24, 1), std(fr[k])); f.position.set(6.8 + (k % 2) * 1.7 - .45 + (q % 3) * .45, .72, 3.5 + Math.floor(k / 2) * 1.3 - .2 + Math.floor(q / 3) * .4); f.castShadow = true; g.add(f); } }
  for (let k = 0; k < 4; k++) { const c = cart(); c.position.set(-5.6 + k * .9, 0, 5.4); c.rotation.y = PI / 2; g.add(c); }
  g.userData.hx = 7.5; g.userData.hz = 4.5; g.userData.r = 8.4; return g;
}
function cart() {
  const g = new THREE.Group(), m = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  m(rbox(.8, .45, .55, .06), 0xd6dce2, 0, .75, 0); m(new THREE.BoxGeometry(.06, .6, .6), 0x3a4452, -.45, 1.0, 0); m(new THREE.BoxGeometry(.7, .05, .5), 0x3a4452, 0, .42, 0);
  for (const sx of [-.3, .3]) for (const sz of [-.22, .22]) m(new THREE.CylinderGeometry(.07, .07, .05, 6), 0x3a4452, sx, .12, sz).rotation.x = PI / 2;
  return g;
}
// a fisherman with a rod over the water
function fisher(shirt, skin) {
  const g = person(shirt, skin), rod = new THREE.Group(); rod.position.set(.4, 1.2, .55); g.add(rod);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(.02, .035, 3.4, 5), std(0x5a4a38)); r.position.y = 1.5; r.rotation.z = -1.0; r.position.x = .95; rod.add(r);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, 2.6, 3), std(0xf4eadb)); line.position.set(2.5, 1.65 - 1.25, 0); rod.add(line);
  const bob = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), std(0xe36d57)); bob.position.set(2.5, 0, 0); rod.add(bob); g.userData.bob = bob; g.userData.rod = rod; return g;
}
// a flowering toxo (gorse): a spiny green bush covered in glowing yellow flowers
function toxo() {
  const g = new THREE.Group(), gm = std(0x4a7a3a, { flatShading: true }), fm = new THREE.MeshStandardMaterial({ color: 0xffd52e, emissive: 0xffc400, emissiveIntensity: 1.0, roughness: .6 });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 1), gm); core.scale.set(1.15, .8, 1.15); core.position.y = .15; g.add(core);
  for (let i = 0; i < 26; i++) { const a = rng() * 6.28, b = rng() * 1.25, sp = new THREE.Mesh(new THREE.ConeGeometry(.07, .8 + rng() * .5, 4), gm); sp.position.set(Math.cos(a) * Math.sin(b) * .5, .2 + Math.cos(b) * .45, Math.sin(a) * Math.sin(b) * .5); sp.lookAt(sp.position.clone().multiplyScalar(3).add(new THREE.Vector3(0, -.1, 0))); sp.rotateX(PI / 2); g.add(sp); }
  for (let i = 0; i < 46; i++) { const a = rng() * 6.28, b = rng() * 1.3, r = .62 + rng() * .5, f = new THREE.Mesh(new THREE.IcosahedronGeometry(.1 + rng() * .08, 0), fm); f.position.set(Math.cos(a) * Math.sin(b) * r * 1.1, .15 + Math.cos(b) * r * .85, Math.sin(a) * Math.sin(b) * r * 1.1); g.add(f); }
  g.userData.mat = fm; return g;
}
// small pictures for the information cards (pastel drawings, labelled in the language of the visitor)
function artFor(id, lang) {
  const T = (a) => a[lang], bg = '<rect width="340" height="190" rx="18" fill="#eef6f4"/>';
  if (id === 0) { const pts = [...Array(5)].map((_, k) => { const a = -PI / 2 + k * PI * 2 / 5; return [170 + Math.cos(a) * 66, 100 + Math.sin(a) * 66]; }), names = ['Muros', 'Outes', 'Noia', 'Lousame', 'Porto do Son'], star = [...Array(10)].map((_, k) => { const a = -PI / 2 + k * PI / 5, r = k % 2 ? 26 : 70; return (170 + Math.cos(a) * r).toFixed(1) + ',' + (100 + Math.sin(a) * r).toFixed(1); }).join(' ');
    return '<svg viewBox="0 0 340 190">' + bg + '<polygon points="' + star + '" fill="#8fd3dd" stroke="#5fb4c4" stroke-width="3" stroke-linejoin="round"/>' + pts.map((q, k) => '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="6" fill="#e36d57"/><text x="' + (q[0] + (k === 0 ? 0 : k < 3 ? 12 : -12)).toFixed(1) + '" y="' + (q[1] + (k === 0 ? -12 : 4)).toFixed(1) + '" font-size="12" font-weight="600" fill="#4a3340" text-anchor="' + (k === 0 ? 'middle' : k < 3 ? 'start' : 'end') + '" font-family="system-ui,sans-serif">' + names[k] + '</text>').join('') + '<text x="170" y="104" font-size="11" font-weight="700" fill="#2f6f80" text-anchor="middle" font-family="system-ui,sans-serif">A Ría da Estrela</text></svg>'; }
  if (id === 5) return '<img src="/extras/img/area-maior.webp?v=1" alt="Area Maior" loading="lazy">';
  if (id === 5 + 1000) return '<svg viewBox="0 0 340 190">' + '<rect width="340" height="190" rx="18" fill="#cfe9f4"/><circle cx="270" cy="46" r="22" fill="#ffe9a8"/><path d="M0 120 Q60 70 120 100 T250 92 T340 110 V190 H0Z" fill="#f2d9a8"/><path d="M0 150 Q80 128 170 146 T340 140 V190 H0Z" fill="#e9c98f"/><path d="M0 168 Q60 156 120 166 T240 164 T340 166 V190 H0Z" fill="#74cfdb"/><path d="M0 178 Q50 170 110 177 T230 176 T340 178 V190 H0Z" fill="#9fe0e8"/><path d="M62 104 l16 -18 l16 18z" fill="#c8b8a6"/><text x="170" y="30" font-size="15" font-weight="700" fill="#4a3340" text-anchor="middle" font-family="system-ui,sans-serif">Area Maior</text></svg>';
  if (id === 6) { const L = { roof: ['Roof', 'Tejado', 'Tellado'], body: ['Slatted body', 'Cuerpo de listones', 'Corpo de listóns'], caps: ['Rat-stoppers', 'Tornarratos', 'Tornarratos'], pil: ['Pillars', 'Pilares', 'Pés'], cross: ['Cross', 'Cruz', 'Cruz'] };
    return '<svg viewBox="0 0 340 190">' + bg + '<polygon points="64,66 170,38 276,66" fill="#c9674f"/><rect x="74" y="66" width="192" height="42" fill="#a5835c"/>' + [...Array(13)].map((_, k) => '<rect x="' + (78 + k * 14.6) + '" y="68" width="5" height="38" fill="#c9a57a"/>').join('') + '<rect x="70" y="108" width="200" height="8" fill="#8d6f4d"/>' + [92, 138, 202, 248].map((x) => '<rect x="' + (x - 7) + '" y="124" width="14" height="44" fill="#bab3a3"/><rect x="' + (x - 13) + '" y="116" width="26" height="8" fill="#d8d1c1"/>').join('') + '<rect x="268" y="40" width="5" height="22" fill="#bab3a3"/><rect x="262" y="46" width="17" height="5" fill="#bab3a3"/>' + [[20, 'roof', 150, 54, 120, 50], [20, 'body', 150, 88, 100, 86], [20, 'caps', 150, 120, 80, 120], [20, 'pil', 150, 146, 92, 146]].map(([, k, x, y, ax, ay]) => '').join('') +
      '<g font-size="11" font-weight="600" fill="#4a3340" font-family="system-ui,sans-serif"><text x="12" y="30">' + T(L.roof) + '</text><line x1="14" y1="34" x2="110" y2="55" stroke="#4a3340" stroke-width="1"/><text x="12" y="86">' + T(L.body) + '</text><line x1="14" y1="90" x2="72" y2="90" stroke="#4a3340" stroke-width="1"/><text x="12" y="150">' + T(L.pil) + '</text><line x1="14" y1="146" x2="85" y2="146" stroke="#4a3340" stroke-width="1"/><text x="328" y="120" text-anchor="end">' + T(L.caps) + '</text><line x1="200" y1="120" x2="260" y2="120" stroke="#4a3340" stroke-width="1"/><text x="328" y="30" text-anchor="end">' + T(L.cross) + '</text><line x1="270" y1="34" x2="270" y2="42" stroke="#4a3340" stroke-width="1"/></g></svg>'; }
  if (id === 8) return '<img src="/extras/img/cisneros.webp?v=1" alt="Cardenal Cisneros, 1905" loading="lazy">';
  if (id === 8 + 1000) return '<svg viewBox="0 0 340 190"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9e6ee"/><stop offset="1" stop-color="#4fa5b8"/></linearGradient></defs><rect width="340" height="190" rx="18" fill="url(#sg)"/><path d="M0 40 Q40 32 85 40 T170 40 T255 40 T340 40" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M0 160 Q70 146 140 158 T340 150 V190 H0Z" fill="#f0d9ae"/><g transform="translate(150,108) rotate(-18)"><path d="M-70 0 L-58 14 H52 L78 -4 L52 -10 H-60Z" fill="#7f93a6"/><rect x="-30" y="-24" width="18" height="16" fill="#d9cdb8"/><rect x="-4" y="-34" width="9" height="26" fill="#d0875f"/><rect x="22" y="-28" width="9" height="20" fill="#d0875f"/><rect x="40" y="-36" width="2" height="26" fill="#8f7455"/></g><path d="M226 158 l14 -22 l12 10 l10 -14 l16 26z" fill="#9d978a"/><text x="170" y="22" font-size="14" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui,sans-serif" style="paint-order:stroke;stroke:#2f7f94;stroke-width:3">Cardenal Cisneros · 1905</text></svg>';
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
  const rol = ctx.createBufferSource(); rol.buffer = nb; rol.loop = true; rol.playbackRate.value = .9; const rof = ctx.createBiquadFilter(); rof.type = 'bandpass'; rof.frequency.value = 520; rof.Q.value = .5; const rog = ctx.createGain(); rog.gain.value = 0; rol.connect(rof); rof.connect(rog); rog.connect(out); rol.start();      // the soft hiss of the tyres on the road
  const tick = (v) => { const t = ctx.currentTime, b2 = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); b2.buffer = nb; f.type = 'bandpass'; f.frequency.value = 2400 + Math.random() * 600; f.Q.value = 3; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.0004, t + .05); b2.connect(f); f.connect(g); g.connect(out); b2.start(t, Math.random() * 3); b2.stop(t + .08); };       // a quiet tick of the freewheel
  let tickAt = 0;
  const note = (m, v, d, when) => { const t = when || ctx.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = .25; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0004, t + d); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + d + .1); o2.stop(t + d + .1); };
  const bubble = (v) => { const t = ctx.currentTime, f = 380 + Math.random() * 700, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.8, t + .11); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0004, t + .15); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .2); };
  const gull = () => { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(2100, t + .12); o.frequency.exponentialRampToValueAtTime(1400, t + .38); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .05); g.gain.exponentialRampToValueAtTime(.0004, t + .45); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .5); };
  const rn = ctx.createBufferSource(); rn.buffer = nb; rn.loop = true; rn.playbackRate.value = 1.6; const rf = ctx.createBiquadFilter(); rf.type = 'highpass'; rf.frequency.value = 1600; const rg = ctx.createGain(); rg.gain.value = 0; rn.connect(rf); rf.connect(rg); rg.connect(out); rn.start();
  const boatG2 = ctx.createGain(); boatG2.gain.value = 0; boatG2.connect(out); boatG2.connect(rev);
  let boatOn = false, boatV = 0; const putt = () => { if (!alive || !boatOn) return; if (!muted) { const t = ctx.currentTime, v = Math.min(1, boatV / 8), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'sine'; const fr = 62 + v * 26; o.frequency.setValueAtTime(fr * 1.5, t); o.frequency.exponentialRampToValueAtTime(fr, t + .09); o2.frequency.setValueAtTime(fr * .5, t); f.type = 'lowpass'; f.frequency.value = 300 + v * 260; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22 + v * .12, t + .008); g.gain.exponentialRampToValueAtTime(.0008, t + .13 + (1 - v) * .06); o.connect(f); o2.connect(f); f.connect(g); g.connect(boatG2); o.start(t); o2.start(t); o.stop(t + .25); o2.stop(t + .25);
      const b2 = ctx.createBufferSource(), bf = ctx.createBiquadFilter(), bg = ctx.createGain(); b2.buffer = nb; bf.type = 'lowpass'; bf.frequency.value = 500 + v * 700; bg.gain.setValueAtTime(.05 + v * .06, t); bg.gain.exponentialRampToValueAtTime(.001, t + .09); b2.connect(bf); bf.connect(bg); bg.connect(boatG2); b2.start(t, Math.random() * 3, .12); }
    timers.push(setTimeout(putt, 260 - Math.min(1, boatV / 8) * 150 + Math.random() * 12)); };
  const horn = () => { if (muted) return; const t = ctx.currentTime; for (const [fr, d] of [[196, 0], [147, .32]]) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = fr; o2.frequency.value = fr * 1.005; f.type = 'lowpass'; f.frequency.value = 600; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.09, t + d + .05); g.gain.setValueAtTime(.09, t + d + .35); g.gain.exponentialRampToValueAtTime(.001, t + d + .9); o.connect(f); o2.connect(f); f.connect(g); g.connect(out); g.connect(rev); o.start(t + d); o2.start(t + d); o.stop(t + d + 1); o2.stop(t + d + 1); } [88, 91, 95].forEach((m, k) => note(m, .03, 1.8, t + .9 + k * .14)); };
  const lap = ctx.createBufferSource(); lap.buffer = nb; lap.loop = true; lap.playbackRate.value = .55; const lapF = ctx.createBiquadFilter(); lapF.type = 'bandpass'; lapF.frequency.value = 420; lapF.Q.value = .6; const lapG = ctx.createGain(); lapG.gain.value = 0; lap.connect(lapF); lapF.connect(lapG); lapG.connect(out); lap.start();
  let alive = true, muted = false, under = false, cozyOn = false; const cg = ctx.createGain(); cg.gain.value = 0; cg.connect(out); cg.connect(rev);
  { const hs = ctx.createBufferSource(); hs.buffer = nb; hs.loop = true; hs.playbackRate.value = .7; const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 380; const hg = ctx.createGain(); hg.gain.value = .5; hs.connect(hf); hf.connect(hg); hg.connect(cg); hs.start(); }
  const crack = () => { const t = ctx.currentTime, b2 = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); b2.buffer = nb; b2.playbackRate.value = .8 + Math.random() * 1.6; f.type = 'bandpass'; f.frequency.value = 1400 + Math.random() * 3600; f.Q.value = 1.4; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 + Math.random() * .1, t + .004); g.gain.exponentialRampToValueAtTime(.0008, t + .03 + Math.random() * .08); b2.connect(f); f.connect(g); g.connect(cg); b2.start(t, Math.random() * 3, .2); };
  const clk = (hi) => { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = hi ? 1250 : 980; g.gain.setValueAtTime(.012, t); g.gain.exponentialRampToValueAtTime(.0005, t + .035); o.connect(g); g.connect(cg); o.start(t); o.stop(t + .05); };
  let tk = 0; const cozyLoop = () => { if (!alive || !cozyOn) return; if (!muted) { if (Math.random() < .7) crack(); if (Math.random() < .08) { crack(); setTimeout(crack, 50); } } timers.push(setTimeout(cozyLoop, 90 + Math.random() * 420)); };
  const simmer = () => { if (!alive || !cozyOn) return; if (!muted) { const f = 260 + Math.random() * 380, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.9, t + .09); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + .015); g.gain.exponentialRampToValueAtTime(.0005, t + .12); o.connect(g); g.connect(cg); o.start(t); o.stop(t + .15); } timers.push(setTimeout(simmer, 260 + Math.random() * 900)); };
  const clockLoop = () => { if (!alive || !cozyOn) return; if (!muted) clk(tk++ % 2); timers.push(setTimeout(clockLoop, 1000)); }; const timers = [];
  const SC = [60, 62, 64, 67, 69, 72, 74, 76];                                   // a warm major pentatonic, plucked like a ukulele
  const tune = () => { if (!alive) return; if (!muted && !under && !cozyOn) { const n = 2 + Math.floor(Math.random() * 3); let i = Math.floor(Math.random() * 5); for (let k = 0; k < n; k++) { note(SC[i], .035, 1.8, ctx.currentTime + k * .32); i = clamp(i + (Math.random() < .5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2)), 0, 7); } } timers.push(setTimeout(tune, 4200 + Math.random() * 4200)); };
  const bub = () => { if (!alive) return; if (!muted && under) { const n = 1 + Math.floor(Math.random() * 3); for (let k = 0; k < n; k++) setTimeout(() => alive && bubble(.02 + Math.random() * .02), k * 90); } timers.push(setTimeout(bub, 600 + Math.random() * 1500)); };
  const chirp = (f0, d, v, when) => { const t = when || ctx.currentTime, o = ctx.createOscillator(), lf = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (1.15 + Math.random() * .4), t + d * .5); o.frequency.exponentialRampToValueAtTime(f0 * (.85 + Math.random() * .2), t + d); lf.frequency.value = 26 + Math.random() * 14; lg.gain.value = f0 * .03; lf.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + d * .15); g.gain.exponentialRampToValueAtTime(.0004, t + d); o.connect(g); g.connect(bus); o.start(t); lf.start(t); o.stop(t + d + .05); lf.stop(t + d + .05); };
  let nightS = 0, rainS = 0;
  const birds = () => { if (!alive) return; if (!muted && !under && !cozyOn && rainS < .5) { if (nightS < .5) { const n = 2 + Math.floor(Math.random() * 4), base = 2600 + Math.random() * 1600; for (let k = 0; k < n; k++) chirp(base * (1 + (Math.random() - .5) * .25), .09 + Math.random() * .08, .008 + Math.random() * .006, ctx.currentTime + k * (.11 + Math.random() * .08)); } else { for (let k = 0; k < 5; k++) chirp(4300, .05, .004, ctx.currentTime + k * .09); } } timers.push(setTimeout(birds, 1800 + Math.random() * 4200)); };       // soft birdsong by day, a few crickets at night
  const gulls = () => { if (!alive) return; if (!muted && !under && !cozyOn) gull(); timers.push(setTimeout(gulls, 9000 + Math.random() * 12000)); };
  return {
    start() { if (ctx.state === 'suspended') ctx.resume(); out.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, 1.2); tune(); bub(); birds(); timers.push(setTimeout(gulls, 6000)); },
    mute(m) { muted = m; out.gain.setTargetAtTime(m ? 0 : .9, ctx.currentTime, .3); if (!m && ctx.state === 'suspended') ctx.resume(); }, get muted() { return muted; },
    update(speed, nearSea, underwater) {
      if (underwater !== under) { under = underwater; lp.frequency.setTargetAtTime(under ? 520 : 18000, ctx.currentTime, .25); }
      rog.gain.setTargetAtTime(cozyOn ? 0 : Math.min(.035, Math.abs(speed) * .0032), ctx.currentTime, .2); rof.frequency.setTargetAtTime(380 + Math.abs(speed) * 38, ctx.currentTime, .2); if (!muted && !under && !cozyOn && Math.abs(speed) > 1.2 && ctx.currentTime > tickAt) { tick(.012 + Math.min(.012, Math.abs(speed) * .001)); tickAt = ctx.currentTime + Math.max(.14, .55 - Math.abs(speed) * .035); }
      sg.gain.setTargetAtTime(cozyOn ? 0 : under ? .05 : nearSea * .09 * (.6 + .4 * Math.sin(ctx.currentTime * .7)), ctx.currentTime, .6);
    },
    boat(on) { if (on === boatOn) return; boatOn = on; boatG2.gain.setTargetAtTime(on ? 1.0 : 0, ctx.currentTime, .3); lapG.gain.setTargetAtTime(on ? .09 : 0, ctx.currentTime, .6); if (on) { horn(); setTimeout(putt, 700); } },
    boatSpeed(v) { boatV = v; lapG.gain.setTargetAtTime(boatOn ? .06 + Math.min(.12, v * .015) : 0, ctx.currentTime, .4); },
    cozy(on) { if (on === cozyOn) return; cozyOn = on; cg.gain.setTargetAtTime(on ? 1.1 : 0, ctx.currentTime, .6); lp.frequency.setTargetAtTime(on ? 3000 : (under ? 520 : 18000), ctx.currentTime, .4); if (on) { cozyLoop(); simmer(); clockLoop(); } },
    talk(len, voice) { if (muted) return; /* a soft, cosy babble: little round "syllables" (a warm sine with a touch of triangle), short and long ones, rising at the end of the phrase */
      const t0 = ctx.currentTime + .02, base = 190 + (voice % 7) * 28, n = Math.max(6, Math.min(26, Math.round(len / 4.2))); let t = t0;
      for (let k = 0; k < n; k++) { const last = k >= n - 2, f = base * Math.pow(2, ([0, 2, 4, 5, 7, 9, 12, 7][Math.floor(Math.random() * 8)] + (last ? 4 : 0)) / 12) * (1 + (Math.random() - .5) * .03), d = .07 + Math.random() * .06 + (k % 5 === 4 ? .07 : 0);
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.setValueAtTime(f * .96, t); o.frequency.linearRampToValueAtTime(f, t + d * .5); o2.frequency.value = f * 2; fl.type = 'lowpass'; fl.frequency.value = 1900;
        const g2 = ctx.createGain(); g2.gain.value = .22; o2.connect(g2); g2.connect(fl); o.connect(fl); fl.connect(g); g.connect(out); g.connect(rev);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.075, t + .014); g.gain.exponentialRampToValueAtTime(.0008, t + d + .05); o.start(t); o2.start(t); o.stop(t + d + .09); o2.stop(t + d + .09);
        t += d * .72 + (k % 5 === 4 ? .11 : .028); }
      [84, 88, 91].forEach((m, k) => note(m, .022, 1.4, ctx.currentTime + .0 + k * .07)); },
    bark() { if (muted) return; const mk = (d, f0) => { const t = ctx.currentTime + d, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'triangle'; o2.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .62, t + .16); o2.frequency.setValueAtTime(f0 * 1.5, t); o2.frequency.exponentialRampToValueAtTime(f0 * .8, t + .12); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .9; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .22); o.connect(f); o2.connect(f); f.connect(g); g.connect(out); g.connect(rev); o.start(t); o2.start(t); o.stop(t + .3); o2.stop(t + .3); }; mk(.0, 520); mk(.42, 480); },
    gull() { if (!muted && !under && !cozyOn) { gull(); setTimeout(() => !muted && !under && !cozyOn && gull(), 330); } },
    atmos(n, r) { nightS = n; rainS = r; },
    rain(on) { rg.gain.setTargetAtTime(on ? .09 : 0, ctx.currentTime, 1.2); },
    chime() { if (muted) return; [76, 79, 83, 88].forEach((m, k) => note(m, .04 - k * .005, 2.4, ctx.currentTime + k * .09)); },
    splash() { if (muted) return; const t = ctx.currentTime, b = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); b.buffer = nb; f.type = 'bandpass'; f.frequency.setValueAtTime(2200, t); f.frequency.exponentialRampToValueAtTime(600, t + .6); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .04); g.gain.exponentialRampToValueAtTime(.0005, t + .7); b.connect(f); f.connect(g); g.connect(bus); b.start(t, Math.random() * 2); b.stop(t + .8); },
    stop() { alive = false; timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); out.gain.setTargetAtTime(0, ctx.currentTime, .3); setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1200); }
  };
}

// ---------------------------------------------------------------- the drive
export function open(opts) {
  opts = opts || {}; PEOPLE.length = 0;
  const lang = Math.max(0, LI.indexOf(getLang())), touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const root = document.createElement('div'); root.className = 'x-dr';
  root.innerHTML = '<canvas class="x-dr-cv"></canvas><div class="x-dr-uw"></div>' +
    '<div class="x-dr-top"><div class="x-dr-t"><b>Ría de Muros e Noia</b><span class="x-dr-sub"></span></div><div class="x-dr-btns"><button type="button" class="x-dr-fit" aria-label="' + tr('Change clothes') + '"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a2 2 0 1 0-2-2"/><path d="M12 7.5v2.2l8 5.3a1.4 1.4 0 0 1-.8 2.5H4.8A1.4 1.4 0 0 1 4 15z"/></svg></button><button type="button" class="x-dr-rn" aria-label="' + tr('Rain') + '"></button><button type="button" class="x-dr-dn" aria-label="' + tr('Day / night') + '"></button><button type="button" class="x-dr-mu" aria-label="' + tr('Sound') + '"></button><button type="button" class="x-dr-x" aria-label="' + tr('Back to the map') + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<button type="button" class="x-dr-out"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg><span>' + tr('Leave the house') + '</span></button>' +
    '<div class="x-dr-count"><i class="x-dr-arrow"></i><span></span></div><div class="x-dr-help">' + tr('Ride with the arrow keys') + '</div>' +
    '<button type="button" class="x-dr-prompt"></button><div class="x-dr-card"><div class="x-dr-art"></div><b></b><p></p><button type="button">' + tr('Close') + '</button></div>' +
    (touch ? '<div class="x-dr-pad"><div><button data-k="left" aria-label="Left"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><button data-k="right" aria-label="Right"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></div><div class="x-v"><button data-k="up" class="x-go" aria-label="Go"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15l7-7 7 7"/></svg></button><button data-k="down" aria-label="Brake"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg></button></div></div>' : '');
  document.body.appendChild(root);
  const css = document.createElement('style'); css.textContent = [
    "@font-face{font-family:'XNunito';font-style:normal;font-weight:500 800;font-display:swap;src:url(/extras/fonts/nunito-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF}@font-face{font-family:'XNunito';font-style:normal;font-weight:500 800;font-display:swap;src:url(/extras/fonts/nunito-latin.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD}",
    '.x-dr{position:fixed;inset:0;z-index:95;background:#cfe6f2;opacity:0;transition:opacity 1.1s ease;color:#4a3340;font:500 13px/1.45 "XNunito","Nunito",system-ui,sans-serif;overscroll-behavior:contain;touch-action:none;user-select:none;-webkit-user-select:none}',
    '.x-dr.x-in{opacity:1}.x-dr-cv{position:absolute;inset:0;width:100%;height:100%;display:block}',
    '.x-dr:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 56%,rgba(70,45,30,.2) 100%),linear-gradient(to bottom,rgba(255,226,170,.07),rgba(255,226,170,0) 40%)}',
    '.x-dr-uw{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .6s ease;background:radial-gradient(ellipse at 50% 30%,rgba(120,220,225,.12),rgba(40,150,170,.4))}.x-dr.x-uw .x-dr-uw{opacity:1}',
    '.x-dr-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:18px;pointer-events:none}.x-dr-top>*{pointer-events:auto}',
    '.x-dr-t b{display:block;font-size:17px;font-weight:700;letter-spacing:-.01em}.x-dr-t span{font-size:12px;opacity:.75}',
    '.x-dr-btns{display:flex;gap:10px}.x-dr-btns button{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,252,246,.85);color:#4a3340;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .3s cubic-bezier(.3,1.5,.5,1),background .2s}.x-dr-btns button:hover{transform:scale(1.08);background:#fff}',
    '.x-dr-count{position:absolute;left:50%;top:18px;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:8px 16px;border-radius:22px;background:rgba(255,252,246,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;pointer-events:none}',
    '.x-dr-arrow{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid #e36d57;transition:transform .15s linear}',
    '.x-dr-help{position:absolute;left:18px;bottom:18px;padding:9px 14px;border-radius:16px;background:rgba(255,252,246,.78);font:500 11px/1.2 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;pointer-events:none;transition:opacity 1s}.x-dr.x-drove .x-dr-help{opacity:.0}',
    '.x-dr-prompt{position:absolute;left:50%;bottom:48px;transform:translate(-50%,14px);padding:16px 30px;border:0;border-radius:20px;background:rgba(255,253,248,.96);color:#4a3340;font:500 13px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .4s,transform .5s cubic-bezier(.22,.8,.24,1);box-shadow:0 10px 30px rgba(60,70,80,.25)}.x-dr.x-near .x-dr-prompt{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
    '.x-dr-card{position:absolute;left:50%;bottom:36px;width:min(480px,calc(100% - 32px));padding:20px 24px 18px;border-radius:26px;background:rgba(255,253,248,.96);box-shadow:0 14px 44px rgba(60,70,80,.3);opacity:0;pointer-events:none;transform:translate(-50%,18px);transition:opacity .45s,transform .6s cubic-bezier(.22,.8,.24,1)}.x-dr.x-card .x-dr-card{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
    '.x-dr-art svg,.x-dr-art img{width:100%;height:auto;display:block;border-radius:16px;margin-bottom:12px}.x-dr-art img{max-height:34vh;object-fit:cover}.x-dr-art:empty{display:none}.x-dr-card b{display:block;font-size:20px;line-height:1.2;font-weight:700;margin-bottom:8px}.x-dr-card p{margin:0 0 14px;font-size:16px;line-height:1.5}.x-dr-card button{border:0;border-radius:14px;padding:11px 20px;background:#e36d57;color:#fff;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
    '.x-dr-pad{position:absolute;left:0;right:0;bottom:22px;display:flex;justify-content:space-between;align-items:flex-end;padding:0 18px;pointer-events:none}.x-dr-pad>div{display:flex;gap:2px;padding:6px;border-radius:44px;background:linear-gradient(160deg,rgba(255,253,248,.78),rgba(255,236,224,.6));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(74,51,64,.2),inset 0 0 0 1px rgba(255,255,255,.75);pointer-events:auto}.x-dr-pad>div.x-v{flex-direction:column}.x-dr-pad button{width:62px;height:62px;border:0;border-radius:50%;background:transparent;color:#7a5a64;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent;transition:transform .18s cubic-bezier(.3,1.5,.5,1),background .2s,color .2s}.x-dr-pad button.x-go{color:#e36d57}.x-dr-pad button.x-on{background:linear-gradient(160deg,#ffb9a1,#e36d57);color:#fff;transform:scale(.92);box-shadow:0 4px 12px rgba(227,109,87,.45)}',
    '.x-dr-out{position:absolute;left:18px;top:68px;display:none;align-items:center;gap:6px;padding:8px 14px 8px 10px;border:0;border-radius:16px;background:#e36d57;color:#fff;font:500 11px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;z-index:2}.x-dr.x-casa .x-dr-out{display:flex}.x-dr.x-casa .x-dr-pad,.x-dr.x-casa .x-dr-tour,.x-dr.x-casa .x-dr-count,.x-dr.x-casa .x-dr-ta,.x-dr.x-casa .x-dr-prompt,.x-dr.x-casa .x-dr-help,.x-dr.x-casa .x-dr-rn,.x-dr.x-casa .x-dr-dn,.x-dr.x-casa .x-dr-card{display:none}.x-dr.x-casa:after{background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 60%,rgba(70,40,20,.25) 100%)}',
    '.x-dr-wel{position:absolute;left:50%;bottom:44px;transform:translate(-50%,16px);width:min(520px,calc(100% - 32px));padding:20px 26px 18px;border-radius:28px;background:rgba(255,248,238,.93);box-shadow:0 14px 44px rgba(90,50,40,.25);text-align:center;opacity:0;pointer-events:none;z-index:3;transition:opacity .9s ease,transform 1.1s cubic-bezier(.22,.8,.24,1)}.x-dr-wel.x-on{opacity:1;transform:translate(-50%,0);pointer-events:auto;cursor:pointer}.x-dr-wel b{display:block;font:700 21px/1.3 "XNunito","Nunito",system-ui,sans-serif;color:#7a4a3a;margin-bottom:4px}.x-dr-wel span{font:500 16px/1.4 "XNunito","Nunito",system-ui,sans-serif;color:#9a6a58}',
    '.x-dr-fact{position:absolute;left:50%;top:40%;transform:translate(-50%,-100%) scale(.92);width:min(300px,calc(100% - 28px));padding:13px 16px 14px;border-radius:20px;background:rgba(255,253,248,.96);color:#4a3340;font:500 14px/1.45 "XNunito","Nunito",system-ui,sans-serif;box-shadow:0 10px 30px rgba(60,70,80,.25);opacity:0;pointer-events:none;z-index:4;text-align:left;transition:opacity .35s ease,transform .45s cubic-bezier(.3,1.4,.5,1)}.x-dr-fact:after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-8px;width:16px;height:16px;background:inherit;transform:rotate(45deg);border-radius:3px}.x-dr-fact b{display:block;margin-bottom:4px;font:800 11.5px/1 \"XNunito\",system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#e36d57}.x-dr-fact.x-pop{animation:x-fpop .5s cubic-bezier(.3,1.4,.5,1)}@keyframes x-fpop{from{transform:translate(-50%,-92%) scale(.9)}}.x-dr-fact.x-on{opacity:1;transform:translate(-50%,-100%) scale(1);pointer-events:auto}.x-dr.x-casa .x-dr-fact{display:none}',
    '.x-dr-fitl{touch-action:pan-y;overscroll-behavior:contain;position:absolute;right:18px;top:68px;width:min(270px,calc(100% - 36px));max-height:min(60vh,420px);overflow:auto;padding:8px;border-radius:20px;background:rgba(255,252,246,.97);box-shadow:0 14px 40px rgba(60,70,80,.28);opacity:0;transform:translateY(-8px) scale(.97);transform-origin:top right;pointer-events:none;transition:opacity .3s ease,transform .4s cubic-bezier(.3,1.3,.5,1);z-index:6;-webkit-overflow-scrolling:touch}.x-dr-fitl.x-on{opacity:1;transform:none;pointer-events:auto}',
    '.x-dr-fith{padding:6px 10px 8px;font:500 10px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#9a7f88}.x-dr-fitl button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:0;border-radius:13px;background:none;color:#4a3340;font:500 14px/1.25 "XNunito","Nunito",system-ui,sans-serif;text-align:left;cursor:pointer;transition:background .2s}.x-dr-fitl button:hover{background:rgba(227,109,87,.1)}.x-dr-fitl button.x-on{background:rgba(227,109,87,.17);font-weight:700}',
    '.x-dr-fitl .x-sw{display:flex;flex:none}.x-dr-fitl .x-sw i{width:15px;height:15px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(74,51,64,.14)}.x-dr-fitl .x-sw i+i{margin-left:-5px}.x-dr-fit.x-open{background:#fff;transform:scale(1.06)}.x-dr.x-casa .x-dr-fitl,.x-dr.x-casa .x-dr-fit{display:none}',
    '.x-dr-intro{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(214,232,244,.38);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);transition:opacity .6s ease}.x-dr-intro.x-out{opacity:0;pointer-events:none}',
    '.x-dr-ic{width:min(430px,100%);padding:30px 28px 22px;border-radius:30px;background:rgba(255,252,246,.97);box-shadow:0 18px 52px rgba(60,70,80,.28);text-align:center;color:#4a3340;animation:x-ipop .7s cubic-bezier(.3,1.3,.5,1) both}@keyframes x-ipop{from{opacity:0;transform:translateY(16px) scale(.96)}}',
    '.x-dr-ic p{margin:20px 0 26px;min-height:3.9em;display:flex;align-items:center;justify-content:center;font:600 22px/1.35 "XNunito","Nunito",system-ui,sans-serif;letter-spacing:-.01em;opacity:0;transform:translateY(8px);transition:opacity .45s ease,transform .55s cubic-bezier(.22,.8,.24,1)}.x-dr-ic p.x-in{opacity:1;transform:none}',
    '.x-dr-idots{display:flex;gap:8px;justify-content:center}.x-dr-idots i{width:8px;height:8px;border-radius:50%;background:#e8d9d0;transition:background .3s,transform .3s}.x-dr-idots i.x-on{background:#e36d57;transform:scale(1.25)}',
    '.x-dr-iact{display:flex;justify-content:space-between;align-items:center}.x-dr-iact button{border:0;cursor:pointer;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}.x-dr-inext{padding:13px 24px;border-radius:16px;background:#e36d57;color:#fff;transition:transform .25s cubic-bezier(.3,1.5,.5,1)}.x-dr-inext:hover{transform:scale(1.05)}.x-dr-iskip{padding:10px 6px;background:none;color:#9a7f88}',
    '@media(prefers-reduced-motion:reduce){.x-dr-ic{animation:none}}',
    '.x-dr.x-touch .x-dr-help{display:none}',
    '.x-dr.x-touch .x-dr-prompt{bottom:118px}.x-dr.x-touch .x-dr-card{bottom:auto;top:128px;max-height:calc(100% - 300px);overflow:auto}.x-dr.x-touch.x-card .x-dr-pad{opacity:0;pointer-events:none}.x-dr-pad{transition:opacity .3s}',
    '@media(max-width:700px){.x-dr-prompt{bottom:118px}.x-dr-card{bottom:auto;top:128px;max-height:calc(100% - 300px);overflow:auto}.x-dr.x-card .x-dr-pad{opacity:0;pointer-events:none}.x-dr-help{display:none}.x-dr-art img{max-height:22vh}}',
    '@media(max-width:600px){.x-dr-t span{display:none}.x-dr-count{top:74px;left:auto;right:18px;transform:none;padding:7px 12px}}'
  ].join('\n'); root.appendChild(css);
  if (touch) root.classList.add('x-touch');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('x-in')));
  const cv = root.querySelector('.x-dr-cv');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !LOW, powerPreference: 'high-performance' }); } catch (e) { root.remove(); return null; }
  renderer.setPixelRatio(LOW ? 1 : Math.min(devicePixelRatio || 1, 1.6)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.22; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), FOG_AIR = new THREE.Color(0xdbe9ef), FOG_SEA = new THREE.Color(0x5fc3cf); scene.background = FOG_AIR.clone(); scene.fog = new THREE.FogExp2(0xdbe9ef, .0065);
  const camera = new THREE.PerspectiveCamera(55, 1, .3, 420);
  const hemi = new THREE.HemisphereLight(0xbcd8ff, 0xe6c9a0, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd6a0, 3.0); sun.castShadow = true; sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); Object.assign(sun.shadow.camera, (LOW ? { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 150 } : { left: -52, right: 52, top: 52, bottom: -52, near: 1, far: 190 })); sun.shadow.bias = -.0006; sun.shadow.normalBias = .05; scene.add(sun, sun.target);

  // ---- sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 20, 14), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false })); { const p = sky.geometry.attributes.position, c = new Float32Array(p.count * 3), top = new THREE.Color(0x5aa9ec), hz = new THREE.Color(0xf6e8d2), tmp = new THREE.Color(); for (let i = 0; i < p.count; i++) { tmp.copy(hz).lerp(top, sstep(.0, .75, p.getY(i) / 300)); c[i * 3] = tmp.r; c[i * 3 + 1] = tmp.g; c[i * 3 + 2] = tmp.b; } sky.geometry.setAttribute('color', new THREE.BufferAttribute(c, 3)); } sky.renderOrder = -1; scene.add(sky);
  const CLOUD_GREY = new THREE.Color(0xaab6c2), CLOUD_WARM = new THREE.Color(0xfff2e0), clouds = []; for (let i = 0; i < (LOW ? 6 : 12); i++) { const g = new THREE.Group(), n = 4 + Math.floor(rng() * 3); for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: k % 2 ? 0xffefd9 : 0xfff6e8, fog: false, toneMapped: false })); s.position.set((k - n / 2) * 4.5 + rng() * 2, rng() * 2, rng() * 3); s.scale.set(5 + rng() * 3, 3 + rng() * 2, 4 + rng() * 2); g.add(s); } g.position.set(-120 + rng() * 260, 50 + rng() * 30, -110 + rng() * 220); g.userData.v = 1.2 + rng() * 1.5; scene.add(g); clouds.push(g); }

  // ---- terrain
  const TX = 210, TZ = 200, CX = 5, NX = LOW ? 110 : 170, NZ = LOW ? 104 : 160, geo = new THREE.PlaneGeometry(TX, TZ, NX, NZ); geo.rotateX(-PI / 2); geo.translate(CX, 0, 0);
  { const p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), A = new THREE.Color(0x8fcd9d), B = new THREE.Color(0x74b88a), SAND = new THREE.Color(0xeed3a0), ROCK = new THREE.Color(0xc8b8a6), SEAB = new THREE.Color(0xe9d3a9), DEEP = new THREE.Color(0x8ec9b8);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = H(x, z); p.setY(i, h); const n = noise(x * .8, z * .8) * .5 + .5;
      c.copy(A).lerp(B, n).lerp(ROCK, sstep(3.2, 5.2, h) * .75); c.lerp(SAND, (1 - sstep(.45, 1.15, h)) * sstep(-1.2, .0, h)); { const bzz = sstep(44, 54, z) * (1 - sstep(78, 88, z)); c.lerp(SAND, bzz * sstep(COAST(z) - 18, COAST(z) - 13, x) * (h > 0 ? 1 : 0)); } if (h < 0) c.copy(SEAB).lerp(DEEP, sstep(-.5, -4.8, h)); c.offsetHSL(0, 0, (hash(Math.round(x * 2), Math.round(z * 2)) - .5) * .025); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); }
  const ttex = paintTex().clone(); ttex.repeat.set(30, 30); ttex.wrapS = ttex.wrapT = THREE.RepeatWrapping; ttex.needsUpdate = true;
  const terrain = new THREE.Mesh(geo, PM({ vertexColors: true, map: ttex, roughness: 1, bumpMap: feltTexD(), bumpScale: 1.2, sheen: 1, sheenRoughness: .6, sheenColor: new THREE.Color(0xfff0dc) })); terrain.receiveShadow = true; scene.add(terrain);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 260, LOW ? 24 : 52, LOW ? 24 : 52), new THREE.MeshStandardMaterial({ color: 0x74cfdb, transparent: true, opacity: .62, roughness: .25, metalness: .05, side: THREE.DoubleSide, depthWrite: false })); sea.rotation.x = -PI / 2; sea.position.set(120, 0, 0); sea.renderOrder = 3; scene.add(sea);
  const seaP = sea.geometry.attributes.position, seaBase = new Float32Array(seaP.count * 2); for (let i = 0; i < seaP.count; i++) { seaBase[i * 2] = seaP.getX(i); seaBase[i * 2 + 1] = seaP.getY(i); }
  const colliders = [];

  // ---- roads: one calm coast road, and in every village narrow lanes (rueiros) between stone walls
  const ribbon = (pts, width, color, lift, order, tex) => {
    const pos = [], idx = [], uvs = [], n = pts.length; let run = 0; for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l; for (const sd of [-1, 1]) { const x = pts[i][0] + nx * width / 2 * sd, z = pts[i][1] + nz * width / 2 * sd; pos.push(x, H(x, z) + lift, z); uvs.push(sd < 0 ? 0 : width / 4, run / 4); } if (i) { run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); } if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, PM({ map: tex || null, color: PASTEL(color), roughness: 1, bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenRoughness: .6, sheenColor: PASTEL(color).lerp(new THREE.Color(0xfff3e4), .5), polygonOffset: true, polygonOffsetFactor: -order, polygonOffsetUnits: -order, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); return m;
  };
  const road = (pts, w) => { ribbon(pts, w + 1.8, 0xe2cba0, .05, 2, sandTex()); ribbon(pts, w, 0x8d96a4, .08, 4, asphTex()); };
  const main = []; for (let z = -98; z <= 98; z += 2) main.push([ROADX(z), z]); road(main, 5.6);
  for (let z = -96; z < 96; z += 7) ribbon([[ROADX(z), z], [ROADX(z + 3.4), z + 3.4]], .2, 0xf6f0e2, .11, 6);
  // rueiros: narrow winding lanes of beaten stone that branch off the road, with a dry-stone wall on both sides
  const lanes = []; const laneDefs = [];
  VILLAGES.forEach(([, z0], vi) => { const rx = ROADX(z0); if (vi !== 4) laneDefs.push([rx - 3, z0 - 13, -1, .12 * vi, 34, 0]); laneDefs.push( [rx - 3, z0 + 11, -1, 1.3 + vi, 36, 1]); if (vi === 3) laneDefs.push([rx - 3, z0 - 2, -1, 2.6, 30, 2]); laneDefs.push([rx + 3, z0 + 2, 1, 4 + vi, 11, 3]); });
  laneDefs.forEach(([x0, z0, dir, ph, len, id]) => { const pts = []; for (let t = 0; t <= len; t += 2) { const x = x0 + dir * t, z = z0 + Math.sin(t * .17 + ph) * 3.2 + Math.sin(t * .05 + ph * 2) * 2; if (H(x, z) < .3) break; pts.push([x, z]); } if (pts.length > 3) lanes.push(pts); });
  for (const pts0 of lanes) { const pts = pts0.filter((q) => Math.abs(q[0] - ROADX(q[1])) > 4.6); if (pts.length > 2) { ribbon(pts, 5.0, 0xd6c9ae, .05, 2, sandTex()); ribbon(pts, 3.7, 0xb9ad98, .08, 4, sandTex()); } }   /* the lanes begin beside the road, never across it */
  // ---- houses, with room between them, facing the lanes; walls, hórreos, cruceiros, squares
  const shelters = [];
  /* the carriageway and the lanes stay free: nothing solid may stand within a margin of their centre lines */
  const corr = [[main, 4.4], ...lanes.map((l) => [l, 3.1])];
  const viol = (u, x, z, yaw) => { const ca = Math.cos(yaw), sa = Math.sin(yaw), hx = u.hx || 0, hz = u.hz || 0, r0 = hx ? 0 : (u.r || .6); let worst = 0, wq = null;
    for (const [pts, m] of corr) for (const q of pts) { const dx = q[0] - x, dz = q[1] - z; if (dx * dx + dz * dz > 400) continue; const lx = dx * ca - dz * sa, lz = dx * sa + dz * ca, d = hx ? Math.hypot(Math.max(Math.abs(lx) - hx, 0), Math.max(Math.abs(lz) - hz, 0)) : Math.hypot(dx, dz) - r0, v = m - d; if (v > worst) { worst = v; wq = q; } }
    return [worst, wq]; };
  const addTo = (o, x, z, yaw, r) => {
    if (r) { for (let it = 0; it < 7; it++) { const [v, q] = viol(o.userData, x, z, yaw); if (v <= 0) break; if (it === 6) return o; const dx = x - q[0], dz = z - q[1], l = Math.hypot(dx, dz) || 1; x += dx / l * (v + .15); z += dz / l * (v + .15); } }
    // everything stands ON the ground: on the highest point under its footprint, with a stone base down to the lowest one
    const u0 = o.userData, ex = u0.hx || u0.r || 0; let top = H(x, z), low = top; if (ex) { const ca = Math.cos(yaw), sa = Math.sin(yaw), hx = u0.hx || ex * .7, hz = u0.hz || ex * .7; for (const [lx, lz] of [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz], [0, hz], [0, -hz]]) { const hh = H(x + lx * ca + lz * sa, z - lx * sa + lz * ca); top = Math.max(top, hh); low = Math.min(low, hh); } }
    if (u0.hx && top - low > .05) { const sk = new THREE.Mesh(new THREE.BoxGeometry(u0.fw || (u0.hx * 2 - .6), top - low + .5, u0.fd || (u0.hz * 2 - .6)), std(0xb9b2a2)); sk.position.y = -(top - low + .5) / 2 + .02; sk.castShadow = true; o.add(sk); }
    if (false && u0.hx && top - low < .5) { const cs = new THREE.Mesh(new THREE.PlaneGeometry(u0.hx * 3.1, u0.hz * 3.1), new THREE.MeshBasicMaterial({ map: contactTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); cs.rotation.x = -PI / 2; cs.position.y = .07; o.add(cs); }
    o.position.set(x, top, z); o.rotation.y = yaw; scene.add(o); if (o.userData.porch) shelters.push([x + Math.sin(yaw) * o.userData.porch, z + Math.cos(yaw) * o.userData.porch]); if (r) { const u = o.userData; colliders.push(u.hx ? [x, z, r, u.hx, u.hz, yaw] : [x, z, r]); } return o; };
  const infoSpots = [], reserved = [], solid = (x, z, rr) => colliders.some((c) => Math.hypot(c[0] - x, c[1] - z) < c[2] + rr) || reserved.some((r) => x > r[0] - rr && x < r[1] + rr && z > r[2] - rr && z < r[3] + rr), laneNear = (x, z, d) => lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - x, q[1] - z) < d)) || Math.abs(x - ROADX(z)) < d + 2.6;
  const plazas = [], walkers = [], stops = []; let mkt = null;
  { const lbl = lang === 0 ? 'SUPERMARKET' : 'SUPERMERCADO', sz0 = 50, sx0 = ROADX(sz0) - 16, sm = supermercado(lbl); addTo(sm, sx0, sz0, PI / 2, sm.userData.r);
    const lot = new THREE.Mesh(new THREE.BoxGeometry(11, .1, 22), std(0x9aa3b0)); lot.position.set(sx0 + 9.4, H(ROADX(sz0) - 7, sz0) + .05, sz0); scene.add(lot); lot.receiveShadow = true;
    shelters.push([sx0 + 5.6, sz0 - 3], [sx0 + 5.6, sz0 + 3]);
    reserved.push([sx0 - 9, sx0 + 16, sz0 - 14, sz0 + 14]);
    const mkShopper = (i, z1, z2, withCart) => { const w2 = person([0x7aa6d8, 0xf0907a, 0xf4e6d0, 0xc9a0e8][i % 4], [0xf0c9a0, 0xe3b185, 0xf5d6b5][i % 3]); if (withCart) { const c = cart(); c.position.set(1.25, 0, 0); w2.add(c); } scene.add(w2); walkers.push({ p: w2, pts: [[sx0 + 5.6, z1], [sx0 + 9.5, (z1 + z2) / 2], [sx0 + 6.4, z2]], d: rng() * 6, sp: .45 + rng() * .25, dir: 1, lift: .08 }); };
    mkShopper(0, sz0 - 6, sz0 + 6, true); mkShopper(1, sz0 + 4, sz0 - 7, false); mkShopper(2, sz0 - 2, sz0 + 8, true); }

  // ---- the Sunday market (mercadillo): a little street off the main road with stalls of vegetables, fruit, bread, cheese, octopus, empanadas, sausages and honey
  { const STP = 5.6, N = 4, LEN = 10 + N * STP + 3; let site = null;
    const cz = []; for (let z = -90; z <= 90; z += 2) cz.push(z); cz.sort((a, b) => Math.abs(a + 34) - Math.abs(b + 34));
    for (const z of cz) { const x0 = ROADX(z) - 8; let ok = true;
      for (let u = 0; u <= LEN && ok; u += 3) for (let v = -6; v <= 6 && ok; v += 3) { const x = x0 - u, zz = z + v; if (H(x, zz) < .55 || solid(x, zz, 2.2) || [2, 3].some((vi) => Math.hypot(ROADX(VILLAGES[vi][1]) - 21 - x, VILLAGES[vi][1] + 1 - zz) < (vi === 3 ? 16 : 13)) || VILLAGES.some(([, z0]) => Math.hypot(ROADX(z0 - 2) - 16 - x, z0 - 14 - zz) < 6) || lanes.some((l) => l.some((q) => Math.hypot(q[0] - x, q[1] - zz) < 6))) ok = false; }
      if (ok) { site = [x0, z]; break; } }
    if (site) { const [x0, z] = site, y0 = H(x0 - LEN / 2, z);
      const sp = []; for (let u = 0; u <= LEN + 4; u += 1.5) sp.push([x0 + 4 - u, z]); ribbon(sp, 7.2, 0xd8cdb6, .06, 3, sandTex()); ribbon(sp, 6.2, 0xcfc3aa, .08, 4, sandTex());
      const awn = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xe9a0c0, 0xa88bd8, 0xf09a3a, 0x6fc3b8];
      for (let k = 0; k < N; k++) for (let sd = 0; sd < 2; sd++) { const kind = KINDS[(k * 2 + sd + (sd ? 3 : 0)) % 8], sx = x0 - 4.5 - k * STP, sz = z + (sd ? -3.7 : 3.7), st = stall(THREE, std, kind, awn[(k * 2 + sd) % 8], !LOW); st.scale.setScalar(.95);
        st.userData.hx = 1.6; st.userData.hz = 1.0; st.userData.r = 2; addTo(st, sx, sz, sd ? 0 : PI, 2.1);
        const vd = person([0xf4e6d0, 0xe9a0c0, 0x7aa6d8, 0xf2c14a][(k + sd) % 4], [0xf0c9a0, 0xe3b185, 0xf5d6b5, 0xc58c5e][(k + sd * 2) % 4]); vd.position.set(sx, H(sx, sz + (sd ? -2.1 : 2.1)) + .08, sz + (sd ? -2.1 : 2.1)); vd.rotation.y = (sd ? 0 : PI) - PI / 2 + (sd ? 0 : 0); scene.add(vd); }
      const shirts = [0xe36d57, 0x4f8fc0, 0xc9a0e8, 0x5fae8a, 0xf0907a, 0x7aa6d8], skins = [0xf0c9a0, 0xe3b185, 0xf5d6b5, 0xc58c5e];
      for (let i = 0; i < 6; i++) { const w2 = person(shirts[i], skins[i % 4]); scene.add(w2); const a = x0 - 3 - (i % 3) * 4, b2 = x0 - LEN + 3 + (i % 3) * 2; walkers.push({ p: w2, pts: [[a, z + (i % 2 ? .9 : -.9)], [(a + b2) / 2, z + (i % 2 ? -.6 : .6)], [b2, z + (i % 2 ? .9 : -.9)]], d: i * 4.5, sp: .45 + (i % 3) * .12, dir: i % 2 ? 1 : -1, lift: .14 }); }
      reserved.push([x0 - LEN - 2, x0 + 5, z - 6.5, z + 6.5]); mkt = { x: x0 - LEN / 2, z }; } }
  VILLAGES.forEach(([name, z0], vi) => {
    const rx = ROADX(z0), cnt = vi === 3 ? 8 : 5; let made = 0;
    // houses along the road and the lanes: set well back, spaced out, each turned to face its way
    const spots = []; for (const pts of lanes) if (Math.abs(pts[0][1] - z0) < 16 && Math.abs(pts[0][0] - (rx - 3)) < 7) for (let q = 2; q < pts.length - 1; q += 3) for (const sd of [-1, 1]) { const a = pts[q - 1], b = pts[q + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l; spots.push([pts[q][0] + nx * 7.2 * sd, pts[q][1] + nz * 7.2 * sd, -nx * sd, -nz * sd]); }
    for (let k = -3; k <= 3; k++) for (const sd of [-1, 1]) { const zz = z0 + k * 9 + sd * 2; spots.push([ROADX(zz) + sd * 12, zz, -sd, 0]); }
    for (let i = spots.length - 1; i > 0; i--) { const j2 = Math.floor(rng() * (i + 1)); [spots[i], spots[j2]] = [spots[j2], spots[i]]; }
    for (const [xx, zz, fx, fz] of spots) {
      if (made >= cnt || H(xx, zz) < .35 || solid(xx, zz, 6.5) || Math.hypot(xx - (rx - 21), zz - (z0 + 1)) < 15) continue;
      if (lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - xx, q[1] - zz) < 5.2))) continue;
      const w = 6.6 + rng() * 2, d = 5.4 + rng() * 1.5, fl = 1 + Math.floor(rng() * (vi === 3 ? 3 : 2)), stone = vi === 3 && rng() < .4;
      const h = houseMesh(w, d, fl, WALLS[(vi * 3 + made) % WALLS.length], ROOFS[(made + vi) % ROOFS.length], stone); addTo(h, xx, zz, Math.atan2(fx, fz), h.userData.r); made++;
    }
    // the square of stone: paving, a fountain or a cruceiro, benches, pruned trees
    if (vi === 3 || vi === 2) { const pr = vi === 3 ? 10 : 7, pcx = rx - 21, pcz = z0 + 1; plazas.push([pcx, pcz, pr]); }
    { const bs = busStop(); let bz = z0 + 9; for (const dz of [0, -6, 6, -12, 12, 17]) { const zz = z0 + 9 + dz; if (viol(bs.userData, ROADX(zz) + 6.4, zz, -PI / 2)[0] <= 0) { bz = zz; break; } } const bx = ROADX(bz) + 6.4; stops.push([bx, bz]); addTo(bs, bx, bz, -PI / 2, 2.6); shelters.push([bx - .2, bz - .9], [bx - .2, bz + .9]); }
    const sc = ROADX(z0 - 2) - 16, cr = cruceiro(); addTo(cr, sc, z0 - 14, 0, 2.3);
    for (let k = 0; k < 1; k++) { const hx = rx - 19 - rng() * 7, hzz = z0 - 12 + k * 12 + (rng() - .5) * 4; if (H(hx, hzz) < .4 || solid(hx, hzz, 7) || lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - hx, q[1] - hzz) < 6.5))) continue; const hr = horreo(); const yaw = rng() * PI * 2; addTo(hr, hx, hzz, yaw, hr.userData.r); if (vi === 1 && !infoSpots.length) infoSpots.push(['horreo', hx + Math.cos(yaw) * 0 + 6.5, hzz]); }
    if (vi === 3 || vi === 2) { const ch = church(); const cx = rx - 21, cz = z0 + (vi === 3 ? -21 : 17); if (!solid(cx, cz, 9)) addTo(ch, cx, cz, PI / 2, 8); }
  });
  for (const [px, pz, pr] of plazas) {
    const g = new THREE.Group(), cvp = document.createElement('canvas'); cvp.width = cvp.height = 256; const c2 = cvp.getContext('2d'); c2.fillStyle = '#9d9585'; c2.fillRect(0, 0, 256, 256); let ry = 0; while (ry < 256) { const rh = 22 + rng() * 14; let rx2 = -rng() * 40; while (rx2 < 256) { const sw = 34 + rng() * 40, tone = 190 + rng() * 40; c2.fillStyle = `rgb(${tone},${tone - 6},${tone - 20})`; c2.beginPath(); c2.roundRect ? c2.roundRect(rx2 + 1.5, ry + 1.5, sw - 3, rh - 3, 6) : c2.rect(rx2 + 1.5, ry + 1.5, sw - 3, rh - 3); c2.fill(); rx2 += sw; } ry += rh; }
    const pt = new THREE.CanvasTexture(cvp); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(pr / 3, pr / 3); pt.colorSpace = THREE.SRGBColorSpace;
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(pr, pr, .22, 40), PM({ map: pt, roughness: 1, bumpMap: feltTexD(), bumpScale: 1, sheen: 1, sheenColor: new THREE.Color(0xfff3e4), sheenRoughness: .6 })); slab.position.y = .04; slab.receiveShadow = true; slab.castShadow = true; g.add(slab);
    const kerb = new THREE.Mesh(new THREE.TorusGeometry(pr + .1, .28, 8, 56), std(0xbdb6a6)); kerb.rotation.x = PI / 2; kerb.position.y = .12; g.add(kerb);
    g.position.set(px, H(px, pz), pz); scene.add(g);
    if (pr > 8) { const f = fonte(); addTo(f, px, pz, 0, 3.2); } else addTo(cruceiro(), px, pz, 0, 2.3);
    for (let k = 0; k < 6; k++) { const a = k * PI / 3 + .3, bx = px + Math.cos(a) * pr * .72, bz = pz + Math.sin(a) * pr * .72, bn = new THREE.Group(); const seat = new THREE.Mesh(rbox(2.4, .2, .8, .06), std(0xa5835c)); seat.position.y = .55; const back = new THREE.Mesh(rbox(2.4, .6, .14, .05), std(0xa5835c)); back.position.set(0, .95, -.34); bn.add(seat, back); for (const sx of [-1, 1]) { const lg = new THREE.Mesh(rbox(.18, .55, .6, .04), std(0xbab3a3)); lg.position.set(sx * 1.05, .27, 0); bn.add(lg); } bn.traverse((o) => { if (o.isMesh) o.castShadow = true; }); if (viol({ r: 1.2 }, bx, bz, 0)[0] > 0) continue; addTo(bn, bx, bz, -a - PI / 2, 0); colliders.push([bx, bz, 1.0]); }
    for (let k = 0; k < 5; k++) { const a = k * PI * 2 / 5 + .9, tx = px + Math.cos(a) * pr * .9, tz = pz + Math.sin(a) * pr * .9, tg = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, 2.6, 6), std(0x8a6a4c)); tk.position.y = 1.3; const cw = new THREE.Mesh(rbox(3.2, 2.2, 3.2, .8), std(0x5aa88a, { flatShading: false })); cw.position.y = 3.6; tg.add(tk, cw); tg.traverse((o) => { if (o.isMesh) o.castShadow = true; }); if (viol({ r: 1.2 }, tx, tz, 0)[0] > 0) continue; addTo(tg, tx, tz, a, 0); colliders.push([tx, tz, .8]); }
    const n = pr > 8 ? 1 : 0; for (let k = 0; k < n; k++) { const w2 = person([0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xc9a0e8, 0xf0907a][k % 6], [0xf0c9a0, 0xe3b185, 0xf5d6b5][k % 3]); scene.add(w2); const pts = []; const a0 = rng() * 6, rr = pr * (.35 + rng() * .3); for (let q = 0; q <= 16; q++) pts.push([px + Math.cos(a0 + q * .4) * rr, pz + Math.sin(a0 + q * .4) * rr]); walkers.push({ p: w2, pts, d: rng() * 20, sp: .8 + rng() * .5, dir: 1, lift: .22 }); }
  }
  // dry-stone walls along both sides of every lane
  { const wallG = rbox(1.7, .95, .6, .14), nW = lanes.reduce((a, p) => a + p.length * 2, 0), walls = new THREE.InstancedMesh(wallG, std(0xffffff, { flatShading: false }), nW), wo = new THREE.Object3D(), wc = new THREE.Color(); let wi = 0;
    for (const pts of lanes) for (let q = 1; q < pts.length - 1; q++) for (const sd of [-1, 1]) { const a = pts[q - 1], b = pts[q + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, x = pts[q][0] + nx * 2.75 * sd, z = pts[q][1] + nz * 2.75 * sd;
      if (q < 3 || Math.abs(x - ROADX(z)) < 6.4 || colliders.some((c) => c.length === 6 ? Math.hypot(c[0] - x, c[1] - z) < c[2] : Math.hypot(c[0] - x, c[1] - z) < c[2] + .4) || rng() < .5) { wo.scale.set(0, 0, 0); wo.updateMatrix(); walls.setMatrixAt(wi++, wo.matrix); continue; }
      wo.position.set(x, H(x, z) + .38, z); wo.rotation.set(0, -Math.atan2(dz, dx), 0); wo.scale.set(1, .8 + rng() * .5, 1); wo.updateMatrix(); walls.setMatrixAt(wi, wo.matrix); wc.set([0xbdb6a6, 0xaaa393, 0xcfc8b8, 0xb2ab9b][wi % 4]); walls.setColorAt(wi, wc); wi++; }
    walls.count = wi; walls.castShadow = !LOW; walls.receiveShadow = true; scene.add(walls); }
  // the people of the villages: on the pavements, in the lanes and on the beach
  { const skins = [0xf0c9a0, 0xe3b185, 0xf5d6b5, 0xc58c5e], shirts = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xc9a0e8, 0xf0907a, 0xf4e6d0, 0x7aa6d8];
    const mk = (pts, i) => { const w2 = person(shirts[i % shirts.length], skins[i % skins.length]); scene.add(w2); walkers.push({ p: w2, pts, d: rng() * 30, sp: .85 + rng() * .6, dir: rng() < .5 ? 1 : -1, lift: .08 }); };
    let wk = 0; VILLAGES.forEach(([, z0], vi) => { for (const sd of [-1, 1]) for (let k = 0; k < 1; k++) { if ((vi + (sd > 0 ? 1 : 0)) % 2) continue; const pts = []; for (let z = z0 - 20 + k * 6; z <= z0 + 20; z += 2) pts.push([ROADX(z) + sd * (3.9 + k * .4), z]); mk(pts, wk++); } });
    for (const pts of lanes.filter((_, i) => i % 5 === 0)) { mk(pts.map((q) => [q[0] + .7, q[1]]), wk++); }
    { const bz = 66; const pts = []; for (let z = bz - 16; z <= bz + 16; z += 2) pts.push([COAST(z) - 4.2 + Math.sin(z * .3) * .8, z]); mk(pts, wk++); } }
  // the beach of Area Maior at Louro: parasols, towels and a sign
  { const bz = 66, parC = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xe9a0c0, 0xf4e6d0];
    for (let k = 0; k < 7; k++) { const z = bz - 14 + k * 4.6, x = COAST(z) - 7 + Math.sin(k * 2.1) * 2.2, g = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 5), std(0xf4eadb)); pole.position.y = 1.3; const top = new THREE.Mesh(new THREE.ConeGeometry(1.7, .7, 8), std(parC[k % 6])); top.position.y = 2.75; const tw = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, 2.4), std(parC[(k + 2) % 6])); tw.position.set(.3, .05, 1.3); g.add(pole, top, tw); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); addTo(g, x, z, (k - 3) * .25, 0); }
 }
  // lamp posts along the main road, joined by cables
  const glowTexL = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, 'rgba(255,247,214,1)'); gr.addColorStop(.25, 'rgba(255,222,150,.7)'); gr.addColorStop(.55, 'rgba(255,184,112,.28)'); gr.addColorStop(.8, 'rgba(255,150,120,.08)'); gr.addColorStop(1, 'rgba(255,140,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glowMat = new THREE.SpriteMaterial({ map: glowTexL, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), lampM = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .5 });
  { const dk = std(0x2f3a45), cm = std(0x2b3036), tops = [];
    for (let z = -90, k = 0; z <= 92; z += 40, k++) {
      const side = k % 2 ? 1 : -1, x = ROADX(z) + side * 6.6, g = new THREE.Group(); g.position.set(x, H(x, z), z); g.rotation.y = side < 0 ? 0 : PI;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.11, .17, 7.4, 6), dk); pole.position.y = 3.7; pole.castShadow = true; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(.14, .14, 3.4), dk); arm.position.set(0, 7.4, 0); g.add(arm);
      for (const s of [-1, 1]) { const hd = new THREE.Mesh(new THREE.CylinderGeometry(.22, .4, .22, 8), dk); hd.position.set(0, 7.5, s * 1.7); g.add(hd); const bu = new THREE.Mesh(new THREE.IcosahedronGeometry(.2, 1), lampM); bu.position.set(0, 7.3, s * 1.7); g.add(bu); const gl = new THREE.Sprite(glowMat); gl.scale.set(4.2, 4.2, 1); gl.position.set(0, 7.2, s * 1.7); g.add(gl); }
      scene.add(g); tops.push(new THREE.Vector3(x, H(x, z) + 7.5, z));
    }
    for (let i = 1; i < tops.length; i++) { const a = tops[i - 1], b = tops[i], mid = a.clone().add(b).multiplyScalar(.5); mid.y -= 1.1; for (const off of [-.35, .35]) scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(0, 0, off)), mid.clone().add(new THREE.Vector3(0, 0, off)), b.clone().add(new THREE.Vector3(0, 0, off))]), 10, .035, 4), cm)); } }
  // ---- Casa Martamon: a lit house by the road; walk up to it and go in
  const casa = { x: 0, z: 0, ok: false, glow: null, mat: null };
  { const cands = []; for (let z = -90; z <= 92; z += 2) cands.push(z); cands.sort((a, b) => Math.abs(a + 2) - Math.abs(b + 2));
    const casaMesh = () => {
      const g = new THREE.Group(), w = 8.8, d = 6.0, fh = 2.6, bh = fh * 2;
      const add = (geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, typeof col === 'number' ? std(col, extra) : col); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
      const glow = new THREE.MeshStandardMaterial({ color: 0xfff0b8, emissive: 0xffc24a, emissiveIntensity: 1.6, roughness: .5 }), TEAL = 0x3f8f9e, CREAM = 0xf7dc9c, STONE = 0xcfc4ae, WHITE = 0xfdf6e6;
      add(rbox(w, bh, d, .2), CREAM, 0, bh / 2, 0); add(rbox(w + .3, .5, d + .3, .1), STONE, 0, .25, 0);
      const rh = 3.1, sh = new THREE.Shape(); sh.moveTo(-d / 2 - .6, 0); sh.lineTo(0, rh); sh.lineTo(d / 2 + .6, 0); sh.closePath();
      const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 1.2, bevelEnabled: false }); rg.translate(0, 0, -(w + 1.2) / 2); rg.rotateY(PI / 2); add(rg, TEAL, 0, bh - .05, 0);
      add(rbox(.9, 2.2, .9, .1), STONE, 1.8, bh + 1.8, -1.2);
      for (const sx of [-1, 1]) { const oc = add(new THREE.CylinderGeometry(.5, .5, .12, 16), glow, sx * (w / 2 + .66), bh + 1.0, 0); oc.rotation.z = PI / 2; oc.castShadow = false; }
      // the glazed gallery (galería) of the first floor, on two stone columns, with a little teal roof
      const gz = d / 2 + .75; add(new THREE.BoxGeometry(5.6, 2.0, .12), glow, 0, fh + 1.3, gz + .5).castShadow = false;
      for (let i = 0; i <= 6; i++) add(new THREE.BoxGeometry(.1, 2.2, .16), WHITE, -2.7 + i * .9, fh + 1.3, gz + .52);
      add(new THREE.BoxGeometry(5.8, .14, .2), WHITE, 0, fh + .24, gz + .52); add(new THREE.BoxGeometry(5.8, .14, .2), WHITE, 0, fh + 2.38, gz + .52); add(new THREE.BoxGeometry(5.8, .12, .2), WHITE, 0, fh + 1.3, gz + .52);
      for (const sx of [-1, 1]) add(new THREE.BoxGeometry(.12, 2.0, 1.2), glow, sx * 2.8, fh + 1.3, gz - .1).castShadow = false;
      add(new THREE.BoxGeometry(6.0, .16, 1.5), WHITE, 0, fh + .1, gz - .1); const gr = add(new THREE.BoxGeometry(6.2, .14, 1.9), TEAL, 0, fh + 2.55, gz - .05); gr.rotation.x = .12;
      for (const sx of [-1, 1]) { add(new THREE.CylinderGeometry(.2, .24, fh, 10), STONE, sx * 2.8, fh / 2, gz + .45); const lan = add(new THREE.IcosahedronGeometry(.2, 1), glow, sx * 2.8, 2.15, gz + .75); lan.castShadow = false; add(new THREE.CylinderGeometry(.01, .01, .35, 3), 0x2b2b30, sx * 2.8, 2.45, gz + .75); }
      // front door under the gallery, with a glowing fanlight, and the steps
      add(rbox(1.1, 1.9, .2, .06), 0x8a3a2a, 0, .95, d / 2 + .08); const fan = add(new THREE.CylinderGeometry(.55, .55, .1, 14, 1, false, 0, PI), glow, 0, 1.9, d / 2 + .1); fan.rotation.x = PI / 2; fan.rotation.z = PI / 2; fan.castShadow = false;
      for (let i = 0; i < 3; i++) add(rbox(2.2 - i * .2, .16, .5, .03), STONE, 0, .08 + i * .0, d / 2 + .95 + i * .32);
      for (const sx of [-2.9, -1.9, 1.9, 2.9]) { const wn = add(new THREE.BoxGeometry(.9, 1.3, .12), glow, sx * (Math.abs(sx) > 2.5 ? 1.35 : 1.0), 1.5, d / 2 + .04); wn.castShadow = false; add(new THREE.BoxGeometry(1.1, .12, .22), WHITE, sx * (Math.abs(sx) > 2.5 ? 1.35 : 1.0), .78, d / 2 + .1); }
      // the round stone tower with a conical roof and glowing slits: a different silhouette from every other house
      { const tx = -w / 2 + .2, tz = -d / 2 + .2; add(new THREE.CylinderGeometry(1.5, 1.6, bh + 2.4, 12), STONE, tx, (bh + 2.4) / 2, tz); add(new THREE.ConeGeometry(2.0, 2.6, 12), TEAL, tx, bh + 2.4 + 1.3, tz); add(new THREE.SphereGeometry(.18, 8, 6), 0xf2c14a, tx, bh + 2.4 + 2.7, tz);
        for (let k = 0; k < 3; k++) { const sl = add(new THREE.BoxGeometry(.24, .9, .12), glow, tx + 1.2, 1.6 + k * 1.9, tz + 1.0 - k * .1); sl.rotation.y = .7; sl.castShadow = false; } }
      // a string of warm bulbs along the eaves
      for (let i = 0; i <= 12; i++) { const bu = add(new THREE.IcosahedronGeometry(.1, 1), glow, -w / 2 + .6 + i * (w - 1.2) / 12, bh - .15 - Math.sin(i / 12 * PI) * .0, d / 2 + .34); bu.castShadow = false; }
      // the pool of warm light on the ground in front of the door
      { const c = document.createElement('canvas'); c.width = c.height = 128; const x2 = c.getContext('2d'), gr2 = x2.createRadialGradient(64, 64, 0, 64, 64, 62); gr2.addColorStop(0, 'rgba(255,210,120,.95)'); gr2.addColorStop(.5, 'rgba(255,190,100,.35)'); gr2.addColorStop(1, 'rgba(255,180,90,0)'); x2.fillStyle = gr2; x2.fillRect(0, 0, 128, 128);
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(10, 7.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); pool.rotation.x = -PI / 2; pool.position.set(0, .16, d / 2 + 2.6); g.add(pool); }
      // the wire-haired dachshund (teckel de pelo duro), curled up asleep on a cushion by the door: soft, round and cuddly
      { const dg = new THREE.Group(); dg.position.set(1.7, .02, d / 2 + 1.7); dg.rotation.y = -.35; g.add(dg);
        const FUR = 0x8a5a38, BACK = 0x5a3a24, MUZ = 0xa9784c, EAR = 0x4a2f1e;
        const sm = (c) => std(c, { flatShading: false, roughness: 1 });
        const bed = new THREE.Mesh(new THREE.CylinderGeometry(.95, 1.0, .16, 28), std(0xf2c4a8)); bed.position.y = .08; bed.receiveShadow = true; dg.add(bed); const rim = new THREE.Mesh(new THREE.TorusGeometry(.95, .08, 10, 28), std(0xe8b296)); rim.rotation.x = PI / 2; rim.position.y = .14; dg.add(rim);
        const br = new THREE.Group(); br.position.y = .2; dg.add(br); const hd = new THREE.Group(); br.add(hd); let tgtP = br;
        const ball = (r, col, x, y, z, sx, sy, sz) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), sm(col)); o.position.set(x, y, z); o.scale.set(sx || 1, sy || 1, sz || 1); o.castShadow = true; tgtP.add(o); return o; };
        // the long body, curled in a C: a chain of overlapping soft spheres that gets thinner towards the tail
        for (let k = 0; k < 14; k++) { const u = k / 13, a = -.2 + u * 4.0, rad = .5, r = .2 - u * .06 + Math.sin(u * 3.1) * .03; ball(r, k % 3 ? FUR : BACK, Math.cos(a) * rad, r * .95, Math.sin(a) * rad, 1, .92, 1); }
        // the head rests on the front paws at the other end of the curl
        tgtP = hd; { const hx = Math.cos(-.2) * .5 - .3, hz = Math.sin(-.2) * .5 - .22; ball(.19, FUR, hx, .2, hz, 1.1, .95, 1); ball(.11, MUZ, hx - .21, .13, hz - .1, 1.6, .75, .9); ball(.04, 0x2a1d16, hx - .36, .15, hz - .12);       // skull, long muzzle, nose
          for (const sd of [-1, 1]) { ball(.1, EAR, hx + .02, .12, hz + sd * .2, .8, 1.5, .55); ball(.012, 0x2a1d16, hx - .1, .27, hz - .1 + sd * .075, 3.2, .6, 1); }            // long floppy ears, closed eyes
        }
        tgtP = br; for (let k = 0; k < 3; k++) ball(.06, FUR, Math.cos(-.2 + 3.7) * .5 + .08 * k, .1, Math.sin(-.2 + 3.7) * .5 + .12, 1.2, .8, 1);                                                        // hind paws tucked in
        const zs = []; for (let k = 0; k < 3; k++) { const c = document.createElement('canvas'); c.width = c.height = 64; const x3 = c.getContext('2d'); x3.fillStyle = '#fff6e4'; x3.font = '700 54px "XNunito","Nunito",system-ui,sans-serif'; x3.textAlign = 'center'; x3.textBaseline = 'middle'; x3.fillText('z', 32, 36); x3.strokeStyle = 'rgba(80,60,40,.45)'; x3.lineWidth = 3; x3.strokeText('z', 32, 36); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false })); sp.scale.set(.4, .4, 1); dg.add(sp); zs.push(sp); }
        // Kira standing and walking: short legs, long body, long snout, floppy ears and a wagging tail (swapped in when she wakes)
        const sg = new THREE.Group(); sg.visible = false; g.add(sg); const legs4 = []; let tail4, head4;
        { const sb = (r, col, x, y, z, sx, sy, sz, par) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), sm(col)); o.position.set(x, y, z); o.scale.set(sx || 1, sy || 1, sz || 1); o.castShadow = true; (par || sg).add(o); return o; };
          const body = new THREE.Group(); sg.add(body); body.position.y = .5;
          sb(.28, FUR, .0, 0, 0, 2.0, .85, 1, body); sb(.26, BACK, -.05, .09, 0, 1.9, .55, .9, body); sb(.23, FUR, .45, .02, 0, 1.2, .9, .95, body);
          for (const [lx, lz] of [[.46, .14], [.46, -.14], [-.42, .14], [-.42, -.14]]) { const lg = new THREE.Group(); lg.position.set(lx, .42, lz); sg.add(lg); const up = new THREE.Mesh(new THREE.CylinderGeometry(.075, .06, .3, 10), sm(FUR)); up.position.y = -.15; up.castShadow = true; lg.add(up); sb(.085, EAR, .03, -.31, 0, 1.4, .7, 1, lg); legs4.push(lg); }
          head4 = new THREE.Group(); head4.position.set(.82, .66, 0); sg.add(head4); sb(.19, FUR, 0, 0, 0, 1.1, .95, 1, head4); sb(.11, MUZ, .22, -.06, 0, 1.7, .72, .9, head4); sb(.04, 0x2a1d16, .38, -.03, 0, 1, 1, 1, head4);
          for (const sd of [-1, 1]) { sb(.1, EAR, -.02, -.1, sd * .2, .8, 1.6, .55, head4); sb(.028, 0x2a1d16, .11, .07, sd * .1, 1, 1.1, .8, head4); sb(.012, 0xffffff, .125, .085, sd * .1, 1, 1, 1, head4); }
          tail4 = new THREE.Group(); tail4.position.set(-.7, .62, 0); sg.add(tail4); for (let k = 0; k < 5; k++) sb(.07 - k * .008, k % 2 ? FUR : BACK, -.1 * k, .09 * k, 0, 1.2, 1, 1, tail4); }
        const PATH = [[1.7, 4.7], [.9, 5.5], [-.4, 5.9], [-1.8, 5.4], [-2.2, 4.6], [-1.2, 4.1], [.3, 4.3], [1.0, 5.2], [1.7, 4.7]]; let plen = 0; const segs = PATH.slice(1).map((q, i) => { const a = PATH[i], l = Math.hypot(q[0] - a[0], q[1] - a[1]); plen += l; return l; });
        const ud = g.userData; ud.dogG = dg; ud.sg = sg; ud.act = 0; ud.wake = 0; ud.barks = [];
        ud.update = (t, dt) => { const aw = ud.wake > 0, k = aw ? Math.min(1, (3.6 - ud.wake) * 3, ud.wake * 2) : 0; if (aw) ud.wake -= dt || .016;
          if (ud.act > 0) { const T = 15 - ud.act; ud.act -= dt || .016; const up = Math.min(1, T / 1.1), wk = T > 1.4 && T < 13.4; let px = 1.7, pz = 4.7, hd2 = 0;
            if (wk) { let dd = ((T - 1.4) / 12) * plen, i = 0; while (i < segs.length - 1 && dd > segs[i]) { dd -= segs[i]; i++; } const a = PATH[i], b = PATH[i + 1], u2 = Math.min(1, dd / segs[i]); px = a[0] + (b[0] - a[0]) * u2; pz = a[1] + (b[1] - a[1]) * u2; hd2 = -Math.atan2(b[1] - a[1], b[0] - a[0]); sg.userData.hd = hd2; } else hd2 = sg.userData.hd || -Math.atan2(PATH[0][1] - 4.7, 0);
            sg.visible = true; br.visible = false; sg.position.set(px, .16, pz); sg.rotation.y = wk ? hd2 : (T < 1.4 ? -.6 : sg.userData.hd || 0); sg.scale.set(1, .35 + .65 * (up * up * (3 - 2 * up)), 1);
            const sw = wk ? Math.sin(t * 9) : 0; legs4.forEach((lg, q) => { lg.rotation.z = sw * .55 * (q % 2 ? -1 : 1) * (q < 2 ? 1 : -1); }); head4.rotation.z = (wk ? Math.sin(t * 4.5) * .06 : .12 * Math.sin(t * 7)); head4.rotation.y = Math.sin(t * 2.1) * .12; tail4.rotation.y = Math.sin(t * 12) * (wk ? .6 : .9); tail4.rotation.z = .35 + Math.sin(t * 3) * .05; sg.children[0].position.y = .5 + Math.abs(Math.sin(t * 9)) * (wk ? .018 : 0);
            if (ud.act <= 0) { sg.visible = false; br.visible = true; } }
          br.scale.set(1 + Math.sin(t * 1.5) * .018, 1 + Math.sin(t * 1.5) * (aw ? .02 : .05) + k * .22, 1 + Math.sin(t * 1.5) * .018);
          const bark = aw ? Math.max(0, Math.sin((3.6 - ud.wake) * 5.2)) ** 6 : 0, ph = t % 9, idle = !aw && ph < 2.4 ? Math.sin(ph / 2.4 * PI) : 0; hd.position.y = k * .16 + bark * .04 + idle * .08; hd.rotation.z = k * .22 - bark * .18 + idle * .14 * Math.sin(t * 5); hd.position.x = -k * .03; br.rotation.y = Math.sin(t * .35) * .035 + idle * .05;
          zs.forEach((sp, q) => { const u = ((t * .25 + q / 3) % 1); sp.visible = !aw; sp.position.set(-.6 - u * .3, .6 + u * 1.0, -.3); sp.material.opacity = Math.sin(u * PI) * .9; sp.scale.setScalar(.25 + u * .3); });
          for (let q = ud.barks.length - 1; q >= 0; q--) { const bk = ud.barks[q]; bk.t += dt || .016; bk.s.position.set(-.2 + bk.t * .1, .9 + bk.t * .9, -.3); bk.s.material.opacity = Math.max(0, 1 - bk.t / 1.4); bk.s.scale.set(.9 + bk.t * .2, .45 + bk.t * .1, 1); if (bk.t > 1.4) { dg.remove(bk.s); ud.barks.splice(q, 1); } } };
        ud.poke = (word) => { ud.wake = 3.6; ud.act = 15; const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x4 = c.getContext('2d'); x4.fillStyle = '#fff8ea'; x4.strokeStyle = '#8a5a44'; x4.lineWidth = 5; x4.beginPath(); x4.roundRect ? x4.roundRect(8, 10, 240, 90, 36) : x4.rect(8, 10, 240, 90); x4.fill(); x4.stroke(); x4.fillStyle = '#6b4a3a'; x4.font = '700 52px "XNunito","Nunito",system-ui,sans-serif'; x4.textAlign = 'center'; x4.textBaseline = 'middle'; x4.fillText(word, 128, 58); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false })); dg.add(sp); ud.barks.push({ s: sp, t: 0 }); };
      }
      // Kira's kennel (caseta), next to her, with her name on a sign
      { const kn = new THREE.Group(); kn.position.set(3.4, 0, d / 2 + 1.5); kn.rotation.y = -.25; g.add(kn); const kadd = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, std(col)); o.position.set(x, y, z); o.castShadow = true; kn.add(o); return o; };
        kadd(rbox(1.5, 1.0, 1.4, .12), 0xd9a36a, 0, .5, 0); for (const sd of [-1, 1]) { const rf = kadd(rbox(1.2, .1, 1.7, .04), 0xc9473a, sd * .55, 1.18, 0); rf.rotation.z = -sd * .6; }
        kadd(rbox(.55, .7, .1, .08), 0x4a3324, 0, .42, .72); const arch = kadd(new THREE.CylinderGeometry(.28, .28, .1, 14, 1, false, 0, PI), 0x4a3324, 0, .77, .72); arch.rotation.x = PI / 2; arch.rotation.z = PI / 2;
        const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x5 = c.getContext('2d'); x5.fillStyle = '#fff6e4'; x5.fillRect(0, 0, 256, 96); x5.strokeStyle = '#c0453a'; x5.lineWidth = 8; x5.strokeRect(5, 5, 246, 86); x5.fillStyle = '#3f6f98'; x5.font = '700 64px "XNunito","Nunito",system-ui,sans-serif'; x5.textAlign = 'center'; x5.textBaseline = 'middle'; x5.fillText('KIRA', 128, 52);
        const sgn = new THREE.Mesh(new THREE.BoxGeometry(1.1, .42, .08), [std(0xd9a36a), std(0xd9a36a), std(0xd9a36a), std(0xd9a36a), new THREE.MeshStandardMaterial({ map: (() => { const t5 = new THREE.CanvasTexture(c); t5.colorSpace = THREE.SRGBColorSpace; return t5; })(), roughness: 1 }), std(0xd9a36a)]); sgn.position.set(0, 1.0, .74); kn.add(sgn);
        kadd(new THREE.CylinderGeometry(.22, .2, .08, 12), 0x5a95c4, -.95, .04, .5); kadd(new THREE.SphereGeometry(.12, 8, 6), 0xf2d27a, -.95, .12, .5); }
      g.userData.fw = w + .2; g.userData.fd = d + .2; g.userData.r = 8.6; g.userData.hx = w / 2 + .9; g.userData.hz = d / 2 + .4; g.userData.porch = d / 2 + 1.6; return g; };
    const hs = casaMesh(); casa.obj = hs;
    for (const [z, off] of cands.flatMap((z) => [[z, 12], [z, 15], [z, 9.5], [z, 18], [z, 21]])) { const x = ROADX(z) - off; if (H(x, z) < .5 || solid(x, z, 4.8) || plazas.some((pl) => Math.hypot(pl[0] - x, pl[1] - z) < pl[2] + 6) || lanes.some((l) => l.some((q) => Math.hypot(q[0] - x, q[1] - z) < 6.5)) || viol(hs.userData, x, z, PI / 2)[0] > 0) continue;
      addTo(hs, x, z, PI / 2, hs.userData.r);
      { const gy = hs.position.y, dD = 6.0, tw = 9.6, fz0 = dD / 2, tdep = 4.6; let lo = gy; for (const lx of [-tw / 2, 0, tw / 2]) for (const lz of [fz0, fz0 + tdep]) lo = Math.min(lo, H(x + lz, z - lx));
        const th = Math.max(.3, gy - lo + .25), tr = new THREE.Mesh(new THREE.BoxGeometry(tw, th, tdep), std(0xd8cdb6)); tr.position.set(0, -th / 2, fz0 + tdep / 2); tr.castShadow = true; tr.receiveShadow = true; hs.add(tr);   // a stone terrace in front of the house, so Kira and her kennel stand on something
        const drop = gy - H(x + fz0 + tdep + .5, z), ns = Math.max(2, Math.ceil(Math.max(0, drop) / .24)); for (let i = 1; i <= ns; i++) { const zc = fz0 + tdep + (i - .5) * .55, top = -i * .24, bot = H(x + zc, z) - gy - .2, hh = Math.max(.2, top - bot), st = new THREE.Mesh(new THREE.BoxGeometry(tw * .55, hh, .55), std(0xcfc4ae)); st.position.set(0, top - hh / 2, zc); st.castShadow = true; st.receiveShadow = true; hs.add(st); } }
      casa.x = x + hs.userData.porch + 1.6; casa.z = z; casa.ok = true; casa.hx = x; casa.hy = H(x, z); break; }
    if (casa.ok) { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexL, color: 0xffc766, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.scale.set(22, 15, 1); gl.position.set(casa.hx + 3, casa.hy + 3.4, casa.z); scene.add(gl); casa.glow = gl;
      const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(.22, 1), new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: 1.6 })); lamp.position.set(casa.x - 1.6, casa.hy + 2.6, casa.z + 1.2); scene.add(lamp); } }
  // ---- traffic: two little cars and a bus that stops at every bus shelter and takes on the people who wait there
  const traffic = [];
  { const mk = (L, W2, Hh, col, bus) => { const g = new THREE.Group(), add = (geo, c, x, y, z, ex) => { const o = new THREE.Mesh(geo, std(c, ex)); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
      add(rbox(W2, Hh * .62, L, .35), col, 0, Hh * .31 + .35, 0); add(rbox(W2 * .94, Hh * .3, bus ? L * .94 : L * .5, .3), 0x34414f, 0, Hh * .62 + .45, bus ? 0 : -L * .06, bus ? { transparent: true, opacity: .32, roughness: .2 } : undefined);
      if (!bus) add(rbox(W2 * .86, .16, L * .46, .1), col, 0, Hh + .38, -L * .06);
      else { add(rbox(W2 * 1.01, .22, L * .98, .08), 0xf6f1e4, 0, Hh * .5, 0); add(rbox(W2 * .9, .2, L * .8, .08), col, 0, Hh + .46, 0); }
      for (const sx of [-1, 1]) for (const sz of bus ? [-.34, .34] : [-.3, .3]) { const w = add(new THREE.CylinderGeometry(.42, .42, .3, 14), 0x23262b, sx * (W2 / 2 - .02), .42, sz * L); w.rotation.z = PI / 2; add(new THREE.CylinderGeometry(.2, .2, .32, 8), 0xe6e2d6, sx * (W2 / 2 - .02), .42, sz * L).rotation.z = PI / 2; }
      for (const sx of [-1, 1]) { const hl = add(new THREE.SphereGeometry(.17, 8, 6), 0xfff0b8, sx * W2 * .32, Hh * .3 + .4, L / 2); hl.material = new THREE.MeshStandardMaterial({ color: 0xfff0b8, emissive: 0xffe9a0, emissiveIntensity: .5 }); add(new THREE.SphereGeometry(.14, 8, 6), 0xe0584a, sx * W2 * .32, Hh * .3 + .4, -L / 2); }
      g.userData.L = L; return g; };
    const mkBus = () => { const g = mk(8.4, 2.7, 2.9, 0xe9873a, true); g.scale.setScalar(.82);
      const seats = new THREE.Group(); g.add(seats); g.userData.pax = [];
      for (let i = 0; i < 8; i++) { const pp = person([0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xc9a0e8, 0xf0907a][i % 6], [0xf0c9a0, 0xe3b185, 0xf5d6b5][i % 3]); pp.scale.setScalar(.46); pp.position.set((i % 2 ? .55 : -.55), 1.3, -3.2 + Math.floor(i / 2) * 1.9); pp.rotation.y = PI / 2; seats.add(pp); pp.visible = i < 3; g.userData.pax.push(pp); }
      return g; };
    const vs = [{ g: mkBus(), lane: 1.5, dir: -1, bus: true, z: 70, sp: 5.2 }, { g: mk(4.1, 1.9, 1.5, 0x3f8f9e, false), lane: -1.5, dir: 1, z: -60, sp: 6.5 }, { g: mk(4.1, 1.9, 1.5, 0xc9473a, false), lane: -1.5, dir: 1, z: 20, sp: 6.5 }];
    for (const v of vs) { v.g.scale.multiplyScalar(.82); scene.add(v.g); v.wait = 0; v.next = 0; traffic.push(v); }
    // the people waiting at the shelters (they board the bus, and a new one turns up a little later)
    const waiters = stops.map(([bx, bz], i) => { const w = person([0x4f8fc0, 0xe9a0c0, 0xf2c14a, 0x5fae8a, 0xc9a0e8][i % 5], [0xf0c9a0, 0xe3b185, 0xf5d6b5][i % 3]); { const sc = new THREE.Group(), cc = [0xc9473a, 0x2f6fa8, 0x3b8f6a][i % 3]; const bd = new THREE.Mesh(rbox(.4, .62, .26, .07), std(cc)); bd.position.y = .38; sc.add(bd); const hdl = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .5, 5), std(0x3a3f47)); hdl.position.set(0, .88, 0); sc.add(hdl); const hg = new THREE.Mesh(new THREE.BoxGeometry(.18, .03, .03), std(0x3a3f47)); hg.position.y = 1.13; sc.add(hg); for (const q of [-.12, .12]) { const wl = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), std(0x23262b)); wl.position.set(q, .04, 0); sc.add(wl); } sc.traverse((o) => { if (o.isMesh) o.castShadow = true; }); sc.position.set(.1, 0, .78); sc.rotation.y = PI / 2; w.add(sc); } w.scale.setScalar(.88); w.position.set(bx - .1, H(bx, bz) + .08, bz + .1); w.rotation.y = PI / 2 + 0; scene.add(w); return { p: w, bx, bz, st: 'wait', t: 0, x: bx - .1, z: bz + .1 }; });
    traffic.update = (dt) => {
      for (const v of traffic) { const g = v.g;
        if (v.wait > 0) { v.wait -= dt; } else { let stopAt = null; if (v.bus) for (const w of waiters) if (w.st === 'wait' && (w.bz - v.z) * v.dir > -.5 && (w.bz - v.z) * v.dir < 6) { stopAt = w; break; }
          if (stopAt) { const d = stopAt.bz - v.z; if (Math.abs(d) < .5) { v.wait = 4.5; stopAt.st = 'board'; stopAt.t = 0; } else v.z += Math.sign(d) * Math.min(Math.abs(d), v.sp * .5 * dt); } else v.z += v.dir * v.sp * dt; }
        if (v.z < -96) v.z = 96; if (v.z > 96) v.z = -96;
        const x = ROADX(v.z) + v.lane, x2 = ROADX(v.z + v.dir * 2); const hd = Math.atan2(x2 - ROADX(v.z), v.dir * 2); g.position.set(x, H(x, v.z) + .02, v.z); g.rotation.y = hd; }
      const bus = traffic[0];
      for (const w of waiters) {
        if (w.st === 'board') { w.t += dt; const dx = (ROADX(bus.z) + 1.5 + 1.8) - w.x, dz = bus.z - w.z, d = Math.hypot(dx, dz); const sp = 2.2 * dt; if (d > .4) { w.x += dx / d * sp; w.z += dz / d * sp; w.p.rotation.y = Math.atan2(dx, dz) - PI / 2; w.p.position.set(w.x, H(w.x, w.z) + .08 + Math.abs(Math.sin(w.t * 7)) * .1, w.z); } else { w.st = 'gone'; w.t = 0; w.p.visible = false; const px = bus.g.userData.pax.find((q) => !q.visible); if (px) px.visible = true; else { const q = bus.g.userData.pax[Math.floor(Math.random() * 8)]; q.visible = false; } } }
        else if (w.st === 'gone') { w.t += dt; if (w.t > 22) { w.st = 'wait'; w.x = w.bx - .1; w.z = w.bz + .1; w.p.position.set(w.x, H(w.x, w.z) + .08, w.z); w.p.rotation.y = PI / 2; w.p.visible = true; } }
      }
    }; }
  // ---- trees, bushes, hydrangeas
  const lowpoly = (g, a) => { const ps = g.attributes.position; for (let q = 0; q < ps.count; q++) { const x = ps.getX(q), y = ps.getY(q), z = ps.getZ(q), k = 1 + (hash(x * 37.1 + y * 11.3, z * 53.7 + y * 5.1) - .5) * a; ps.setXYZ(q, x * k, y * k, z * k); } g.computeVertexNormals(); return g; };
  const crownG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .34), trunkG = new THREE.CylinderGeometry(.18, .3, 1, 6); trunkG.translate(0, .5, 0);
  const trees = []; for (let i = 0; i < 6000 && trees.length < (LOW ? 80 : 150); i++) { const x = -98 + rng() * 150, z = -96 + rng() * 192, c = COAST(z); if (x > c - 8 || Math.abs(x - ROADX(z)) < 12 || lanes.some((l) => l.some((q) => Math.hypot(q[0] - x, q[1] - z) < 4.2))) continue; if (FLATS.some((f) => Math.hypot(x - f[0], z - f[1]) < 17) || colliders.some((q) => Math.hypot(q[0] - x, q[1] - z) < q[2] + 3)) continue; trees.push([x, z, 1.2 + rng() * 1.5, rng() < .22]); }
  const crowns = new THREE.InstancedMesh(crownG, std(0xffffff, { flatShading: true, roughness: .9 }), trees.length), trunks = new THREE.InstancedMesh(trunkG, std(0x8a6a4c), trees.length), tc = new THREE.Color(), to = new THREE.Object3D(); const TCOL = [0x3c8c6c, 0x4a9a78, 0x4e9e7a, 0x2f7a62, 0x5aa88a], ECOL = [0x7fb48a, 0x8cc095];
  trees.forEach(([x, z, s, euc], i) => { const y = H(x, z); to.position.set(x, y, z); to.rotation.set(0, rng() * 6, 0); to.scale.set(s * .4, s * (euc ? 3.2 : 1.4), s * .4); to.updateMatrix(); trunks.setMatrixAt(i, to.matrix); to.position.set(x, y + s * (euc ? 3.4 : 1.8), z); to.scale.set(s * (euc ? 1 : 1.5), s * (euc ? 2.3 : 1.35), s * (euc ? 1 : 1.5)); to.updateMatrix(); crowns.setMatrixAt(i, to.matrix); tc.set(euc ? ECOL[i % 2] : TCOL[i % 5]).offsetHSL((rng() - .5) * .02, (rng() - .5) * .08, (rng() - .5) * .06); crowns.setColorAt(i, tc); });
  crowns.castShadow = !LOW; trunks.castShadow = !LOW; scene.add(crowns, trunks); for (const [x, z, sz] of trees) colliders.push([x, z, .3 * sz]);
  const bushG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .3), HC = [0x8fa9e8, 0xe9a0c0, 0x9ab8f0, 0xc9a5e8, 0x5fae8a], bushes = new THREE.InstancedMesh(bushG, std(0xffffff, { flatShading: true }), 70);
  for (let i = 0; i < 70; i++) { const vz = VILLAGES[i % 5][1] + (rng() - .5) * 40, side = rng() < .5 ? -1 : 1, x = ROADX(vz) + side * (11 + rng() * 6), s = .5 + rng() * .8; to.position.set(x, H(x, vz) + s * .3, vz); to.rotation.set(0, rng() * 6, 0); to.scale.set(s * 1.3, s, s * 1.3); to.updateMatrix(); bushes.setMatrixAt(i, to.matrix); tc.set(HC[i % 5]); tc.offsetHSL(0, 0, (rng() - .5) * .06); bushes.setColorAt(i, tc); }
  bushes.castShadow = !LOW; scene.add(bushes);
  // grass tufts and tiny flowers over the meadows, and soft contact shadows under trees, bushes and houses (the painted look of the reference)
  { const tg = new THREE.ConeGeometry(.12, .8, 3); tg.translate(0, .4, 0); const NT = LOW ? 350 : 1100, tufts = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), NT), fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.14, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), 260); let n1 = 0, n2 = 0;
    for (let i = 0; i < 9000 && (n1 < NT || n2 < 260); i++) { const x = -98 + rng() * 146, z = -96 + rng() * 192, c = COAST(z), h = H(x, z); if (h < .55 || x > c - 7 || Math.abs(x - ROADX(z)) < 4.4 || lanes.some((pts) => pts.some((q) => Math.hypot(q[0] - x, q[1] - z) < 3.4)) || plazas.some((pl) => Math.hypot(pl[0] - x, pl[1] - z) < pl[2] + 1) || colliders.some((q) => q.length === 6 && Math.hypot(q[0] - x, q[1] - z) < q[2] + 1)) continue;
      if (n1 < NT && rng() < .8) { const k = .7 + rng() * .9; to.position.set(x, h - .05, z); to.rotation.set((rng() - .5) * .3, rng() * 6, (rng() - .5) * .3); to.scale.set(k, k * (.8 + rng() * .8), k); to.updateMatrix(); tufts.setMatrixAt(n1, to.matrix); tc.set([0x6fb585, 0x8fcf9c, 0x5aa476, 0x7fc08c][n1 % 4]).offsetHSL(0, 0, (rng() - .5) * .06); tufts.setColorAt(n1, tc); n1++; }
      else if (n2 < 260) { to.position.set(x, h + .1, z); to.rotation.set(0, 0, 0); to.scale.setScalar(.7 + rng() * .7); to.updateMatrix(); fl.setMatrixAt(n2, to.matrix); tc.set([0xf6e58a, 0xf4a3b8, 0xffffff, 0xc9a5e8][n2 % 4]); fl.setColorAt(n2, tc); n2++; } }
    tufts.count = n1; fl.count = n2; tufts.receiveShadow = true; scene.add(tufts, fl);
    const blob = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 31); gr.addColorStop(0, 'rgba(30,50,60,.5)'); gr.addColorStop(.6, 'rgba(30,50,60,.22)'); gr.addColorStop(1, 'rgba(30,50,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    const bm = new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }), pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-PI / 2);
    const bl = new THREE.InstancedMesh(pg, bm, trees.length + 70); let bi = 0; trees.forEach(([x, z, sz, euc]) => { to.position.set(x, H(x, z) + .06, z); to.rotation.set(0, 0, 0); to.scale.setScalar(sz * (euc ? 3.2 : 5.2)); to.updateMatrix(); bl.setMatrixAt(bi++, to.matrix); });
    for (let i = 0; i < 70; i++) { const m4 = new THREE.Matrix4(); bushes.getMatrixAt(i, m4); const v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m4.decompose(v, q, sc); to.position.set(v.x, H(v.x, v.z) + .06, v.z); to.rotation.set(0, 0, 0); to.scale.setScalar(Math.max(.01, sc.x * 2.6)); to.updateMatrix(); bl.setMatrixAt(bi++, to.matrix); }
    bl.count = bi; bl.renderOrder = 1; scene.add(bl); }

  // ---- the sea: boats, gulls, and everything under it
  // two wooden piers with a walkway, and fishing boats tied up on both sides of them
  const piers = [], PIERW = 3.6, PIERY = .6, plankA = std(0xb98a5a), plankB = std(0xa87a4c), postM = std(0x6f5238);
  const mkPier = (z0) => { const c = COAST(z0), x0 = c - 5, x1 = c + 24, g = new THREE.Group();
    for (let x = x0, k = 0; x < x1; x += .62, k++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(.58, .16, PIERW), k % 2 ? plankA : plankB); pl.position.set(x + .3, PIERY, z0); pl.castShadow = true; pl.receiveShadow = true; g.add(pl); }
    for (let x = x0 + 1.5; x < x1; x += 4.4) for (const sz of [-1, 1]) { const zz = z0 + sz * (PIERW / 2 - .15), gy = H(x, zz), po = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, PIERY + .75 - gy, 7), postM); po.position.set(x, (PIERY + .75 + gy) / 2, zz); po.castShadow = true; g.add(po); if (sz > 0 || x > x1 - 6) { const bo = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .5, 8), std(0x3a4452)); bo.position.set(x, PIERY + .3, zz); g.add(bo); } }
    for (const sz of [-1, 1]) for (let x = x0 + 1; x < x1; x += 2.2) { const rp = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .9, 5), postM); rp.position.set(x, PIERY + .55, z0 + sz * (PIERW / 2 - .08)); g.add(rp); }
    for (const sz of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 1, .08, .08), postM); rail.position.set((x0 + x1) / 2 + .2, PIERY + 1.0, z0 + sz * (PIERW / 2 - .08)); g.add(rail); }
    scene.add(g); piers.push({ x0, x1, z: z0, y: PIERY + .08 }); return g; };
  mkPier(-62); mkPier(34);
  const fishers = [];
  [[-62, 1, 4], [34, 1, 6], [34, -1, 11], [34, 1, 16]].forEach(([z0, sd, dx], i) => { const pr = piers.find((q) => q.z === z0), f = fisher([0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a][i], [0xf0c9a0, 0xe3b185][i % 2]); f.position.set(pr.x1 - dx, pr.y + .1, z0 + sd * (PIERW / 2 - .6)); f.rotation.y = 0; f.userData.ph = i * 1.9; scene.add(f); fishers.push(f); });
  const boats = []; [[-62, -1, 9], [-62, 1, 17], [34, -1, 8], [34, 1, 15], [34, -1, 19]].forEach(([z0, sd, dx], i) => { const b = new THREE.Group(), col = [0xe36d57, 0x4f8fc0, 0xf2c14a, 0x5fae8a, 0xe36d57][i]; const hull = new THREE.Mesh(rbox(5, 1.1, 2, .4), std(col)); hull.position.y = .3; b.add(hull); const cab = new THREE.Mesh(rbox(1.6, 1.3, 1.4, .25), std(0xf7f0e0)); cab.position.set(-.6, 1.2, 0); b.add(cab); const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3, 5), std(0x8a6a4c)); mast.position.set(.8, 2, 0); b.add(mast); const fl = new THREE.Mesh(new THREE.SphereGeometry(.18, 6, 5), std(0xf08a76)); fl.position.set(2.6, .8, 0); b.add(fl); b.userData = { x: COAST(z0) + dx - 5, z: z0 + sd * (PIERW / 2 + 1.5), ph: i * 1.7 }; b.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(b); boats.push(b); });
  // seagulls fly past from time to time: a little flock crosses the sky above the car, calling
  const gulls = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(.4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfffaf0 })); body.scale.set(1.9, .8, .8); g.add(body); const hd = new THREE.Mesh(new THREE.SphereGeometry(.2, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfffaf0 })); hd.position.x = .72; g.add(hd); const bk = new THREE.Mesh(new THREE.ConeGeometry(.07, .26, 4), new THREE.MeshBasicMaterial({ color: 0xf2a94a })); bk.rotation.z = -PI / 2; bk.position.x = .94; g.add(bk); g.userData.w = []; for (const sd of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.8, .05, 1.7), new THREE.MeshBasicMaterial({ color: 0xffffff })); w.position.z = sd * .85; w.userData.s = sd; g.add(w); g.userData.w.push(w); } g.visible = false; scene.add(g); gulls.push(g); }
  const a0 = (k) => k * 1.3 + 2; const flock = { next: 4, t: -1, p0: new THREE.Vector3(), dir: new THREE.Vector3() };
  const sx0 = COAST(0), under = new THREE.Group(); scene.add(under);
  const kelpG = new THREE.CylinderGeometry(.06, .22, 1, 5, 6); kelpG.translate(0, .5, 0); const kuni = { uTime: { value: 0 } };
  const kelpM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, map: paintTex() }); kelpM.onBeforeCompile = (sh) => { sh.uniforms.uTime = kuni.uTime; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float ph = instanceMatrix[3].x * .7 + instanceMatrix[3].z * .5; transformed.x += sin(uTime * 1.1 + ph + position.y * 2.2) * position.y * position.y * .5; transformed.z += cos(uTime * .9 + ph * 1.3 + position.y * 1.8) * position.y * position.y * .4;'); };
  { const NK = 70, kelp = new THREE.InstancedMesh(kelpG, kelpM, NK); for (let i = 0; i < NK; i++) { const z = -95 + rng() * 190, x = COAST(z) + 2 + rng() * 26, h = 2 + rng() * 4; to.position.set(x, H(x, z) - .1, z); to.rotation.set(0, rng() * 6, 0); to.scale.set(1, h, 1); to.updateMatrix(); kelp.setMatrixAt(i, to.matrix); tc.set([0x56ad8a, 0x6fc29a, 0x4a9f86, 0x8bcf9c, 0xd88aa0][i % 5]); kelp.setColorAt(i, tc); } under.add(kelp); }
  { const rockG = lowpoly(new THREE.IcosahedronGeometry(1, 1), .35), rocks = new THREE.InstancedMesh(rockG, std(0xffffff, { flatShading: true }), 40); for (let i = 0; i < 40; i++) { const z = -95 + rng() * 190, x = COAST(z) + 3 + rng() * 40, s = .7 + rng() * rng() * 3; to.position.set(x, H(x, z) + s * .2, z); to.rotation.set(rng(), rng() * 6, rng() * .4); to.scale.set(s, s * (.6 + rng() * .5), s); to.updateMatrix(); rocks.setMatrixAt(i, to.matrix); tc.set([0xb8aab8, 0xa9b7bd, 0xc9b9a6, 0x9fb0b4][i % 4]); rocks.setColorAt(i, tc); } rocks.castShadow = true; under.add(rocks); }
  { const cG = new THREE.ConeGeometry(.35, 1.8, 6), co = new THREE.InstancedMesh(cG, std(0xffffff, { flatShading: true }), 90); for (let i = 0; i < 90; i++) { const b = Math.floor(i / 5), bz = -95 + hash(b, 5) * 190, bx = COAST(bz) + 3 + hash(b, 9) * 30, x = bx + (rng() - .5) * 2.4, z = bz + (rng() - .5) * 2.4, s = .6 + rng() * 1.1; to.position.set(x, H(x, z) + s * .1, z); to.rotation.set((rng() - .5) * .8, rng() * 6, (rng() - .5) * .8); to.scale.set(s, s * (.7 + rng() * .7), s); to.updateMatrix(); co.setMatrixAt(i, to.matrix); tc.set([0xf0959c, 0xf4b36e, 0xc5a0e8, 0xf7d27a, 0xe97f8e][b % 5]).offsetHSL(0, 0, (rng() - .5) * .06); co.setColorAt(i, tc); } under.add(co); }
  const wz = 68, wx = COAST(wz) + 16, W = wreck(); W.scale.setScalar(1.7); W.position.set(wx, H(wx, wz) + .8, wz); W.rotation.set(.05, -.7, -.38); under.add(W);
  const animals = []; const sch = [school(40, COAST(-50) + 12, -50, -2.6, 6, 4, [0xdfe9ef, 0xcfe0ea, 0xe9eef2], .8, .8), school(34, COAST(-10) + 14, -10, -2.8, 6, 5, [0xf1c27a, 0xe9b46a, 0xf4d08c], 1.0, .65), school(46, COAST(36) + 12, 36, -2.4, 6, 4.5, [0xdfe9ef, 0xbcd8e4, 0xcfe0ea], .8, .85), school(10, wx - 6, wz - 8, -3.4, 5, 3, [0xf29a7c, 0xf4b08c], 1.3, .5)]; sch.forEach((s) => { under.add(s); animals.push(s); });
  const dolphins = [dolphin(), dolphin()]; dolphins.forEach((d, i) => { d.scale.setScalar(1.4 - i * .2); under.add(d); });
  const jellies = []; [[COAST(-70) + 8, -2.2, -70], [COAST(-30) + 16, -2.6, -30], [COAST(10) + 10, -2.0, 10], [COAST(30) + 20, -2.8, 30], [COAST(56) + 9, -2.2, 56], [wx - 7, -3.0, wz + 10]].forEach(([x, y, z], i) => { const j = jelly([0xf3b7d6, 0xcbb4f0, 0xf7c9a3][i % 3]); j.scale.setScalar(1.6 + (i % 3) * .4); j.userData.base = [x, y, z]; j.userData.ph = i * 1.7; under.add(j); jellies.push(j); });
  const oct = octopus(); { const ox = wx - 8, oz = wz + 4; oct.position.set(ox, H(ox, oz) - .1, oz); oct.scale.setScalar(1.7); under.add(oct); }
  const crb = crab(); { const cx0 = wx - 14, cz0 = wz - 3; crb.position.set(cx0, H(cx0, cz0) - .1, cz0); crb.scale.setScalar(2.1); crb.userData.c = [cx0, cz0]; under.add(crb); }
  for (let i = 0; i < 14; i++) { const z = -90 + rng() * 180, x = COAST(z) + 3 + rng() * 16, s = starfish([0xf2956e, 0xf4c26e, 0xe97f9a, 0xc9a2e8][i % 4]); s.position.set(x, H(x, z) + .03, z); s.scale.setScalar(1.4 + rng()); s.rotation.y = rng() * 6; under.add(s); }
  // ---- the old stone bridge: a ramp up from the coast, four round arches over the water, a ramp down to a little island with a chapel
  const BZ = ISL_Z, BW = 4.6, B0 = COAST(BZ) - 4, B1 = ISL_X - 9.5, BY0 = H(B0, BZ), BY1 = H(B1, BZ), BRAMP = 8, stoneMat = std(0xc7bfae), mossMat = std(0x6fb585);
  { const bg = new THREE.Group(); scene.add(bg);
    const body = (pts, holes) => { const sh = new THREE.Shape(pts.map((q) => new THREE.Vector2(q[0], q[1]))); for (const hl of holes) { const hp = new THREE.Path(); hl.forEach((q, i) => i ? hp.lineTo(q[0], q[1]) : hp.moveTo(q[0], q[1])); sh.holes.push(hp); } const g = new THREE.ExtrudeGeometry(sh, { depth: BW, bevelEnabled: false }); g.translate(0, 0, -BW / 2); const m = new THREE.Mesh(g, stoneMat); m.position.z = BZ; m.castShadow = true; m.receiveShadow = true; bg.add(m); return m; };
    body([[B0, BY0 - 2], [B0, BY0], [B0 + BRAMP, DECK_Y], [B0 + BRAMP, BY0 - 2]], []);
    body([[B1 - BRAMP, BY1 - 2], [B1 - BRAMP, DECK_Y], [B1, BY1], [B1, BY1 - 2]], []);
    const xa = B0 + BRAMP, xb = B1 - BRAMP, NA = 4, PIER = 1.3, SP = (xb - xa - PIER * (NA + 1)) / NA, spring = DECK_Y - 1.5 - SP / 2, holes = [];
    for (let k = 0; k < NA; k++) { const xl = xa + PIER + k * (SP + PIER), xr = xl + SP, xc = (xl + xr) / 2, h = [[xl, -5.9], [xl, spring]]; for (let a = PI; a >= 0; a -= PI / 14) h.push([xc + Math.cos(a) * SP / 2, spring + Math.sin(a) * SP / 2]); h.push([xr, -5.9]); holes.push(h); }
    body([[xa, -6.2], [xb, -6.2], [xb, DECK_Y], [xa, DECK_Y]], holes);
    for (const sd of [-1, 1]) {
      const z = BZ + sd * (BW / 2 - .22), mk = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), w = new THREE.Mesh(new THREE.BoxGeometry(L, .9, .46), stoneMat); w.position.set((x0 + x1) / 2, (y0 + y1) / 2 + .45, z); w.rotation.z = Math.atan2(y1 - y0, x1 - x0); w.castShadow = true; bg.add(w); const cap = new THREE.Mesh(new THREE.BoxGeometry(L, .12, .6), std(0xd9d1bf)); cap.position.set((x0 + x1) / 2, (y0 + y1) / 2 + .94, z); cap.rotation.z = w.rotation.z; bg.add(cap); };
      mk(B0, BY0, B0 + BRAMP, DECK_Y); mk(B0 + BRAMP, DECK_Y, B1 - BRAMP, DECK_Y); mk(B1 - BRAMP, DECK_Y, B1, BY1);
      colliders.push([(B0 + B1) / 2, z, (B1 - B0) / 2, (B1 - B0) / 2, .3, 0, 1.7]);
    }
    for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.4 + rng() * .4, 1), mossMat); m.scale.y = .5; m.position.set(xa + rng() * (xb - xa), DECK_Y - 1.2 - rng() * 1.2, BZ + (rng() < .5 ? -1 : 1) * (BW / 2 + .05)); bg.add(m); }
    // the island: a chapel at the top, pines, rocks and a hórreo
    const chp = church(); chp.scale.setScalar(.6); addTo(chp, ISL_X + 1, ISL_Z, -PI / 2, 5);
    for (let k = 0; k < 7; k++) { const a = k * 2.4 + .5, rr = 3.5 + (k % 3) * 2.2, x = ISL_X + 2 + Math.cos(a) * rr, z = ISL_Z + Math.sin(a) * rr * .8, hh = H(x, z); if (hh < 1) continue; const t = new THREE.Group(); const tk = new THREE.Mesh(new THREE.CylinderGeometry(.2, .3, 2.2, 6), std(0x8a6a4c)); tk.position.y = 1.1; const cr2 = new THREE.Mesh(lowpoly(new THREE.IcosahedronGeometry(1.7, 1), .3), std(0x3c8c6c, { flatShading: true })); cr2.position.y = 3.2; cr2.scale.y = 1.35; t.add(tk, cr2); t.traverse((o) => { if (o.isMesh) o.castShadow = true; }); t.position.set(x, hh, z); scene.add(t); colliders.push([x, z, .5]); }
    const hr = horreo(); addTo(hr, ISL_X + 4, ISL_Z - 4.5, .5, hr.userData.r);
  }
  const bridgeY = (x, z) => { if (Math.abs(z - BZ) > BW / 2 - .15 || x < B0 || x > B1) return -9; if (x < B0 + BRAMP) return BY0 + (DECK_Y - BY0) * (x - B0) / BRAMP; if (x > B1 - BRAMP) return DECK_Y + (BY1 - DECK_Y) * (x - (B1 - BRAMP)) / BRAMP; return DECK_Y; };
  // bubbles around the car when under the water
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const bub = (() => { const g = new THREE.BufferGeometry(), n = 140, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (rng() - .5) * 26; a[i * 3 + 1] = rng() * 10; a[i * 3 + 2] = (rng() - .5) * 26; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size: .5, map: dotTex, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff })); p.frustumCulled = false; p.visible = false; return p; })(); scene.add(bub);
  const ripples = [];
  // ---- the little Galician fishing boat the bike turns into at sea
  const boatG = new THREE.Group(); boatG.visible = false; scene.add(boatG); boatG.scale.setScalar(1.25);
  { const add = (geo, col, x, y, z, ex) => { const o = new THREE.Mesh(geo, std(col, ex)); o.position.set(x, y, z); o.castShadow = true; boatG.add(o); return o; };
    const sh = new THREE.Shape(); sh.moveTo(-1.55, .62); sh.lineTo(-1.45, .05); sh.lineTo(-.9, -.22); sh.lineTo(.9, -.22); sh.lineTo(1.85, .5); sh.lineTo(1.95, .78); sh.lineTo(1.0, .66); sh.lineTo(-1.55, .62);
    const hg = new THREE.ExtrudeGeometry(sh, { depth: 1.15, bevelEnabled: true, bevelSize: .12, bevelThickness: .12, bevelSegments: 3 }); hg.translate(0, 0, -.575); const hull = new THREE.Mesh(hg, std(0x2f6fa8)); hull.castShadow = true; boatG.add(hull);
    const band = new THREE.Mesh(hg, std(0xf6f1e4)); band.scale.set(1.005, .22, 1.02); band.position.set(0, .5, 0); boatG.add(band);
    add(rbox(3.0, .08, 1.0, .03), 0xc9a46a, -.1, .5, 0);                                                                   // the planked deck
    add(rbox(.85, .8, .85, .12), 0xf6f1e4, -.95, .95, 0); add(rbox(1.0, .12, 1.0, .05), 0xc9473a, -.95, 1.4, 0);        // the little wheelhouse and its red roof
    for (const sz of [-1, 1]) add(rbox(.04, .3, .3, .02), 0x34414f, -.95, 1.05, sz * .44); add(rbox(.3, .3, .04, .02), 0x34414f, -.5, 1.05, 0);
    add(new THREE.CylinderGeometry(.04, .05, 2.0, 8), 0x8a6a44, .75, 1.5, 0);                                            // the mast, with a flag and a lantern
    const fl = add(rbox(.5, .3, .02, .02), 0xc9473a, 1.0, 2.35, 0); add(new THREE.IcosahedronGeometry(.1, 1), 0xfff0b8, .75, 1.7, .12, { emissive: 0xffd36b, emissiveIntensity: .9 }); boatG.userData.flag = fl;
    for (let k = 0; k < 3; k++) add(rbox(.5, .22, .38, .05), [0xe9873a, 0x4f8fc0, 0xe9873a][k], .3 + (k % 2) * .5, .66, (k - 1) * .36);       // fish boxes
    add(new THREE.TorusGeometry(.2, .06, 8, 14), 0xe9573a, 1.35, .75, .3).rotation.x = PI / 2.5;                         // a lifebuoy
    const fr = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 2.0, 5), std(0x6b4a2e)); fr.position.set(1.6, 1.4, -.35); fr.rotation.z = -.9; boatG.add(fr);
    const b2 = buildBike(), fisher = b2.userData.rider; b2.userData.legs.forEach(([l, f]) => { l.visible = false; f.visible = false; }); fisher.scale.setScalar(.82); fisher.position.set(-.35, .1, 0); boatG.add(fisher); boatG.userData.fisher = fisher; boatG.userData.b2 = b2;
    add(rbox(.1, .5, .1, .03), 0x6b4a2e, .15, .78, 0); add(rbox(.5, .08, .08, .03), 0x6b4a2e, .15, 1.0, 0); }


  // ---- the car
  const car = buildBike(), carW = new THREE.Group(); carW.add(car); carW.scale.setScalar(.62); scene.add(carW);
  const S = { boat: false, x: ROADX(-90), z: -90, yaw: 0, v: 0, steer: 0, y: 0, pitch: 0, roll: 0, cyaw: 0, uw: false };
  S.y = H(S.x, S.z); carW.position.set(S.x, S.y, S.z);
  // ---- the orbs of information
  const orbs = []; const IDX = { welcome: 0, freixo: 1, esteiro: 2, outes: 3, muros: 4, louro: 5, horreo: 6, tambre: 7, wreck: 8 };
  const place = { welcome: [ROADX(-78) - 4, -78], freixo: [ROADX(-66) + 5, -63], esteiro: [ROADX(-34) + 8, -32], outes: [ROADX(-2) - 6.5, -4], muros: [ROADX(30) - 5, 26], louro: [COAST(66) - 8, 66], tambre: [COAST(2) - 5.5, 2], wreck: [wx - 2, wz - 4] };
  const hs = infoSpots.find((q) => q[0] === 'horreo'); if (hs) place.horreo = [hs[1], hs[2]]; else place.horreo = [ROADX(-34) - 18, -28];
  const orbMat = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xffd98a, emissiveIntensity: .9, roughness: .3 }), beamMat = new THREE.MeshBasicMaterial({ color: 0xffe3a0, transparent: true, opacity: .07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  Object.keys(IDX).forEach((k) => {
    const [x, z] = place[k], g = new THREE.Group(), isW = k === 'wreck'; let body, mat;
    if (isW) { body = buoy(); mat = body.userData.mat; }
    else { body = toxo(); mat = body.userData.mat; }
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexL, color: isW ? 0xffd27a : 0xffe04a, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); glow.scale.set(isW ? 7 : 6, isW ? 7 : 6, 1);
    const ring = new THREE.Group(); ring.add(glow); ring.material = glow.material; const beam = new THREE.Mesh(new THREE.CylinderGeometry(.3, .6, 9, 10, 1, true), beamMat);
    const sea0 = isW ? .75 : H(x, z) + .5; g.add(body, ring); beam.position.y = 4.5; g.add(beam); g.position.set(x, sea0, z);
    g.userData = { id: IDX[k], base: sea0, ball: { material: mat || { emissiveIntensity: 1 } }, ring, beam, done: false, body }; scene.add(g); orbs.push(g); });
  const dots = root.querySelector('.x-dr-count span'), arrow = root.querySelector('.x-dr-arrow'), prompt = root.querySelector('.x-dr-prompt'), card = root.querySelector('.x-dr-card');
  let seen = 0, cardOn = false, nearOrb = null, nearCasa = false, inCasa = false, casaR = null; const paintCount = () => { dots.textContent = '★ ' + seen + ' / ' + orbs.length; }; paintCount();
  prompt.textContent = touch ? tr('Tap to read') : tr('Press E to read');
  const openCard = (o) => { if (!o) return; cardOn = true; card.querySelector('.x-dr-art').innerHTML = artFor(o.userData.id, lang); card.querySelector('b').textContent = INFO[o.userData.id].h[lang]; card.querySelector('p').textContent = INFO[o.userData.id].p[lang]; root.classList.add('x-card'); if (!o.userData.done) { o.userData.done = true; seen++; paintCount(); } if (snd) snd.chime(); };
  const closeCard = () => { cardOn = false; root.classList.remove('x-card'); };
  card.querySelector('button').addEventListener('click', () => { closeCard(); }); prompt.addEventListener('click', () => { if (nearCasa && !nearOrb) enterCasa(); else openCard(nearOrb); });

  // ---- inside Casa Martamon
  const exitBtn = root.querySelector('.x-dr-out');
  const enterCasa = () => { if (inCasa || !casa.ok) return; inCasa = true; root.classList.add('x-fade');
    const done = () => { welcome(); if (snd) snd.cozy(true); root.classList.add('x-casa'); subEl.textContent = 'Casa Martamon'; root.classList.remove('x-near', 'x-fade'); };
    import('./casa.js?v=15').then((m) => { if (closed) return; if (!casaR) casaR = m.buildCasa(THREE, { std, rbox, PI }); setTimeout(done, 450); }).catch(() => { inCasa = false; root.classList.remove('x-fade'); }); };
  const welcome = () => { let w = root.querySelector('.x-dr-wel'); if (!w) { w = document.createElement('div'); w.className = 'x-dr-wel'; root.appendChild(w); w.addEventListener('click', () => w.classList.remove('x-on')); } w.innerHTML = '<b>' + ['Welcome to my grandmother\u2019s house.', 'Bienvenidos a la casa de mi abuela.', 'Benvidos á casa da miña avoa.'][lang] + '</b><span>' + ['I hope you like it.', 'Espero que os guste.', 'Espero que vos guste.'][lang] + '</span>'; w.classList.remove('x-on'); void w.offsetWidth; w.classList.add('x-on'); clearTimeout(w._t); w._t = setTimeout(() => w.classList.remove('x-on'), 7500); };
  const leaveCasa = () => { const w0 = root.querySelector('.x-dr-wel'); if (w0) w0.classList.remove('x-on'); if (!inCasa) return; if (snd) snd.cozy(false); root.classList.add('x-fade'); setTimeout(() => { inCasa = false; root.classList.remove('x-casa', 'x-fade'); nearName = ''; }, 450); };
  exitBtn.addEventListener('click', leaveCasa);

  // ---- the wardrobe: a drop-down menu with every outfit (the choice is kept for next visit)
  { const fb = root.querySelector('.x-dr-fit'), fl = document.createElement('div'); fl.className = 'x-dr-fitl'; root.appendChild(fl); let idx = 0; try { idx = parseInt(localStorage.getItem('xr-fit') || '0', 10) || 0; } catch (e) {}
    const NF = car.userData.fits, hex = (c) => '#' + ('000000' + c.toString(16)).slice(-6), fitsData = car.userData.fitsData;
    fl.setAttribute('role', 'menu'); fl.innerHTML = '<div class="x-dr-fith">' + ['Wardrobe', 'Armario', 'Armario'][lang] + '</div>' + fitsData.map((f, i) => '<button type="button" role="menuitemradio" data-i="' + i + '"><span class="x-sw"><i style="background:' + hex(f.torso) + '"></i><i style="background:' + hex(f.skirt || f.bib || f.legs) + '"></i></span><span>' + f.n[lang] + '</span></button>').join('');
    const mark = () => fl.querySelectorAll('button').forEach((b) => { const on = +b.dataset.i === idx; b.classList.toggle('x-on', on); b.setAttribute('aria-checked', on); });
    const apply = (i) => { car.userData.setOutfit(i); idx = ((i % NF) + NF) % NF; if (boatG.userData.b2) boatG.userData.b2.userData.setOutfit(idx); try { localStorage.setItem('xr-fit', String(idx)); } catch (e) {} mark(); };
    const open2 = (on) => { fl.classList.toggle('x-on', on); fb.classList.toggle('x-open', on); fb.setAttribute('aria-expanded', on); if (on) { const cur = fl.querySelector('button.x-on'); if (cur) cur.scrollIntoView({ block: 'nearest' }); } };
    fb.setAttribute('aria-haspopup', 'menu'); fb.addEventListener('click', (e) => { e.stopPropagation(); open2(!fl.classList.contains('x-on')); if (snd) snd.chime(); });
    fl.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; apply(+b.dataset.i); if (snd) snd.chime(); });
    root.addEventListener('pointerdown', (e) => { if (!e.target.closest('.x-dr-fitl,.x-dr-fit')) open2(false); }, true);
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && fl.classList.contains('x-on')) open2(false); }, true);
    apply(idx); }
  // ---- the welcome: three little screens before the ride starts
  let introOn = true, introI = 0;
  const INTRO = [['Ride around the island to learn.', 'Recorre la isla para aprender.', 'Percorre a illa para aprender.'],
    ['You can talk to Marta’s neighbours: they will tell you things about her.', 'Puedes hablar con los vecinos de Marta: ellos te contarán cosas sobre ella.', 'Podes falar cos veciños de Marta: eles contarán cousas sobre ela.'],
    ['You can also visit Marta’s grandmother’s house.', 'También puedes ver la casa de la abuela de Marta.', 'Tamén podes ver a casa da avoa de Marta.']];
  const NEXT = ['Next', 'Siguiente', 'Seguinte'], GO = ['Let’s go', 'Vamos', 'Imos'], SKIP = ['Skip', 'Saltar', 'Saltar'];
  const introEl = document.createElement('div'); introEl.className = 'x-dr-intro'; introEl.innerHTML = '<div class="x-dr-ic"><div class="x-dr-idots"></div><p></p><div class="x-dr-iact"><button type="button" class="x-dr-iskip"></button><button type="button" class="x-dr-inext"></button></div></div>'; root.appendChild(introEl);
  const iP = introEl.querySelector('p'), iD = introEl.querySelector('.x-dr-idots'), iN = introEl.querySelector('.x-dr-inext'), iS = introEl.querySelector('.x-dr-iskip');
  const introPaint = () => { iP.classList.remove('x-in'); void iP.offsetWidth; iP.textContent = INTRO[introI][lang]; iP.classList.add('x-in'); iD.innerHTML = INTRO.map((_, k) => '<i class="' + (k === introI ? 'x-on' : '') + '"></i>').join(''); iN.textContent = introI === INTRO.length - 1 ? GO[lang] : NEXT[lang]; iS.textContent = SKIP[lang]; iS.style.visibility = introI === INTRO.length - 1 ? 'hidden' : 'visible'; };
  function introEnd() { if (!introOn) return; introOn = false; introEl.classList.add('x-out'); setTimeout(() => introEl.remove(), 700); if (snd) snd.chime(); }
  function introNext() { if (introI >= INTRO.length - 1) { introEnd(); return; } introI++; introPaint(); if (snd) snd.chime(); }
  iN.addEventListener('click', introNext); iS.addEventListener('click', introEnd); introPaint();
  const tour = { on: false, ghost: 0 };   /* (no guided tour any more) */

  // ---- sound and controls
  const snd = makeSound(); const muBtn = root.querySelector('.x-dr-mu');
  const paintMu = () => { const m = snd && snd.muted; muBtn.innerHTML = m ? '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'; };
  paintMu(); muBtn.addEventListener('click', () => { if (snd) { snd.mute(!snd.muted); paintMu(); } }); if (snd) snd.start();
  // ---- day and night: it starts at the hour of the planet, and the button changes it
  let night = opts.getDark ? opts.getDark() : 0, nightT = night > .5 ? 1 : 0, nightGoal = nightT;
  const dnBtn = root.querySelector('.x-dr-dn');
  const paintDn = () => { dnBtn.innerHTML = nightGoal > .5 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; };
  paintDn(); dnBtn.addEventListener('click', () => { nightGoal = nightGoal > .5 ? 0 : 1; paintDn(); if (snd) snd.chime(); });
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, 'rgba(255,244,214,1)'); gr.addColorStop(.18, 'rgba(255,226,160,.8)'); gr.addColorStop(.5, 'rgba(255,200,130,.22)'); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false })); sunGlow.scale.set(150, 150, 1); scene.add(sunGlow);
  const stars = (() => { const g = new THREE.BufferGeometry(), n = 380, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = rng() * 6.28, v = .12 + rng() * .85, r = 280; a[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r; a[i * 3 + 1] = v * r; a[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const p2 = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, color: 0xfff6e0, transparent: true, opacity: 0, depthWrite: false, fog: false, sizeAttenuation: false })); p2.frustumCulled = false; scene.add(p2); return p2; })();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff1cf, fog: false, transparent: true, opacity: 0 })); scene.add(moon);
  const RAIN_FOG = new THREE.Color(0xa9b8c4), NIGHT_FOG = new THREE.Color(0x1b2547), NIGHT_SEA = new THREE.Color(0x14405a), WARM = new THREE.Color(0xffd6a0), MOON = new THREE.Color(0x9db4ff);
  // ---- rain: a button, falling drops, a greyer sky, umbrellas on the people and a dash for the shelters
  let rainGoal = 0, rainT = 0; const rnBtn = root.querySelector('.x-dr-rn');
  const paintRn = () => { rnBtn.innerHTML = rainGoal ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.2 7.6 3.7 3.7 0 0 1 17 15"/><path d="M8 18l-1 2.4M12 17l-1 2.4M16 18l-1 2.4"/></svg>'; };
  paintRn(); rnBtn.addEventListener('click', () => { rainGoal = rainGoal ? 0 : 1; paintRn(); if (snd) { snd.rain(!!rainGoal); snd.chime(); } });
  const NR = LOW ? 260 : 700, rainG = new THREE.BufferGeometry(), rp = new Float32Array(NR * 6); for (let i = 0; i < NR; i++) { const x = (rng() - .5) * 46, y = rng() * 22, z = (rng() - .5) * 46; rp.set([x, y, z, x - .08, y - 1.1, z], i * 6); }
  rainG.setAttribute('position', new THREE.BufferAttribute(rp, 3)); const rainL = new THREE.LineSegments(rainG, new THREE.LineBasicMaterial({ color: 0xd4e6f4, transparent: true, opacity: 0 })); rainL.frustumCulled = false; scene.add(rainL);
  const K = { up: 0, down: 0, left: 0, right: 0 }; let closed = false, raf = 0;
  const MAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  const onKey = (e) => {
    if (introOn) { if (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'ArrowRight')) { introNext(); e.preventDefault(); e.stopPropagation(); } else if (e.type === 'keydown' && e.key === 'Escape') { introEnd(); e.preventDefault(); e.stopPropagation(); } return; }
    const k = MAP[e.key];
    if (k) { K[k] = e.type === 'keydown' ? 1 : 0; if (e.type === 'keydown') root.classList.add('x-drove'); e.preventDefault(); e.stopPropagation(); return; }
    if (e.type !== 'keydown') return;
    if (e.key === 'Escape') { if (inCasa) leaveCasa(); else if (cardOn) closeCard(); else close(); }
    else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') { if (inCasa) leaveCasa(); else if (cardOn) closeCard(); else if (nearOrb) openCard(nearOrb); else if (nearCasa) enterCasa(); }
    else return; e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true);
  root.querySelectorAll('.x-dr-pad button').forEach((b) => { const k = b.dataset.k, on = (e) => { K[k] = 1; b.classList.add('x-on'); root.classList.add('x-drove'); e.preventDefault(); }, off = () => { K[k] = 0; b.classList.remove('x-on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off); });
  // hold the mouse (or a finger) and drag to look round the bike; let go and the view glides back behind it
  const orb = { yaw: 0, pitch: 0, hold: false, idle: 0, id: -1, x: 0, y: 0 };
  root.addEventListener('pointerdown', (e) => { if (e.target.closest('button,.x-dr-card,.x-dr-pad,.x-dr-fitl') || e.button) return; orb.hold = true; orb.id = e.pointerId; orb.x = e.clientX; orb.y = e.clientY; try { root.setPointerCapture(e.pointerId); } catch (er) {} });
  root.addEventListener('pointermove', (e) => { if (!orb.hold || e.pointerId !== orb.id) return; if (inCasa && casaR) { casaR.view.az -= (e.clientX - orb.x) * .006; casaR.view.pol -= (e.clientY - orb.y) * .005; orb.x = e.clientX; orb.y = e.clientY; return; } orb.yaw -= (e.clientX - orb.x) * .008; orb.pitch = clamp(orb.pitch + (e.clientY - orb.y) * .004, -.15, 1.0); orb.x = e.clientX; orb.y = e.clientY; orb.idle = 0; });
  { let dn = null; const rc = new THREE.Raycaster(), nd = new THREE.Vector2();
    root.addEventListener('pointerdown', (e) => { dn = [e.clientX, e.clientY]; });
    root.addEventListener('pointerup', (e) => { if (!dn || inCasa || !casa.obj || !casa.obj.userData.dogG) return; const mv = Math.hypot(e.clientX - dn[0], e.clientY - dn[1]); dn = null; if (mv > 7 || e.target.closest('button,.x-dr-card,.x-dr-pad')) return;
      nd.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); rc.setFromCamera(nd, camera); const hit = rc.intersectObject(casa.obj.userData.dogG, true); if (hit.length && casa.obj.userData.wake <= 0 && casa.obj.userData.act <= 0) { casa.obj.userData.poke(['Woof!', '¡Guau!', 'Gau!'][lang] || 'Guau!'); if (snd) snd.bark(); } }); }
  // ---- the neighbours who know Martamon: nine people carry three little dots over their heads; tap one and they turn to you, ask "do you know Martamon?" in their own way, and then tell you something about her
  const factEl = document.createElement('div'); factEl.className = 'x-dr-fact'; root.appendChild(factEl);
  const talkers = [], nbDotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 28); gr.addColorStop(0, '#fff'); gr.addColorStop(.7, '#fff6e4'); gr.addColorStop(1, 'rgba(255,246,228,0)'); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 28, 0, 6.3); g.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  { // Mario and Adrián: two colleagues from Madrid who are visiting Marta's village; they stroll together along the main road of Muros
    const mkV = (k) => { const w = person(k === 2 ? 0x8a5fb0 : k ? 0x2f7a5a : 0x3f6fa8, k === 1 ? 0xe3b185 : k === 2 ? 0xc58c5e : 0xf0c9a0);
      if (k === 2) { for (const c of w.children) { if (c.geometry && c.geometry.type === 'IcosahedronGeometry' && c.position.y > 1.6) { c.scale.multiplyScalar(1.5); } if (c.geometry && c.geometry.type === 'SphereGeometry' && c.position.y > 1.6) c.scale.multiplyScalar(1.5); } for (const c of w.children) if (c.position.y > 1.6 && c.geometry) { c.position.y += .22; if (Math.abs(c.position.x) > 0.01) c.position.x *= 1.5; c.position.z *= 1.5; } }
      if (!k) { const tm = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), std(0xd9382a)); tm.position.set(.22, .98, .66); tm.scale.set(1.05, .9, 1.05); tm.castShadow = true; w.add(tm); for (let q = 0; q < 5; q++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(.05, .13, 4), std(0x4f9a4a)); lf.position.set(.22 + Math.cos(q * 1.26) * .07, 1.15, .66 + Math.sin(q * 1.26) * .07); lf.rotation.set(Math.sin(q * 1.26) * .9, 0, -Math.cos(q * 1.26) * .9); w.add(lf); } }
      else if (k === 1) { const fk = new THREE.Group(); fk.position.set(.12, .9, -.66); fk.rotation.z = -.12; w.add(fk); const hd = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, 1.35, 8), std(0xcfd3d8)); hd.position.y = .45; fk.add(hd); const nk = new THREE.Mesh(new THREE.BoxGeometry(.3, .05, .06), std(0xcfd3d8)); nk.position.y = 1.15; fk.add(nk); for (const tx of [-.12, 0, .12]) { const tn = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .38, 6), std(0xcfd3d8)); tn.position.set(tx, 1.38, 0); fk.add(tn); } fk.traverse((o) => { if (o.isMesh) o.castShadow = true; }); } w.scale.setScalar(k ? 1.1 : 1.04); const hairM = w.children.find((c) => c.geometry && c.geometry.type === 'SphereGeometry' && c.geometry.parameters && Math.abs(c.geometry.parameters.radius - .42) < .01); if (hairM) hairM.material = std(k ? 0x2b2530 : 0x4a3326);
      if (k) for (const sz of [-1, 1]) { const gl = new THREE.Mesh(new THREE.TorusGeometry(.1, .016, 6, 14), std(0x2b2530)); gl.position.set(.36, 1.9, sz * .14); gl.rotation.y = PI / 2; w.add(gl); }
      scene.add(w); const pts = []; for (let z = 14; z <= 48; z += 2) pts.push([ROADX(z) - 4.5 + k * .55, z]); walkers.push({ p: w, pts, d: 3 + k * 1.1, sp: .62, dir: 1, lift: .08 }); return w; };
    const pair = [mkV(0), mkV(1), mkV(2)]; pair.forEach((w, k) => { w.userData.pairIdx = 9 + k; });
  }
  { const pool = PEOPLE.filter((q) => q.parent === scene && q.userData.pairIdx === undefined), step = Math.max(1, Math.floor(pool.length / 9));
    for (const q of PEOPLE) if (q.userData.pairIdx !== undefined) { q.userData.talker = q.userData.pairIdx; q.userData.line = 0; const dots = new THREE.Group(); dots.position.set(0, 2.85, 0); q.add(dots); for (let n = 0; n < 3; n++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: nbDotTex, depthWrite: false, transparent: true, fog: false })); sp.scale.set(.34, .34, 1); sp.position.x = (n - 1) * .42; sp.renderOrder = 9; dots.add(sp); } q.userData.dots = dots; talkers.push(q); }
    for (let k = 0; k < 9; k++) { const g = pool[(k * step + 1) % pool.length]; if (!g || g.userData.talker !== undefined) continue; g.userData.talker = k; g.userData.line = 0;
      const dots = new THREE.Group(); dots.position.set(0, 2.85, 0); g.add(dots); for (let q = 0; q < 3; q++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: nbDotTex, depthWrite: false, transparent: true, fog: false })); sp.scale.set(.34, .34, 1); sp.position.x = (q - 1) * .42; sp.renderOrder = 9; dots.add(sp); }
      g.userData.dots = dots; talkers.push(g); } }
  { let dn2 = null, factP = null, factT = 0, stage = 0, lines = null; const rcF = new THREE.Raycaster(), ndF = new THREE.Vector2(), hv = new THREE.Vector3();
    const showLine = (txt) => { const nm = TALKER_NAMES[factP.userData.talker]; factEl.textContent = ''; if (nm) { const b = document.createElement('b'); b.textContent = nm; factEl.appendChild(b); } factEl.appendChild(document.createTextNode(txt)); factEl.classList.remove('x-pop'); void factEl.offsetWidth; factEl.classList.add('x-on', 'x-pop'); if (snd) snd.talk(txt.length, factP.userData.talker * 3 + 1); };
    root.addEventListener('pointerdown', (e) => { dn2 = [e.clientX, e.clientY]; });
    root.addEventListener('pointerup', (e) => { if (!dn2 || inCasa || cardOn || introOn) return; const mv = Math.hypot(e.clientX - dn2[0], e.clientY - dn2[1]); dn2 = null; if (mv > 7 || e.target.closest('button,.x-dr-card,.x-dr-pad,.x-dr-fitl')) return;
      if (e.target.closest('.x-dr-fact') && factP) { if (stage === 0) { stage = 1; factT = 12; showLine(lines[1][lang]); } return; }
      ndF.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); rcF.setFromCamera(ndF, camera); const live = talkers.filter((q) => { for (let o = q; o; o = o.parent) if (!o.visible) return false; return true; });
      const hit = rcF.intersectObjects(live, true)[0]; if (!hit) return; let g = hit.object; while (g && g.userData.talker === undefined) g = g.parent; if (!g) return;
      if (factP && factP !== g) endTalk();
      factP = g; const T = TALKERS[g.userData.talker]; lines = T[g.userData.line % T.length]; g.userData.line++; stage = 0; factT = 3.6; g.userData.pop = 1; g.userData.hold = 16; g.userData.rot0 = g.rotation.y; showLine(lines[0][lang]); });
    const endTalk = () => { factEl.classList.remove('x-on'); if (factP) { factP.userData.hold = 0; } factP = null; };
    root.__factTick = (dt, t) => {
      for (const g of talkers) { const d = g.userData.dots; if (!d) continue; const talking = g === factP; d.visible = !talking; d.children.forEach((sp, q) => { const w = Math.sin(t * 4 + q * .9); sp.position.y = w * .1; sp.material.opacity = .65 + .35 * Math.max(0, w); sp.scale.setScalar(.3 + .08 * Math.max(0, w)); }); }
      if (!factP) return; factT -= dt; if (factT <= 0) { if (stage === 0) { stage = 1; factT = 9; showLine(lines[1][lang]); } else { endTalk(); return; } }
      factP.userData.hold = Math.max(factP.userData.hold, 1);
      hv.setFromMatrixPosition(factP.matrixWorld); hv.y += 2.5 * (factP.scale.y || 1); hv.project(camera); const bx = Math.max(150, Math.min(innerWidth - 150, (hv.x + 1) / 2 * innerWidth)), by = Math.max(130, (1 - hv.y) / 2 * innerHeight);
      factEl.style.left = bx + 'px'; factEl.style.top = by + 'px';
      const wk = walkers.find((w) => w.p === factP);                                    /* walkers face you by themselves (see their loop); the others turn on the spot */
      const wp = new THREE.Vector3(); factP.getWorldPosition(wp); const face = Math.atan2(S.x - wp.x, S.z - wp.z) - PI / 2; if (!wk) { let dd = face - factP.rotation.y; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); factP.rotation.y += dd * Math.min(1, dt * 5); }
      if (factP.userData.pop > 0) { factP.userData.pop -= dt * 2; const k = 1 + Math.sin(Math.max(0, factP.userData.pop) * 3.14) * .1; factP.scale.setScalar((factP.userData.s0 || (factP.userData.s0 = factP.scale.x)) * k); }
    };
  }
  const orbUp = (e) => { if (e.pointerId === orb.id) orb.hold = false; }; root.addEventListener('pointerup', orbUp); root.addEventListener('pointercancel', orbUp);
  let zoomK = 1; root.addEventListener('wheel', (e) => { if (e.target.closest && e.target.closest('.x-dr-fitl')) return; e.preventDefault(); if (inCasa && casaR) { casaR.view.dist *= Math.exp(e.deltaY * (e.deltaMode ? .03 : .0012)); return; } zoomK = clamp(zoomK * Math.exp(e.deltaY * (e.deltaMode ? .03 : .0012)), .55, 3.4); }, { passive: false });
  const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 70 : 55; camera.updateProjectionMatrix(); }; size(); addEventListener('resize', size);

  // ---- the loop
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(); let last = performance.now(), t = 0, uwMix = 0, firstUw = true;
  const subEl = root.querySelector('.x-dr-sub'); let nearName = '';
  const frame = (now) => {
    if (closed) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    // driving: arcade physics
    const throttle = cardOn || inCasa || introOn ? 0 : (K.up - K.down), steerIn = cardOn || inCasa || introOn ? 0 : (K.left - K.right);
    if (throttle > 0) S.v += (S.v < 0 ? 14 : 5.5) * dt; else if (throttle < 0) S.v -= (S.v > 0 ? 14 : 6) * dt; else S.v -= Math.sign(S.v) * Math.min(Math.abs(S.v), 6 * dt);
    const vmax = S.boat ? 8 : 11; S.v = clamp(S.v, -3.5, vmax);
    S.steer += (steerIn - S.steer) * Math.min(1, dt * 5); S.yaw += S.steer * 1.55 * Math.min(1, Math.abs(S.v) / 2.8) / (1 + Math.abs(S.v) * .05) * Math.sign(S.v || 1) * dt;
    S.x += Math.sin(S.yaw) * S.v * dt; S.z += Math.cos(S.yaw) * S.v * dt;
    for (const c of colliders) {
            const dx = S.x - c[0], dz = S.z - c[1], CR = .55;
      if (c.length >= 6) { if (c[6] !== undefined && S.y < c[6]) continue;                                                               // a building: an oriented box, the car is pushed out of it
        if (dx * dx + dz * dz > (c[2] + 3) * (c[2] + 3)) continue; const ca = Math.cos(c[5]), sa = Math.sin(c[5]), lx = dx * ca - dz * sa, lz = dx * sa + dz * ca, qx = clamp(lx, -c[3], c[3]), qz = clamp(lz, -c[4], c[4]), ex = lx - qx, ez = lz - qz, ed = Math.hypot(ex, ez);
        let ox, oz; if (ed > 1e-4) { if (ed >= CR) continue; ox = ex / ed * (CR - ed); oz = ez / ed * (CR - ed); } else { const px = c[3] - Math.abs(lx), pz = c[4] - Math.abs(lz); if (px < pz) { ox = Math.sign(lx || 1) * (px + CR); oz = 0; } else { oz = Math.sign(lz || 1) * (pz + CR); ox = 0; } }
        S.x += ox * ca + oz * sa; S.z += -ox * sa + oz * ca; S.v *= .97; continue;
      }
      const d = Math.hypot(dx, dz), r = c[2] + CR; if (d < r && d > 1e-4) { S.x = c[0] + dx / d * r; S.z = c[1] + dz / d * r; S.v *= .97; }
    }
    S.x = clamp(S.x, -97, 108); S.z = clamp(S.z, -96, 96);
    let gy = H(S.x, S.z); { const by = bridgeY(S.x, S.z); if (by > -5 && S.y > by - 1.5) gy = Math.max(gy, by); } for (const pr of piers) if (S.x > pr.x0 && S.x < pr.x1 && Math.abs(S.z - pr.z) < PIERW / 2 - .1) gy = Math.max(gy, pr.y); if (gy < -.45 && !(S.y > gy + 4)) { if (!S.boat) { S.boat = true; if (snd) { snd.splash(); snd.boat(true); } ripples.push({ x: S.x, z: S.z, t: 0 }); } } else if (gy > -.15 && S.boat) { S.boat = false; if (snd) { snd.splash(); snd.boat(false); } ripples.push({ x: S.x, z: S.z, t: 0 }); }
    if (S.boat) gy = Math.sin(t * 1.3) * .04 + Math.sin(t * .7 + 1) * .03; S.y += (gy - S.y) * Math.min(1, dt * (S.boat ? 4 : 14));
    const fx = Math.sin(S.yaw), fz = Math.cos(S.yaw), rxx = fz, rzz = -fx;                                    // forward and left
    const hF = H(S.x + fx * 1.7, S.z + fz * 1.7), hB = H(S.x - fx * 1.7, S.z - fz * 1.7), hL = H(S.x + rxx * 1.1, S.z + rzz * 1.1), hR = H(S.x - rxx * 1.1, S.z - rzz * 1.1);
    S.pitch += ((S.boat ? Math.sin(t * 1.1) * .03 - S.v * .004 : Math.atan2(hF - hB, 3.4)) - S.pitch) * Math.min(1, dt * 8); S.roll += ((S.boat ? Math.sin(t * 1.6) * .05 - S.steer * S.v * .01 : Math.atan2(hL - hR, 2.2)) - S.roll) * Math.min(1, dt * 8);
    carW.position.set(S.x, S.y + Math.sin(t * 9) * Math.min(.03, Math.abs(S.v) * .003), S.z); carW.rotation.set(0, 0, 0); carW.rotation.y = S.yaw - PI / 2; car.rotation.set(0, 0, -S.pitch * .9); car.rotation.x = S.roll * .8; car.rotation.z += -Math.sin(S.steer) * 0 ;
    car.visible = !S.boat; boatG.visible = S.boat;
    if (S.boat) { boatG.position.set(S.x, S.y + .12, S.z); boatG.rotation.set(S.roll * .6, 0, S.pitch * .8); boatG.rotation.order = 'YXZ'; boatG.rotation.y = S.yaw - PI / 2; boatG.userData.flag.rotation.y = Math.sin(t * 6) * .25; boatG.userData.b2.userData.setRain(rainT > .45); if (Math.abs(S.v) > 1.5 && (t * 3.2 | 0) !== ((t - dt) * 3.2 | 0)) ripples.push({ x: S.x - Math.sin(S.yaw) * 1.6, z: S.z - Math.cos(S.yaw) * 1.6, t: 0 }); }
    car.userData.setRain(rainT > .45); car.userData.anim(S.v, dt, S.steer); car.rotation.x = S.roll * .8 - S.steer * Math.min(1, Math.abs(S.v) / 7) * .32;
    // water: in and out
    
    uwMix += ((camera.position.y < -.15 ? 1 : 0) - uwMix) * Math.min(1, dt * 5);
    root.classList.toggle('x-uw', camera.position.y < -.15);
    // camera
    let dy = S.yaw - S.cyaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); S.cyaw += dy * Math.min(1, dt * 3.2);
    const cd = (6.6 + Math.min(1.8, Math.abs(S.v) * .15)) * zoomK, cp = _v.set(S.x - Math.sin(S.cyaw + orb.yaw) * cd * (1 - orb.pitch * .25), 0, S.z - Math.cos(S.cyaw + orb.yaw) * cd * (1 - orb.pitch * .25)); cp.y = Math.max(S.y, 0) + 3.1 * (.6 + .4 * zoomK) + (zoomK > 1 ? (zoomK - 1) * 3 : 0) + (S.uw ? -S.y * .35 : 0);
    cp.y += orb.pitch * cd * .55; if (!orb.hold) { orb.idle += dt; if (orb.idle > .5) { const k = Math.min(1, dt * 2.2); orb.yaw *= 1 - k; orb.pitch *= 1 - k; } }
    camera.position.lerp(cp, Math.min(1, dt * 6)); camera.position.y = Math.max(camera.position.y, H(camera.position.x, camera.position.z) + .9);
    camera.lookAt(S.x + Math.sin(S.yaw) * 3, S.y + 1.7, S.z + Math.cos(S.yaw) * 3);
    // atmosphere
    nightT += (nightGoal - nightT) * Math.min(1, dt * .7); const nz = nightT; rainT += (rainGoal - rainT) * Math.min(1, dt * .8);
    sun.intensity = (3.0 * (1 - nz) + .5 * nz) * (1 - .6 * rainT); sun.color.copy(WARM).lerp(MOON, nz); hemi.intensity = (1.0 * (1 - nz) + .45 * nz) * (1 - .2 * rainT); hemi.color.set(0xbcd8ff).lerp(new THREE.Color(0x6b7fc0), nz); hemi.groundColor.set(0xe6c9a0).lerp(new THREE.Color(0x2b3358), nz);
    sunGlow.material.opacity = (1 - nz) * (1 - rainT * .7) * (1 - uwMix) * .85; sunGlow.position.set(camera.position.x + 62 * 3.4, camera.position.y + 36 * 3.4, camera.position.z + 34 * 3.4);
    stars.material.opacity = nz * (1 - uwMix); moon.material.opacity = nz * (1 - uwMix); moon.position.set(camera.position.x - 120, 160, camera.position.z - 180);
    lampM.emissiveIntensity = .5 + nz * 3.2; WINM.emissiveIntensity = nz * 1.4; glowMat.opacity = Math.min(.85, nz * 1.1);
    sky.material.color.setScalar(1 - nz * .86 - rainT * .22).lerp(new THREE.Color(0x4b5b9a), nz * .25);
    scene.fog.color.copy(FOG_AIR).lerp(RAIN_FOG, rainT * (1 - nz * .7)).lerp(NIGHT_FOG, nz).lerp(FOG_SEA.clone().lerp(NIGHT_SEA, nz), uwMix); scene.background.copy(scene.fog.color); scene.fog.density = (.0065 + .003 * nz + .005 * rainT) + .05 * uwMix; sky.visible = uwMix < .5; sky.position.copy(camera.position);
    sun.position.set(S.x + 62, 36, S.z + 34); sun.target.position.set(S.x, 0, S.z); sun.target.updateMatrixWorld();
    for (const c of clouds) { c.position.x += c.userData.v * dt; if (c.position.x > 140) c.position.x = -140; }
    kuni.uTime.value = t;
    // the sea surface, boats, gulls
    if (!LOW || (Math.floor(t * 30) & 1)) for (let i = 0; i < seaP.count; i++) { const x = seaBase[i * 2] + sea.position.x, z = -seaBase[i * 2 + 1] + sea.position.z; seaP.setZ(i, Math.sin(x * .18 + t * .9) * .09 + Math.cos(z * .21 + t * .7) * .08); } seaP.needsUpdate = true;
    boats.forEach((b) => { const u = b.userData; b.position.set(u.x + Math.sin(t * .15 + u.ph) * .15, Math.sin(t * 1.1 + u.ph) * .1, u.z + Math.sin(t * .2 + u.ph) * .1); b.rotation.set(Math.sin(t * .9 + u.ph) * .04, Math.sin(t * .15 + u.ph) * .04, Math.cos(t * 1.1 + u.ph) * .05); });
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
      if (w.p.userData && w.p.userData.hold > 0 && w.cx !== undefined) { w.p.userData.hold -= dt; const fy = Math.atan2(S.x - w.cx, S.z - w.cz); let dh2 = fy - (w.yaw === undefined ? fy : w.yaw); dh2 = Math.atan2(Math.sin(dh2), Math.cos(dh2)); w.yaw = (w.yaw === undefined ? fy : w.yaw) + dh2 * Math.min(1, dt * 6); w.p.rotation.set(0, w.yaw - PI / 2, 0); continue; }
      const pts = w.pts; if (!w.cum) { w.cum = [0]; for (let i = 1; i < pts.length; i++) w.cum.push(w.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); w.len = w.cum[w.cum.length - 1] || 1; w.d = (w.d % w.len + w.len) % w.len; w.mode = 'walk'; w.st = rng(); }
      const raining = rainT > .45;
      if (raining && w.mode === 'walk' && !w.decided) { w.decided = true; if (w.st < .4 && shelters.length) { let bd = 1e9; for (const sh of shelters) { const d2 = Math.hypot(sh[0] - (w.cx || sh[0]), sh[1] - (w.cz || sh[1])); if (d2 < bd) { bd = d2; w.sh = sh; } } w.mode = 'go'; } }
      if (!raining && rainT < .15) { w.decided = false; if (w.mode === 'stay' || w.mode === 'go') w.mode = 'back'; }
      if (w.mode === 'walk' || w.mode === 'back') { if (w.mode === 'walk') { w.d += w.sp * w.dir * dt; if (w.d > w.len) { w.d = w.len; w.dir = -1; } else if (w.d < 0) { w.d = 0; w.dir = 1; } } }
      let i = 1; while (i < pts.length - 1 && w.cum[i] < w.d) i++; const u = (w.d - w.cum[i - 1]) / Math.max(.001, w.cum[i] - w.cum[i - 1]), px = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pz = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u;
      const tx = w.mode === 'go' || w.mode === 'stay' ? w.sh[0] : px, tz = w.mode === 'go' || w.mode === 'stay' ? w.sh[1] : pz;
      if (w.cx === undefined) { w.cx = px; w.cz = pz; }
      let moving = true; const dx = tx - w.cx, dz = tz - w.cz, dd = Math.hypot(dx, dz);
      if (w.mode === 'walk') { w.cx = px; w.cz = pz; } else { const sp = (w.mode === 'back' ? 1.6 : 2.4) * dt; if (dd < Math.max(.15, sp)) { w.cx = tx; w.cz = tz; if (w.mode === 'go') w.mode = 'stay'; else if (w.mode === 'back') w.mode = 'walk'; moving = false; } else { w.cx += dx / dd * sp; w.cz += dz / dd * sp; } }
      if (w.mode === 'stay') moving = false;
      let hd = w.mode === 'walk' ? Math.atan2(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) + (w.dir < 0 ? PI : 0) : (moving ? Math.atan2(dx, dz) : (w.yaw === undefined ? 0 : w.yaw));
      let dh = hd - (w.yaw === undefined ? hd : w.yaw); dh = Math.atan2(Math.sin(dh), Math.cos(dh)); w.yaw = (w.yaw === undefined ? hd : w.yaw) + dh * Math.min(1, dt * 6);
      w.p.position.set(w.cx, H(w.cx, w.cz) + (w.lift || .08) + (moving ? Math.abs(Math.sin(t * 7 + w.d)) * .1 : 0), w.cz); w.p.rotation.set(0, w.yaw - PI / 2, moving ? Math.sin(t * 7 + w.d) * .06 : 0);
      const um = w.p.userData.um; if (um) um.visible = raining && w.mode !== 'stay';
    }
    { rainL.material.opacity = rainT * .55 * (1 - uwMix); rainL.visible = rainT > .03 && uwMix < .6; if (rainL.visible) { rainL.position.set(camera.position.x, Math.max(camera.position.y - 5, H(camera.position.x, camera.position.z)), camera.position.z); const a = rainG.attributes.position; for (let i = 0; i < NR; i++) { let y = a.getY(i * 2) - dt * 20; if (y < -1) y += 23; a.setY(i * 2, y); a.setY(i * 2 + 1, y - 1.1); } a.needsUpdate = true; } for (const c of clouds) c.children.forEach((m2) => m2.material.color.lerp(rainT > .3 ? CLOUD_GREY : CLOUD_WARM, dt * .8)); }
    if (traffic.update) traffic.update(dt); if (root.__factTick) root.__factTick(dt, t);
    for (const f of fishers) { const u = f.userData; u.rod.rotation.z = Math.sin(t * .6 + u.ph) * .03; u.bob.position.y = Math.sin(t * 1.6 + u.ph) * .06 - (Math.sin(t * .35 + u.ph) > .95 ? .25 : 0); if (u.um || f.userData.um) f.userData.um.visible = rainT > .45; }
    // the orbs
    let best = null, bd = 6.5, tgt = null, td = 1e9;
    for (const o of orbs) { const u = o.userData; o.position.y = u.base + Math.sin(t * 1.6 + u.id) * .3; u.body.rotation.y = Math.sin(t * .5 + u.id) * .25; u.body.rotation.z = Math.sin(t * .8 + u.id) * .03; u.ring.scale.setScalar(1 + Math.sin(t * 2 + u.id) * .12); u.ball.material.emissiveIntensity = u.done ? .15 : .9 + Math.sin(t * 3 + u.id) * .3; u.ring.material.opacity = u.done ? .25 : .8; u.beam.visible = !u.done; const dx = o.position.x - S.x, dz = o.position.z - S.z, d = Math.hypot(dx, dz); if (d < bd && Math.abs(o.position.y - S.y) < 7) { bd = d; best = o; } if (!u.done && d < td) { td = d; tgt = o; } }
    nearOrb = best; nearCasa = casa.ok && !inCasa && Math.hypot(S.x - casa.x, S.z - casa.z) < 6.5; if (nearCasa && !best) { if (prompt.dataset.m !== 'c') { prompt.dataset.m = 'c'; prompt.textContent = 'Casa Martamon · ' + tr('Enter'); } } else if (prompt.dataset.m === 'c') { prompt.dataset.m = ''; prompt.textContent = touch ? tr('Tap to read') : tr('Press E to read'); }
    root.classList.toggle('x-near', (!!best || nearCasa) && !cardOn && !inCasa);
    if (casa.obj && casa.obj.userData.update) casa.obj.userData.update(t, dt);
    if (casa.glow) { casa.glow.material.opacity = .32 + nightT * .55 + Math.sin(t * 1.7) * .03; }
    if (tgt) { const b = Math.atan2(tgt.position.x - S.x, tgt.position.z - S.z); arrow.style.transform = 'rotate(' + ((S.cyaw - b) * 180 / PI).toFixed(1) + 'deg)'; arrow.style.opacity = 1; } else arrow.style.opacity = .2;
    let vn = '', vd = 40; VILLAGES.forEach(([n, z0]) => { const d = Math.hypot(S.x - (ROADX(z0) - 9), S.z - z0); if (d < vd) { vd = d; vn = n; } }); if (vn !== nearName) { nearName = vn; subEl.textContent = vn; }
    if (snd) { snd.atmos(nightT, rainT); }
    if (snd) { snd.update(S.boat ? 0 : S.v, sstep(26, 4, COAST(S.z) - S.x) * (S.boat ? 1.4 : 1), false); snd.boatSpeed(S.boat ? Math.abs(S.v) : 0); }
    if (inCasa && casaR && root.classList.contains('x-casa')) { casaR.update(dt, t, { w: innerWidth, h: innerHeight }); renderer.render(casaR.scene, casaR.camera); } else renderer.render(scene, camera);
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
  return { close, state: S, dbg: { colliders, lanes, traffic } };
}
