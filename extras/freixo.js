// The coast of the ría de Muros e Noia as a little 3D planet: Muros and its stone arcades, Esteiro and its inlet, O Freixo and its pier, Outes and
// the old bridge, with Monte Louro across the water. Villages are spread over the whole globe and joined by roads, with people on the beaches,
// fishermen on anchored boats, cars, boats under sail, birds and clouds that keep moving. Opened from the Contact page (three clicks on the creature).
// open({ night, onClose }) shows it on top of the page and returns { close }.
import * as THREE from './three.module.min.js';
import { mochiText, MOCHI, tr } from './i18n.js?v=10';
const mochiLen = MOCHI.length;

const R = 12, PI = Math.PI, SEA = -.06;    // SEA: the water level, a little below the shore line, so waves and tides never reach the roads and houses                // radius of the planet
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n2 = (x, z) => Math.sin(x * .9 + 1.3) * Math.cos(z * .8 - .4) * .5 + Math.sin(x * 2.1 + z * 1.7) * .25 + Math.sin(x * .35 - z * .5 + 2) * .6;
const hash2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

// The map is drawn on a plane (x east, z south, 1 unit = 4.8 degrees of arc) wrapped on the sphere from the north pole outwards
const _v = new THREE.Vector3();
function dirFrom(x, z, out) {
  const r = Math.hypot(x, z), th = Math.min(PI - 1e-3, r / R), s = Math.sin(th);
  return r > 1e-6 ? out.set(s * x / r, Math.cos(th), s * z / r) : out.set(0, 1, 0);
}
function planeOf(d) {
  const th = Math.acos(Math.max(-1, Math.min(1, d.y))), s = Math.hypot(d.x, d.z), k = s > 1e-6 ? th * R / s : 0;
  return [d.x * k, d.z * k];
}
// land: the north shore (Muros to Outes), the south shore (Monte Louro) and two islets
const ISL = [
  { cx: -1, cz: -14, a: 22, b: 13, hh: 3.0 },
  { cx: -4, cz: 17, a: 20, b: 7, hh: 3.2 },
  { cx: 17, cz: 9, a: 3.4, b: 2.5, hh: 1.5 },
  { cx: -22, cz: 6, a: 2.8, b: 2.1, hh: 1.3 }
];
const gs = (x, c, sg) => Math.exp(-((x - c) * (x - c)) / (2 * sg * sg));
// how far the shore is pushed out (+) or in (-) along the coast, in map units: gentle swells, named capes and bays
function coastW(i, x) {
  if (i === 0) return 1.1 * Math.sin(x * .31 + .8) + .75 * Math.sin(x * .52 + 2.1) + .4 * Math.sin(x * 1.1 + 1)
    + 2.4 * gs(x, -2.3, .95) + 1.7 * gs(x, 14.1, .8) + 1.9 * gs(x, 17.1, .8) + 1.5 * gs(x, 20.3, .7) + 2.0 * gs(x, -21.4, .9) - 1.1 * gs(x, 15.6, .55) - 1.1 * gs(x, 18.7, .55);
  if (i === 1) return 1.0 * Math.sin(x * .37 + 2.2) + .7 * Math.sin(x * .6 + .4) + 2.0 * gs(x, -12.5, 1.1) + 1.7 * gs(x, 0.5, 1.0) - 1.2 * gs(x, -5, .8) - 1.0 * gs(x, 7.5, .8);
  return 0;
}
function isl(i, x, z) {
  const s = ISL[i], rx = (x - s.cx) / s.a, rz = (z - s.cz) / s.b, a = Math.atan2(rz, rx);
  const w = .34 * Math.sin(x * .43 + i * 2.1) + .27 * Math.sin(z * .5 + i) + .21 * Math.sin(x * 1.3 + z * .9 + i);
  return Math.hypot(rx, rz) + .025 * Math.sin(a * 3 + 1 + i * 2) + .018 * Math.sin(a * 7 + i) + w / ((s.a + s.b) / 2) - coastW(i, x) / ((s.a + s.b) / 2);
}
const whichIsl = (x, z) => { let b = 0, m = 9; for (let i = 0; i < ISL.length; i++) { const r = isl(i, x, z); if (r < m) { m = r; b = i; } } return b; };
const islandR = (x, z) => { let m = 9; for (let i = 0; i < ISL.length; i++) m = Math.min(m, isl(i, x, z)); return m; };
const edgeMemo = {};
function edge(i, x, dir) {                  // z of the shore of island i at x, looking from its centre towards dir (+1 south, -1 north)
  const xr = Math.round(x * 20) / 20, k = i + ':' + dir + ':' + xr;
  if (edgeMemo[k] === undefined) { let z = ISL[i].cz, n = 0; while (n++ < 900 && isl(i, xr, z) < 1) z += dir * .04; edgeMemo[k] = z; }
  return edgeMemo[k];
}
const shore = (x) => edge(0, x, 1);          // the south shore of the north coast, where the villages are
const shoreS = (x) => edge(1, x, -1);        // the north shore of the south coast (Louro)
const COVES = [[-4.2, shore(-4.2) - .15], [3.9, shore(3.9) - .15], [-19.0, shore(-19.0) - .15], [-8.8, shoreS(-8.8) + .2], [15.6, shore(15.6) - .15], [18.7, shore(18.7) - .15]];
const INLET = [[-6.4, shore(-6.4) + .5], [-6.4, shore(-6.4) - .9], [-6.25, shore(-6.4) - 2.2], [-6.4, shore(-6.4) - 3.4]];     // Esteiro's inlet
const INLET2 = [[5.8, shore(5.8) + .5], [5.8, shore(5.8) - 1.0], [5.65, shore(5.8) - 2.6], [5.8, shore(5.8) - 4.2]];            // the river of Outes
const INLET3 = [[-1.2, shoreS(-1.2) - .6], [-1.2, shoreS(-1.2) + 1.0], [-1.1, shoreS(-1.2) + 2.4], [-1.2, shoreS(-1.2) + 3.7]];      // Ézaro: the sea runs in as a short river up to the waterfall
const INLETS = [INLET, INLET2, INLET3];
const LOURO = [-19.8, shore(-19.8) - 3.0], LAG = [-19.0, shore(-19.0) - 1.9], HILL2 = [12.6, shore(12.6) - 8.5];
function inletD(x, z) {
  let m = 9;
  for (const P of INLETS) for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], az = P[i][1], dx = P[i + 1][0] - ax, dz = P[i + 1][1] - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    m = Math.min(m, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return m;
}
function cove(x, z) { let g = 0; for (const c of COVES) g = Math.max(g, Math.exp(-((x - c[0]) ** 2 + (z - c[1]) ** 2) / (2 * 2.5 * 2.5))); return g; }
function groundRaw(x, z) {
  const i = whichIsl(x, z), r = isl(i, x, z);
  if (r >= 1) return -.02 - .75 * sstep(1, 1.1, r);
  const k = 1 - r;
  let h = -.02 + .42 * Math.pow(k, .55) + ISL[i].hh * Math.pow(k, 1.3) * (.65 + .35 * n2(x + i * 7, z));
  if (i === 0) h += 4.2 * Math.exp(-((x - LOURO[0]) ** 2 + (z - LOURO[1]) ** 2) / (2 * 2.6 * 2.6)) + 2.8 * Math.exp(-((x - HILL2[0]) ** 2 + (z - HILL2[1]) ** 2) / (2 * 2.4 * 2.4));
  const g = cove(x, z);
  if (g > 0) h = -.02 + (h + .02) * (1 - .8 * g);
  { const c = 1 - sstep(.26, .5, inletD(x, z)); if (c > 0) h = h * (1 - c) - .16 * c; }
  const lg = 1 - sstep(.45, .8, Math.hypot(x - LAG[0], z - LAG[1])); if (lg > 0) h = h * (1 - lg) - .14 * lg;
  return h;
}
// the school yards and the little pitch sit on flat ground: the hill is levelled round them
let FLAT = null; const flatList = () => FLAT;
function groundH(x, z) {
  if (!FLAT) { FLAT = []; for (const [fx, inl, r, so] of [[-.5, 5.05, 2.1], [15.6, 4.55, 2.1], [-7.6, 4.85, 1.3], [8.3, 1.4, 1.0], [2.2, 5.4, 1.9, 1], [3.9, 7.0, .9], [14.2, 7.4, .9]]) { const cz = so ? shoreS(fx) + inl : shore(fx) - inl; FLAT.push([fx, cz, r * 1.25, groundRaw(fx, cz) - .14]); } }
  let h = groundRaw(x, z);
  for (const f of FLAT) { const d = Math.hypot(x - f[0], z - f[1]); if (d < f[2] * 1.9) h += (f[3] - h) * (1 - sstep(f[2] * .8, f[2] * 1.9, d)); }
  return h;
}
const Y = new THREE.Vector3(0, 1, 0), Zax = new THREE.Vector3(0, 0, 1);
const _d = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
// stands an object on the planet at map position (x, z), facing yaw (0 = along the map's z axis), lift above the ground (sea = on the water)
function put(obj, x, z, yaw, lift, sea) {
  let gh = sea ? SEA : groundH(x, z), drop = 0; lift = lift || 0;
  if (!sea) {
    const fp = obj.userData && obj.userData.fp;
    if (fp) { let lo = gh; for (let k = 0; k < 6; k++) { const a = k * PI / 3 + .4, hh = groundH(x + Math.cos(a) * fp * .6, z + Math.sin(a) * fp * .6); gh = Math.max(gh, hh); lo = Math.min(lo, hh); } drop = gh - lo; }       // stand on the highest point under the footprint
    if (lift < 0) lift = 0;                                                                                                                                  // and never sink into the grass
    if (obj.userData && obj.userData.skirt && fp && !obj.userData.skirted) { obj.userData.skirted = true; const sk = new THREE.Mesh(new THREE.CylinderGeometry(fp * .6, fp * .66, drop + .16, 14), std(0xb9b2a2)); sk.position.y = -(drop + .16) / 2 + .015; obj.add(sk); }       // a stone base that reaches the ground on the low side
  }
  dirFrom(x, z, _d); dirFrom(x + .05, z, _e); _e.sub(_d); _e.addScaledVector(_d, -_e.dot(_d)).normalize();
  _f.crossVectors(_e, _d);
  obj.quaternion.setFromRotationMatrix(_m.makeBasis(_e, _d, _f));
  if (yaw) obj.quaternion.multiply(_q.setFromAxisAngle(Y, yaw));
  obj.position.copy(_d).multiplyScalar(R + gh + lift);
  return obj;
}

// ---- colours (soft, like a miniature)
const C = (h) => new THREE.Color(h);
// the pastel look: every colour is softened (less saturated, lighter, a touch warm), like gouache on paper
const PASTEL = (h, k) => { const c = new THREE.Color(h), hsl = {}; c.getHSL(hsl); k = k === undefined ? 1 : k; hsl.s = Math.min(1, hsl.s * (1 - .02 * k)); hsl.l = hsl.l + (1 - hsl.l) * (hsl.l < .3 ? .08 : .18) * k; c.setHSL(hsl.h, hsl.s, hsl.l); c.lerp(new THREE.Color(0xfff0dc), .04 * k); return c; };
// a hand-painted paper texture: soft mottling, tiny brush dabs and a fine grain; it multiplies the colours, so it only adds texture
// a soft, felted surface: a fine fibre bump and a velvet sheen on everything, so it looks warm and cuddly to the touch
let FELT = null;
const feltTex = () => {
  if (FELT) return FELT; const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, N, N);
  let sd = 3; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  for (let i = 0; i < 2600; i++) { const x = r() * N, y = r() * N, a = r() * 6.28, l = 3 + r() * 7, v = r() < .5 ? 20 : 235; g.strokeStyle = `rgba(${v},${v},${v},${.16 + r() * .2})`; g.lineWidth = .8 + r() * .8; for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); } }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; FELT = t; return t;
};
let PAINT = null;
let SEATEX = null;
const seaTex = () => {
  if (SEATEX) return SEATEX;
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); g.fillStyle = '#e9f4f8'; g.fillRect(0, 0, N, N);
  let sd = 21; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const wrap = (fn) => { for (const oy of [-N, 0, N]) for (const ox of [-N, 0, N]) fn(ox, oy); };
  for (let i = 0; i < 26; i++) { const x = r() * N, y = r() * N, rad = 50 + r() * 90, c = r() < .5 ? [255, 255, 255] : [196, 232, 244], a = .1 + r() * .14; wrap((ox, oy) => { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`); gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); }); }
  // long soft ripple lines: gentle S-curves, light on the crest and a faint shade beneath
  for (let i = 0; i < 44; i++) { const x = r() * N, y = r() * N, w = 60 + r() * 120, amp = 3 + r() * 6, ph = r() * 6.28;
    for (const [dy, col, al] of [[0, '255,255,255', .17 + r() * .1], [5, '120,176,206', .07]]) { g.strokeStyle = `rgba(${col},${al})`; g.lineWidth = dy ? 5 : 2.4; g.lineCap = 'round';
      wrap((ox, oy) => { g.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, px = x + ox + (u - .5) * w, py = y + oy + dy + Math.sin(u * 5 + ph) * amp; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }); } }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 8); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; SEATEX = t; return t;
};
const paintRep = {};
const paintTexR = (n) => { if (!paintRep[n]) { const t = paintTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(n, n); t.needsUpdate = true; paintRep[n] = t; } return paintRep[n]; };
const paintTex = () => {
  if (PAINT) return PAINT;
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d');
  g.fillStyle = '#f3ece0'; g.fillRect(0, 0, N, N);
  let sd = 9; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const wrap = (fn) => { for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) fn(ox, oy); };
  // big soft colour washes (warm peach, lilac, sage), like watered gouache
  const WASH = [[255, 214, 176], [236, 212, 236], [214, 228, 196], [255, 244, 226], [246, 205, 190]];
  for (let i = 0; i < 46; i++) { const x = r() * N, y = r() * N, rad = 40 + r() * 90, c = WASH[Math.floor(r() * WASH.length)], a = .12 + r() * .16; wrap((ox, oy) => { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`); gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); }); }
  // dry-brush strokes: long, mostly diagonal, made of many thin parallel hairs that skip here and there
  const ANG = -.62;
  for (let i = 0; i < 150; i++) {
    const x = r() * N, y = r() * N, len = 50 + r() * 150, a = ANG + (r() - .5) * .5, w = 6 + r() * 18, light = r() < .55, hairs = Math.floor(w / 1.7), tone = light ? [255, 250, 238] : [170, 140, 142];
    for (let h = 0; h < hairs; h++) { const off = (h - hairs / 2) * 1.7, nx = -Math.sin(a) * off, ny = Math.cos(a) * off, s0 = r() * .25, s1 = .7 + r() * .3; g.strokeStyle = `rgba(${tone[0]},${tone[1]},${tone[2]},${(light ? .16 : .1) * (.4 + r() * .8)})`; g.lineWidth = 1 + r() * 1.3; g.lineCap = 'round';
      wrap((ox, oy) => { g.beginPath(); g.moveTo(x + ox + nx + Math.cos(a) * len * s0, y + oy + ny + Math.sin(a) * len * s0); g.lineTo(x + ox + nx + Math.cos(a) * len * s1, y + oy + ny + Math.sin(a) * len * s1); g.stroke(); }); }
  }
  // a few short dark flecks (paint caught in the paper)
  for (let i = 0; i < 260; i++) { const x = r() * N, y = r() * N, a = ANG + (r() - .5) * 1.2, l = 2 + r() * 6; g.strokeStyle = `rgba(120,92,96,${.05 + r() * .08})`; g.lineWidth = 1 + r(); wrap((ox, oy) => { g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); }); }
  const im = g.getImageData(0, 0, N, N), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 9; d[i] = Math.max(0, Math.min(255, d[i] + n)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n)); } g.putImageData(im, 0, 0);
  { const im2 = g.getImageData(0, 0, N, N), q = im2.data; for (let i = 0; i < q.length; i += 4) { q[i] = 243 + (q[i] - 243) * .5; q[i + 1] = 240 + (q[i + 1] - 240) * .5; q[i + 2] = 232 + (q[i + 2] - 232) * .5; } g.putImageData(im2, 0, 0); }   // the same brush texture, half as strong: calmer, flatter surfaces
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; PAINT = t; return t;
};
// palette after the "Summer Afternoon" look: minty greens, sandy kerbs, dusty mauve and coral, teal trees, blue-grey roads
const SAND = PASTEL(0xeed3a0), SEABED_SHORE = PASTEL(0xf1dcb4), SEABED_DEEP = PASTEL(0x4f9fd0, .4), FAR = PASTEL(0x6cb8dc, .4), GRASS_A = PASTEL(0x86c892), GRASS_B = PASTEL(0x72b784),
  WOOD = PASTEL(0x56a37c), ROCK = PASTEL(0xc7b6a8), ROCK_G = PASTEL(0x96b88e), HEATH = PASTEL(0xd8bccb);
const FIELDS = [PASTEL(0xcfd078), PASTEL(0xe8bb68), PASTEL(0x86c87c), PASTEL(0xe2d890), PASTEL(0xe2a082)];

function buildTerrain() {
  const src = new THREE.IcosahedronGeometry(R, 64), sp = src.attributes.position, m = new THREE.Vector3(), out = new THREE.Color();
  const map = new Map(), P = [], idx = [];
  for (let i = 0; i < sp.count; i++) {                  // weld the vertices that touch so that normals and colours are shared (soft surface)
    m.fromBufferAttribute(sp, i).normalize();
    const k = Math.round(m.x * 4e4) + ',' + Math.round(m.y * 4e4) + ',' + Math.round(m.z * 4e4);
    let j = map.get(k);
    if (j === undefined) { j = P.length / 3; map.set(k, j); P.push(m.x, m.y, m.z); }
    idx.push(j);
  }
  const nv = P.length / 3, pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
  for (let v = 0; v < nv; v++) {
    m.set(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]);
    const [x, z] = planeOf(m), r = islandR(x, z), h = groundH(x, z);
    if (r >= 1 || h < -.03) out.copy(SEABED_SHORE).lerp(SEABED_DEEP, sstep(0, .65, -h)).lerp(FAR, sstep(-.5, -.75, h));
    else {                                              // everything blends smoothly into the next thing (sand, grass, fields, wood, rock)
      const nz = n2(x * 1.7, z * 1.7) * .5 + .5, cv = cove(x, z);
      out.copy(GRASS_A).lerp(GRASS_B, nz);
      const f1 = sstep(.52, .7, n2(x * .55 + 3, z * .55 - 1) * .5 + .5), f2 = sstep(.5, .72, n2(x * .5 - 4, z * .6 + 2) * .5 + .5);
      const fieldW = sstep(.2, .5, h) * (1 - sstep(1.1, 1.5, h));
      out.lerp(FIELDS[1], f1 * .75 * fieldW).lerp(FIELDS[0], f2 * .6 * fieldW);
      out.lerp(WOOD, sstep(1.1, 1.7, h) * .7).lerp(HEATH, sstep(1.5, 2.1, h) * (1 - sstep(2.3, 2.7, h)) * sstep(.55, .75, nz) * .4);
      out.lerp(ROCK, sstep(2.2, 2.9, h)).lerp(ROCK_G, sstep(2.2, 2.9, h) * nz * .5);
      const sandW = Math.max(1 - sstep(.08, .2, h), sstep(.3, .55, cv) * (1 - sstep(.3, .5, h)));
      out.lerp(SAND, sandW); if (h < .045) out.multiplyScalar(.93 + .07 * sstep(-.03, .045, h));
    }
    const hh = groundH(x, z);
    pos[v * 3] = m.x * (R + hh); pos[v * 3 + 1] = m.y * (R + hh); pos[v * 3 + 2] = m.z * (R + hh);
    col[v * 3] = out.r; col[v * 3 + 1] = out.g; col[v * 3 + 2] = out.b;
  }
  const g = new THREE.BufferGeometry();
  const uv = new Float32Array(nv * 2); for (let v = 0; v < nv; v++) { m.set(P[v * 3], P[v * 3 + 1], P[v * 3 + 2]); const [ux, uz] = planeOf(m); uv[v * 2] = ux / 2.4; uv[v * 2 + 1] = uz / 2.4; }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ vertexColors: true, map: paintTex(), flatShading: false, roughness: 1, bumpMap: feltTex(), bumpScale: 1.2, sheen: 1, sheenRoughness: .6, sheenColor: new THREE.Color(0xfff0dc) }));
}

// ---- small building blocks
const matCache = new Map();
// a dark brush-like outline round the buildings and boats, as in ink-and-gouache illustrations (inverted hull pushed out along the normals)
let OUTLINE = null;
const outlineMat = () => OUTLINE || (OUTLINE = (() => { const m = new THREE.MeshBasicMaterial({ color: 0x4a3236, side: THREE.BackSide }); m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * .011;'); }; return m; })());
const addOutline = (root) => { const list = []; root.traverse((o) => { if (o.isMesh && !o.userData.ol && o.material && !o.material.transparent && !o.isInstancedMesh && o.geometry && o.geometry.attributes.normal) { o.geometry.computeBoundingBox && !o.geometry.boundingBox && o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox, sz = b ? Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) * Math.max(o.scale.x, o.scale.y, o.scale.z) : 0; if (sz > .16) list.push(o); } }); for (const o of list) { const ol = new THREE.Mesh(o.geometry, outlineMat()); ol.userData.ol = 1; ol.castShadow = false; ol.receiveShadow = false; o.add(ol); } };
const std = (color, extra) => {
  const key = extra ? null : color;
  if (key !== null && matCache.has(key)) return matCache.get(key);
  const base = PASTEL(color), m = new THREE.MeshPhysicalMaterial(Object.assign({ color: base, roughness: .95, map: paintTex(), bumpMap: feltTex(), bumpScale: 1.1, sheen: 1, sheenRoughness: .55, sheenColor: base.clone().lerp(new THREE.Color(0xfff3e4), .6) }, extra || {}));
  if (key !== null) matCache.set(key, m);
  return m;
};
const winMat = new THREE.MeshStandardMaterial({ color: 0x2c2a33, emissive: 0xffc46b, emissiveIntensity: 0, roughness: .5 });
const lampMats = [];
// a soft round glow: warm white in the middle, through amber, to a fading orange-pink edge
let GLOW = null; const glowTex = () => { if (GLOW) return GLOW; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, 'rgba(255,247,214,1)'); gr.addColorStop(.25, 'rgba(255,222,150,.7)'); gr.addColorStop(.55, 'rgba(255,184,112,.28)'); gr.addColorStop(.8, 'rgba(255,150,120,.08)'); gr.addColorStop(1, 'rgba(255,140,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); GLOW = new THREE.CanvasTexture(c); GLOW.colorSpace = THREE.SRGBColorSpace; return GLOW; };
const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .4, roughness: .3 });
const boxG = new Map();
// every "box" is softly rounded, like a little clay model: the corners are pulled onto a small sphere and the normals follow, so there are no hard edges
function roundBox(w, h, d) {
  const mn = Math.min(w, h, d);
  if (mn < .05) return new THREE.BoxGeometry(w, h, d);
  const r = Math.min(.03, mn * .32), seg = mn > .12 ? 4 : 2, g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), pos = g.attributes.position, nor = g.attributes.normal, v = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i); c.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
    n.copy(v).sub(c); if (n.lengthSq() < 1e-10) { n.fromBufferAttribute(nor, i); } else n.normalize();
    pos.setXYZ(i, c.x + n.x * r, c.y + n.y * r, c.z + n.z * r); nor.setXYZ(i, n.x, n.y, n.z);
  }
  return g;
}
const box = (w, h, d, mat) => {
  const k = w.toFixed(3) + ',' + h.toFixed(3) + ',' + d.toFixed(3); let g = boxG.get(k);
  if (!g) { g = roundBox(w, h, d); boxG.set(k, g); }
  return new THREE.Mesh(g, mat);
};
const gable = (len, span, rh, mat) => {              // a gabled roof, ridge along x
  const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath();
  const bv = Math.min(.03, rh * .3), g = new THREE.ExtrudeGeometry(sh, { depth: len - bv * 2, bevelEnabled: true, bevelSize: bv, bevelThickness: bv, bevelSegments: 3 });
  g.rotateY(PI / 2); g.translate(-(len - bv * 2) / 2, 0, 0); g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
};
const ROOF = [0xe36d57, 0xd95f4e, 0xea866c, 0xcb5a4e, 0xe5785e, 0x7597ac], SLATE = 0x7f86b0;
const GRANITE = [0xb8b19f, 0xaaa391, 0xc2bba9];
const WALLS = [0xd9aeb0, 0xe9cbb6, 0xf3e4ca, 0xcaa3a8, 0xe7c1b0, 0xf1ddc2, 0xd4b2b8, 0xeacfb7, 0xf2e7d4, 0xd0a9a2];
const FLG = new THREE.SphereGeometry(.014, 6, 5), FLM = [0xe9577a, 0xf2a43a, 0xf5e04a, 0xf07a5a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: .8 }));
const FRAMEC = [0xfff8ea, 0x5f8fd0, 0x5fae60, 0xfff8ea, 0xe0694a, 0xf0b040];

// a house: simple, warm walls, terracotta roof with a little overhang, dark windows, a door, a chimney
function house(o) {
  const g = new THREE.Group(), fh = .2, bodyH = o.floors * fh, w = o.w, d = o.d;
  const wall = std(o.wall);
  const body = box(w, bodyH, d, wall); body.position.y = bodyH / 2; g.add(body);
  const rh = Math.min(.3, d * .46), roof = gable(w + .1, d + .09, rh, std(o.roof)); roof.position.y = bodyH - .004; g.add(roof);
  const ridge = box(w + .11, .018, .035, std(o.roof)); ridge.position.set(0, bodyH + rh, 0); g.add(ridge);
  if (o.chim !== false) { const ch = box(.055, .15, .055, std(o.stone ? 0xaaa391 : 0xe9dcc2)); ch.position.set(w * .24, bodyH + rh * .6, -d * .12); g.add(ch); }
  const fm = std(o.stone ? 0xd6d0c0 : FRAMEC[(o.fr || 0) % FRAMEC.length]), z = d / 2, n = Math.max(2, Math.round(w / .2));
  for (let f = 0; f < o.floors; f++) {
    const y = fh * f + fh * .56;
    if (f === 1 && o.gal) {                          // a glazed gallery, as on the seafarers’ houses
      const gl = box(w * .86, fh * .6, .02, winMat); gl.position.set(0, y, z + .008); g.add(gl);
      for (let i = 0; i <= 5; i++) { const bar = box(.014, fh * .64, .026, fm); bar.position.set(-w * .43 + i * w * .86 / 5, y, z + .012); g.add(bar); }
      const t1 = box(w * .9, .016, .03, fm); t1.position.set(0, y + fh * .32, z + .012); g.add(t1);
      const t2 = box(w * .9, .016, .03, fm); t2.position.set(0, y - fh * .32, z + .012); g.add(t2);
      continue;
    }
    // long dark window bands with pale mullions, as on the houses of the reference (the door splits the ground floor band in two)
    const bands = f === 0 ? [[-w * .27, w * .3], [w * .27, w * .3]] : [[0, w * .8]];
    for (const [bx, bw] of bands) {
      const gl = box(bw, fh * .36, .016, winMat); gl.position.set(bx, y, z + .006); g.add(gl);
      const fr2 = box(bw + .016, .012, .02, fm); fr2.position.set(bx, y + fh * .19, z + .008); g.add(fr2);
      const fr3 = box(bw + .016, .012, .02, fm); fr3.position.set(bx, y - fh * .19, z + .008); g.add(fr3);
      const nm = Math.max(1, Math.round(bw / .16));
      for (let q = 0; q <= nm; q++) { const mu = box(.01, fh * .38, .02, fm); mu.position.set(bx - bw / 2 + q * bw / nm, y, z + .008); g.add(mu); }
    }
  }
  const dcol = std(o.door || 0x8a4f2e);
  const door = box(.07, .12, .02, dcol); door.position.set(0, .06, z + .008); g.add(door);
  const aw = box(.15, .014, .06, std(o.roof)); aw.position.set(0, .16, z + .03); aw.rotation.x = .18; g.add(aw);                // a small coral awning over the door
  const st0 = box(.1, .02, .05, std(0xd9d0bc)); st0.position.set(0, .01, z + .035); g.add(st0);
  if (o.floors >= 2 && (o.fr || 0) % 2 === 0) {                           // a dormer window in the roof
    const dm = box(.13, .1, .1, wall); dm.position.set(0, bodyH + .1, d / 2 - .26 + .1); g.add(dm);
    const dr2 = gable(.17, .17, .07, std(o.roof)); dr2.position.set(0, bodyH + .15, d / 2 - .16); g.add(dr2);
    const dw = box(.05, .06, .012, winMat); dw.position.set(0, bodyH + .1, d / 2 - .1 + .008); g.add(dw);
  }
  if (!o.stone) for (const sx of [-1, 1]) { const q = box(.03, bodyH, .03, std(0xc9c2b0)); q.position.set(sx * (w / 2 - .004), bodyH / 2, z - .004); g.add(q); }
  g.userData.fp = Math.max(w, d) / 2 * 1.45 + .14; g.userData.pri = 1; g.userData.home = 1; g.userData.skirt = 1;
  return g;
}
// stone arcades (soportales): shops under round granite arches, two storeys above, one long roof
function arcade(n, wu, d, stone) {
  const g = new THREE.Group(), W = n * wu, gh = .2, fh = .2, r = wu / 4, gr = std(0xb8b19f);
  const rec = box(W, gh, d - .16, std(0x6f655b)); rec.position.set(0, gh / 2, -.08); g.add(rec);
  const slab = box(W + .02, .03, d, gr); slab.position.set(0, gh + .005, 0); g.add(slab);
  for (let k = 0; k <= n * 2; k++) {
    const x = -W / 2 + k * wu / 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(.026, .03, gh - r, 8), gr); col.position.set(x, (gh - r) / 2, d / 2 - .04); g.add(col);
    if (k < n * 2) { const ar = new THREE.Mesh(new THREE.TorusGeometry(r * .92, .02, 6, 12, PI), gr); ar.position.set(x + wu / 4, gh - r, d / 2 - .04); g.add(ar); }
  }
  for (let i = 0; i < n; i++) {
    const cx = -W / 2 + wu * (i + .5);
    const up = box(wu - .006, fh * 2, d, std(stone ? GRANITE[i % 3] : WALLS[i % WALLS.length])); up.position.set(cx, gh + .02 + fh, 0); g.add(up);
    const dr = box(.065, .115, .02, std([0x2f6fa8, 0x7a4a2e, 0x3b8f6a][i % 3])); dr.position.set(cx, .058, d / 2 - .12); g.add(dr);
    const gl = box(wu * .74, fh * .6, .022, winMat); gl.position.set(cx, gh + .02 + fh * .55, d / 2 + .01); g.add(gl);
    for (let b = 0; b <= 4; b++) { const bar = box(.014, fh * .64, .028, std(0xffffff)); bar.position.set(cx - wu * .37 + b * wu * .74 / 4, gh + .02 + fh * .55, d / 2 + .014); g.add(bar); }
    for (const sx of [-1, 1]) { const fr = box(.06, .09, .014, std(0xe8e2d2)); fr.position.set(cx + sx * wu * .22, gh + .02 + fh * 1.55, d / 2 + .004); g.add(fr); const w2 = box(.042, .07, .018, winMat); w2.position.set(cx + sx * wu * .22, gh + .02 + fh * 1.55, d / 2 + .008); g.add(w2); }
  }
  const roof = gable(W * 1.02, d + .1, .28, std(ROOF[1])); roof.position.y = gh + .02 + fh * 2; g.add(roof);
  for (let i = 0; i < n; i += 2) { const ch = box(.055, .15, .055, std(0xaaa391)); ch.position.set(-W / 2 + wu * (i + .5), gh + .02 + fh * 2 + .18, -d * .12); g.add(ch); }
  g.userData.fps = []; for (let k = 0; k < n * 1.6; k++) g.userData.fps.push([-W / 2 + .25 + k * (W - .5) / Math.max(1, n * 1.6 - 1), .3]); g.userData.pri = 2;
  return g;
}
// a granite church with a porch under a tiled roof and a tall bell tower with a lantern (after the church of the photo)
// the stone market of Muros: a granite house with a double flight of stairs, a balustrade, an arch under the landing and tall arched windows
function mercado() {
  const g = new THREE.Group(), st = std(0xcfc8b6), st2 = std(0xbdb6a3), dk = std(0x2a2620), roofM = std(0xc9674f), grn = std(0x4f8f6a);
  const body = box(1.7, .92, .9, st); body.position.set(0, .5, 0); g.add(body);
  const base = box(1.74, .24, .94, st2); base.position.set(0, .12, 0); g.add(base);
  const cor = box(1.78, .05, .98, std(0xe3dccb)); cor.position.set(0, .98, 0); g.add(cor);
  const roof = gable(1.9, 1.0, .3, roofM); roof.position.y = .98; g.add(roof);
  const sc = new THREE.Mesh(new THREE.ConeGeometry(.04, .14, 4), st); sc.position.set(0, 1.38, .1); g.add(sc);
  for (const sx of [-.62, -.3, .3, .62]) {                                      // tall arched windows with green shutters
    const w = box(.15, .3, .02, dk); w.position.set(sx, .68, .46); g.add(w); const top = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .02, 10, 1, false, 0, PI), dk); top.rotation.x = PI / 2; top.rotation.z = PI / 2; top.position.set(sx, .83, .46); g.add(top);
    for (const dx of [-.095, .095]) { const sh = box(.045, .3, .02, grn); sh.position.set(sx + dx, .68, .465); g.add(sh); }
  }
  const arch = box(.3, .34, .02, dk); arch.position.set(0, .68, .46); g.add(arch); const at = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .02, 12, 1, false, 0, PI), dk); at.rotation.x = PI / 2; at.rotation.z = PI / 2; at.position.set(0, .85, .46); g.add(at);
  // the sign
  { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 48; const c = cv.getContext('2d'); c.fillStyle = '#d6cfbd'; c.fillRect(0, 0, 256, 48); c.fillStyle = '#5a5246'; c.font = '700 34px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MERCADO', 128, 26); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const sg = new THREE.Mesh(new THREE.PlaneGeometry(.4, .075), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); sg.position.set(0, .96, .495); g.add(sg); }
  // the double staircase meeting at a landing, with balustrades and an arch below
  const land = box(.62, .06, .42, st2); land.position.set(0, .37, .66); g.add(land);
  const under = box(.5, .24, .02, dk); under.position.set(0, .18, .56); g.add(under); const ut = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .02, 14, 1, false, 0, PI), dk); ut.rotation.x = PI / 2; ut.rotation.z = PI / 2; ut.position.set(0, .3, .56); g.add(ut);
  const fill = box(.62, .34, .42, st); fill.position.set(0, .17, .66); g.add(fill);
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 6; i++) { const hh = .055 * (i + 1), stp = box(.1, hh, .38, st2); stp.position.set(sx * (.76 - i * .09), hh / 2, .66); g.add(stp); }
    const rail = box(.5, .05, .04, std(0xe7e0cf)); rail.position.set(sx * .56, .5, .86); g.add(rail); const rail2 = box(.04, .05, .42, std(0xe7e0cf)); rail2.position.set(sx * .31, .55, .66); g.add(rail2);
    for (let q = 0; q < 6; q++) { const ba = new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, .1, 6), std(0xf2ecdc)); ba.position.set(sx * (.34 + q * .08), .43, .86); g.add(ba); }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), std(0xf2ecdc)); ball.position.set(sx * .84, .5, .86); g.add(ball);
  }
  g.scale.setScalar(.9); g.userData.fp = .95; g.userData.pri = 5; g.userData.skirt = 1; return g;
}
// the fish market (lonja): a long, low hall with big blue doors, a pale roof, a sign, and boxes of fish waiting outside
function lonja() {
  const g = new THREE.Group(), wall = std(0xf3ead8), blue = std(0x3d78a8);
  const body = box(1.9, .5, .8, wall); body.position.y = .27; g.add(body);
  const roof = gable(2.05, .95, .2, std(0x7fa0b8)); roof.position.y = .52; g.add(roof);
  for (const sx of [-.62, 0, .62]) { const dr = box(.42, .34, .02, blue); dr.position.set(sx, .2, .405); g.add(dr); const ar = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .02, 14, 1, false, 0, PI), blue); ar.rotation.x = PI / 2; ar.rotation.z = PI / 2; ar.position.set(sx, .37, .405); g.add(ar); const st = box(.44, .02, .12, std(0xd6d0c0)); st.position.set(sx, .02, .46); g.add(st); }
  { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#2f6fa8'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#fff6e4'; c.font = '700 40px "Switzer","Inter",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LONJA', 128, 34); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const sg = new THREE.Mesh(new THREE.PlaneGeometry(.5, .12), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); sg.position.set(0, .54, .402); g.add(sg); }
  const cols = [0xe9577a, 0xf2c14a, 0x5fae8a, 0x4f8fc0];
  for (let i = 0; i < 7; i++) { const cr = box(.17, .1, .12, std(cols[i % 4])); cr.position.set(-.78 + (i % 4) * .2 + (i > 3 ? .1 : 0), .05 + (i > 3 ? .1 : 0), .62 + (i > 3 ? .02 : .0)); g.add(cr); }
  // fishing nets in front of it: drying racks with sagging nets, a heap of net with floats, and a pile of crates
  { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; for (let i = -64; i < 128; i += 14) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); }
    const nt = new THREE.CanvasTexture(cv); nt.wrapS = nt.wrapT = THREE.RepeatWrapping; nt.repeat.set(3, 2); nt.colorSpace = THREE.SRGBColorSpace;
    [[-.62, 0x4f8fc0], [0, 0xe9a24a], [.62, 0x5fae8a]].forEach(([sx, col], k) => {
      const post = (x) => { const p2 = new THREE.Mesh(new THREE.CylinderGeometry(.014, .018, .46, 6), std(0x7a5a3c)); p2.position.set(x, .23, .8); g.add(p2); }; post(sx - .26); post(sx + .26);
      const bar = box(.54, .014, .014, std(0x7a5a3c)); bar.position.set(sx, .45, .8); g.add(bar);
      const ng = new THREE.PlaneGeometry(.5, .32, 8, 4); for (let i = 0; i < ng.attributes.position.count; i++) { const x = ng.attributes.position.getX(i); ng.attributes.position.setZ(i, Math.sin((x + .25) * 6.3) * .02 + .02); } ng.computeVertexNormals();
      const net = new THREE.Mesh(ng, new THREE.MeshStandardMaterial({ color: PASTEL(col), map: nt, transparent: true, alphaTest: .25, side: THREE.DoubleSide, roughness: 1 })); net.position.set(sx, .29, .8); g.add(net);
      for (let f = 0; f < 4; f++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 5), std([0xe36d57, 0xf2c14a][f % 2])); fl.position.set(sx - .2 + f * .13, .12, .805); g.add(fl); } });
    const heap = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 1), new THREE.MeshStandardMaterial({ color: PASTEL(0x4f8fc0), map: nt, roughness: 1 })); heap.scale.set(1.5, .5, 1); heap.position.set(.78, .06, .66); g.add(heap);
    for (let f = 0; f < 5; f++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 5), std(0xe36d57)); fl.position.set(.7 + f * .04, .1 + (f % 2) * .02, .6 + (f % 3) * .05); g.add(fl); } }
  g.userData.fp = 1.3; g.userData.pri = 5; g.userData.skirt = 1; return g;
}

function church(scale) {
  const g = new THREE.Group(), st = std(0xb9b29f), dk = std(0x2a2620), rf = std(ROOF[0]);
  const nave = box(.62, .5, 1.0, st); nave.position.set(.1, .25, 0); g.add(nave);
  const roof = gable(1.1, .78, .26, rf); roof.rotation.y = PI / 2; roof.position.set(.1, .5, 0); g.add(roof);
  const porch = box(.5, .24, .32, st); porch.position.set(.1, .12, .66); g.add(porch);
  const proof = gable(.34, .62, .14, rf); proof.rotation.y = PI / 2; proof.position.set(.1, .24, .66); g.add(proof);
  for (const sx of [-1, 1]) { const pc = new THREE.Mesh(new THREE.CylinderGeometry(.018, .02, .24, 6), st); pc.position.set(.1 + sx * .22, .12, .81); g.add(pc); }
  const door = box(.1, .17, .02, dk); door.position.set(.1, .085, .665 + .01); g.add(door);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .014, 12), std(0xdcd5c2)); rose.rotation.x = PI / 2; rose.position.set(.1, .38, .505); g.add(rose);
  // tower
  const t1 = box(.3, .86, .3, st); t1.position.set(-.38, .43, .22); g.add(t1);
  const t2 = box(.26, .3, .26, st); t2.position.set(-.38, 1.0, .22); g.add(t2);
  for (const [dx, dz, ry] of [[0, .131, 0], [0, -.131, 0], [.131, 0, PI / 2], [-.131, 0, PI / 2]]) { const op = box(.07, .15, .014, dk); op.position.set(-.38 + dx, 1.0, .22 + dz); op.rotation.y = ry; g.add(op); }
  const bal = box(.34, .03, .34, std(0xcfc8b6)); bal.position.set(-.38, 1.165, .22); g.add(bal);
  for (const [px, pz] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) { const pn = new THREE.Mesh(new THREE.ConeGeometry(.02, .1, 6), std(0xcfc8b6)); pn.position.set(-.38 + px, 1.23, .22 + pz); g.add(pn); }
  const t3 = new THREE.Mesh(new THREE.CylinderGeometry(.095, .11, .22, 8), st); t3.position.set(-.38, 1.29, .22); g.add(t3);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 6, 0, PI * 2, 0, PI / 2), std(0xa59f8c)); dome.position.set(-.38, 1.4, .22); g.add(dome);
  const cr1 = box(.016, .12, .016, std(0xdddddd)); cr1.position.set(-.38, 1.56, .22); g.add(cr1);
  const cr2 = box(.07, .016, .016, std(0xdddddd)); cr2.position.set(-.38, 1.58, .22); g.add(cr2);
  g.scale.setScalar(scale || 1);
  g.userData.fp = 1.15 * (scale || 1); g.userData.pri = 3; g.userData.skirt = 1;
  return g;
}
// a granite hórreo on stone legs with ventilation slits and a tiled roof (after the one of the photo)
function horreo() {
  const g = new THREE.Group(), st = std(0xaaa391), dk = std(0x2a2620);
  const body = box(.32, .3, .9, st); body.position.y = .52; g.add(body);
  for (const sx of [-1, 1]) for (let row = 0; row < 2; row++) for (let k = 0; k < 6; k++) { const sl = box(.012, .028, .1, dk); sl.position.set(sx * .161, .46 + row * .1, -.36 + k * .144); g.add(sl); }
  const door = box(.16, .2, .012, std(0x7a6a52)); door.position.set(0, .5, .456); g.add(door);
  const roof = gable(1.0, .46, .17, std(ROOF[2])); roof.rotation.y = PI / 2; roof.position.y = .66; g.add(roof);
  for (const [lx, lz] of [[-.11, -.32], [.11, -.32], [-.11, .32], [.11, .32]]) {
    const lg = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .34, 7), st); lg.position.set(lx, .19, lz); g.add(lg);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.1, .09, .03, 10), std(0xbdb6a3)); cap.position.set(lx, .37, lz); g.add(cap);
  }
  const cr = box(.014, .09, .014, std(0xcccccc)); cr.position.set(0, .87, .46); g.add(cr);
  const cr2 = box(.06, .014, .014, std(0xcccccc)); cr2.position.set(0, .89, .46); g.add(cr2);
  for (let i = 0; i < 5; i++) { const stp = box(.2, .07, .11, std(0xcfc8b6)); stp.position.set(0, .035 + i * .07, .93 - i * .1); g.add(stp); }          // a little flight of stone steps up to the door
  for (const sx of [-1, 1]) { const sw = box(.025, .2, .5, std(0xb7b09e)); sw.position.set(sx * .11, .1, .7); sw.rotation.x = .38; g.add(sw); }
  g.userData.fp = .62; g.userData.pri = 1; g.userData.skirt = 1;
  return g;
}
const ALLP = [];
function person(shirt, o) {
  o = o || {};
  // round and cute: an egg-shaped body, a big round head with two dot eyes and rosy cheeks, tiny round feet (about as tall as before)
  const g = new THREE.Group(), skin = std(o.skin || 0xf0c9a0), eye = std(0x2b2530), sh = std(shirt);
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(.036, 2), sh); body.scale.set(1, 1.12, .92); body.position.y = .05; g.add(body);
  for (const sz of [-1, 1]) {
    const ft = new THREE.Mesh(new THREE.IcosahedronGeometry(.013, 1), std(o.pants || 0x3a4a63)); ft.scale.set(1.25, .8, 1); ft.position.set(.006, .01, sz * .016); g.add(ft);
    const hn = new THREE.Mesh(new THREE.IcosahedronGeometry(.011, 1), skin); hn.position.set(0, .05, sz * .037); g.add(hn);
  }
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.032, 2), skin); head.position.y = .113; g.add(head);
  for (const sz of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.IcosahedronGeometry(.0042, 1), eye); e.position.set(.028, .118, sz * .0115); g.add(e);
    const ck = new THREE.Mesh(new THREE.IcosahedronGeometry(.0058, 1), std(0xf08a8a)); ck.scale.set(.5, .8, 1); ck.position.set(.027, .107, sz * .0195); g.add(ck);
  }
  if (o.hat) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(.043, .043, .006, 12), std(o.hat)); brim.position.y = .137; g.add(brim);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 6, 0, PI * 2, 0, PI / 2), std(o.hat)); dome.position.y = .137; dome.scale.y = .85; g.add(dome);
  } else {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.0345, 10, 6, 0, PI * 2, 0, PI * .55), std([0x4a3326, 0x2b2530, 0xb5651d, 0xe0b45a, 0x7a4a2a][(ALLP.length * 7 + (o.skin || 0)) % 5])); hair.position.set(-.004, .117, 0); hair.rotation.z = .12; g.add(hair);
  }
  g.userData.role = o.role || 'town'; g.userData.idx = ALLP.length;
  if (g.userData.role === 'town' || g.userData.role === 'walk') {                           // a little umbrella, only shown while it rains
    const um = new THREE.Group(), pole = new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, .1, 4), std(0x4a4038)); pole.position.y = .07; um.add(pole);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 6, 0, PI * 2, 0, PI / 2), std([0xd9473a, 0x2f6fa8, 0xf2c14a, 0x3b9a6a, 0xe277a0][ALLP.length % 5])); dome.position.y = .12; dome.scale.y = .6; um.add(dome);
    um.position.set(.02, .035, 0); um.visible = false; g.add(um); g.userData.umb = um;
  }
  ALLP.push(g);
  return g;
}
function lying(shirt, o) {
  o = o || {};
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(.03, 2), std(shirt)); torso.scale.set(1.35, .75, 1); torso.position.set(-.012, .02, 0);
  const legs = new THREE.Mesh(new THREE.IcosahedronGeometry(.022, 1), std(o.pants || 0x3a4a63)); legs.scale.set(1.6, .8, 1.1); legs.position.set(.05, .016, 0);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.026, 2), std(o.skin || 0xf0c9a0)); head.position.set(-.06, .026, 0);
  g.add(torso, legs, head);
  g.userData.role = 'sunL'; g.userData.idx = ALLP.length; ALLP.push(g);
  return g;
}
const SHIRTS = [0xd9473a, 0x2f6fa8, 0xf2c14a, 0x3b9a6a, 0xf2efe6, 0xe277a0, 0x7a58b5, 0xf08a3c];
const SKINS = [0xf0c9a0, 0xe3b185, 0xc58c5e, 0xf5d6b5];

function stoneBridge(span, nA, bw, mat, deckMat, hump) {
  hump = hump === undefined ? .07 : hump;
  const br = new THREE.Group(), L = span * nA;
  for (let k = 0; k < nA; k++) {
    const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(span / 2, .24); sh.lineTo(-span / 2, .24); sh.closePath();
    const ra = span * .38, hole = new THREE.Path(); hole.moveTo(-ra, .012); hole.absarc(0, .012, ra, PI, 0, true); hole.closePath(); sh.holes.push(hole);
    const g2 = new THREE.ExtrudeGeometry(sh, { depth: bw, bevelEnabled: false }); g2.translate(0, 0, -bw / 2);
    const m = new THREE.Mesh(g2, mat); m.position.x = (k - (nA - 1) / 2) * span; br.add(m);
  }
  for (let k = 0; k < 11; k++) {
    const u = k / 10 * 2 - 1, y = .24 + (1 - u * u) * hump, seg = L / 11 + .02;
    const dk = box(seg, .05, bw + .02, deckMat); dk.position.set(u * L / 2, y + .02, 0); br.add(dk);
    for (const sz of [-1, 1]) { const pr = box(seg, .07, .035, mat); pr.position.set(u * L / 2, y + .075, sz * (bw / 2 - .005)); br.add(pr); }
  }
  return br;
}
// a ribbon laid on the ground along a list of map points (road, path); it breaks over water and dashes if asked
function ribbon(pts, width, mat, lift, dash, flo, noSkip) {
  flo = flo === undefined ? .07 : flo;
  const H = pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1, nx = -tz / l * .3, nz = tx / l * .3; return Math.max(groundH(q[0], q[1]), groundH(q[0] + nx, q[1] + nz), groundH(q[0] - nx, q[1] - nz), flo); });
  { const M = H.slice(); for (let i = 0; i < H.length; i++) for (let k = -2; k <= 2; k++) M[i] = Math.max(M[i], H[Math.min(H.length - 1, Math.max(0, i + k))]); for (let i = 0; i < H.length; i++) H[i] = M[i]; }
  for (let pass = 0; pass < 6; pass++) for (let i = 1; i < H.length - 1; i++) H[i] = Math.max(H[i] * .5 + (H[i - 1] + H[i + 1]) * .25, Math.min(H[i], flo + .0));
  const P = pts.map((q, i) => dirFrom(q[0], q[1], new THREE.Vector3()).multiplyScalar(R + H[i] + lift));
  const pos = [], idx = [], tan = new THREE.Vector3(), side = new THREE.Vector3(), nrm = new THREE.Vector3();
  for (let i = 0; i < P.length; i++) {
    tan.copy(P[Math.min(P.length - 1, i + 1)]).sub(P[Math.max(0, i - 1)]).normalize(); nrm.copy(P[i]).normalize();
    side.crossVectors(tan, nrm).normalize().multiplyScalar(width / 2);
    pos.push(P[i].x + side.x, P[i].y + side.y, P[i].z + side.z, P[i].x - side.x, P[i].y - side.y, P[i].z - side.z);
  }
  for (let i = 0; i < P.length - 1; i++) {
    if (dash && i % 4 > 1) continue;
    if (!noSkip && inletD((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2) < .46) continue;
    const o = i * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.userData.ribbon = true; return m;
}
// a ribbon of water that follows the ground uphill and gets narrower (widths per point)
function ribbonW(pts, widths, mat, lift) {
  const H = pts.map((q) => groundH(q[0], q[1]));
  for (let pass = 0; pass < 5; pass++) for (let i = 1; i < H.length - 1; i++) H[i] = H[i] * .5 + (H[i - 1] + H[i + 1]) * .25;
  const P = pts.map((q, i) => dirFrom(q[0], q[1], new THREE.Vector3()).multiplyScalar(R + H[i] + lift));
  const pos = [], idx = [], tan = new THREE.Vector3(), side = new THREE.Vector3(), nrm = new THREE.Vector3();
  for (let i = 0; i < P.length; i++) {
    tan.copy(P[Math.min(P.length - 1, i + 1)]).sub(P[Math.max(0, i - 1)]).normalize(); nrm.copy(P[i]).normalize();
    side.crossVectors(tan, nrm).normalize().multiplyScalar(widths[i] / 2);
    pos.push(P[i].x + side.x, P[i].y + side.y, P[i].z + side.z, P[i].x - side.x, P[i].y - side.y, P[i].z - side.z);
    if (i < P.length - 1) { const o = i * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.userData.ribbon = true; return m;
}
function route(pts) {
  const len = [0]; let t = 0;
  for (let i = 1; i < pts.length; i++) { t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(t); }
  return { pts, len, total: t };
}
function routeAt(r, u) {
  const s = u * r.total; let i = 1;
  while (i < r.len.length - 1 && r.len[i] < s) i++;
  const f = (s - r.len[i - 1]) / Math.max(1e-4, r.len[i] - r.len[i - 1]), a = r.pts[i - 1], b = r.pts[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(-(b[1] - a[1]), b[0] - a[0])];
}


// ---- sound: all of it is made here with the Web Audio API (no files): a soft pad, a music-box melody, the sea, and little chimes and splashes
function makeAudio(night0) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  let ctx; try { ctx = new AC(); } catch (e) { return null; }
  const out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
  const dryB = ctx.createGain(); dryB.gain.value = .8; dryB.connect(out);
  // a long, soft reverb made from decaying noise
  const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const revG = ctx.createGain(); revG.gain.value = .75; rev.connect(revG); revG.connect(out);
  const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5200; tone.connect(dryB); tone.connect(rev);
  let night = !!night0, muted = false, alive = true, last = {};
  const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[48, 55, 59, 64], [45, 52, 57, 64], [41, 48, 55, 64], [43, 50, 57, 62], [48, 55, 59, 67], [45, 52, 60, 64]];   // Cmaj7 · Am7 · Fmaj7 · G6 · ...
  let ci = 0;
  function pad() {
    if (!alive) return;
    const ch = CH[ci++ % CH.length], t = ctx.currentTime, dur = 9;
    for (const m of ch) for (const dt of [-4, 4]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = NOTE(m + (night ? -12 : 0) + (m < 50 ? 0 : 0)); o.detune.value = dt;
      f.type = 'lowpass'; f.frequency.value = night ? 520 : 800;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + 3.5); g.gain.linearRampToValueAtTime(0, t + dur + 3);
      o.connect(f); f.connect(g); g.connect(tone); o.start(t); o.stop(t + dur + 3.2);
    }
  }
  const PENT = [72, 74, 76, 79, 81, 84, 79, 76], PENTN = [69, 72, 74, 76, 79, 81, 76, 72];
  let pi = 0;
  function note(m, vol, hold) {
    const t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = NOTE(m); o2.type = 'sine'; o2.frequency.value = NOTE(m) * 2.01;
    const g2 = ctx.createGain(); g2.gain.value = .22;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + (hold || 2.6));
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(tone); o.start(t); o2.start(t); o.stop(t + (hold || 2.6) + .1); o2.stop(t + (hold || 2.6) + .1);
  }
  function melody() {
    if (!alive) return;
    const sc = night ? PENTN : PENT, n = sc[Math.floor(Math.random() * sc.length)];
    note(n - (Math.random() < .25 ? 12 : 0), .05 + Math.random() * .02, 2.8);
    if (Math.random() < .3) setTimeout(() => alive && note(sc[(sc.indexOf(n) + 2) % sc.length], .035, 2.4), 380 + Math.random() * 300);
    mt = setTimeout(melody, 2400 + Math.random() * 3600);
  }
  // the sea: filtered noise that swells and recedes
  const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = .4;
  const sg = ctx.createGain(); sg.gain.value = .05;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .11; lg.gain.value = .035; lfo.connect(lg); lg.connect(sg.gain);
  const seaMul = ctx.createGain(); seaMul.gain.value = 0;      // the sea is only heard when you come close to the open sea
  ns.connect(bp); bp.connect(sg); sg.connect(seaMul); seaMul.connect(out); ns.start(); lfo.start();
  // rain: soft hiss (filtered noise) + a few tiny drops that plink in the reverb
  const rb = ctx.createBufferSource(); rb.buffer = nb; rb.loop = true; rb.playbackRate.value = .8;
  const rh = ctx.createBiquadFilter(); rh.type = 'highpass'; rh.frequency.value = 900; const rl = ctx.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 5200;
  const rg = ctx.createGain(); rg.gain.value = 0; rb.connect(rh); rh.connect(rl); rl.connect(rg); rg.connect(out); rg.connect(rev); rb.start();
  let rainOn = false, dropT = 0;
  function drops() { if (!alive) return; if (rainOn && !muted) { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1400 + Math.random() * 1300, t); o.frequency.exponentialRampToValueAtTime(700 + Math.random() * 500, t + .06); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012 + Math.random() * .01, t + .004); g.gain.exponentialRampToValueAtTime(.0004, t + .22); o.connect(g); g.connect(tone); o.start(t); o.stop(t + .25); } dropT = setTimeout(drops, 120 + Math.random() * 380); }
  // ---- ambience of the place you are looking at: tiny cartoon voices of children, fiesta murmur and a music box, gulls and swash on the beach, engines and bells in the harbour, sheep and birds on the hills, whales in the open sea
  const zOut = ctx.createGain(); zOut.gain.value = 0; zOut.connect(tone); zOut.connect(rev);
  const Z = { kind: '', lvl: 0 }, R_ = Math.random, PENTZ = [72, 74, 76, 79, 81, 84];
  function voice(f, d, v, fc) {
    const t = ctx.currentTime, o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.12 + R_() * .35), t + d);
    bp.type = 'bandpass'; bp.frequency.value = fc || 800 + R_() * 700; bp.Q.value = 5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(.0005, t + d + .05);
    o.connect(bp); bp.connect(g); g.connect(zOut); o.start(t); o.stop(t + d + .08);
  }
  const babble = (n, base, v) => { for (let i = 0; i < n; i++) setTimeout(() => alive && Z.lvl > .03 && voice(base * (.85 + R_() * .5), .07 + R_() * .08, v || .03), i * (100 + R_() * 90)); };
  const laugh = (base) => { for (let i = 0; i < 4; i++) setTimeout(() => alive && Z.lvl > .03 && voice(base * (1.25 - i * .09), .08, .028, 1100), i * 115); };
  function tone2(f0, f1, d, v, type, hold) {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + d * .5); o.frequency.linearRampToValueAtTime(f0 * 1.05, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + d * .35); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(zOut); o.start(t); o.stop(t + d + .1); return o;
  }
  function whale() { const o = tone2(150 + R_() * 40, 270 + R_() * 60, 5.5, .05, 'sine'); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 4.5; lg.gain.value = 5; l.connect(lg); lg.connect(o.frequency); l.start(); l.stop(ctx.currentTime + 6); const h = tone2(300, 520, 5.5, .012, 'sine'); }
  function gull() { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.linearRampToValueAtTime(950, t + .16); o.frequency.linearRampToValueAtTime(1350, t + .34); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.018, t + .03); g.gain.linearRampToValueAtTime(0, t + .4); o.connect(g); g.connect(zOut); o.start(t); o.stop(t + .45); }
  function swash(v) { const t = ctx.currentTime, b = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); b.buffer = nb; fl.type = 'bandpass'; fl.frequency.value = 500 + R_() * 300; fl.Q.value = .5; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v || .035, t + 1.3); g.gain.linearRampToValueAtTime(0, t + 3); b.connect(fl); fl.connect(g); g.connect(zOut); b.start(t, R_() * 2); b.stop(t + 3.1); }
  function engine() { const t = ctx.currentTime, o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'square'; o.frequency.value = 70 + R_() * 20; fl.type = 'lowpass'; fl.frequency.value = 220; l.frequency.value = 5.5; lg.gain.value = .008; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.014, t + .8); g.gain.linearRampToValueAtTime(0, t + 3.4); l.connect(lg); lg.connect(g.gain); o.connect(fl); fl.connect(g); g.connect(zOut); o.start(t); l.start(t); o.stop(t + 3.5); l.stop(t + 3.5); }
  function bellZ() { const t = ctx.currentTime; for (const [m, d] of [[69, 0], [76, .02]]) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = NOTE(m); o2.frequency.value = NOTE(m) * 2.76; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.022, t + d + .01); g.gain.exponentialRampToValueAtTime(.0004, t + d + 3.2); const g2 = ctx.createGain(); g2.gain.value = .25; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(zOut); o.start(t + d); o2.start(t + d); o.stop(t + d + 3.3); o2.stop(t + d + 3.3); } }
  function bleat() { const t = ctx.currentTime, o = ctx.createOscillator(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(240, t + .5); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 4; l.frequency.value = 26; lg.gain.value = .006; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.014, t + .06); g.gain.linearRampToValueAtTime(0, t + .55); l.connect(lg); lg.connect(g.gain); o.connect(bp); bp.connect(g); g.connect(zOut); o.start(t); l.start(t); o.stop(t + .6); l.stop(t + .6); }
  function chirp() { const n = 2 + Math.floor(R_() * 3), f = 2800 + R_() * 900; for (let i = 0; i < n; i++) setTimeout(() => { if (!alive || Z.lvl < .03) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.25, t + .06); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .01); g.gain.linearRampToValueAtTime(0, t + .09); o.connect(g); g.connect(zOut); o.start(t); o.stop(t + .1); }, i * 120); }
  let mbI = 0; const WALTZ = [72, 76, 79, 76, 84, 79, 76, 74]; function musicbox() { const m = WALTZ[mbI++ % WALTZ.length], t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = NOTE(m); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + .008); g.gain.exponentialRampToValueAtTime(.0004, t + 1.2); o.connect(g); g.connect(zOut); o.start(t); o.stop(t + 1.3); }
  const lastZ = {}; const cool = (k, ms) => { const n = performance.now(); if (lastZ[k] && n - lastZ[k] < ms) return false; lastZ[k] = n; return true; };
  const ZR = {
    kids: [[.9, () => babble(2 + Math.floor(R_() * 3), 520, .03)], [.14, () => laugh(560)]],
    fiesta: [[.55, () => babble(3, 230, .022)], [.8, musicbox], [.15, () => babble(2, 560, .02)]],
    beach: [[.12, () => cool('gull', 5000) && gull()], [.22, () => babble(2, 600, .02)]],
    harbour: [[.07, () => cool('eng', 6000) && engine()], [.05, () => cool('bell', 9000) && bellZ()], [.07, () => cool('gull', 6000) && gull()]],
    village: [[.06, () => cool('bell', 12000) && bellZ()], [.3, () => babble(2, 240, .02)], [.15, chirp]],
    mountain: [[.16, () => cool('bleat', 3500) && bleat()], [.4, chirp]],
    sea: [[.07, () => cool('whale', 9000) && whale()], [.3, () => swash(.04)], [.05, () => cool('gull', 7000) && gull()]],
    ria: [[.03, () => cool('eng', 9000) && engine()], [.06, () => cool('gull', 7000) && gull()]]
  };
  const zt = setInterval(() => { if (!alive || muted || Z.lvl < .05 || !Z.kind) return; for (const [rate, fn] of ZR[Z.kind] || []) if (R_() < rate * .17) fn(); }, 130);
  let mt = 0, pt = 0;
  const api = {
    start() { if (ctx.state === 'suspended') ctx.resume(); out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, 1.6); pad(); pt = setInterval(pad, 8200); mt = setTimeout(melody, 1800); },
    mute(m) { muted = m; out.gain.setTargetAtTime(m ? 0 : .9, ctx.currentTime, .35); if (!m && ctx.state === 'suspended') ctx.resume(); },
    setRain(on) { rainOn = on; rg.gain.setTargetAtTime(on ? .075 : 0, ctx.currentTime, 1.4); rh.frequency.setTargetAtTime(on ? 1100 : 900, ctx.currentTime, 1); sg.gain.setTargetAtTime(on ? .028 : (night ? .07 : .05), ctx.currentTime, 2); if (on) drops(); else clearTimeout(dropT); },
    zone(kind, lvl) { Z.kind = kind; Z.lvl = lvl; seaMul.gain.setTargetAtTime(kind === 'sea' && !muted ? Math.min(1, lvl * 1.3) : 0, ctx.currentTime, .9); zOut.gain.setTargetAtTime(muted ? 0 : lvl * 2.6, ctx.currentTime, .6); },
    setNight(n) { night = n; bp.frequency.setTargetAtTime(n ? 340 : 520, ctx.currentTime, 2); sg.gain.setTargetAtTime(n ? .07 : .05, ctx.currentTime, 2); },
    sfx(name) {
      if (muted || !alive) return;
      const now = performance.now(); if (last[name] && now - last[name] < (name === 'splash' ? 1500 : name === 'hover' ? 70 : 150)) return; last[name] = now;
      if (name === 'open') { note(72, .07, 2.4); setTimeout(() => note(76, .06, 2.4), 140); setTimeout(() => note(79, .06, 2.8), 290); }
      else if (name === 'close') { note(79, .05, 1.6); setTimeout(() => note(72, .05, 2.2), 150); }
      else if (name === 'day') {                                  // sunrise: a slow, soft harp-like rise, a shimmer of bells and a few little birds
        [67, 72, 76, 79, 84, 88].forEach((m, k) => setTimeout(() => alive && note(m, .05 - k * .004, 3.2), k * 190));
        setTimeout(() => { if (!alive || muted) return; const t = ctx.currentTime; for (let k = 0; k < 5; k++) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = NOTE(91 + [0, 2, 4, 7, 9][k]); g.gain.setValueAtTime(0, t + k * .12); g.gain.linearRampToValueAtTime(.012, t + k * .12 + .01); g.gain.exponentialRampToValueAtTime(.0004, t + k * .12 + 1.4); o.connect(g); g.connect(tone); o.start(t + k * .12); o.stop(t + k * .12 + 1.5); } }, 900);
        for (let b = 0; b < 3; b++) setTimeout(() => { if (!alive || muted) return; const t = ctx.currentTime, f = 2900 + Math.random() * 700, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.3, t + .07); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.014, t + .01); g.gain.linearRampToValueAtTime(0, t + .1); o.connect(g); g.connect(tone); g.connect(rev); o.start(t); o.stop(t + .12); }, 1500 + b * 260 + Math.random() * 120);
      }
      else if (name === 'night') { note(69, .07, 2.6); setTimeout(() => note(64, .06, 3), 160); }
      else if (name === 'tick') note(88, .03, .9);
      else if (name === 'boom') { const t = ctx.currentTime, b2 = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); b2.buffer = nb; fl.type = 'lowpass'; fl.frequency.setValueAtTime(420, t + .5); fl.frequency.exponentialRampToValueAtTime(90, t + 1.6); g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(0, t + .5); g.gain.linearRampToValueAtTime(.09, t + .53); g.gain.exponentialRampToValueAtTime(.0005, t + 1.8); b2.connect(fl); fl.connect(g); g.connect(tone); g.connect(rev); b2.start(t + .5, Math.random() * 2); b2.stop(t + 1.9); const w = ctx.createOscillator(), wg = ctx.createGain(); w.type = 'sine'; w.frequency.setValueAtTime(500, t); w.frequency.exponentialRampToValueAtTime(1400, t + .5); wg.gain.setValueAtTime(.012, t); wg.gain.linearRampToValueAtTime(0, t + .5); w.connect(wg); wg.connect(tone); w.start(t); w.stop(t + .55); for (let k = 0; k < 6; k++) setTimeout(() => alive && !muted && note(84 + Math.floor(Math.random() * 12), .012, .35), 650 + k * 90 + Math.random() * 120); }
      else if (name === 'mochi') { [64, 71, 76, 83, 88].forEach((m, k) => setTimeout(() => alive && note(m, .05, 3.4), k * 140)); setTimeout(() => { if (!alive || muted) return; for (let k = 0; k < 3; k++) { const t = ctx.currentTime + k * .13, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(700 + k * 120, t); o.frequency.exponentialRampToValueAtTime(1500 + k * 160, t + .09); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + .2); o.connect(g); g.connect(tone); g.connect(rev); o.start(t); o.stop(t + .25); } }, 760); }
      else if (name === 'mochitalk') { const t = ctx.currentTime, f = 520 + Math.random() * 380, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.1 + Math.random() * .25), t + .06); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + .11); o.connect(g); g.connect(tone); o.start(t); o.stop(t + .13); }
      else if (name === 'mochinext') { [74, 79, 83, 91].forEach((m, k) => setTimeout(() => alive && note(m, .042 - k * .004, 2.2), k * 95)); setTimeout(() => { if (!alive || muted) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(1800, t + .22); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.026, t + .02); g.gain.exponentialRampToValueAtTime(.0005, t + .4); o.connect(g); g.connect(tone); g.connect(rev); o.start(t); o.stop(t + .45); }, 60); }
      else if (name === 'mochiend') { [86, 79, 74, 67].forEach((m, k) => setTimeout(() => alive && note(m, .04 - k * .004, 2.4), k * 120)); }
      else if (name === 'pick') { note(84, .028, 1.2); setTimeout(() => note(91, .022, 1.4), 60); }
      else if (name === 'place') { note(67, .05, 2); setTimeout(() => note(74, .04, 2.2), 70); setTimeout(() => note(79, .03, 2.4), 150); }
      else if (name === 'place_tree') { note(72, .045, 1.6); setTimeout(() => note(76, .035, 1.8), 90); setTimeout(() => note(79, .028, 2), 180); const t = ctx.currentTime, b = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); b.buffer = nb; fl.type = 'bandpass'; fl.frequency.value = 3600; fl.Q.value = .8; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + .05); g.gain.exponentialRampToValueAtTime(.0005, t + .5); b.connect(fl); fl.connect(g); g.connect(tone); b.start(t, Math.random() * 2); b.stop(t + .6); }
      else if (name === 'place_flowers') { [88, 91, 95, 100].forEach((m, k) => setTimeout(() => alive && note(m, .026 - k * .003, 1.2), k * 70)); }
      else if (name === 'place_house') { [55, 59, 62].forEach((m, k) => setTimeout(() => alive && note(m, .05, 2.6), k * 85)); setTimeout(() => alive && note(74, .03, 2.4), 300); }
      else if (name === 'place_horreo') { note(48, .06, .9); setTimeout(() => note(52, .05, .8), 110); setTimeout(() => note(60, .035, 1.4), 230); }
      else if (name === 'place_sheep') { for (let k = 0; k < 2; k++) { const t = ctx.currentTime + k * .27, o = ctx.createOscillator(), lf = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(430 - k * 40, t); o.frequency.linearRampToValueAtTime(330 - k * 30, t + .24); lf.frequency.value = 30; lg.gain.value = .014; lf.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.032, t + .03); g.gain.exponentialRampToValueAtTime(.0006, t + .3); o.connect(g); g.connect(tone); o.start(t); lf.start(t); o.stop(t + .34); lf.stop(t + .34); } }
      else if (name === 'place_lighthouse') { note(79, .05, 3.2); setTimeout(() => note(86, .035, 3.4), 120); setTimeout(() => note(91, .02, 3.6), 260); }
      else if (name === 'place_boat') { api.sfx('splash'); setTimeout(() => { note(72, .04, 1.8); setTimeout(() => note(67, .035, 2), 110); }, 120); }
      else if (name === 'trash') { [79, 72, 65].forEach((m, k) => setTimeout(() => alive && note(m, .03, 1.4), k * 80)); }
      else if (name === 'nope') { note(62, .03, 1.2); }
      else if (name === 'learn') { [72, 76, 79, 83].forEach((m, k) => setTimeout(() => note(m, .04 - k * .004, 2.8), k * 105)); }
      else if (name === 'learnoff') { [83, 79, 74].forEach((m, k) => setTimeout(() => note(m, .03, 1.8), k * 95)); }
      else if (name === 'rain') { note(76, .05, 2.6); setTimeout(() => note(71, .045, 2.8), 160); setTimeout(() => note(67, .04, 3), 330); }
      else if (name === 'sun') { note(79, .05, 2.2); setTimeout(() => note(84, .05, 2.6), 140); setTimeout(() => note(88, .04, 2.8), 280); }
      else if (name === 'hover' || name === 'press') {                       // a soft bubbly "pop": a quick upward glide with a little shimmer on top
        const t = ctx.currentTime, base = [523, 587, 659, 784, 880][Math.floor(Math.random() * 5)] * (name === 'press' ? .75 : 1), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(base * .78, t); o.frequency.exponentialRampToValueAtTime(base * 1.12, t + .09);
        o2.type = 'triangle'; o2.frequency.setValueAtTime(base * 1.5, t); o2.frequency.exponentialRampToValueAtTime(base * 2.1, t + .09);
        const g2 = ctx.createGain(); g2.gain.value = .18; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(name === 'press' ? .07 : .05, t + .012); g.gain.exponentialRampToValueAtTime(.0006, t + (name === 'press' ? .5 : .32));
        o.connect(g); o2.connect(g2); g2.connect(g); g.connect(tone); o.start(t); o2.start(t); o.stop(t + .6); o2.stop(t + .6);
      }
      else if (name === 'splash') {
        const t = ctx.currentTime, b = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); b.buffer = nb; fl.type = 'bandpass'; fl.frequency.setValueAtTime(2200, t); fl.frequency.exponentialRampToValueAtTime(700, t + .5); fl.Q.value = .8;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + .03); g.gain.exponentialRampToValueAtTime(.0005, t + .6); b.connect(fl); fl.connect(g); g.connect(tone); b.start(t, Math.random() * 2); b.stop(t + .7);
      }
    },
    stop() { alive = false; clearInterval(zt); clearTimeout(dropT); clearTimeout(mt); clearInterval(pt); out.gain.setTargetAtTime(0, ctx.currentTime, .5); setTimeout(() => { try { ctx.close(); } catch (e) {} }, 2200); },
    get muted() { return muted; },
    get zoneKind() { return Z.kind; }
  };
  return api;
}

export function open(opts) {
  opts = opts || {};
  injectCss();
  const root = document.createElement('div');
  root.className = 'x-pl';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Ría de Muros e Noia');
  root.innerHTML = '<canvas class="x-pl-cv"></canvas><div class="x-pl-ts x-pl-ts-t"></div><div class="x-pl-ts x-pl-ts-b"></div>' +
    '<div class="x-pl-top"><div class="x-pl-t"><b>Ría de Muros e Noia</b><span>A Coruña</span><span class="x-pl-clock"><em>Local time</em> <b class="x-pl-hh"></b><i>:</i><b class="x-pl-mm"></b><svg class="x-pl-an" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><line class="x-pl-ah" x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line class="x-pl-am" x1="12" y1="12" x2="12" y2="4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span></div><div class="x-pl-btns">' +
    '<button type="button" class="x-pl-mu" aria-label="Sound"></button><button type="button" class="x-pl-rn" aria-label="Rain"></button><button type="button" class="x-pl-dn" aria-label="Day / night"></button>' +
    '<button type="button" class="x-pl-x" aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<button type="button" class="x-pl-more"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l1.7 5 5 1.7-5 1.7L12 17l-1.7-5.1-5-1.7 5-1.7z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg><span>Learn more</span></button>' +
    '<div class="x-pl-mochi" hidden><div class="x-pl-mq"><div class="x-pl-mo"><div class="x-pl-ms"><canvas class="x-pl-mc" width="320" height="262"></canvas></div></div><div class="x-pl-sh"></div></div><div class="x-pl-bub"><p></p><span class="x-pl-go">▾</span></div><button type="button" class="x-pl-cta">Start the tour</button></div>' +
    '<div class="x-pl-info" hidden><button type="button" class="x-pl-ix" aria-label="Cerrar"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button>' +
    '<h2>Ría de Muros e Noia</h2><p class="x-pl-sub">A Coruña · Galicia</p>' +
    '<p>Una de las Rías Baixas, entre el monte Louro y la desembocadura del Tambre. Esta maqueta es una versión simplificada y soñada de su costa.</p>' +
    '<ul><li><b>Muros</b>: villa marinera con soportales de granito, casco antiguo, puerto y pescadores.</li><li><b>Esteiro</b>: aldea de mariscadores con su ensenada y el arenal de Area Maior.</li><li><b>O Freixo y Outes</b>: casas de piedra, el puente medieval de Nafonso sobre el Tambre y las playas de Ancoradoiro y Paramán.</li><li><b>Monte Louro</b>: la montaña sobre la laguna y la playa de dunas de Louro.</li><li><b>Ézaro</b>: el río Xallas se despeña en cascada hasta casi tocar el mar.</li><li><b>Bateas</b> y barquitos: de la ría salen mejillón y pescado todo el año.</li></ul>' +
    '<p class="x-pl-tip">Arrastra para girar · rueda o pellizco para acercarte · N para cambiar de día a noche</p></div>';
  document.body.appendChild(root);
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('x-in')));

  const cv = root.querySelector('.x-pl-cv');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) {
    root.querySelector('.x-pl-more span').textContent = 'Your browser cannot show the 3D map.';
    root.querySelector('.x-pl-x').addEventListener('click', () => { root.remove(); document.documentElement.style.overflow = prevOverflow; opts.onClose && opts.onClose(); });
    return { close() { root.remove(); document.documentElement.style.overflow = prevOverflow; } };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .03, 400);
  const world = new THREE.Group();
  scene.add(world);
  const W = (o) => { world.add(o); return o; };

  // lights stay with the camera, so the sun does not move when the planet turns (the shadows do)
  const HEMI_GROUND = new THREE.Color(0xd8bcd8), hemi = new THREE.HemisphereLight(0xfff4e4, 0xd8bcd8, 1.75); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffeccf, 2.15); sun.position.set(16, 20, 24); scene.add(sun);
  sun.castShadow = true; sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;

  const terrain = buildTerrain(); W(terrain);
  const sea = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 30), new THREE.MeshStandardMaterial({ color: 0x62d0ee, map: seaTex(), transparent: true, opacity: .9, flatShading: true, roughness: .9, metalness: 0 }));
  sea.scale.setScalar((R + SEA) / R); W(sea);
  const seaOrig = sea.geometry.attributes.position.array.slice();
  // white wave crests, only on the open sea (the far side of the planet): little flat foam ribbons that drift, swell and fade
  const crestN = 0, crestGeo = new THREE.IcosahedronGeometry(1, 1), crestMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false }), crests = new THREE.InstancedMesh(crestGeo, crestMat, crestN), crestData = [];
  { const dd0 = new THREE.Vector3(); let n = 0;
    for (let i = 0; i < 9000 && n < crestN; i++) { dd0.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(); const [x, z] = planeOf(dd0); const far = Math.hypot(x, z) > 24 || z > 14.5 || z < -23; if (!far || islandR(x, z) < 1.4) continue; crestData.push({ x, z, yaw: Math.random() * 6.28, sp: .05 + Math.random() * .09, ph: Math.random() * 6.28, w: .22 + Math.random() * .3, drift: (Math.random() - .5) * .05 }); n++; } }
  crests.count = crestData.length; crests.frustumCulled = false; crests.visible = false;
  const spots = [];
  const spot = () => 0;                      // (the planet is only for looking at: no points to click)
  const hubAt = (x, z, lift) => { const o = new THREE.Object3D(); W(put(o, x, z, 0, lift)); return o; };

  // ---- the coast: houses, road, villages
  const slopeAt = (x) => (shore(x + .3) - shore(x - .3)) / .6, seaYaw = (x) => Math.atan2(-slopeAt(x), 1);
  const slopeS = (x) => (shoreS(x + .3) - shoreS(x - .3)) / .6, seaYawS = (x) => Math.atan2(slopeS(x), -1);
  const onShore = (x, inl) => [x, shore(x) - inl], onShoreS = (x, inl) => [x, shoreS(x) + inl];
  let hc = 0;
  const SHUTC = [0x2f6fa8, 0x3b8f6a, 0xa23a30];
  const mk = (floors, extra) => { const k = hc++; return Object.assign({ w: .44 + rnd() * .2, d: .4 + rnd() * .07, floors, wall: WALLS[k % WALLS.length], roof: ROOF[(k * 3 + 1) % ROOF.length], gal: floors > 1 && k % 2 === 0, shut: k % 4 === 0 ? SHUTC[(k >> 2) % 3] : 0, fr: k, turn: (rnd() - .5) * .14 }, extra || {}); };
  // village squares (x range, inland range): houses keep out of them
  let riverPts = [], riverWidths = [], BRIDGE_C = null, riverMat = null; const keptC = [], HOMES = [], STAIRS = [];
  const SQ = [[3.1, 4.7, 6.2, 7.8], [13.4, 15.0, 6.6, 8.2], [-1.9, .9, 3.4, 6.7], [14.3, 16.9, 3.0, 6.1], [-8.7, -6.6, 4.0, 5.7], [-13.95, -11.65, 1.8, 3.55], [-8.9, -7.4, 2.1, 3.4], [1.1, 2.5, 2.1, 3.4], [8.9, 10.4, 2.1, 3.4]];
  const inSq = (x, inl) => SQ.some((q) => x > q[0] && x < q[1] && inl > q[2] && inl < q[3]);
  const JX = [8.3], LINKX = [8.3];
  const roadClear = (x, inl) => LINKX.some((lx) => Math.abs(x - lx) < .65 && inl > .9 && inl < 7.9)  || JX.some((jx) => Math.abs(x - jx) < 1.05 && inl < 2.6 && inl > .5);
  let hk = 0; const thin = () => (hk++ % 5) > 1;
  const hh = (x, inl, floors, extra) => { if (thin() || inSq(x, inl) || roadClear(x, inl) || (cove(x, shore(x) - inl) > .04 && inl < 3.7)) return null; const o = mk(floors, extra); if (o.stone) { o.wall = GRANITE[hc % 3]; o.gal = false; o.roof = ROOF[hc % 3]; } const [px, pz] = onShore(x, inl); const hs = house(o); W(put(hs, px, pz, seaYaw(px) + o.turn, -.02)); return hs; };
  const hhS = (x, inl, floors, extra) => { if (thin() || (x > 3.3 && x < 5.9 && inl > 1.0) || (cove(x, shoreS(x) + inl) > .04 && inl < 3.7)) return null; const o = mk(floors, extra); if (o.stone) { o.wall = GRANITE[hc % 3]; o.gal = false; } const [px, pz] = onShoreS(x, inl); const hs = house(o); W(put(hs, px, pz, seaYawS(px) + o.turn, -.02)); return hs; };
  const shoreEdge = (fn, sg) => (x, off) => fn(x) - sg * off;       // sg -1: land lies to the north of the water line (north coast), +1: to the south
  const lane = std(0xe5dccb), cobble = std(0xcfc6b4);

  // Muros: stone arcades along the front, an old town of granite houses with cobbled lanes, the church with its hórreo, the quay and the seafarers’ quarter
  { const [ax, az] = onShore(-14.6, .62); W(put(arcade(5, .46, .42, true), ax, az, seaYaw(ax), -.02));
    const [bx, bz] = onShore(-11.8, .62); W(put(arcade(4, .46, .42, true), bx, bz, seaYaw(bx), -.02));
    for (const [inl, f] of [[2.15, 2], [3.0, 3], [3.85, 2]]) for (let x = -17.2 + (inl > 2 ? .35 : 0); x < -9.8; x += .74) { if ([-15.6, -13.1, -10.9].some(l => Math.abs(x - l) < .42)) continue; hh(x, inl + rnd() * .12, f, { stone: hc % 5 !== 3 }); }
    const [cx2, cz2] = onShore(-12.8, 2.6); const cr = new THREE.Group();
    for (let k = 0; k < 3; k++) { const st = box(.34 - k * .08, .05, .34 - k * .08, std(0xbdb6a3)); st.position.y = .025 + k * .05; cr.add(st); }
    const sh = box(.045, .5, .045, std(0xc9c3b2)); sh.position.y = .42; cr.add(sh);
    const cb = box(.2, .045, .045, std(0xc9c3b2)); cb.position.y = .56; cr.add(cb);
    W(put(cr, cx2, cz2, 0, -.01));
    const [chx, chz] = onShore(-13.0, 5.2); const ch = church(1.25); W(put(ch, chx, chz, seaYaw(chx), -.03));
    { const [mx, mz] = onShore(-9.6, 6.4); W(put(mercado(), mx, mz, seaYaw(mx), -.02));
      // a round stone square in front of the market, with a fountain and stone houses round it
      { const [qx, qz] = onShore(-9.6, 4.05), sq = new THREE.Group(), pav = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, .04, 32), std(0xd3cbb8)); sq.add(pav);
        const kerb = new THREE.Mesh(new THREE.TorusGeometry(.78, .03, 6, 36), std(0xb7b09e)); kerb.rotation.x = PI / 2; kerb.position.y = .03; sq.add(kerb);
        for (let k = 0; k < 8; k++) { const sp = box(.015, .005, .56, std(0xb7b09e)); sp.rotation.y = k * PI / 8; sp.position.y = .025; sq.add(sp); }
        const fb = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .08, 14), std(0xcfc7b4)); fb.position.y = .06; sq.add(fb); const fw = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .02, 14), std(0x74cfdb, { transparent: true, opacity: .85 })); fw.position.y = .1; sq.add(fw); const fc = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .22, 6), std(0xcfc7b4)); fc.position.y = .17; sq.add(fc);
        sq.userData.fp = .8; sq.userData.pri = 5; W(put(sq, qx, qz, 0, -.03));
        // little fishermen's cottages round the square, each turned to face it
        [[-1.3, 4.05], [1.3, 4.05], [-.95, 2.95], [.95, 2.95], [0, 2.6]].forEach(([dx, inl], k) => { const [hx, hz] = onShore(-9.6 + dx, inl), hs = house({ w: .3, d: .26, floors: 1, wall: [0xf7f1e4, 0xd8e8f0, 0xf6e2b8, 0xf2d4c4, 0xe3efe6][k % 5], roof: [0xc9473a, 0x2f6fa8, 0xe9b94a, 0xc9473a, 0x5fae8a][k % 5], gal: false, shut: [0x2f6fa8, 0xb4483a, 0x4a9a74][k % 3], fr: k + 8, door: 0x2f6fa8 }); hs.userData.pri = 4; hs.userData.fp = .32; W(put(hs, hx, hz, Math.atan2(qx - hx, qz - hz), -.02)); const bar = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .05, 8), std(0x4f8fc0)); const bg = new THREE.Group(); bg.add(bar); bar.position.y = .025; bg.userData.fp = .05; bg.userData.pri = 4; W(put(bg, hx + (qx - hx) * .22, hz + (qz - hz) * .22, 0, -.02)); }); } const [lx, lz] = onShore(-17.2, 2.5); W(put(lonja(), lx, lz, seaYaw(lx), -.02));
      // in front of the lonja, set back from the road: a round stone square with a little fountain and a few stone houses round it
      const [qx, qz] = onShore(-17.2, 4.75), sq = new THREE.Group(), pav = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, .04, 32), std(0xd3cbb8)); pav.position.y = .0; sq.add(pav);
      const kerb = new THREE.Mesh(new THREE.TorusGeometry(.78, .03, 6, 36), std(0xb7b09e)); kerb.rotation.x = PI / 2; kerb.position.y = .03; sq.add(kerb);
      for (let k = 0; k < 8; k++) { const sp = box(.015, .005, .56, std(0xb7b09e)); sp.rotation.y = k * PI / 8; sp.position.y = .025; sq.add(sp); }
      const fb = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .08, 14), std(0xcfc7b4)); fb.position.y = .06; sq.add(fb); const fw = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .02, 14), std(0x74cfdb, { transparent: true, opacity: .85 })); fw.position.y = .1; sq.add(fw); const fc = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .22, 6), std(0xcfc7b4)); fc.position.y = .17; sq.add(fc);
      sq.userData.fp = .95; sq.userData.pri = 5; W(put(sq, qx, qz, 0, -.03));
      [[-1.25, 4.35, .3, 2], [1.25, 4.35, -.3, 1], [-1.65, 3.3, .7, 1], [1.65, 3.3, -.7, 2]].forEach(([dx, inl, yw, fl], k) => { const [hx, hz] = onShore(-17.2 + dx, inl); const hs = house({ w: .42, d: .36, floors: fl, wall: 0xd6d0c0, roof: ROOF[(k + 1) % ROOF.length], gal: false, shut: [0x3d78a8, 0x4a9a74, 0xb4483a][k % 3], fr: k + 3, stone: true }); hs.userData.pri = 4; W(put(hs, hx, hz, seaYaw(hx) + yw, -.02)); });
    }
    const [hx, hz] = onShore(-11.4, 4.5); const hr = horreo(); hr.scale.setScalar(1.15); W(put(hr, hx, hz, seaYaw(hx) + .35, -.02));
    spot('Church and hórreo', 'Old town', 'A granite church with its tall bell tower, and in front of it a hórreo on stone legs: the two pieces that make up the heart of a Galician old town.', ch, .55);
    spot('Muros arcades', 'Soportales', 'The arcades (soportales) of Muros: granite arches along the waterfront, shops at street level and white galleries above, all looking at the sea.', hubAt(-14.6, shore(-14.6) - 1.2, .4), .5);
    spot('Muros old town', 'Casco antiguo', 'Granite houses, narrow cobbled lanes and a stone cruceiro in the little square: the old town of Muros climbs up the slope behind the arcades.', hubAt(-13.1, shore(-13.1) - 2.6, .5), .5); }
  // the quay and the seafarers’ quarter of Muros
  for (let x = -17.2; x < -9.6; x += .52) { const q = new THREE.Group(); q.userData.stoneBlock = 1; q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, shore(x) + .1, 0, .02, true)); }
  for (const x of [-15.0, -10.4]) { const [px, pz] = onShore(x, .5); const shed = house({ w: .36, d: .28, floors: 1, wall: 0xf7f1e4, roof: ROOF[1], gal: false, shut: 0x2f6fa8, fr: 2, chim: false, door: 0x2f6fa8 }); W(put(shed, px, pz, seaYaw(px), -.02)); }
  for (const x of [-13.9, -11.0]) { const [px, pz] = onShore(x, .38); const cs = new THREE.Group(); for (let k = 0; k < 6; k++) { const cr2 = box(.1, .07, .08, std(0x8a6a44)); cr2.position.set((k % 3 - 1) * .11, .035 + Math.floor(k / 3) * .075, 0); cs.add(cr2); } W(put(cs, px, pz, seaYaw(px) + .3, -.01)); }
  for (const x of [-12.4]) { const [px, pz] = onShore(x, .4); const nt = new THREE.Group(); for (const dx of [-.3, .3]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .34, 4), std(0x6b5a46)); pole.position.set(dx, .17, 0); nt.add(pole); } const net = box(.6, .2, .01, std(0x5f8f8a, { transparent: true, opacity: .6 })); net.position.y = .22; nt.add(net); W(put(nt, px, pz, seaYaw(px), -.01)); }
  spot('Seafarers’ quarter', 'Zona marinera', 'By the quay of Muros: the fishermen’s sheds, stacked creels and nets put out to dry, and the small boats that go out every morning.', hubAt(-15.0, shore(-15.0) - .35, .35), .46);

  // Esteiro: houses on both banks of the inlet, the big building at the end of the mole, the bridge, the boats in the inlet
  for (const x of [-9.0, -8.35]) hh(x, 2.2, 2); for (const x of [-8.7, -8.0, -7.3, -9.3]) hh(x, 3.1, 1 + (hc % 2)); hh(-7.0, 2.5, 1);
  for (const x of [-5.6, -5.0, -4.4, -3.8, -3.2]) hh(x, 2.4 + rnd() * .1, 2);
  for (const x of [-5.3, -4.6, -3.9, -3.2]) hh(x, 3.3, 1 + (hc % 2));
  { const [mx, mz] = onShore(-7.75, 1.0); const lonja = new THREE.Group();
    const b1 = box(.95, .26, .56, std(0xcbc6b9)); b1.position.y = .13; lonja.add(b1);
    const b2 = box(.99, .03, .6, std(0x8a8e94)); b2.position.y = .275; lonja.add(b2);
    for (let k = 0; k < 6; k++) { const w2 = box(.09, .06, .02, winMat); w2.position.set(-.4 + k * .16, .17, .29); lonja.add(w2); }
    const dr2 = box(.2, .16, .02, std(0x7a8f9a)); dr2.position.set(0, .09, .29); lonja.add(dr2);
    W(put(lonja, mx, mz, seaYaw(mx), -.02)); }
  for (let s = 0; s < 6; s++) { const x = -8.9 + s * .52, z = shore(x) + .12; const q = new THREE.Group(); q.userData.stoneBlock = 1; q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }
  for (let s = 1; s < 3; s++) { const x = -6.2, z = shore(-6.2) + .12 + s * .52; const q = new THREE.Group(); q.userData.stoneBlock = 1; q.add(box(.5, .5, .46, std(0xb2ac9c))); const c = box(.54, .06, .5, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }
  const stoneM = std(0xb8b19f), deckM = std(0xc9c2b2);
  spot('Esteiro harbour', 'Puerto', 'Esteiro opens onto its own little inlet: houses on both banks, a bridge across the water, boats at anchor in the calm, and the big harbour building at the end of the mole.', hubAt(-7.0, shore(-7.0) - 1.1, .5), .5);

  // O Freixo: the houses round the pier
  for (const x of [-.8, -.2, .4, 2.6, 3.2]) hh(x, .62, 1 + (hc % 2)); for (const x of [-.6, .1, .8, 2.2, 2.9, 3.5]) hh(x, 2.15, 2); for (const x of [-.2, .6, 1.4, 2.4]) hh(x, 3.3, 1 + (hc % 2));
  // Outes: bigger, up the slope
  for (let x = 7.7; x < 12.9; x += .68) hh(x, .62 + rnd() * .04, 2);
  for (let x = 8.0; x < 12.9; x += .72) hh(x, 2.15 + rnd() * .08, 2 + (hc % 2));
  for (let x = 8.4; x < 12.5; x += .8) hh(x, 3.35 + rnd() * .1, 2);
  { const [px, pz] = onShore(10.1, 4.8); const ch = church(1.3); W(put(ch, px, pz, seaYaw(px), -.03));
    const [hx, hz] = onShore(11.5, 4.3); const hr = horreo(); W(put(hr, hx, hz, seaYaw(hx) - .3, -.02));
    spot('Outes church', 'Iglesia', 'The church of Outes, on the slope above the houses, with the hills of the interior behind and the ría in front.', ch, .55); }
  // a few houses behind the beaches of the east coast, and a farm
  for (const x of [15.0, 15.9, 16.8, 17.7, 18.6, 19.3]) hh(x, 2.3 + rnd() * .3, 1 + (hc % 2));
  for (const x of [15.4, 16.5, 17.6, 18.9]) hh(x, 3.4 + rnd() * .3, 2);
  // farms and hórreos between the villages
  for (const [fx, inl] of [[-2.4, 4.6]]) {
    hh(fx, inl, 2); hh(fx + .75, inl + .4, 1); const [hx, hz] = onShore(fx + .3, inl + 1.0); const hr = horreo(); W(put(hr, hx, hz, seaYaw(hx) + .2, -.02));
  }

  // ---- the pier of O Freixo with its light, and a breakwater
  const pier = new THREE.Group(); W(pier);
  const pierX = 1.5, shoreZ = shore(pierX), PIER_LEN = 4.6;
  for (let s = 0; s * .5 < PIER_LEN; s++) {
    const z = shoreZ - .6 + s * .5, p = new THREE.Group(); p.userData.stoneBlock = 1; p.add(box(.4, .6, .6, std(0xb2ac9c))); const top = box(.46, .08, .6, std(0xd0cabb)); top.position.y = .34; p.add(top);
    pier.add(put(p, pierX, z, 0, .02, true));
    if (s % 2 === 1) { const bol = new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, .12, 6), std(0x2b3036)); bol.position.y = .44; const pb = new THREE.Group(); pb.add(bol); pier.add(put(pb, pierX + .15, z, 0, .02, true)); }
  }
  const endZ = shoreZ - .6 + (Math.ceil(PIER_LEN / .5) - 1) * .5;
  const lh = new THREE.Group();
  const lbase = new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, .7, 10), std(0xf3f1ea)); lbase.position.y = .35; lh.add(lbase);
  const lband = new THREE.Mesh(new THREE.CylinderGeometry(.16, .17, .16, 10), std(0xc23b2e)); lband.position.y = .42; lh.add(lband);
  const lroom = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .14, 10), lampMat); lroom.position.y = .77; lh.add(lroom);
  const lroof = new THREE.Mesh(new THREE.ConeGeometry(.19, .2, 10), std(0x2b3036)); lroof.position.y = .94; lh.add(lroof);
  pier.add(put(lh, pierX, endZ, 0, .34, true));
  const lamp = new THREE.PointLight(0xffd36b, 0, 6, 1.6); lamp.position.set(0, .78, 0); lh.add(lamp);
  for (let s = 0; s < 8; s++) { const t = s / 7, x = 2.9 + t * 2.0, z = shore(x) + .25 + Math.sin(t * 1.5) * 1.0; const p = new THREE.Group(); const b = box(.5, .5, .6, std(0xb2ac9c)); b.rotation.y = .5 - t * .6; p.add(b); W(put(p, x, z, 0, .02, true)); }
  spot('O Freixo pier', 'Muelle', 'The pier of O Freixo reaches out into the ría. The boats tie up along it and, at its end, a small light shows the way in at night.', lh, .5);

  // ---- the old stone bridge of Outes (Ponte Nafonso) and the river
  // ---- roads (joined to every village), promenades and street lamps
  const smooth = (fn, a, b, off) => { const out = []; for (let x = a; x <= b; x += .22) { let zz = 0; for (let k = -3; k <= 3; k++) zz += fn(x + k * .22); out.push([x, zz / 7 + off]); } return out; };
  const roadN = smooth(shore, -17.8, 19.6, -1.4), roadS = smooth(shoreS, -12.1, 7.6, 1.45);
  // near the beaches the roads keep further back from the water, so the sand has room for people, parasols and the kiosk
  for (const q of roadN) q[1] -= 1.1 * Math.min(1, cove(q[0], q[1]) * 1.6) * (1 - gs(q[0], 1.8, 1.0)) * sstep(21, 18.6, q[0]) * sstep(-19.2, -17.6, q[0]); for (const q of roadS) q[1] += 1.1 * Math.min(1, cove(q[0], q[1]) * 1.6) * sstep(9, 7.4, q[0]) * sstep(-13.5, -12, q[0]);
  { const sm = (r) => { for (let k = 0; k < 6; k++) for (let i = 1; i < r.length - 1; i++) { r[i][1] = (r[i - 1][1] + 2 * r[i][1] + r[i + 1][1]) / 4; } }; sm(roadN); sm(roadS); for (let k = 0; k < 40; k++) for (let i = 1; i < roadN.length - 1; i++) if (roadN[i][0] > 11.5) roadN[i][1] = (roadN[i - 1][1] + 2 * roadN[i][1] + roadN[i + 1][1]) / 4; }
  const walkMat = std(0xe2cba0, { roughness: 1, side: THREE.DoubleSide }), asphalt = std(0x808a98, { roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), lineMat = std(0xf4f0e4, { roughness: 1, side: THREE.DoubleSide }), pathMat = std(0xeee5d0, { roughness: 1, side: THREE.DoubleSide });
  const sideOf = (pts, d) => pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1; return [q[0] - tz / l * d, q[1] + tx / l * d]; });
  const relax = (pts, passes) => { let q = pts; for (let k = 0; k < passes; k++) q = q.map((p, i) => (i === 0 || i === q.length - 1) ? p : [(q[i - 1][0] + 2 * p[0] + q[i + 1][0]) / 4, (q[i - 1][1] + 2 * p[1] + q[i + 1][1]) / 4]); return q; };
  const roadList = [], roadMeshes = [], rcDown = new THREE.Raycaster(), _ro = new THREE.Vector3(), _rd = new THREE.Vector3(), _rp = new THREE.Vector3();
  // how high the asphalt really is under a point (cars and bikes ride on the surface itself, never sunk into it)
  const roadLift = (x, z, fb) => {
    if (!roadMeshes.length) return fb; dirFrom(x, z, _rd); _ro.copy(_rd).multiplyScalar(R + 1.0).applyMatrix4(world.matrixWorld); _rd.transformDirection(world.matrixWorld).negate(); rcDown.set(_ro, _rd); rcDown.far = 2.4;
    const h = rcDown.intersectObjects(roadMeshes, false)[0]; if (!h) return fb; _rp.copy(h.point); world.worldToLocal(_rp); return _rp.length() - R - groundH(x, z);
  };
  const buildRoad = (pts, up) => { roadList.push([pts, up || 0]); };
  const flushRoads = () => {
    // every road is laid at the same height, all the pavements first and all the asphalt above them, so crossings and junctions merge with no seams
    for (const [pts] of roadList) { const m = ribbon(pts, .56, walkMat, .03, false, undefined, true); m.renderOrder = 1; W(m); }
    for (const [pts] of roadList) { const m = ribbon(pts, .4, asphalt, .05, false, undefined, true); m.renderOrder = 2; W(m); roadMeshes.push(m); }
  };
  // the roundabout: a flat ring (pavement + asphalt + grass island) where the coast road is cut; the cars follow the inland half of the ring
  const RB = 0.62, roadRaw = relax(roadN, 4);
  for (const jx of JX) {
    let c = 0; for (let q = 0; q < roadN.length; q++) if (Math.abs(roadN[q][0] - jx) < Math.abs(roadN[c][0] - jx)) c = q;
    const z0 = roadRaw[c][1];
    for (let q = 0; q < roadN.length; q++) { const dx = roadN[q][0] - jx; if (Math.abs(dx) <= RB) roadN[q] = [roadN[q][0], z0 - Math.sqrt(Math.max(0, RB * RB - dx * dx)) * .9]; }
    roadN.rb = roadN.rb || []; roadN.rb.push([jx, z0]);
  }
  { const rn = relax(roadN, 3); rn.rb = roadN.rb; roadN.length = 0; rn.forEach((q) => roadN.push(q)); }
  { const cut = [[]]; for (const q of roadRaw) { if (roadN.rb.some(([jx, z0]) => Math.hypot(q[0] - jx, q[1] - z0) < RB - .08)) { if (cut[cut.length - 1].length) cut.push([]); } else cut[cut.length - 1].push(q); } for (const part of cut) if (part.length > 2) buildRoad(part); }
  for (const [jx, z0] of roadN.rb) {
    const hb = Math.max(groundH(jx, z0), .07), mk = (r0, r1, mat, lift) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48, 1), mat); m.rotation.x = -PI / 2; m.userData.ribbon = true; const g = new THREE.Group(); g.add(m); W(put(g, jx, z0, 0, hb + lift, true)); return m; };
    const lift0 = -SEA;
    mk(RB - .27, RB + .34, new THREE.MeshStandardMaterial({ color: 0xe2cba0, roughness: 1, side: THREE.DoubleSide }), lift0 + .012);
    roadMeshes.push(mk(RB - .2, RB + .2, new THREE.MeshStandardMaterial({ color: 0x808a98, roughness: 1, side: THREE.DoubleSide }), lift0 + .03));
    const isl2 = new THREE.Mesh(new THREE.CylinderGeometry(RB - .3, RB - .27, .05, 28), std(0x7fb35a)); const ig = new THREE.Group(); ig.add(isl2);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.015, .02, .16, 6), std(0x7a5a3c)); tr.position.y = .1; ig.add(tr); const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.11, 2), std(0x3f9576, { flatShading: true })); cr.position.y = .24; ig.add(cr);
    W(put(ig, jx, z0, 0, hb + .04, true));
  }
  buildRoad(roadS);
  // each coast road now stops short of the sea, in a little car park with a couple of cars parked in their bays
  const parked = [];
  for (const [rd, atEnd] of [[roadN, true], [roadN, false], [roadS, true], [roadS, false]]) {
    const e = atEnd ? rd[rd.length - 1] : rd[0], p2 = atEnd ? rd[rd.length - 3] : rd[2], dx = e[0] - p2[0], dz = e[1] - p2[1], dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
    const cx = e[0] + ux * .5, cz = e[1] + uz * .5, hb = Math.max(groundH(cx, cz), .07), yaw = Math.atan2(-uz, ux);
    if (groundH(cx, cz) < -.02) continue;
    const lot = new THREE.Group(), slab = box(.8, .02, 1.25, std(0xdcd0b8)); slab.position.y = -.005; lot.add(slab); const tar = box(.74, .02, 1.17, std(0x808a98)); tar.position.y = .01; lot.add(tar);
    for (let i = 0; i < 4; i++) { const ln = box(.5, .006, .018, std(0xf6f0e2)); ln.position.set(-.04, .022, -.5 + i * .33); lot.add(ln); }
    lot.userData.fp = .75; lot.userData.pri = 4; W(put(lot, cx, cz, yaw, hb + .05 - SEA, true));
    [[0xe9577a, -.33], [0x4f8fc0, .0], [0xf2c14a, .33]].slice(0, atEnd ? 2 : 3).forEach(([col, off], k) => { if (k === 2 && roadN === rd) return; const pc = car(col, false); pc.scale.setScalar(.58); const pg = new THREE.Group(); pg.add(pc); parked.push(pg); const ox = -cz * 0, qx = cx + (-uz) * off * -1, qz = cz + ux * off * -1; W(put(pg, cx - uz * off, cz + ux * off, yaw + PI / 2 + (k % 2 ? PI : 0), hb + .062 - SEA, true)); });
  }
  const linkRoads = [];
  const inlRoute = null;
  // street lamps in the style of the reference: tall dark posts with a double-headed arm, one every little while along the coast roads,
  // strung together with a sagging cable
  const lampOf = (x, z, yaw) => {
    const lp = new THREE.Group(), dk = std(0x2f3a45);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.009, .015, .5, 6), dk); pole.position.y = .25; lp.add(pole);
    const arm = box(.15, .012, .012, dk); arm.position.y = .505; lp.add(arm);
    for (const sx of [-1, 1]) {
      const hd = new THREE.Mesh(new THREE.CylinderGeometry(.018, .03, .016, 8), dk); hd.position.set(sx * .075, .512, 0); lp.add(hd);
      const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(.014, 1), lampMat); bulb.position.set(sx * .075, .5, 0); lp.add(bulb);
      const halo = new THREE.Sprite(lampGlow); halo.scale.set(.3, .3, 1); halo.position.set(sx * .075, .49, 0); lp.add(halo);        // the glow round each lamp at night
    }
    const pool = new THREE.Mesh(poolG, lampPool); pool.rotation.x = -PI / 2; pool.position.set(0, .012, 0); pool.userData.ribbon = true; lp.add(pool);       // and a pool of light on the ground
    return W(put(lp, x, z, yaw, 0));
  };
  const lampGlow = new THREE.SpriteMaterial({ map: glowTex(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), lampPool = new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }); lampMats.push(lampGlow, lampPool);
  const poolG = new THREE.CircleGeometry(.4, 32);
  const lampLine = (pts, step, off) => {
    const made = [];
    for (let i = 3; i < pts.length - 3; i += step) {
      const a = pts[i - 1], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], dl = Math.hypot(dx, dz) || 1, nx = -dz / dl, nz = dx / dl;
      let best = null; for (const sd of [-1, 1]) { const x = pts[i][0] + nx * off * sd, z = pts[i][1] + nz * off * sd, h = groundH(x, z); if (h > .06 && inletD(x, z) > .6 && (!best || h > best[2])) best = [x, z, h]; }
      if (best) made.push(lampOf(best[0], best[1], Math.atan2(-dz, dx) + PI / 2));
    }
    const cm = std(0x2b3036);
    for (let k = 1; k < made.length; k++) {
      const A = made[k - 1].position, B = made[k].position; if (A.distanceTo(B) > 1.7) continue;
      const a = A.clone().addScaledVector(A.clone().normalize(), .5), b = B.clone().addScaledVector(B.clone().normalize(), .5), mid = a.clone().add(b).multiplyScalar(.5);
      mid.addScaledVector(mid.clone().normalize(), -.05);
      for (const off2 of [-.022, .022]) { const sh = a.clone().sub(b).cross(a.clone().normalize()).normalize().multiplyScalar(off2); W(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone().add(sh), mid.clone().add(sh), b.clone().add(sh)]), 8, .0035, 4), cm)); }
    }
  };
  lampLine(roadN, 9, .36); lampLine(roadS, 10, .36);
  // mountain roads: winding up Monte Louro and the hill above Outes, with a little chapel at the top of each
  const winding = (a, b, amp, turns) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len, n = Math.round(len / .2), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, w = Math.sin(t * PI * 2 * turns) * amp * Math.pow(Math.sin(Math.min(1, t * 2.5) * PI / 2), 2) * (1 - t * .5); pts.push([a[0] + dx * t + nx * w, a[1] + dz * t + nz * w]); }
    return relax(pts, 14);
  };
  const nearOn = (road, x) => road.reduce((m, p) => Math.abs(p[0] - x) < Math.abs(m[0] - x) ? p : m);
  const mtRoads = [];
  flushRoads();
  // the bridges carry the road itself: same line, same width, arches under it
  const roadBridge = (road, x, len) => {
    let k = 1; for (let q = 1; q < road.length - 1; q++) if (Math.abs(road[q][0] - x) < Math.abs(road[k][0] - x)) k = q;
    const a = road[k - 1], b = road[k + 1], yaw = Math.atan2(-(b[1] - a[1]), b[0] - a[0]), st = std(0xb4ad9a), g = new THREE.Group();
    const slab = box(len, .09, .64, st); slab.position.y = .03 - SEA - .045 + .045 - .045 + .045 - .0 ; slab.position.y = 0; g.add(slab);
    for (const sz of [-1, 1]) { const pr = box(len, .07, .045, std(0xc9c2ae)); pr.position.set(0, .06, sz * .335); g.add(pr); }
    for (let q = -1; q <= 1; q += 2) { const pier = box(.1, .26, .5, st); pier.position.set(q * len * .3, -.17, 0); g.add(pier); }
    W(put(g, road[k][0], road[k][1], yaw, .07 - SEA - .045 - .005 + .03 - .03, true));
  };
  roadBridge(roadRaw, INLET[0][0], 1.3); roadBridge(roadRaw, INLET2[0][0], 1.5);
  { const rs = relax(roadS, 3); roadBridge(rs, INLET3[0][0], 1.3); }
  const routes = [route(roadN), route(roadS)];
  // the river of Outes keeps going up the hillside, getting narrower and narrower until it is a thread
  const RIVER2 = relax([[INLET2[2][0], INLET2[2][1] + .2], [INLET2[3][0], INLET2[3][1] + .1], [5.5, -7.2], [6.6, -8.5], [7.9, -9.0], [8.4, -10.3], [9.8, -10.7], [10.2, -12.0], [11.3, -12.4]], 0);
  { const dense = []; for (let i = 0; i < RIVER2.length - 1; i++) for (let k = 0; k < 6; k++) dense.push([RIVER2[i][0] + (RIVER2[i + 1][0] - RIVER2[i][0]) * k / 6, RIVER2[i][1] + (RIVER2[i + 1][1] - RIVER2[i][1]) * k / 6]); dense.push(RIVER2[RIVER2.length - 1]);
    const sm = relax(dense, 6), n = sm.length, widths = sm.map((_, i) => .78 * Math.pow(1 - i / (n - 1), 1.25) + .05);
    riverPts = sm; riverMat = std(0x62d0ee, { transparent: true, opacity: .9, roughness: .9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }); W(ribbonW(sm, widths, riverMat, .03));
    riverWidths = widths; }
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false, side: THREE.DoubleSide });
  function car(color, bus) {
    // a chubby little toy car: rounded body and cabin, big dark windows, round headlights, tail lights and fat wheels
    const g = new THREE.Group(), L = bus ? .5 : .3, body = std(color), hl = std(0xfff0b8, { emissive: 0xffe9a0, emissiveIntensity: .35 }), tl = std(0xe0584a);
    const bd = box(L, bus ? .13 : .085, bus ? .18 : .16, body); bd.position.y = bus ? .1 : .075; g.add(bd);
    if (!bus) {
      const ca = box(.17, .075, .14, body); ca.position.set(-.03, .15, 0); g.add(ca);
      const ws = box(.178, .05, .146, winMat); ws.position.set(-.03, .152, 0); g.add(ws);                       // the dark windows run right round the cabin
      const roof = box(.18, .016, .146, body); roof.position.set(-.03, .192, 0); g.add(roof);
    } else { const ws = box(L * .9, .05, .184, winMat); ws.position.set(0, .125, 0); g.add(ws); }
    for (const sz of [-1, 1]) {
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(.02, 1), hl); h.scale.set(.6, 1, 1); h.position.set(L / 2 - .004, .08, sz * .055); g.add(h);
      const t = new THREE.Mesh(new THREE.IcosahedronGeometry(.016, 1), tl); t.scale.set(.6, 1, 1); t.position.set(-L / 2 + .004, .08, sz * .055); g.add(t);
    }
    for (const [wx, wz] of [[-L * .3, -.08], [L * .3, -.08], [-L * .3, .08], [L * .3, .08]]) {
      const wl = new THREE.Mesh(new THREE.CylinderGeometry(.034, .034, .034, 12), std(0x1d1f23)); wl.rotation.x = PI / 2; wl.position.set(wx, .034, wz); g.add(wl);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .036, 8), std(0xe6e2d6)); hub.rotation.x = PI / 2; hub.position.set(wx, .034, wz); g.add(hub);
    }
    return g;
  }
  const cars = [];
  // every lane carries its cars at one speed and evenly spaced, so a car never catches up with the one in front
  const addCars = (ri, dir, n, speed, colors, bus, ping) => {
    for (let k = 0; k < n; k++) {
      const m = car(colors[k % colors.length], bus && k === 0), w = new THREE.Group(); m.scale.setScalar(.64); w.add(m); W(w);
      cars.push({ w, r: routes[ri], u: (k + (dir > 0 ? .1 : .6)) / n, v: speed * dir, off: dir > 0 ? .095 : -.095, ping: !!ping });
    }
  };
  function bike(shirt, col) {
    const g = new THREE.Group(), tire = std(0x2b3036), fr = std(col);
    for (const x of [-.09, .09]) { const w = new THREE.Mesh(new THREE.TorusGeometry(.045, .008, 8, 20), tire); w.position.set(x, .05, 0); g.add(w);   /* wheels stand along the road: round seen from the side */
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .02, 6), fr); hub.rotation.x = PI / 2; hub.position.set(x, .05, 0); g.add(hub); }
    const bar = box(.2, .008, .008, fr); bar.position.set(0, .085, 0); bar.rotation.z = -.2; g.add(bar); const bar2 = box(.11, .008, .008, fr); bar2.position.set(-.03, .06, 0); bar2.rotation.z = .9; g.add(bar2);
    const hb = box(.008, .008, .06, tire); hb.position.set(.095, .12, 0); g.add(hb);
    const rd = person(shirt, { skin: SKINS[0], role: 'bike', hat: 0xe9e2d2 }); rd.scale.setScalar(.62); rd.position.set(-.02, .06, 0); g.add(rd);
    return g;
  }
  const addBikes = (ri, dir, n, speed, off) => {
    for (let k = 0; k < n; k++) { const m = bike(SHIRTS[(k * 3 + ri + (dir > 0 ? 1 : 4)) % SHIRTS.length], [0xd9473a, 0x2f6fa8, 0x3b9a6a, 0xf2c14a][(k + ri) % 4]), w = new THREE.Group(); m.scale.setScalar(.9); w.add(m); W(w); cars.push({ w, r: routes[ri], u: (k + (dir > 0 ? .35 : .85)) / n, v: speed * dir, off: dir > 0 ? off : -off, ping: false, bike: true }); }
  };
  addBikes(0, 1, 3, .2, .165); addBikes(0, -1, 2, .19, .165); addBikes(1, 1, 1, .18, .165); addBikes(1, -1, 1, .17, .165);
  addCars(0, 1, 5, .5, [0xc23b2e, 0xf2efe6, 0x2f6fa8, 0xe9b94a, 0x3b8f6a]);
  addCars(0, -1, 4, .5, [0xd0744a, 0xf2efe6, 0x3a3f47, 0xc23b2e], true);
  addCars(1, 1, 2, .45, [0x2f6fa8, 0xe9b94a]);
  addCars(1, -1, 2, .45, [0xc23b2e, 0xf2efe6]);
  

  // ---- the south coast across the ría: Louro, its dune beach and lagoon, the mountain, a second village and farms
  for (let x = -10.2; x < -6.2; x += .72) hhS(x, .62, 1 + (hc % 2)); for (let x = -9.8; x < -6.4; x += .78) hhS(x, 2.15, 2); hhS(-8.6, 3.2, 1);
  for (let x = 2.0; x < 5.8; x += .72) hhS(x, .62, 1 + (hc % 2)); for (let x = 2.4; x < 5.6; x += .8) hhS(x, 2.15, 2);
  for (const [fx, inl] of [[-2.4, 3.1]]) { hhS(fx, inl, 2); hhS(fx + .7, inl + .4, 1); const [hx, hz] = onShoreS(fx + .3, inl + 1.0); const hr = horreo(); W(put(hr, hx, hz, seaYawS(hx) + .2, -.02)); }
  for (let s = 0; s < 5; s++) { const x = 2.2 + s * .52, z = shoreS(x) - .12; const q = new THREE.Group(); q.userData.stoneBlock = 1; q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }

  // ---- boats: smaller than before; every one has its own place (anchored, moored) or its own lane, so none touches another
  const boats = [], sailers = [], occupied = [];
  function boat(color, trim, kind) {
    const g = new THREE.Group();
    const sh = new THREE.Shape();
    sh.moveTo(-.4, .13); sh.lineTo(-.34, -.05); sh.lineTo(.2, -.06); sh.lineTo(.5, .17); sh.lineTo(.1, .12); sh.closePath();
    const hg = new THREE.ExtrudeGeometry(sh, { depth: .27, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2 }); hg.translate(0, 0, -.135);
    g.add(new THREE.Mesh(hg, std(color)));
    const deck = box(.85, .02, .22, std(0xe9e2d2)); deck.position.set(.02, .125, 0); g.add(deck);
    if (kind === 'trawler') {
      const h2 = new THREE.Mesh(hg, std(color)); h2.scale.set(1.5, 1.15, 1.35); g.add(h2);
      const dk = box(1.15, .02, .3, std(0xdad4c4)); dk.position.set(.02, .2, 0); g.add(dk);
      const wh = box(.3, .2, .24, std(0xf2efe6)); wh.position.set(.32, .31, 0); g.add(wh); const wr = box(.32, .03, .26, std(trim)); wr.position.set(.32, .42, 0); g.add(wr);
      const ww = box(.02, .07, .22, winMat); ww.position.set(.475, .33, 0); g.add(ww);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.014, .02, .7, 6), std(0x59514a)); mast.position.set(-.1, .55, 0); g.add(mast);
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .55, 4), std(0x59514a)); boom.rotation.z = PI / 2 - .5; boom.position.set(-.3, .6, 0); g.add(boom);
      const dr = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .24, 10), std(0xd26a3a)); dr.rotation.x = PI / 2; dr.position.set(-.38, .3, 0); g.add(dr);
      return g;
    }
    if (kind === 'sail') {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, .85, 6), std(0x59514a)); mast.position.set(.08, .55, 0); g.add(mast);
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([.07, .16, 0, .07, .92, .0, -.36, .18, .0, .09, .22, 0, .09, .8, .02, .44, .2, .03]), 3)); sg.computeVertexNormals();
      g.add(new THREE.Mesh(sg, std(0xffffff, { side: THREE.DoubleSide })));
      return g;
    }
    const cab = box(.22, .15, .18, std(trim)); cab.position.set(-.12, .21, 0); g.add(cab);
    const cw = box(.025, .06, .19, winMat); cw.position.set(-.012, .23, 0); g.add(cw);
    if (kind !== 'fisher') { const mast = new THREE.Mesh(new THREE.CylinderGeometry(.012, .014, .5, 5), std(0x59514a)); mast.position.set(.14, .38, 0); g.add(mast); const boom = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .34, 4), std(0x59514a)); boom.rotation.z = PI / 2; boom.position.set(-.01, .48, 0); g.add(boom); }
    return g;
  }
  const BOATS = [[0xf2efe6, 0x2f6fa8], [0x2f6fa8, 0xf2efe6], [0xc9473a, 0xf2efe6], [0xe9b94a, 0x2f6fa8], [0x3b8f6a, 0xf2efe6], [0xf2efe6, 0xc9473a]];
  const BAT = [[-15.8, 6.9, .1], [11.6, 5.4, 0], [-16.4, 2.6, .2]];
  for (const b of BAT) for (const dx of [-.7, 0, .7]) occupied.push([b[0] + dx, b[1]]);
  let bi = 0;
  const free = (x, z, r) => occupied.every((o) => Math.hypot(o[0] - x, o[1] - z) > r);
  const moor = (x, z, yaw, sc, kind, r) => {
    r = r || .95;
    for (let k = 0; k < 24 && !free(x, z, r); k++) { x += Math.cos(k * 2.4) * (.2 + k * .06); z += Math.sin(k * 2.4) * (.2 + k * .06); }
    if (!free(x, z, r) || [[0, 0], [.3, 0], [-.3, 0], [0, .3], [0, -.3], [.22, .22], [-.22, -.22], [.22, -.22], [-.22, .22]].some(([dx, dz]) => groundH(x + dx, z + dz) > -.17 || inletD(x + dx, z + dz) < .35)) return null;
    occupied.push([x, z]);
    const bc = BOATS[bi++ % BOATS.length], b = boat(bc[0], bc[1], kind); b.scale.setScalar(sc || 1);
    const w = new THREE.Group(); w.add(b);
    if (kind === 'fisher') {                          // a fisherman on the deck with his rod and line
      const p = person(SHIRTS[bi % SHIRTS.length], { hat: [0xf2c14a, 0xe9e2d2, 0x2f6fa8][bi % 3], skin: SKINS[bi % 4], role: 'fish' }); p.position.set(.28, .13, .05); p.scale.setScalar(.9); b.add(p);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(.004, .006, .5, 4), std(0x6b4a2a)); rod.position.set(.46, .32, .08); rod.rotation.z = -.9; b.add(rod);
      const line = new THREE.Mesh(new THREE.CylinderGeometry(.0015, .0015, .33, 3), std(0xffffff)); line.position.set(.65, .16, .08); b.add(line);
    }
    put(w, x, z, yaw, 0, true); W(w); boats.push({ w, b, ph: rnd() * 6.28, base: 0 });
    return w;
  };
  // fishermen at anchor in the calm water, well apart from each other
  [[-3.4, .9, 1.3], [4.8, .8, 1.9], [-12.2, .3, .5], [10.8, 1.0, 2.8], [-5.5, 9.4, 1.1], [3.5, 9.3, 2.0]].forEach((b) => moor(b[0], b[1], b[2], .8, 'fisher', 1.5));
  const m1 = moor(pierX - .55, shoreZ + 1.2, PI / 2 + .06, 1, undefined, .62); moor(pierX + .55, shoreZ + 1.6, PI / 2 - .08, 1, undefined, .62);
  for (const x of [-15.4, -12.6]) moor(x, shore(x) + .75, 1.6 + (rnd() - .5) * .3, .9, undefined, .7);
  for (let k = 0; k < 2; k++) moor(INLET[0][0] + (k % 2 ? .12 : -.12), shore(INLET[0][0]) - .3 - k * .4, PI / 2 + (rnd() - .5) * .2, .7, undefined, .3);
  // boats on the move, each kind on its own lane (a loop along the ría), equally spaced so that they never catch up with one another
  const sail = (kind, cx, cz, rx, rz, sp, ph, ci, sc) => {
    const bc = BOATS[ci % BOATS.length], b = kind === 'sail' ? boat(0xf2efe6, 0, 'sail') : kind === 'trawler' ? boat(bc[0], bc[1], 'trawler') : boat(bc[0], bc[1]); b.scale.setScalar(sc);
    const w = new THREE.Group(); w.add(b); W(w);
    const clear = (k) => { for (let q = 0; q < 72; q++) { const a = q / 72 * PI * 2, x = cx + rx * k * Math.cos(a), z = cz + rz * k * Math.sin(a); for (const [dx, dz] of [[0, 0], [.35, 0], [-.35, 0], [0, .35], [0, -.35]]) if (groundH(x + dx, z + dz) > -.17 || inletD(x + dx, z + dz) < .4) return false; } return true; };
    let k = 1; while (k > .12 && !clear(k)) k -= .08; if (k <= .12) { world.remove(w); return; }
    sailers.push({ w, b, cx, cz, rx: rx * k, rz: rz * k, sp, a: ph, ph: rnd() * 6.28 });
  };
  const loopLane = (cx, cz, rx, rz, sp, n, kinds, sc) => { for (let k = 0; k < n; k++) sail(kinds[k % kinds.length], cx, cz, rx, rz, sp, k * 2 * PI / n, k + 2, sc); };
  loopLane(-3.5, 4.4, 11, .4, .04, 1, ['trawler'], .75);
  loopLane(-3, 6.2, 10, .5, -.034, 1, ['sail'], 1.0);
  // open sea (beyond the ría, round the far side of the planet): bigger fishing boats on two wide rings
  loopLane(0, 0, 31, 31, .03, 2, ['trawler'], .95);
  loopLane(0, 0, 35, 35, -.025, 2, ['trawler'], 1.05);
  spot('Fishing boats', 'Pesca', '', m1, .5);

  // ---- bateas: the floating wooden rafts of the Galician rías, with their buoys
  const bateas = [];
  for (const [x, z, yaw] of BAT) {
    const g = new THREE.Group();
    const deck = box(1.3, .06, .8, std(0x7a6650)); deck.position.y = .02; g.add(deck);
    for (const [bx, bz] of [[-.6, -.36], [.6, -.36], [-.6, .36], [.6, .36], [0, -.38], [0, .38]]) { const bu = new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 1), std(0xf2efe6)); bu.position.set(bx, .0, bz); g.add(bu); }
    const hut2 = box(.26, .17, .2, std(0xe9b94a)); hut2.position.set(-.4, .13, 0); g.add(hut2);
    const w = new THREE.Group(); w.add(g); put(w, x, z, yaw, 0, true); W(w);
    boats.push({ w, b: g, ph: rnd() * 6.28, base: 0, calm: true }); bateas.push(w);
  }

  // ---- sea life: dolphins that leap, shoals of fish just under the surface, turtles and a whale
  const seaLife = [];
  const skin = std(0x7f93a6), belly = std(0xe5ecf2), whaleM = std(0x35506b);
  function dolphin(sc) {
    const g = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 8), skin); body.scale.set(2.6, .8, .75); g.add(body);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 6), belly); bl.scale.set(2.3, .45, .6); bl.position.y = -.025; g.add(bl);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(.032, .14, 8), skin); beak.rotation.z = -PI / 2; beak.position.x = .31; g.add(beak);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(.04, .1, 4), skin); fin.position.set(-.02, .1, 0); fin.rotation.z = .5; g.add(fin);
    const tail = new THREE.Group(); tail.position.x = -.27; g.add(tail);
    const tb = new THREE.Mesh(new THREE.ConeGeometry(.04, .2, 6), skin); tb.rotation.z = PI / 2; tb.position.x = -.08; tail.add(tb);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(.05, .012, .22), skin); fl.position.x = -.19; tail.add(fl);
    g.scale.setScalar(sc || 1); return { g, tail };
  }
  for (const [cx, cz, rx, rz, sp, ph, n, gap] of [[0, 0, 32.5, 32.5, .042, 0, 3, .035], [0, 0, 29.5, 29.5, -.04, 2, 2, .04]]) {
    for (let k = 0; k < n; k++) { const d = dolphin(1.25), w = new THREE.Group(); w.add(d.g); W(w); seaLife.push({ kind: 'dol', w, d, cx, cz, rx, rz, sp, a: ph + k * (gap || .55), ph: rnd() * 6, off: k * .22 }); }
  }
  const fishBody = new THREE.SphereGeometry(.05, 8, 6), fishTail = new THREE.ConeGeometry(.04, .07, 4), fishEye = new THREE.SphereGeometry(.009, 5, 4), eyeM = std(0x1b1b1b);
  function fish(col) {
    const g = new THREE.Group(), m = std(col), b = new THREE.Mesh(fishBody, m); b.scale.set(1.7, .75, .45); g.add(b);
    const t = new THREE.Mesh(fishTail, m); t.rotation.z = PI / 2; t.position.x = -.1; t.scale.z = .5; g.add(t);
    const e = new THREE.Mesh(fishEye, eyeM); e.position.set(.06, .018, .02); g.add(e); const e2 = e.clone(); e2.position.z = -.02; g.add(e2);
    return g;
  }
  for (const [cx, cz, rx, rz, sp, ph, col] of [[-3, 3.4, 9.5, .6, .05, 0, 0xf08a3c], [-1, 7.3, 8.5, .6, -.045, 2, 0xb9c8d6], [3, 5.3, 7, .5, .04, 4, 0xf2c14a]]) {
    const sh = new THREE.Group(), fs = [];
    for (let k = 0; k < 6; k++) { const h = fish(col); h.scale.setScalar(.8); sh.add(h); fs.push({ h, lx: -(k % 3) * .18 + rnd() * .1, lz: (k - 2.5) * .09 + (rnd() - .5) * .05, ph: rnd() * 6 }); }
    W(sh); seaLife.push({ kind: 'fish', w: sh, fs, cx, cz, rx, rz, sp, a: ph, ph: rnd() * 6 });
  }
  const whale = (cx, cz, rx, rz, sp, a, sc) => {
    const g = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(.3, 14, 8), whaleM); body.scale.set(3.2, .85, .85); g.add(body);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(.3, 10, 6), belly); bl.scale.set(2.9, .5, .75); bl.position.y = -.07; g.add(bl);
    const tail = new THREE.Group(); tail.position.x = -.85; g.add(tail);
    const tb = new THREE.Mesh(new THREE.ConeGeometry(.12, .5, 8), whaleM); tb.rotation.z = PI / 2; tb.position.x = -.22; tail.add(tb);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(.12, .02, .7), whaleM); fl.position.x = -.5; tail.add(fl);
    const sp2 = new THREE.Mesh(new THREE.ConeGeometry(.05, .3, 8), std(0xffffff, { transparent: true, opacity: .75 })); sp2.position.set(.5, .38, 0); g.add(sp2);
    g.scale.setScalar(sc);
    const w = new THREE.Group(); w.add(g); W(w); seaLife.push({ kind: 'whale', w, g, tail, spout: sp2, cx, cz, rx, rz, sp, a, ph: rnd() * 6 });
  };
  whale(0, 0, 31, 31, .018, 1.2, .8); whale(0, 0, 33.5, 33.5, -.015, 3.9, .9); whale(0, 0, 36, 36, .012, 5.6, .75);

  // ---- canoes (piraguas) paddling slowly up and down the coast, close to the beaches
  const canoes = [];
  function canoe(col, pc) {
    const g = new THREE.Group(), hull = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 10, 0, PI * 2, 0, PI / 2), std(col)); hull.scale.set(2.7, .75, .62); hull.rotation.x = PI; hull.position.y = .09; g.add(hull);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.1, .006, 6, 24), std(0xfff8ea)); rim.rotation.x = PI / 2; rim.scale.set(2.7, .62, 1); rim.position.y = .09; g.add(rim);
    const inside = new THREE.Mesh(new THREE.CircleGeometry(.1, 20), std(0x5a4636)); inside.rotation.x = -PI / 2; inside.scale.set(2.65, .6, 1); inside.position.y = .088; g.add(inside);
    const rd = person(pc, { skin: SKINS[(col >> 3) % 4], role: 'bike', hat: 0xf2efe6 }); rd.scale.setScalar(.58); rd.position.set(-.02, .1, 0); g.add(rd);
    const pad = new THREE.Group(), sh = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .4, 5), std(0x6b4a2a)); sh.rotation.x = PI / 2; pad.add(sh);
    for (const sz of [-1, 1]) { const bl = box(.08, .012, .05, std(sz > 0 ? 0xd9473a : 0xf2efe6)); bl.position.set(0, 0, sz * .21); pad.add(bl); }
    pad.position.set(-.02, .2, 0); g.add(pad);
    return { g, pad };
  }
  [[-4.2, .85, .5, 0xe9774a, 0x2f6fa8, 1.6], [3.9, .9, .7, 0x4aa8d9, 0xd9473a, 1.4], [15.6, .85, .5, 0xf2c14a, 0x3b9a6a, 1.5], [18.7, .85, .45, 0xd9608a, 0x7a58b5, 1.6], [-19.0, .9, .4, 0x3bb89a, 0xf08a3c, 1.5], [-8.8, -.8, .5, 0xe9774a, 0xe277a0, 1.5]].forEach(([cx, off, sp, col, pc, half], i) => {
    const c = canoe(col, pc); c.g.scale.setScalar(.62); W(c.g); canoes.push({ ...c, cx, off, sp: sp * .5, half, ph: i * 1.7, south: i === 5 });
  });

  // ---- people on the beaches: sunbathers, parasols, swimmers and walkers along the water
  const swimmers = [], walkers = [], balls = [], fireworks = []; let fwNext = 0;
  function parasol(col) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .36, 5), std(0xeeeeee)); pole.position.y = .18; g.add(pole);
    const top = new THREE.Mesh(new THREE.ConeGeometry(.19, .1, 10), std(col)); top.position.y = .37; g.add(top);
    return g;
  }
  // one shared "is this spot free?" test for every beach item: clear of roads, buildings, the water and everything already placed
  const beachOcc = [];
  const beachFree = (x, z, r) => groundH(x, z) > .03 && inletD(x, z) > .5 + r && !roadN.some((q) => Math.abs(q[0] - x) < .9 && Math.hypot(q[0] - x, q[1] - z) < .46 + r) && !roadS.some((q) => Math.abs(q[0] - x) < .9 && Math.hypot(q[0] - x, q[1] - z) < .46 + r) && !keptC.some((c) => Math.hypot(c[0] - x, c[1] - z) < c[2] + r) && !beachOcc.some((o) => Math.hypot(o[0] - x, o[1] - z) < o[2] + r) && (beachOcc.push([x, z, r]), true);
  function beach(cx, fn, sg, nSun, nSwim, nWalk, title, type, text) {
    const wl = (x) => fn(x);
    for (let k = 0; k < nSun; k++) {
      const x = cx + (rnd() - .5) * 2.8, off = .3 + rnd() * .55, z = wl(x) + sg * off;
      const withPz = k % 3 === 0;
      if (!beachFree(x, z, withPz ? .3 : .13)) continue;
      const tw = new THREE.Group(), tc = SHIRTS[(k * 3) % SHIRTS.length];
      tw.add(box(.17, .008, .085, std(tc === 0xf2efe6 ? 0xe277a0 : tc)));
      const ly = lying(SHIRTS[(k * 5 + 2) % SHIRTS.length], { skin: SKINS[k % 4] }); ly.position.y = .01; tw.add(ly);
      W(put(tw, x, z, rnd() * 6.28, .0));
      if (withPz) { const pz = parasol([0xc9473a, 0x2f6fa8, 0xe9b94a, 0xf2efe6, 0xe277a0][k % 5]); W(put(pz, x + .14, z + .04, 0, .0)); }
    }
    for (let k = 0; k < 1; k++) { const x = cx + (rnd() - .5) * 2.4, z = wl(x) + sg * (.5 + rnd() * .35); if (!beachFree(x, z, .2)) continue; const p1 = person(SHIRTS[(k * 2 + 1) % SHIRTS.length], { skin: SKINS[k % 4], role: 'sun' }); W(put(p1, x, z, rnd() * 6, 0)); const p2 = person(SHIRTS[(k * 2 + 4) % SHIRTS.length], { skin: SKINS[(k + 1) % 4], role: 'sun' }); W(put(p2, x + .07, z + .03, rnd() * 6, 0)); }
    for (let k = 0; k < nSwim; k++) {
      const p = person(SHIRTS[(k * 3 + 1) % SHIRTS.length], { skin: SKINS[k % 4], role: 'swim' }); W(p);
      swimmers.push({ p, x: cx + (rnd() - .5) * 2.2, off: .45 + rnd() * .55, fn, sg, ph: rnd() * 6.28, sp: .25 + rnd() * .2, rx: .25 + rnd() * .35 });
    }
    for (let k = 0; k < nWalk; k++) {
      const p = person(SHIRTS[(k * 2 + 5) % SHIRTS.length], { skin: SKINS[(k + 2) % 4], role: 'walk' }); W(p);
      walkers.push({ p, cx, fn, sg, half: 1.0 + rnd() * .5, ph: rnd() * 6.28, sp: .13 + rnd() * .08, off: .1 + rnd() * .12 });
    }
    // boardwalk along the back of the sand, tufts of dune grass, a lifeguard tower, a kiosk with an awning and a volleyball net
    for (let k = 0; k < 0; k++) { const x = cx + (rnd() - .5) * 3.6, z = wl(x) + sg * (1.45 + rnd() * .3); if (groundH(x, z) < .05) continue; const tu = new THREE.Group(); for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.ConeGeometry(.018, .14, 4), std(0x8fb35a)); bl.position.set((b - 1) * .025, .07, (b % 2) * .02); bl.rotation.z = (b - 1) * .25; tu.add(bl); } W(put(tu, x, z, rnd() * 6, 0)); }
    for (let tr = 0, vx = cx - .9, vz = wl(vx) + sg * .72; tr < 6; tr++, vx = cx - 1.9 + tr * .45, vz = wl(vx) + sg * (.6 + (tr % 2) * .2)) { if (!beachFree(vx, vz, .55)) continue; const g = new THREE.Group();            // a volleyball game: net, four players and a ball going back and forth
      for (const sx of [-.2, .2]) { const po = box(.012, .16, .012, std(0x6b4a2a)); po.position.set(sx, .08, 0); g.add(po); }
      const net = box(.4, .06, .004, std(0xffffff, { transparent: true, opacity: .7 })); net.position.y = .13; g.add(net);
      W(put(g, vx, vz, 0, 0));
      for (const [px, pz, c] of [[-.2, .28, 0], [.2, .3, 3], [-.15, -.28, 5], [.22, -.3, 1]]) { const pp = person(SHIRTS[c], { skin: SKINS[c % 4], role: 'sun' }); pp.scale.setScalar(.95); W(put(pp, vx + px, vz + pz * sg * -1, pz > 0 ? PI : 0, 0)); }
      const bl = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), std(0xf6f1e4)); W(bl); balls.push({ m: bl, x: vx, z: vz, ph: rnd() * 6, sg }); break;
    }
    for (let tr = 0, kx = cx + 1.1, kz = wl(kx) + sg * .95; tr < 6; tr++, kx = cx + .5 + tr * .35, kz = wl(kx) + sg * (.8 + (tr % 2) * .25)) { if (!beachFree(kx, kz, .3)) continue; const g = new THREE.Group();
      const kb = box(.22, .12, .16, std(0xf7f1e4)); kb.position.y = .06; g.add(kb); const aw = box(.26, .02, .1, std(0xc9473a)); aw.position.set(0, .15, .13); aw.rotation.x = .25; g.add(aw);
      const aw2 = box(.065, .021, .1, std(0xf7f1e4)); aw2.position.set(-.06, .151, .13); aw2.rotation.x = .25; g.add(aw2); const aw3 = box(.065, .021, .1, std(0xf7f1e4)); aw3.position.set(.07, .151, .13); aw3.rotation.x = .25; g.add(aw3);
      W(put(g, kx, kz, 0, 0)); break; }
    spot(title, type, text, hubAt(cx, wl(cx) + sg * .5, .05), .5);
  }
  beach(-4.2, shore, -1, 11, 2, 1, 'Area Maior beach', 'Playa', 'A long white sand spit that closes the inlet of Esteiro, with pines behind it. People take the sun, swim and walk along the water.');
  beach(3.9, shore, -1, 9, 2, 1, 'O Freixo beach', 'Playa', 'The sand of O Freixo, just beside the harbour: a few steps from the houses to the water.');
  beach(15.6, shore, -1, 10, 2, 1, 'Paramean beach', 'Playa', '');
  beach(18.7, shore, -1, 9, 2, 1, 'Ancoradoiro beach', 'Playa', '');
  beach(-19.0, shore, -1, 10, 2, 1, 'Louro beach', 'Playa y laguna', 'The long dune beach of Louro, with a lagoon behind the sand, at the foot of the mountain.');
  beach(-8.8, shoreS, 1, 4, 1, 0, 'Cove across the ría', 'Playa', 'A small beach on the other shore of the ría, in front of the fishermen’s houses.');

  // ---- village squares: a paved plaza with a tree or two, benches, café terraces and people; Muros has the main square (with the cruceiro)
  const strollers = [], pathers = [], kickers = [];
  function chair(g, x, z, ry) { const c = box(.045, .045, .045, std(0x6b4a2a)); c.position.set(x, .05, z); g.add(c); const bk = box(.045, .05, .01, std(0x6b4a2a)); bk.position.set(x + Math.sin(ry) * .026, .09, z + Math.cos(ry) * .026); g.add(bk); }
  function terrace(x, inl, col) {
    const [px, pz] = onShore(x, inl), g = new THREE.Group();
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .012, 10), std(0xf4efe4)); tb.position.y = .1; g.add(tb);
    const ps = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .1, 5), std(0xeeeeee)); ps.position.y = .05; g.add(ps);
    chair(g, -.1, 0, PI / 2); chair(g, .1, 0, -PI / 2); chair(g, 0, .1, PI);
    const pa = parasol(col); pa.scale.setScalar(.72); pa.position.set(0, 0, 0); g.add(pa);
    W(put(g, px, pz, seaYaw(px), 0));
  }
  function square(x, inl, w, d, o) {
    o = o || {};
    const [px, pz] = onShore(x, inl), yaw = seaYaw(px), slab = new THREE.Group();
    const sl = box(w, .16, d, std(0xe3d9c2)); sl.position.y = -.01; slab.add(sl);
    const bd = box(w + .06, .15, d + .06, std(0xc9bfa8)); bd.position.y = -.015; slab.add(bd);
    slab.userData.fp = Math.max(w, d) * .62; slab.userData.pri = 3; W(put(slab, px, pz, yaw, -.04));
    for (const [qx, qz] of [[-.5, -.4], [.5, -.4], [-.5, .4], [.5, .4]].slice(0, o.trees === undefined ? 2 : o.trees)) {
      const tr = new THREE.Group(), tk = new THREE.Mesh(new THREE.CylinderGeometry(.02, .028, .24, 6), std(0x7a5a3c)); tk.position.y = .12; tr.add(tk);
      const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.17, 1), std(0x3f9576, { flatShading: true })); cr.position.y = .36; tr.add(cr);
      const a = yaw, tx = px + (qx * w * .8) * Math.cos(a) + (qz * d * .8) * Math.sin(a), tz = pz - (qx * w * .8) * Math.sin(a) + (qz * d * .8) * Math.cos(a);
      W(put(tr, tx, tz, 0, .03));
    }
    for (const sx of [-1, 1]) { const bn = new THREE.Group(); bn.add(box(.2, .035, .06, std(0x8a6a44))); const bk = box(.2, .06, .012, std(0x8a6a44)); bk.position.set(0, .05, -.03); bn.add(bk); const a = yaw, tx = px + sx * w * .3 * Math.cos(a) + d * .38 * Math.sin(a), tz = pz - sx * w * .3 * Math.sin(a) + d * .38 * Math.cos(a); W(put(bn, tx, tz, yaw, .045)); }
    for (let k = 0; k < (o.terraces || 2); k++) { const tx = x + (k - ((o.terraces || 2) - 1) / 2) * w * .42; terrace(tx, inl - d * .33, [0xc9473a, 0x2f6fa8, 0xe9b94a][k % 3]); }
    for (let k = 0; k < (o.people || 6); k++) {
      const p = person(SHIRTS[(k * 3 + 2) % SHIRTS.length], { skin: SKINS[k % 4], hat: k % 4 === 0 ? 0xe9e2d2 : undefined }); W(p);
      strollers.push({ p, x: px, z: pz, yaw, rx: w * (.2 + rnd() * .22), rz: d * (.18 + rnd() * .2), a: rnd() * 6.28, sp: (.18 + rnd() * .16) * (k % 2 ? 1 : -1), still: k % 3 === 0 });
    }
    return slab;
  }
  { const sqM = square(-12.8, 2.65, 2.0, 1.5, { trees: 4, terraces: 3, people: 12 });
    const sqE = square(-8.15, 2.75, 1.2, 1.0, { trees: 1, terraces: 1, people: 4 });
    const sqF = square(1.8, 2.75, 1.4, 1.0, { trees: 2, terraces: 2, people: 5 });
    const sqO = square(9.65, 2.75, 1.5, 1.1, { trees: 2, terraces: 2, people: 6 }); }

  // ---- Ézaro, on the south shore: a granite village under the mountain and the waterfall of the river Xallas, falling straight into the sea
  const falls = [];
  { const ex = -1.2, [fx, fz] = onShoreS(ex, 3.95), yaw = seaYawS(fx), g = new THREE.Group(), gr = [0xaaa391, 0xb8b19f, 0x9b968a];
    for (const [bx, by, bz, sc, k] of [[0, .35, -.25, .62, 0], [-.35, .28, -.05, .45, 1], [.38, .3, -.05, .48, 2], [-.1, .8, -.3, .5, 1], [.15, 1.05, -.35, .38, 0], [0, .15, -.1, .4, 2], [-.55, .12, .1, .3, 1], [.58, .12, .12, .3, 0]]) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), std(gr[k], { flatShading: false })); m.scale.set(sc * 1.05, sc * 1.1, sc); m.position.set(bx, by, bz); m.castShadow = true; g.add(m);
    }
    // the water: three soft ribbons that keep sliding down, white streaks, foam rolling at the foot and a fine spray
    const fallTex = (() => { const c = document.createElement('canvas'); c.width = 32; c.height = 128; const g2 = c.getContext('2d'), gr = g2.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(176,226,244,.55)'); gr.addColorStop(.45, 'rgba(214,242,252,.8)'); gr.addColorStop(1, 'rgba(255,255,255,.96)'); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 128); const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; return t2; })();
    const sheet = (x, w, o, z) => { const m = box(w, 1.0, .05, std(0xffffff, { map: fallTex, transparent: true, opacity: o, roughness: .3, emissive: 0x5b8fa8, emissiveIntensity: .18, sheen: 0 })); m.position.set(x, .56, z || .62); g.add(m); return m; };
    sheet(0, .36, .8); sheet(-.17, .14, .65, .6); sheet(.17, .14, .65, .6); sheet(-.075, .09, .6, .66); sheet(.08, .08, .55, .66);
    for (let k = 0; k < 26; k++) { const st = box(.025 + (k % 3) * .014, .16 + (k % 4) * .06, .05, std(0xffffff, { transparent: true, opacity: .9 })); st.position.set(((k * 37) % 29 - 14) * .0125, .9, .66); g.add(st); falls.push({ m: st, k, sp: .8 + (k % 5) * .12, x0: st.position.x }); }
    const pool = box(.62, .03, .3, std(0x62d0ee, { transparent: true, opacity: .85 })); pool.position.set(0, 1.04, .3); g.add(pool);
    for (let k = 0; k < 16; k++) { const fo = new THREE.Mesh(new THREE.IcosahedronGeometry(.06 + (k % 3) * .022, 1), std(0xffffff, { transparent: true, opacity: .85, roughness: 1 })); g.add(fo); falls.push({ foam: fo, k, a: k * .6 }); }
    const mist = new THREE.Mesh(new THREE.SphereGeometry(.36, 12, 8), std(0xffffff, { transparent: true, opacity: .4, roughness: 1 })); mist.position.set(0, .14, .74); mist.scale.set(1.4, .55, 1.1); g.add(mist); falls.push({ mist });
    for (let k = 0; k < 22; k++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(.016, 5, 4), std(0xffffff, { transparent: true, opacity: .8 })); g.add(sp); falls.push({ spray: sp, k, ph: rnd() }); }
    W(put(g, fx, fz, yaw, -.08));
    for (const x of [-3.7, -2.9, -2.2, .4, 1.1, 1.8]) hhS(x, .9 + rnd() * .3, 1 + (hc % 2), { stone: true });
    const [cx, cz] = onShoreS(-3.4, 3.1); W(put(church(.9), cx, cz, seaYawS(cx), -.03)); }

  // ---- the small island: a tiny harbour with a boat, one little house in the middle and two horses grazing
  const horses = [];
  function horse(col, mane) {
    const g = new THREE.Group(), m = std(col), dk = std(mane);
    const body = box(.3, .15, .12, m); body.position.y = .24; g.add(body);
    const neck = box(.07, .16, .08, m); neck.position.set(.17, .33, 0); neck.rotation.z = -.5; g.add(neck);
    const head = new THREE.Group(); head.position.set(.24, .39, 0); const hd = box(.14, .07, .07, m); hd.position.x = .05; head.add(hd);
    const mn = box(.02, .1, .02, dk); mn.position.set(-.02, .04, 0); head.add(mn); g.add(head);
    for (const [lx, lz] of [[-.11, -.04], [-.11, .04], [.11, -.04], [.11, .04]]) { const lg = box(.03, .17, .03, m); lg.position.set(lx, .085, lz); g.add(lg); }
    const tail = box(.03, .14, .03, dk); tail.position.set(-.17, .22, 0); tail.rotation.z = .4; g.add(tail);
    return { g, head };
  }
  { const I = ISL[2], ix = I.cx, iz = I.cz, sz = edge(2, ix, 1);
    const hs = house({ w: .42, d: .36, floors: 1, wall: 0xf7f1e4, roof: ROOF[0], gal: false, shut: 0x2f6fa8, fr: 2, door: 0x2f6fa8 }); W(put(hs, ix, iz - .1, .5, -.02));
    for (let k = 0; k < 3; k++) { const q = new THREE.Group(); q.add(box(.3, .4, .3, std(0xb2ac9c))); const c = box(.34, .05, .34, std(0xd0cabb)); c.position.y = .22; q.add(c); W(put(q, ix, sz - .05 + k * .3, 0, .02, true)); }
    const bt = boat(0xc9473a, 0xf2efe6, 'fisher'); bt.scale.setScalar(.7); const bw = new THREE.Group(); bw.add(bt); put(bw, ix + .45, sz + .55, PI / 2, 0, true); W(bw); boats.push({ w: bw, b: bt, ph: 1.3, base: 0 });
    for (const [hx, hz, c, mn, ry] of [[-.9, .35, 0x7a4a2e, 0x2a1a10, .6], [.95, -.2, 0xf1ece0, 0x8a7a66, 3.4]]) { const h = horse(c, mn), w = new THREE.Group(); h.g.scale.setScalar(.5); w.add(h.g); const x = ix + hx, z = iz + hz; put(w, x, z, ry, -.02); W(w); horses.push({ h, ph: rnd() * 6 }); } }

  // ---- a pretty street of little houses with tulip borders, leading inland from the south road (after the reference miniatures)
  const stX = 4.6, stZ0 = shoreS(stX) + 1.5;
  const stPts = []; for (let k = 0; k <= 22; k++) stPts.push([stX + .28 * Math.sin(k * .38), stZ0 + k * .2]);
  W(ribbon(relax(stPts, 3), .34, std(0xcfc6b4, { roughness: 1, side: THREE.DoubleSide }), .012, false, undefined, true));
  W(ribbon(relax(stPts, 3), .5, std(0xe3dac4, { roughness: 1, side: THREE.DoubleSide }), .004, false, undefined, true));
  { const PAST = [0xdcb3b4, 0xe8c9b4, 0xf1e0c6, 0xcdb2bb, 0xe6bcab, 0xf0e1cd], RF = [0xd25a4a, 0xdc6a52, 0x6f8fa0, 0xc7503f, 0xe07a5c, 0xb84a40];
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) {
      const z = stZ0 + .55 + k * .78 + (sd > 0 ? .3 : 0), px = stX + .28 * Math.sin((z - stZ0) / .2 * .38), x = px + sd * .62;
      const hs = house({ w: .42, d: .36, floors: k % 2 ? 2 : 1, wall: PAST[(k + (sd > 0 ? 2 : 0)) % PAST.length], roof: RF[(k * 2 + (sd > 0 ? 1 : 0)) % RF.length], gal: false, shut: [0x3d78a8, 0x4a9a74, 0xb4483a][(k + sd + 3) % 3], fr: k * 3 + (sd > 0 ? 1 : 0) });
      hs.userData.pri = 2; W(put(hs, x, z, -sd * PI / 2, -.01));
      for (let q = 0; q < 6; q++) {                                                     // a border of tulips between the house and the street
        const fx = px + sd * (.34 + (q % 2) * .045), fz = z - .26 + q * .1, fl = new THREE.Group(), cl = [0xf0793a, 0xf2a43a, 0xe9577a, 0xf5e04a][(q + k) % 4];
        const sm = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .07, 4), std(0x4a8a3a)); sm.position.y = .035; fl.add(sm); const bl = new THREE.Mesh(new THREE.SphereGeometry(.024, 8, 6), std(cl)); bl.position.y = .08; bl.scale.y = 1.25; fl.add(bl);
        W(put(fl, fx, fz, 0, 0));
      }
    }
    for (const z of [stZ0 + 1.0, stZ0 + 2.6]) { const px = stX + .28 * Math.sin((z - stZ0) / .2 * .38), lp = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.01, .013, .3, 5), std(0x2b3036)); pole.position.y = .15; lp.add(pole); const lb = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), lampMat); lb.position.y = .32; lp.add(lb); W(put(lp, px + .24, z, 0, 0)); }
    const pc = car(0x9fd0d6, false); pc.scale.setScalar(.64); const pw = new THREE.Group(); pw.add(pc); W(put(pw, stX + .1, stZ0 + 1.9, -PI / 2, .03));
    const [wx, wz] = [stX + .28 * Math.sin(2.7 / .2 * .38), stZ0 + 2.9]; const wb = new THREE.Group(); wb.add(box(.5, .02, .2, std(0x8a6a44))); W(put(wb, wx - .0, wz, 0, .01)); }

  // life in the street: cars that come and go, neighbours walking, a child running, two friends chatting
  { const sr = route(relax(stPts, 3)); routes.push(sr); const ri = routes.length - 1;
    addCars(ri, 1, 1, .26, [0x9fd0d6], false, true); addCars(ri, -1, 1, .24, [0xf2c14a], false, true);
    const mkP = (c, k, o, u, v, off, r, sc) => { const pp = person(SHIRTS[c % SHIRTS.length], { skin: SKINS[k % 4], hat: k % 3 === 0 ? 0xf2efe6 : undefined }); pp.scale.setScalar(sc || .9); W(pp); pathers.push({ p: pp, r, u, v, off, bob: 1 }); return pp; };
    mkP(1, 0, 0, .1, .045, .2, sr); mkP(4, 1, 0, .6, -.04, -.22, sr); mkP(6, 2, 0, .35, .11, .05, sr, .7);
    const c1 = mkP(2, 3, 0, .8, 0, -.12, sr); pathers[pathers.length - 1].still = true; const c2 = mkP(5, 0, 0, .815, 0, -.12, sr); pathers[pathers.length - 1].still = true; }

  // ---- the seafront of the south road: a stone sea wall with steps, bollards and moored boats beside the road
  for (let x = 1.9; x < 7.6; x += .46) { const q = new THREE.Group(); q.userData.stoneBlock = 1; q.add(box(.4, .5, .3, std(0xb9b19d))); const c = box(.42, .05, .32, std(0xd6cdb8)); c.position.y = .26; q.add(c); W(put(q, x, shoreS(x) - .02, 0, .02, true)); }
  for (const x of [2.6, 4.0, 5.3, 6.6]) { const bo = new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, .08, 6), std(0x2b3036)); const g = new THREE.Group(); g.add(bo); W(put(g, x, shoreS(x) - .02, 0, .3, true)); }
  for (const x of [3.0, 4.7, 6.3]) moor(x, shoreS(x) - .62, 1.6 + (rnd() - .5) * .2, .85, undefined, .5);

  // ---- a mountain village on the hillside above Outes: houses on stone terraces joined by flights of steps, a small church, a pool and a little arch
  { const base = [10.6, shore(10.6) - 7.3], rows = [[0, -.0, 3], [1, -1.0, 3], [2, -2.0, 2]];
    const stoneT = std(0xa7a08e), moss = std(0x7fae52), wallsM = [0xf6e6b4, 0xaed0dc, 0xf8efd9, 0xf2c6a8, 0xb9d9c3];
    let hi2 = 0;
    for (const [r, dz, n] of rows) for (let k = 0; k < n; k++) {
      const x = base[0] + (k - (n - 1) / 2) * 1.4 + (r % 2) * .35, z = base[1] + dz * 1.25 - r * .0, gh = groundH(x, z);
      if (inletD(x, z) < .7 || riverPts.some((q) => Math.hypot(q[0] - x, q[1] - z) < .5)) continue;
      const pl = new THREE.Group(); const sl = box(.85, .5, .7, stoneT); sl.position.y = .02; pl.add(sl); const mt = box(.88, .04, .74, moss); mt.position.y = .27; pl.add(mt);
      const ya = -PI / 2 * 0 + .15 * (k - 1);
      const hs = house({ w: .46, d: .38, floors: 1 + (hi2 % 2), wall: wallsM[hi2 % wallsM.length], roof: ROOF[hi2 % ROOF.length], gal: false, shut: [0x3d78a8, 0x4a9a74, 0xb4483a][hi2 % 3], fr: hi2, stone: false });
      hs.position.y = .3; pl.add(hs); pl.userData.fp = .52; pl.userData.pri = 2; W(put(pl, x, z, ya, -.02));
      { const hd = house({ w: .42, d: .36, floors: 1 + ((hi2 + 1) % 2), wall: wallsM[(hi2 + 2) % wallsM.length], roof: ROOF[(hi2 + 3) % ROOF.length], gal: false, shut: [0x3d78a8, 0x4a9a74, 0xb4483a][(hi2 + 1) % 3], fr: hi2 + 5, stone: hi2 % 2 === 0 });     // a house at the top of every flight of steps
        if (hd.userData) hd.userData.pri = 2; W(put(hd, x + 1.1, z + .85, ya + .3, -.02)); STAIRS.push([x, z, ya]); }
      hi2++;
    }
    { const sp = []; for (let k = 0; k <= 12; k++) sp.push([base[0] - .3 + k * .05 + Math.sin(k * .6) * .12, base[1] + 1.0 - k * .22]); const sr = route(relax(sp, 2));
      for (const [c, u, v, off] of [[1, .1, .05, .06], [5, .7, -.045, -.06], [3, .4, .03, 0]]) { const pp = person(SHIRTS[c], { skin: SKINS[c % 4] }); pp.scale.setScalar(.85); W(pp); pathers.push({ p: pp, r: sr, u, v, off, bob: 1, lift: 0 }); } }
    const [cx, cz] = [base[0] + 1.9, base[1] - .5]; if (groundH(cx, cz) > .3) { const pl = new THREE.Group(); pl.userData.fp = .95; pl.userData.pri = 3; pl.add(box(1.0, .4, .9, stoneT)); const mt = box(1.02, .04, .92, moss); mt.position.y = .22; pl.add(mt); W(put(pl, cx, cz, 0, -.05)); const ch = church(.7); ch.position.y = .22; const cg = new THREE.Group(); cg.add(ch); W(put(cg, cx, cz, -.3, -.05)); }
    const [px, pz] = [base[0] - 1.9, base[1] + .8]; if (groundH(px, pz) > .2) { const pool = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .03, 18), std(0x45b6d0, { transparent: true, opacity: .92, roughness: .15 })); pool.scale.z = .7; const pg = new THREE.Group(); pg.add(pool); W(put(pg, px, pz, .3, .02));
      const arch = new THREE.Group(); const ab = box(.5, .36, .24, stoneT); ab.position.y = .1; arch.add(ab); const ah = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .26, 12), std(0x1b1a18)); ah.rotation.x = PI / 2; ah.position.set(0, .06, .02); arch.add(ah); W(put(arch, px + .35, pz - .4, -.3, -.04)); }
  }
  // the village keeps its clearing
  // ---- two schools with a football pitch where children play, and one tiny pitch
  function pitch(w, d, goals) {
    const g = new THREE.Group(), grass = box(w, .05, d, std(0xc9a574)); grass.position.y = .005; g.add(grass);
    for (let k = 0; k < 3; k++) { const st = box(w * .5, .052, d * .4, std(k % 2 ? 0xc29c6a : 0xd0ae80)); st.position.set((k - 1) * w * .22, .006, (k - 1) * d * .12); g.add(st); }
    const ln = std(0xf4efe0);
    for (const [lw, ld, lx, lz] of [[w - .06, .014, 0, d / 2 - .035], [w - .06, .014, 0, -d / 2 + .035], [.014, d - .06, w / 2 - .035, 0], [.014, d - .06, -w / 2 + .035, 0], [.014, d - .06, 0, 0]]) { const l = box(lw, .054, ld, ln); l.position.set(lx, .008, lz); g.add(l); }
    const cc = new THREE.Mesh(new THREE.TorusGeometry(Math.min(w, d) * .13, .007, 5, 24), ln); cc.rotation.x = PI / 2; cc.position.y = .03; g.add(cc);
    if (goals) for (const sx of [-1, 1]) { const gl = new THREE.Group(), pm = std(0xffffff); for (const gz of [-.09, .09]) { const po = box(.012, .09, .012, pm); po.position.set(0, .075, gz); gl.add(po); } const cb = box(.012, .012, .2, pm); cb.position.set(0, .12, 0); gl.add(cb); const nt = box(.05, .09, .19, std(0xffffff, { transparent: true, opacity: .25 })); nt.position.set(sx * .03, .075, 0); gl.add(nt); gl.position.x = sx * (w / 2 - .02); g.add(gl); }
    return g;
  }
  function school(roofCol, wallCol) {
    const g = new THREE.Group(), wl = std(wallCol), rf = std(roofCol), wd = std(0xfff8ea);
    const wing = (x, w2) => { const b = box(w2, .3, .46, wl); b.position.set(x, .15, 0); g.add(b); const r = gable(w2 + .06, .5, .16, rf); r.position.set(x, .29, 0); g.add(r);
      for (let k = 0; k < Math.floor(w2 / .22); k++) { const wx = x - w2 / 2 + .13 + k * .22; for (const wy of [.1, .22]) { const fr = box(.09, .09, .014, wd); fr.position.set(wx, wy, .235); g.add(fr); const gl = box(.06, .065, .018, winMat); gl.position.set(wx, wy, .24); g.add(gl); } } };
    wing(-.62, .8); wing(.62, .8);
    const mid = box(.5, .42, .5, wl); mid.position.set(0, .21, .02); g.add(mid);
    const rm = gable(.56, .56, .2, rf); rm.position.set(0, .4, .02); g.add(rm);
    const tw = box(.26, .3, .26, wl); tw.position.set(0, .56, 0); g.add(tw); const tr = new THREE.Mesh(new THREE.ConeGeometry(.2, .2, 12), rf); tr.position.set(0, .81, 0); g.add(tr);
    const clk = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .02, 16), std(0xfffdf2)); clk.rotation.x = PI / 2; clk.position.set(0, .56, .14); g.add(clk);
    const h1 = box(.008, .05, .008, std(0x2b3036)); h1.position.set(0, .58, .152); g.add(h1); const h2 = box(.04, .008, .008, std(0x2b3036)); h2.position.set(.015, .56, .152); g.add(h2);
    const dr = box(.12, .17, .02, std(0xb4483a)); dr.position.set(0, .085, .275); g.add(dr); const da = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .02, 12), wd); da.rotation.x = PI / 2; da.position.set(0, .17, .27); g.add(da);
    const fp = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .5, 5), std(0xeeeeee)); fp.position.set(.42, .25, .45); g.add(fp); const fl = box(.12, .07, .005, std(0xc9473a)); fl.position.set(.48, .46, .45); g.add(fl); g.userData.flag = fl;
    return g;
  }
  const flags = [];
  function schoolYard(x, inl, roofCol, wallCol, nKids) {
    const [px, pz] = onShore(x, inl), yaw = seaYaw(px), slab = new THREE.Group();
    const sl = box(2.5, .8, 2.7, std(0xe6dcc0)); sl.position.y = -.34; slab.add(sl); const bd = box(2.56, .78, 2.76, std(0xc9bfa8)); bd.position.y = -.35; slab.add(bd);
    slab.userData.fp = 2.0; slab.userData.pri = 3; W(put(slab, px, pz, yaw, -.04));
    const loc = (lx, lz) => [px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
    const sc = school(roofCol, wallCol); const [sx, sz] = loc(0, -.95); W(put(sc, sx, sz, yaw, .03)); flags.push(sc.userData.flag);
    const pt = pitch(1.15, .7, true); const [qx, qz] = loc(0, .5); W(put(pt, qx, qz, yaw, .1));
    for (const lx of [-1.0, 1.0]) for (const lz of [.5, 1.1]) { const tr = new THREE.Group(), tk = new THREE.Mesh(new THREE.CylinderGeometry(.02, .028, .24, 6), std(0x7a5a3c)); tk.position.y = .12; tr.add(tk); const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 2), std(0x62ae4a)); cr.position.y = .34; tr.add(cr); const [tx, tz] = loc(lx, lz); W(put(tr, tx, tz, 0, .03)); }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.026, 10, 8), std(0xf6f1e4)); W(ball);
    const kids = []; for (let k = 0; k < nKids; k++) { const kd = person(SHIRTS[(k * 3 + (k % 2 ? 1 : 0)) % SHIRTS.length], { skin: SKINS[k % 4], pants: k % 2 ? 0x2f3f66 : 0x8a2f2f, role: 'kid' }); kd.scale.setScalar(.7); W(kd); kids.push({ kd, x: (rnd() - .5) * 1.4, z: (rnd() - .5) * .7, team: k % 2, ph: rnd() * 6 }); }
    kickers.push({ loc, qx: 0, qz: .5, ball, kids, bx: 0, bz: 0, vx: .3, vz: .2, ph: rnd() * 6 });
    // two kids chatting by the school door and a teacher
    for (const [lx, c] of [[-.2, 1], [.15, 4]]) { const pp = person(SHIRTS[c], { skin: SKINS[c % 4] }); pp.scale.setScalar(.85); const [ax, az] = loc(lx, -.52); W(put(pp, ax, az, yaw + PI, .03)); }
  }
  schoolYard(-.5, 5.05, 0xc9462e, 0xf6e6b4, 8);
  schoolYard(15.6, 4.55, 0x5f7f96, 0xf2c6a8, 8);
  { const [px, pz] = onShore(-7.6, 4.85), yaw = seaYaw(px), slab = new THREE.Group(); const sb = box(1.5, .8, 1.1, std(0xe6dcc0)); sb.position.y = -.34; slab.add(sb); slab.userData.fp = 1.0; slab.userData.pri = 3; W(put(slab, px, pz, yaw, -.05));
    const pt = pitch(1.2, .7, true); W(put(pt, px, pz, yaw, .1));
    const loc = (lx, lz) => [px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.026, 10, 8), std(0xf6f1e4)); W(ball);
    const kids = []; for (let k = 0; k < 4; k++) { const kd = person(SHIRTS[(k * 2 + 1) % SHIRTS.length], { skin: SKINS[k % 4], pants: 0x2f3f66, role: 'kid' }); kd.scale.setScalar(.7); W(kd); kids.push({ kd, x: (rnd() - .5) * 1, z: (rnd() - .5) * .5, team: k % 2, ph: rnd() * 6 }); }
    kickers.push({ loc, qx: 0, qz: 0, ball, kids, bx: 0, bz: 0, vx: .3, vz: .2, ph: rnd() * 6, small: true }); }

  // rocks on the tips of the capes (puntas)
  for (const cx of [-2.3, 14.1, 17.1, 20.3, -21.4]) for (let k = 0; k < 3; k++) {
    const x = cx + (rnd() - .5) * 1.4, z = shore(x) + (rnd() - .35) * .5, g = new THREE.Mesh(new THREE.IcosahedronGeometry(.07 + rnd() * .1, 2), std(0x9a968a, { flatShading: false }));
    g.scale.y = .7; W(put(g, x, z, rnd() * 6, .0, groundH(x, z) < -.02));
  }
  // ---- trees: round oaks, pines and eucalyptus, only where nobody lives or drives
  const forbid = (x, z) => {
    if (Math.hypot(x - ISL[2].cx, z - ISL[2].cz) < 2.2) return true;
    for (const q of SQ) { const sh = shore(x); if (x > q[0] - .2 && x < q[1] + .2 && z < sh - q[2] + .2 && z > sh - q[3] - .2) return true; }
    if (x > 8.2 && x < 13.2 && z > shore(10.6) - 9.6 && z < shore(10.6) - 5.2) return true;
    if (Math.abs(x - 4.6) < 1.3 && z > shoreS(4.6) + .9 && z < shoreS(4.6) + 6.4) return true;
    for (const q of riverPts) if (Math.abs(q[0] - x) < .45 && Math.abs(q[1] - z) < .45) return true;
    for (const c of keptC) if (Math.hypot(x - c[0], z - c[1]) < c[2] + .22) return true;
    for (const f of FLAT) if (Math.hypot(x - f[0], z - f[1]) < f[2] * .95) return true;      // the little island keeps its clearing for the house and the horses
    const s = shore(x);
    for (const rt of mtRoads) for (let q = 0; q < rt.pts.length; q += 2) if (Math.abs(rt.pts[q][0] - x) < .6 && Math.abs(rt.pts[q][1] - z) < .6) return true;
    if (x > -23 && x < 17 && z > s - 6.6 && z < s + .1) { for (const [a, b] of [[-17.4, -9.5], [-9.4, -2.8], [-1.2, 4.6], [7.4, 13.3]]) if (x > a && x < b && z > s - 5.8) return true; if (Math.abs(z - (s - 1.2)) < .45) return true; }
    const t = shoreS(x); if (x > -21 && x < 13 && z > t - .2 && z < t + 1.9) return true;
    return false;
  };
  // ---- hamlets up the hillsides (a few houses round a small church or a hórreo), away from roads and villages
  { const HAM = [[-17.6, 4.8, 1], [-10.5, 6.6, 0], [-4.8, 6.4, 1], [0.5, 7.0, 0], [5.0, 6.6, 1], [11.0, 7.4, 0], [15.8, 6.2, 1], [-20.5, 5.6, 0], [18.5, 5.6, 0]];
    for (const [hx, inl, ch] of HAM) {
      const [cx0, cz0] = onShore(hx, inl);
      if (groundH(cx0, cz0) < .35 || forbid(cx0, cz0) || cove(cx0, cz0) > .08) continue;
      const n = 3 + (hc % 3);
      for (let k = 0; k < n; k++) {
        const a = k * 2.4 + hx, x = cx0 + Math.cos(a) * (.5 + k * .1), z = cz0 + Math.sin(a) * (.4 + k * .08);
        if (groundH(x, z) < .3 || forbid(x, z) || inletD(x, z) < .8 || cove(x, z) > .08) continue;
        const o = mk(1 + (k % 2), { w: .4 + rnd() * .12, d: .36, wall: WALLS[(hc + k) % WALLS.length], stone: k % 2 === 0 }); if (o.stone) { o.wall = GRANITE[k % 3]; o.gal = false; }
        W(put(house(o), x, z, a * .7, -.01));
      }
      if (ch) { const c = church(.85); W(put(c, cx0 + .2, cz0 - .55, rnd() * 6, -.02)); }
      else { const hr = horreo(); W(put(hr, cx0 - .3, cz0 + .35, rnd() * 6, -.02)); }
    } }


  // ---- supermarkets, small blocks of flats, more houses and crop fields (everything goes through the tidy pass below, so nothing overlaps)
  function supermarket(col) {
    const g = new THREE.Group(), w = .9, d = .55;
    const b = box(w, .2, d, std(0xf4efe2)); b.position.y = .1; g.add(b);
    const rf = box(w + .06, .035, d + .06, std(col)); rf.position.y = .215; g.add(rf);
    const gl = box(w * .8, .11, .02, winMat); gl.position.set(-.04, .09, d / 2 + .008); g.add(gl);
    for (let k = 0; k <= 6; k++) { const m = box(.012, .12, .026, std(0xffffff)); m.position.set(-.04 - w * .4 + k * w * .8 / 6, .09, d / 2 + .012); g.add(m); }
    const aw = box(w * .85, .025, .12, std(col)); aw.position.set(-.04, .17, d / 2 + .06); aw.rotation.x = .2; g.add(aw);
    const sign = box(.36, .07, .02, std(col)); sign.position.set(.26, .27, d / 2 - .02); g.add(sign); const sl = box(.28, .035, .022, std(0xfff8ea)); sl.position.set(.26, .27, d / 2 - .01); g.add(sl);
    for (let k = 0; k < 4; k++) { const tr = box(.045, .028, .03, std(0x8a929a)); tr.position.set(-.3 + k * .06, .02, d / 2 + .16); g.add(tr); }
    g.userData.fp = .85; g.userData.pri = 2; return g;
  }
  function flats(col) {
    const g = new THREE.Group(), w = .5, d = .42, fl = 3, fh = .17;
    const b = box(w, fl * fh, d, std(col)); b.position.y = fl * fh / 2; g.add(b);
    for (let f = 0; f < fl; f++) for (let k = -1; k <= 1; k++) { const fr = box(.07, .09, .014, std(0xfff8ea)); fr.position.set(k * .15, f * fh + .1, d / 2 + .004); g.add(fr); const gl = box(.048, .068, .018, winMat); gl.position.set(k * .15, f * fh + .1, d / 2 + .008); g.add(gl); if (f > 0 && k !== 0) { const bc = box(.1, .016, .045, std(0xd9d0bc)); bc.position.set(k * .15, f * fh + .04, d / 2 + .03); g.add(bc); } }
    const rf = box(w + .04, .03, d + .04, std(0xb9b19d)); rf.position.y = fl * fh + .015; g.add(rf);
    const dr = box(.09, .12, .02, std(0x3d78a8)); dr.position.set(0, .06, d / 2 + .008); g.add(dr);
    g.userData.fp = .5; g.userData.pri = 2; g.userData.home = 1; return g;
  }
  { const FLATC = [0xf2c6a8, 0xaed0dc, 0xf3d9a0, 0xb9d9c3];
    [[-3.0, 2.3, 0xc9462e], [10.6, 1.9, 0x2f6fa8]].forEach(([x, inl, c]) => { const [px, pz] = onShore(x, inl); W(put(supermarket(c), px, pz, seaYaw(px), -.02)); });
    [[-10.2, 2.1], [-5.9, 2.5], [2.0, 2.2], [6.4, 2.2], [12.1, 2.4]].forEach(([x, inl], i) => { const [px, pz] = onShore(x, inl); W(put(flats(FLATC[i % 4]), px, pz, seaYaw(px), -.02)); });
    // more houses along the village streets, in rows that keep a clear gap
    for (const [x0, x1, inl] of [[-17.2, -9.6, 4.6], [-9.0, -2.4, 3.9], [-.8, 4.2, 4.2], [7.4, 13.4, 4.3], [-8.7, -6.2, 5.3]]) for (let x = x0; x < x1; x += .95) hh(x, inl + (rnd() - .5) * .25, 1 + (hc % 2), { shut: [0x3d78a8, 0x4a9a74, 0xb4483a][hc % 3] });
    for (const x of [-18.6, -16.9, -15.4]) hh(x, 2.4, 1 + (hc % 2)); for (const x of [14.0, 15.1, 17.9]) hh(x, 2.6, 1 + (hc % 2));
    // crop fields: rows of vegetables, vines, wheat, ploughed earth and flower beds on the gentle slopes
    const CROPS = [[0x6fae3a, 0x4f8f2d], [0xe6c85a, 0xcfa83a], [0x8a5a3a, 0x6f452c], [0x7aa84a, 0x9c5fb0], [0x5f8f3a, 0x3d6f26], [0xe9a23a, 0xd4812a]];
    const field = (x, z, ang, w, d, ci, lift) => {
      const g = new THREE.Group(), [c1, c2] = CROPS[ci % CROPS.length], base = box(w, .03, d, std(0x8a6a44)); base.position.y = .0; g.add(base);
      const rows = Math.floor(d / .09);
      for (let r = 0; r < rows; r++) {
        const rw = box(w - .06, ci % 3 === 2 ? .028 : .05, .045, std(r % 2 ? c1 : c2)); rw.position.set(0, ci % 3 === 2 ? .02 : .03, -d / 2 + .06 + r * .09); g.add(rw);
        if (ci % 6 === 3) for (let k = 0; k < 6; k++) { const bl = new THREE.Mesh(new THREE.SphereGeometry(.022, 6, 5), std([0xe9577a, 0xf5e04a, 0xfff8ea][(k + r) % 3])); bl.position.set(-w / 2 + .1 + k * (w - .2) / 5, .065, -d / 2 + .06 + r * .09); g.add(bl); }
      }
      const fn = box(w + .04, .05, .012, std(0x8a6a44)); fn.position.set(0, .03, d / 2 + .01); g.add(fn); const fn2 = fn.clone(); fn2.position.z = -d / 2 - .01; g.add(fn2);
      // the produce: nothing grows until it rains; then fruits come out, stay, and are picked by the farmer
      const PRC = [0xe0523f, 0xf2a43a, 0x8fcf60, 0x9a6cc0, 0xf2d24e, 0xe9774a][ci % 6], prod = [], nr = Math.max(2, Math.floor(rows / 2)), nc = Math.max(3, Math.floor(w / .1));
      for (let r2 = 0; r2 < nr; r2++) for (let k = 0; k < nc; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), std(PRC)); f.position.set(-w / 2 + .09 + k * (w - .18) / Math.max(1, nc - 1), .075, -d / 2 + .1 + r2 * (d - .2) / Math.max(1, nr - 1)); f.scale.setScalar(.001); f.visible = false; g.add(f); prod.push(f); }
      g.userData.prod = prod; g.userData.fw = w; g.userData.fd = d;
      g.userData.fp = Math.max(w, d) * .5 + (w < .45 ? .01 : .1); g.userData.pri = 0; g.userData.field = 1; g.userData.fx = x; g.userData.fz = z; g.userData.fang = ang; W(put(g, x, z, ang, .03 + lift)); return g;
    };
    // tiny fields on little stone terraces around the mountain village, and a few more houses there
    { const vb = [10.6, shore(10.6) - 7.3], TF = [[-1.9, -1.4], [-2.6, -.2], [-1.6, 1.2], [1.6, 2.0], [2.8, .9], [3.0, -.6], [2.4, -2.0], [-.4, 2.3], [.6, -2.6], [-3.1, 1.5], [1.0, 3.1], [-2.2, 2.7], [-3.4, -1.6], [3.6, 2.2], [-1.0, -3.0], [3.8, -1.4], [2.0, 3.6], [-3.6, 3.0], [-.6, 3.8], [1.6, -3.4]];
      // two groups of four small fields on a levelled stone platform, beside the houses (they do not touch the slope)
      [[3.9, 7.0], [14.2, 7.4]].forEach(([cx, inl], ci2) => { const z0 = shore(cx) - inl, plat = new THREE.Group(), pb = box(1.25, .16, 1.05, std(0xaaa08c)); pb.position.y = -.02; plat.add(pb); const hh0 = groundH(cx, z0); W(put(plat, cx, z0, 0, -.06));
        [[-.3, -.25], [.3, -.25], [-.3, .25], [.3, .25]].forEach(([ox, oz], q) => { const gf = field(cx + ox, z0 + oz, 0, .5, .4, 30 + ci2 * 4 + q, 0); gf.userData.fp = 0; gf.userData.pri = 0; gf.position.copy(dirFrom(cx + ox, z0 + oz, new THREE.Vector3()).multiplyScalar(R + hh0 + .08)); }); });
      for (let k = 0; k < 44; k++) { const a = k * 2.4, rr = 1.6 + (k % 7) * .55; hh(vb[0] + Math.cos(a) * rr * 1.1, 7.3 + Math.sin(a) * rr - 0, 1 + (hc % 2), { stone: k % 2 === 0 }); } }
    let fi = 0;
    for (const [fx, inl] of []) {
      const x = fx, z = shore(x) - inl, sl = Math.abs(groundH(x + .5, z) - groundH(x - .5, z)) + Math.abs(groundH(x, z + .5) - groundH(x, z - .5));
      if (groundH(x, z) < .35 || sl > .16 || inletD(x, z) < 1.2) continue;
      field(x, z, seaYaw(x) + (fi % 2 ? .15 : -.12), .55 + (fi % 3) * .08, .45 + (fi % 2) * .06, fi, sl * .7); fi++;
    }
  }

  // ---- a shopping street and a village fiesta (verbena) on the south shore: bar with terrace, supermarket, pulpería, the stage of an orchestra, stalls, string lights and a "saltamontes" (little roller-coaster)
  const fiestaLights = [];
  const fiestaObj = [], fiestaFx = { x: 0, z: 0 };
  { const sx = 2.0, sz0 = shoreS(sx) + 1.45, sline = []; for (let k = 0; k <= 19; k++) sline.push([sx + .12 * Math.sin(k * .5), sz0 + .75 + k * .2]);
    const sr = relax(sline, 3);
    W(ribbon(sr, .42, std(0xcfc6b4, { roughness: 1, side: THREE.DoubleSide }), .012, false, undefined, true)); W(ribbon(sr, .6, std(0xe3dac4, { roughness: 1, side: THREE.DoubleSide }), .004, false, undefined, true));
    const px = (z) => sx + .12 * Math.sin((z - sz0) / .2 * .5);
    const shopFront = (sd, z, wall, roof, awn, kind) => {
      const g = new THREE.Group(), w = .44, d = .4, bd = box(w, .32, d, std(wall)); bd.position.y = .16; g.add(bd);
      const rf = gable(w + .06, d + .06, .17, std(roof)); rf.position.y = .32; g.add(rf);
      const gl = box(w * .7, .15, .02, winMat); gl.position.set(0, .15, d / 2 + .008); g.add(gl);
      const aw = box(w * .85, .02, .12, std(awn)); aw.position.set(0, .27, d / 2 + .06); aw.rotation.x = .25; g.add(aw);
      for (let k = 0; k < 4; k++) { const st = box(w * .85 / 8, .021, .12, std(0xfff8ea)); st.position.set(-w * .32 + k * w * .21, .271, d / 2 + .06); st.rotation.x = .25; g.add(st); }
      const sign = box(.3, .06, .02, std(0xfff8ea)); sign.position.set(0, .37, d / 2 - .01); g.add(sign);
      if (kind === 'pulperia') { const oc = new THREE.Group(), hd = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), std(0xc9462e)); hd.position.y = .0; oc.add(hd); for (let k = 0; k < 6; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.004, .003, .045, 4), std(0xc9462e)); t.position.set(Math.cos(k) * .02, -.035, Math.sin(k) * .02); oc.add(t); } oc.position.set(0, .37, d / 2 + .0); g.add(oc); }
      if (kind === 'bar') { const cup = new THREE.Mesh(new THREE.CylinderGeometry(.018, .012, .03, 8), std(0xd9a441)); cup.position.set(0, .375, d / 2); g.add(cup); }
      g.userData.fp = .27; g.userData.pri = 4; g.userData.home = 1;
      W(put(g, px(z) + sd * .56, z, sd > 0 ? -PI / 2 : PI / 2, -.01)); return g;
    };
    shopFront(-1, sz0 + .75 + .55, 0xf6e6b4, 0xc9462e, 0xc9462e, 'bar'); shopFront(1, sz0 + .75 + .55, 0xaed0dc, 0x5f7f96, 0x2f6fa8, 'shop');
    shopFront(-1, sz0 + .75 + 1.2, 0xf2c6a8, 0xd0693a, 0x3b8f6a, 'pulperia'); shopFront(1, sz0 + .75 + 1.2, 0xb9d9c3, 0xc45a30, 0xe9b94a, 'shop');
    { const sm = supermarket(0x2f6fa8); sm.scale.setScalar(.6); sm.userData.fp = .45; sm.userData.pri = 4; W(put(sm, px(sz0 + .75 + 1.95) + .8, sz0 + .75 + 1.95, -PI / 2, -.02)); }
    // terrace of the bar: tables with parasols on the pavement
    for (let k = 0; k < 2; k++) { const tz = sz0 + .75 + .5 + k * .3, g = new THREE.Group(), tb = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .012, 10), std(0xf4efe4)); tb.position.y = .08; g.add(tb); const ps = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .08, 5), std(0xeeeeee)); ps.position.y = .04; g.add(ps); const pa = parasol(0xc9462e); pa.scale.setScalar(.6); g.add(pa); W(put(g, px(tz) - .24, tz, 0, 0)); }
    // the pulpería's long table, with people eating octopus
    { const g = new THREE.Group(); g.add(box(.5, .02, .09, std(0x9a7a52))); g.children[0].position.y = .07; for (const lx of [-.2, .2]) { const lg = box(.02, .07, .02, std(0x6b4a2a)); lg.position.set(lx, .035, 0); g.add(lg); } const pl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .01, 10), std(0xfff8ea)); pl.position.set(.1, .085, 0); g.add(pl); const oc = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), std(0xe9744a)); oc.position.set(.1, .095, 0); g.add(oc); W(put(g, px(sz0 + .75 + 1.2) - .26, sz0 + .75 + 1.2, PI / 2, 0));
      for (let k = 0; k < 3; k++) { const pp = person(SHIRTS[(k * 3 + 1) % SHIRTS.length], { skin: SKINS[k % 4], role: 'town' }); pp.scale.setScalar(.8); W(put(pp, px(sz0 + .75 + 1.2) - .26 + .12 * (k - 1), sz0 + .75 + 1.2 + .1, PI, .0)); } }
    // string lights over the street
    for (let k = 0; k < 5; k++) { const z = sz0 + .75 + .35 + k * .42, a = new THREE.Group(); for (let b = 0; b < 7; b++) { const bu = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), lampMat); bu.position.set(-.35 + b * .117, .38 - Math.sin(b / 6 * PI) * .05, 0); a.add(bu); } const ln = box(.7, .004, .004, std(0x3a3a3a)); ln.position.y = .39; a.add(ln); W(put(a, px(z), z, 0, 0)); }
    // the fiesta field at the end of the street
    const fx = px(sz0 + .75 + 3.0), fz = sz0 + .75 + 3.0 + .6;
    { const slab = new THREE.Group(); slab.add(box(2.7, .12, 2.4, std(0xe6dcc0))); slab.userData.fp = 0; W(put(slab, fx, fz, 0, -.05)); }
    // orchestra stage with a roof, musicians and a banner
    { const g = new THREE.Group(), bs = box(.9, .1, .5, std(0x8a6a44)); bs.position.y = .05; g.add(bs); const bn = box(.7, .08, .01, std(0xfff8ea)); bn.position.set(0, .4, .3); g.add(bn); const back = box(.9, .3, .02, std(0x5b3a2a)); back.position.set(0, .25, -.24); g.add(back);
      for (let k = 0; k < 5; k++) { const m = person(SHIRTS[(k * 2 + 3) % SHIRTS.length], { skin: SKINS[k % 4], pants: 0x1f2937, role: 'band' }); m.scale.setScalar(.75); m.position.set(-.32 + k * .16, .1, .02); g.add(m); const ins = box(.03, .03, .05, std([0xd9a441, 0x8a5a3a, 0xc0c0c0][k % 3])); ins.position.set(-.32 + k * .16, .14, .06); g.add(ins); fiestaObj.push(m); }
      g.userData.fp = .5; g.userData.pri = 4; const stl = new THREE.PointLight(0xffb86b, 0, 3.2, 1.6); stl.position.set(0, .5, .1); g.add(stl); fiestaLights.push([stl, 1.6]); for (let k = 0; k < 6; k++) { const sb = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 5), lampMat); sb.position.set(-.4 + k * .16, .42, .3); g.add(sb); } W(put(g, fx - .75, fz - .6, Math.atan2(.75, .6), .0)); }
    // stalls (churros, pulpo, tombola) with striped awnings and a crowd that dances and strolls
    for (const [dx, dz, c, ry] of [[.1, -.95, 0xc9462e, 0], [.8, -.95, 0x2f6fa8, 0], [1.05, .1, 0xe9b94a, -PI / 2], [1.05, .8, 0x3b8f6a, -PI / 2]]) { const g = new THREE.Group(), bd = box(.34, .16, .22, std(0xfff8ea)); bd.position.y = .08; g.add(bd); const aw = box(.4, .02, .16, std(c)); aw.position.set(0, .26, .1); aw.rotation.x = .25; g.add(aw); for (let k = 0; k < 4; k++) { const st = box(.05, .021, .16, std(0xfff8ea)); st.position.set(-.15 + k * .1, .261, .1); st.rotation.x = .25; g.add(st); } for (const sx of [-.18, .18]) { const po = box(.015, .2, .015, std(0x6b4a2a)); po.position.set(sx, .13, .17); g.add(po); } g.userData.fp = .22; g.userData.pri = 4; W(put(g, fx + dx, fz + dz, ry, 0)); }
    const crowd = []; for (let k = 0; k < 26; k++) { const pp = person(SHIRTS[(k * 3 + 2) % SHIRTS.length], { skin: SKINS[k % 4], role: 'fest' }); pp.scale.setScalar(.85); W(pp); crowd.push({ p: pp, a: k * .9, cx: fx - .1 + (k % 6 - 2.5) * .15, cz: fz + .1 + (Math.floor(k / 6) - 1.5) * .2, dance: k % 2, night: k >= 14, s0: .85 }); }
    fiestaFx.x = fx; fiestaFx.z = fz;
    window.__crowd = crowd;
    // the saltamontes: a small ring roller-coaster with a train of three cars
    { const cx = fx + .3, cz = fz - .45, N = 20, pts = [];
      for (let k = 0; k < N; k++) { const a = k / N * PI * 2, rr = .3 + .03 * Math.sin(a * 3); const x = cx + Math.cos(a) * rr * 1.1, z = cz + Math.sin(a) * rr; const y = .09 + (Math.sin(a * 3 + .5) * .5 + .5) * .14; dirFrom(x, z, _e).multiplyScalar(R + groundH(x, z) + y); pts.push(_e.clone()); }
      const curve = new THREE.CatmullRomCurve3(pts, true), tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, .01, 6, true), std(0xc9462e)); W(tube);
      for (let k = 0; k < N; k += 2) { const pp = pts[k], gp = dirFrom(0, 0, _f), base = pp.clone().normalize().multiplyScalar(R + .03), leg = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, pp.length() - base.length(), 4), std(0xeeeeee)); leg.position.copy(pp.clone().add(base).multiplyScalar(.5)); leg.quaternion.setFromUnitVectors(Y, pp.clone().sub(base).normalize()); W(leg); }
      const cars = []; for (let k = 0; k < 3; k++) { const g = new THREE.Group(); g.scale.setScalar(.5); const cb = box(.11, .045, .07, std([0xf2c14a, 0x2f6fa8, 0x3b9a6a][k])); cb.position.y = .03; g.add(cb); const pp = person(SHIRTS[(k * 2) % SHIRTS.length], { skin: SKINS[k], role: 'kid' }); pp.scale.setScalar(.45); pp.position.y = .05; g.add(pp); W(g); cars.push(g); }
      const lap = (cx2, cz2) => 0;
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .02, 10), std(0xfff8ea)); const gg = new THREE.Group(); gg.add(sp); gg.userData.fp = .2; gg.userData.pri = 4; W(put(gg, cx, cz, 0, -.04));
      for (let k = 0; k < N; k += 2) { const bl = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 5), lampMat); bl.position.copy(pts[k]).addScaledVector(pts[k].clone().normalize(), .03); W(bl); }
      const rl = new THREE.PointLight(0xff7aa8, 0, 2.6, 1.6); const rg = new THREE.Object3D(); rg.add(rl); W(put(rg, cx, cz, 0, .5)); fiestaLights.push([rl, 1.3]);
      fiestaObj.push({ curve, cars }); }
    // a second, small stage for a singer: platform, backdrop, speakers, a microphone stand, coloured spot lights and the singer, with a few fans in front
    { const g = new THREE.Group(), bs = box(.62, .09, .42, std(0x6b4a2a)); bs.position.y = .045; g.add(bs); const back = box(.62, .3, .02, std(0x2b2d42)); back.position.set(0, .24, -.19); g.add(back); for (let k = 0; k < 5; k++) { const bl = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), new THREE.MeshStandardMaterial({ color: [0xff5a7a, 0xffd36b, 0x6bd0ff, 0x9bff7a, 0xff9a3b][k], emissive: [0xff5a7a, 0xffd36b, 0x6bd0ff, 0x9bff7a, 0xff9a3b][k], emissiveIntensity: .6 })); bl.position.set(-.24 + k * .12, .4, -.17); g.add(bl); g.userData['b' + k] = bl; }
      for (const sx of [-.27, .27]) { const sp = box(.07, .12, .06, std(0x1d1f23)); sp.position.set(sx, .15, -.1); g.add(sp); const cn = new THREE.Mesh(new THREE.CircleGeometry(.02, 10), std(0x555a63)); cn.position.set(sx, .17, -.068); g.add(cn); }
            const st = box(.006, .13, .006, std(0x2b3036)); st.position.set(0, .16, .05); g.add(st); const mc = new THREE.Mesh(new THREE.SphereGeometry(.01, 6, 5), std(0x2b3036)); mc.position.set(0, .23, .05); g.add(mc);
      const sg = person(0xe9577a, { skin: SKINS[1], pants: 0x2f2f4a, role: 'band', hat: 0xf6f1e4 }); sg.scale.setScalar(.85); sg.position.set(0, .09, .0); g.add(sg); fiestaObj.push(sg);
      const spl = new THREE.PointLight(0xff7ac8, 0, 2.2, 1.6); spl.position.set(0, .42, .1); g.add(spl); fiestaLights.push([spl, 1.2]);
      g.userData.fp = .42; g.userData.pri = 4; W(put(g, fx + .15, fz + 1.0, PI, 0)); }
    for (let k = 0; k < 8; k++) { const pp = person(SHIRTS[(k * 3 + 1) % SHIRTS.length], { skin: SKINS[k % 4], role: 'fest' }); pp.scale.setScalar(.8); W(pp); crowd.push({ p: pp, a: k * 1.3, cx: fx + .15 + (k % 4 - 1.5) * .13, cz: fz + 1.0 - .33 - Math.floor(k / 4) * .18, dance: 1, night: false, s0: .8 }); }
    // flags between lamp posts and a little lamp for the stage
    for (const [dx, dz] of [[-1.1, -1.0], [1.1, -1.0], [-1.1, 1.0], [1.1, 1.0]]) { const lp = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.01, .013, .4, 5), std(0x2b3036)); pole.position.y = .2; lp.add(pole); const lb = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), lampMat); lb.position.y = .42; lp.add(lb); W(put(lp, fx + dx, fz + dz, 0, 0)); }
  }

  // ---- a second, prettier lighthouse on the cape of Punta Uhía: tapered white tower with red bands, a gallery with railing, a glass lantern whose beam turns at night, the keeper's house and a rocky base
  const beamPivot = new THREE.Group();
  { const g = new THREE.Group(), white = std(0xf6f1e4), red = std(0xc9462e);
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(.5, 2), std(0x9a968a)); rock.scale.set(1, .45, .85); rock.position.y = .06; g.add(rock);
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, 1.1, 14), white); tw.position.y = .72; g.add(tw);
    for (const [y, h] of [[.45, .17], [.88, .17]]) { const bd = new THREE.Mesh(new THREE.CylinderGeometry(.165 - y * .07 + .05, .185 - y * .07 + .05, h, 14), red); bd.position.y = y + .26; g.add(bd); }
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(.19, .15, .045, 16), std(0x2b3036)); gal.position.y = 1.29; g.add(gal);
    for (let k = 0; k < 16; k++) { const a2 = k / 16 * PI * 2, r1 = box(.012, .07, .012, std(0x2b3036)); r1.position.set(Math.cos(a2) * .18, 1.34, Math.sin(a2) * .18); g.add(r1); }
    const rl = new THREE.Mesh(new THREE.TorusGeometry(.18, .008, 5, 20), std(0x2b3036)); rl.rotation.x = PI / 2; rl.position.y = 1.375; g.add(rl);
    const lan = new THREE.Mesh(new THREE.CylinderGeometry(.095, .095, .16, 12), new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .5, transparent: true, opacity: .85 })); lan.position.y = 1.4; g.add(lan); g.userData.lan = lan;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.13, .13, 12), red); cap.position.y = 1.54; g.add(cap); const ball = new THREE.Mesh(new THREE.SphereGeometry(.02, 8, 6), std(0x2b3036)); ball.position.y = 1.62; g.add(ball);
    const dr = box(.07, .12, .02, std(0x2f6fa8)); dr.position.set(0, .14, .2); g.add(dr);
    const kh = house({ w: .38, d: .3, floors: 1, wall: 0xf6f1e4, roof: ROOF[0], gal: false, shut: 0x2f6fa8, fr: 2, door: 0x2f6fa8 }); kh.position.set(.5, -.0, .12); kh.scale.setScalar(.85); g.add(kh);
    beamPivot.position.y = 1.4; const bm = new THREE.Mesh(new THREE.ConeGeometry(.12, 1.3, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); bm.rotation.z = -PI / 2; bm.position.x = .7; beamPivot.add(bm); g.add(beamPivot); beamPivot.userData.m = bm;
    const sl = new THREE.PointLight(0xffd36b, 0, 5, 1.8); sl.position.y = 1.4; g.add(sl); g.userData.sl = sl;
    g.scale.setScalar(.9); g.userData.fp = 0; g.userData.pri = 0;
    // it stands at the far end of a short stone causeway that runs out into the open sea from the western cape (like the road out to Fisterra's light)
    let x0 = -4; while (x0 > -40 && isl(0, x0, ISL[0].cz) < 1) x0 -= .05;
    const zc = ISL[0].cz, LEN = 4.4, stone2 = std(0xb4ad9a), cap2 = std(0xd0cabb);
    for (let k = 0; k * .42 < LEN; k++) { const x = x0 + .5 - k * .42, q = new THREE.Group(); q.userData.stoneBlock = 1; const b1 = box(.46, .4, .5, stone2); b1.position.y = .0; q.add(b1); const c1 = box(.5, .05, .54, cap2); c1.position.y = .22; q.add(c1);
      for (const sz of [-1, 1]) { const wl = box(.46, .09, .05, stone2); wl.position.set(0, .29, sz * .22); q.add(wl); }
      W(put(q, x, zc, 0, .03, true)); }
    for (let k = 0; k < 9; k++) { const rk = new THREE.Mesh(new THREE.IcosahedronGeometry(.12 + rnd() * .12, 2), std(0x8d897d, { flatShading: false })); rk.scale.y = .7; W(put(rk, x0 - LEN * .15 - rnd() * LEN * .5, zc + (rnd() - .5) * 1.2 + (k % 2 ? .4 : -.4), rnd() * 6, -.05, true)); }
    const lx = x0 + .5 - LEN, base = new THREE.Mesh(new THREE.CylinderGeometry(.5, .56, .3, 16), stone2); const bg = new THREE.Group(); bg.add(base); bg.userData.stoneBlock = 1; W(put(bg, lx, zc, 0, .04, true));
    g.remove(g.children[0]); g.remove(g.children.find((c) => c.scale && Math.abs(c.scale.x - .85) < .01));
    W(put(g, lx, zc, PI / 2, .13, true)); fiestaObj.push({ lh2: g });
  }

  // ---- a little wooden bridge over the river, and neighbours who walk across it
  { const n = riverPts.length, k = Math.floor(n * .66), a1 = riverPts[k - 1], b1 = riverPts[k + 1], c0 = riverPts[k], tx = b1[0] - a1[0], tz = b1[1] - a1[1], tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl, wr = riverWidths[k] || .4, len = wr + 1.0;
    BRIDGE_C = [c0[0], c0[1]]; const yaw = Math.atan2(-nz, nx), g = new THREE.Group(), wood = std(0xb98a5a), dark = std(0x8a6a44);
    const deck = box(len, .04, .28, wood); deck.position.y = .17; g.add(deck); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const lg = box(.04, .17, .04, dark); lg.position.set(sx * (len / 2 - .08), .085, sz * .1); g.add(lg); }
    for (let q = 0; q < Math.floor(len / .1); q++) { const pl = box(.012, .038, .27, dark); pl.position.set(-len / 2 + .06 + q * .1, .172, 0); g.add(pl); }
    for (const sz of [-1, 1]) { const rl = box(len, .02, .02, dark); rl.position.set(0, .26, sz * .14); g.add(rl); for (let q = 0; q <= 5; q++) { const po = box(.02, .1, .02, dark); po.position.set(-len / 2 + .05 + q * (len - .1) / 5, .21, sz * .14); g.add(po); } }
    const hm = Math.max(groundH(c0[0] + nx * len * .5, c0[1] + nz * len * .5), groundH(c0[0] - nx * len * .5, c0[1] - nz * len * .5), groundH(c0[0], c0[1]));
    g.userData.fp = len * .5 + .2; g.userData.pri = 5; put(g, c0[0], c0[1], yaw, hm + .02 - groundH(c0[0], c0[1])); W(g);
    // houses on both banks, a little way beyond the bridge ends
    [[-1, 1.15, 0], [1, 1.15, 1], [-1, 1.95, 2], [1, 2.0, 3], [-1, 2.8, 4]].forEach(([sd, dist, i3]) => { const ex = c0[0] + nx * sd * (len / 2 + dist) + (tx / tl) * (i3 % 2 ? .5 : -.5), ez = c0[1] + nz * sd * (len / 2 + dist) + (tz / tl) * (i3 % 2 ? .5 : -.5); if (groundH(ex, ez) < .3 || inletD(ex, ez) < .7) return; const hs = house({ w: .44, d: .38, floors: 1 + (i3 % 2), wall: WALLS[(i3 * 3 + 2) % WALLS.length], roof: ROOF[i3 % ROOF.length], gal: false, shut: [0x3d78a8, 0x4a9a74, 0xb4483a][i3 % 3], fr: i3 + 7, stone: i3 % 2 === 1 }); hs.userData.pri = 2; W(put(hs, ex, ez, yaw + (sd > 0 ? PI / 2 : -PI / 2), -.02)); });
    const pts = [[c0[0] + nx * (len / 2 + .5), c0[1] + nz * (len / 2 + .5)], [c0[0] - nx * (len / 2 + .5), c0[1] - nz * (len / 2 + .5)]], rt = route(pts);
    [[0, 1, .05, 1], [4, 0, .04, -1], [2, 2, .06, 1]].forEach(([c, sk, v, d], i2) => { const pp = person(SHIRTS[c % SHIRTS.length], { skin: SKINS[sk], role: 'town' }); pp.scale.setScalar(.85); W(pp); pathers.push({ p: pp, r: rt, u: .15 + i2 * .3, v: v * d * .35, off: (i2 - 1) * .04, lift: 0, bridge: { cx: c0[0], cz: c0[1], half: len / 2, top: hm + .215 } }); }); }

  // ---- tidy up: no building may overlap another one or stand on a road; the most important ones (churches, schools, squares, arcades) stay
  { const items = [], dd2 = new THREE.Vector3();
    for (const o of world.children) { const u = o.userData; if (!u || !(u.fp || u.fps)) continue; if (u.fp === 0) continue; dd2.copy(o.position).normalize(); const [x, z] = planeOf(dd2); items.push({ o, x, z, home: !!u.home, pri: u.pri || 1, circles: u.fps ? u.fps.map(([dx, r]) => [x + dx, z, r]) : [[x, z, u.fp]] }); }
    items.sort((a, b) => b.pri - a.pri || b.circles[0][2] - a.circles[0][2]);
    const roads = [roadRaw, roadS, relax(stPts, 3)]; const nearRoad = (c, withStreet) => roads.some((pts, ri) => (ri < 2 || withStreet) && pts.some((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) < c[2] + .6));
    const kept = [];
    for (const it of items) {
      const bad = it.circles.some((c) => kept.some((k) => k.circles.some((kc) => Math.hypot(c[0] - kc[0], c[1] - kc[1]) < c[2] + kc[2] + (it.pri >= 4 && k.pri >= 4 ? -.05 : .3))) || (it.pri < 3 && nearRoad(c, it.pri < 2)) || (it.pri < 3 && kept.some((k) => k.pri === 3 && k.circles.some((kc) => Math.hypot(c[0] - kc[0], c[1] - kc[1]) < c[2] + kc[2] + .7))));
      if (bad) world.remove(it.o); else { addOutline(it.o); if (it.home) HOMES.push([it.x, it.z, it.circles[0][2]]); kept.push(it); for (const c of it.circles) keptC.push(c); }
    } }
  { const solids = [], dd3 = new THREE.Vector3();
    for (const o of world.children) if (o.userData && o.userData.stoneBlock) { dd3.copy(o.position).normalize(); const [x, z] = planeOf(dd3); solids.push([x, z]); }
    for (let i = boats.length - 1; i >= 0; i--) { const b = boats[i]; dd3.copy(b.w.position).normalize(); const [x, z] = planeOf(dd3); if (solids.some((q) => Math.hypot(q[0] - x, q[1] - z) < (b.calm ? .9 : .5))) { world.remove(b.w); boats.splice(i, 1); } } }
  const oaks = [], pines = [], euc = [];
  const dd = new THREE.Vector3();
  for (let i = 0; i < 14000 && oaks.length + pines.length + euc.length < 330; i++) {
    dd.set(rnd() - .5, rnd() - .5, rnd() - .5).normalize();
    const [x, z] = planeOf(dd), r = islandR(x, z), h = groundH(x, z);
    const spit = x > -5.8 && x < -2.6 && z > shore(x) - 1.7 && z < shore(x) - .5;
    if (r > .985 || h < (spit ? .04 : .28) || (!spit && (forbid(x, z) || cove(x, z) > .45))) continue;
    const inl = z < shore(x) - 5.2;
    if (spit) { if (!roadN.some((q) => Math.abs(q[0] - x) < 1 && Math.hypot(q[0] - x, q[1] - z) < .7)) pines.push([x, z, .85 + rnd() * .4]); continue; }
    const q = rnd();
    if (h > 1.6) { if (q < .5) pines.push([x, z, .8 + rnd() * .7]); else oaks.push([x, z, .8 + rnd() * .5]); }
    else if (q < .6) oaks.push([x, z, .75 + rnd() * .6]); else if (q < .74) pines.push([x, z, .75 + rnd() * .6]); else if (inl || q > .9) euc.push([x, z, .8 + rnd() * .6]);
    else oaks.push([x, z, .6 + rnd() * .4]);
  }
  const trunkG = new THREE.CylinderGeometry(.028, .04, .32, 6), trunkM = std(0x7a5a3c); trunkG.translate(0, -.03, 0);
  // faceted, slightly lumpy crowns, like the low-poly trees of the reference
  const lowpoly = (g, a) => { const ps = g.attributes.position; for (let q = 0; q < ps.count; q++) { const x = ps.getX(q), y = ps.getY(q), z = ps.getZ(q), k = 1 + (hash2(x * 37.1 + y * 11.3, z * 53.7 + y * 5.1) - .5) * a; ps.setXYZ(q, x * k, y * k, z * k); } g.computeVertexNormals(); return g; };
  const oakG = lowpoly(new THREE.IcosahedronGeometry(.27, 1), .34), pineG = lowpoly(new THREE.IcosahedronGeometry(.2, 1).scale(1, 1.7, 1), .26), pine2G = lowpoly(new THREE.IcosahedronGeometry(.14, 1).scale(1, 1.6, 1), .26);
  const eucG = lowpoly(new THREE.IcosahedronGeometry(.16, 1), .3), eucT = new THREE.CylinderGeometry(.014, .026, .8, 5);
  const inst = (geo, mat, list, place) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), o = new THREE.Object3D(), hold = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((t, i) => { put(hold, t[0], t[1], rnd() * 6.28, -.02); o.position.copy(hold.position); o.quaternion.copy(hold.quaternion); o.scale.setScalar(t[2]); place(o, t); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, place.color ? place.color(c, t) : c.set(0xffffff)); });
    m.count = list.length; m.castShadow = true; m.receiveShadow = true; return m;
  };
  const gorse = (base, v, p) => (c) => { if (rnd() < p) return c.set(0xf5d83a).offsetHSL((rnd() - .5) * .03, 0, (rnd() - .5) * .08); return c.set(base).offsetHSL((rnd() - .5) * .03, (rnd() - .5) * .08, (rnd() - .5) * v); };   // some bushes flower yellow, like the Galician toxos
  const green = (base, v) => (c) => c.set(base).offsetHSL((rnd() - .5) * .03, (rnd() - .5) * .08, (rnd() - .5) * v);
  const pl = (fn, colFn) => { fn.color = colFn; return fn; };
  W(inst(trunkG, trunkM, oaks, pl((o) => o.translateY(.13 * o.scale.x))));
  W(inst(oakG, std(0xffffff, { flatShading: true, roughness: .85, map: paintTexR(3) }), oaks, pl((o) => { o.translateY(.5 * o.scale.x); o.scale.y *= .9; }, gorse(0x4a9a78, .12, .22))));
  W(inst(trunkG, trunkM, pines, pl((o) => o.translateY(.13 * o.scale.x))));
  W(inst(pineG, std(0xffffff, { flatShading: true, roughness: .85, map: paintTexR(3) }), pines, pl((o) => o.translateY(.5 * o.scale.x), green(0x3c8c6c, .1))));
  W(inst(pine2G, std(0xffffff, { flatShading: true, roughness: .85, map: paintTexR(3) }), pines, pl((o) => o.translateY(.98 * o.scale.x), green(0x4e9e7a, .1))));
  W(inst(eucT, std(0xcfc7b0), euc, pl((o) => o.translateY(.4 * o.scale.x))));
  W(inst(eucG, std(0xffffff, { flatShading: true, roughness: .85, map: paintTexR(3) }), euc, pl((o) => { o.translateY(.88 * o.scale.x); o.scale.y *= 1.5; }, gorse(0x7fb48a, .1, .12))));

  // Monte Louro
  spot('Monte Louro', 'Monte', 'Across the water, Monte Louro rises over the mouth of the ría, with pines on its slopes and the sea on three sides.', hubAt(LOURO[0], LOURO[1], 1.9), .6);

  // ---- gentle little animals on the hillsides: sheep, deer, goats, rabbits and a fox that wander and graze
  const critters = [];
  function animal(kind) {
    const g = new THREE.Group(), head = new THREE.Group();
    const col = { sheep: 0xf8f3e6, deer: 0xb98a5a, rabbit: 0xd8cdbc, fox: 0xd9733a, goat: 0xe8e0cf }[kind], dk = std({ sheep: 0x4a4038, deer: 0x6b4a2e, rabbit: 0xb7a994, fox: 0x2b2420, goat: 0x6b6358 }[kind]);
    const s2 = kind === 'rabbit' ? .55 : kind === 'fox' ? .8 : 1;
    const body = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 9), std(col)); body.scale.set(kind === 'sheep' ? 1.25 : 1.5, kind === 'sheep' ? 1.05 : .85, 1); body.position.y = kind === 'deer' ? .26 : .15; g.add(body);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.052, 10, 8), kind === 'sheep' ? dk : std(col)); hd.scale.set(1.25, 1, .95); head.add(hd);
    head.position.set(.15, kind === 'deer' ? .4 : .2, 0); g.add(head);
    const ear = (sz) => { const e = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 5), kind === 'sheep' ? dk : std(col)); e.scale.set(.6, kind === 'rabbit' ? 2.8 : 1.6, .6); e.position.set(-.02, kind === 'rabbit' ? .07 : .045, sz * .035); head.add(e); }; ear(1); ear(-1);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.008, 5, 4), std(0x1b1b1b)); eye.position.set(.04, .015, .03); head.add(eye); const eye2 = eye.clone(); eye2.position.z = -.03; head.add(eye2);
    if (kind === 'deer') { const nk = new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, .16, 7), std(col)); nk.position.set(.11, .33, 0); nk.rotation.z = -.5; g.add(nk); for (const sz of [-1, 1]) for (let k = 0; k < 2; k++) { const an = new THREE.Mesh(new THREE.CylinderGeometry(.004, .006, .09, 4), std(0xcfc3a6)); an.position.set(-.01 + k * .02, .09, sz * .03); an.rotation.z = k ? -.5 : .2; head.add(an); } }
    if (kind === 'goat') for (const sz of [-1, 1]) { const hn = new THREE.Mesh(new THREE.ConeGeometry(.009, .06, 5), std(0x8a7a60)); hn.position.set(0, .06, sz * .02); hn.rotation.x = sz * -.3; head.add(hn); }
    const tail = new THREE.Mesh(new THREE.SphereGeometry(kind === 'fox' ? .05 : .026, 8, 6), std(kind === 'fox' ? 0xd9733a : 0xffffff)); if (kind === 'fox') tail.scale.set(2.6, .9, .9); tail.position.set(-.17 * (kind === 'fox' ? 1.35 : 1), kind === 'deer' ? .28 : .16, 0); g.add(tail);
    const leg = (x, z) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.012, .01, kind === 'deer' ? .26 : kind === 'rabbit' ? .05 : .12, 5), dk); l.position.set(x, kind === 'deer' ? .13 : kind === 'rabbit' ? .03 : .06, z); g.add(l); return l; };
    const legs = [leg(.09, .05), leg(.09, -.05), leg(-.09, .05), leg(-.09, -.05)];
    g.scale.setScalar(s2 * .78);
    return { g, head, legs };
  }
  // they live up on the mountains only: high ground, well away from every building, field, road, river and beach
  { const KINDS = ['sheep', 'sheep', 'deer', 'goat', 'rabbit', 'rabbit', 'fox'];
    const okSpot = (x, z) => groundH(x, z) > 1.5 && !forbid(x, z) && inletD(x, z) > 1 && cove(x, z) < .05 && keptC.every((c) => Math.hypot(x - c[0], z - c[1]) > c[2] + 1.3);
    let placed = 0; const anchors = [];
    for (let g = 0; g < 900 && placed < 9; g++) {
      const ax = -20 + rnd() * 38, az = shore(ax) - (6.5 + rnd() * 6.5);
      if (!okSpot(ax, az) || anchors.some((q) => Math.hypot(q[0] - ax, q[1] - az) < 4.2)) continue;
      anchors.push([ax, az]);
      const kind = KINDS[placed % KINDS.length], cnt = kind === 'sheep' ? 2 : 1;
      for (let k = 0; k < cnt; k++) {
        const x = ax + k * .45 + (rnd() - .5) * .2, z = az + (rnd() - .5) * .4;
        if (!okSpot(x, z)) continue;
        const an = animal(kind); W(an.g); critters.push({ ...an, kind, hx: x, hz: z, ph: rnd() * 6, r: .3 + rnd() * .25, sp: .12 + rnd() * .1 });
      }
      placed++;
    } }

  // ---- sky: clouds, gulls and a few birds that keep going round the planet
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const pv = new THREE.Group(); pv.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    const cl = new THREE.Group();
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.34 + rnd() * .22, 2), std(0xffffff, { roughness: 1, transparent: true, opacity: .94 })); s.position.set(k * .42 - .8, rnd() * .18, rnd() * .22); s.scale.y = .72; s.castShadow = true; cl.add(s); }
    cl.position.set(0, R + 3.4 + rnd() * 1.4, 0); pv.add(cl); pv.userData.sp = (.07 + rnd() * .09) * (rnd() > .5 ? 1 : -1); clouds.push(pv); W(pv);
  }
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, .3, .02, .07, 0, 0, .14]), 3)); wingG.computeVertexNormals();
  const birdMat = std(0xffffff, { side: THREE.DoubleSide });
  function bird() {
    const g = new THREE.Group();
    const w1 = new THREE.Mesh(wingG, birdMat), w2 = new THREE.Mesh(wingG, birdMat); w2.scale.x = -1; w1.position.z = w2.position.z = -.07;
    const bd = new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 1), birdMat); bd.scale.set(1, .8, 1.9);
    const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.04, 1), birdMat); hd.position.set(0, .01, .11);
    g.add(w1, w2, bd, hd); g.rotation.y = PI / 2;
    const wrap = new THREE.Group(); wrap.add(g);
    return { wrap, w1, w2 };
  }
  const flyers = [];
  [[-12, shore(-12) + 1.2], [1.5, shore(1.5) + 2], [-4, 4], [9, 3]].forEach((c, ci) => {
    for (let k = 0; k < 1; k++) { const b = bird(); W(b.wrap); flyers.push({ b, cx: c[0] + (rnd() - .5) * 1.5, cz: c[1], rx: 1.2 + rnd() * 2.2, rz: .7 + rnd() * 1.2, sp: (.22 + rnd() * .22) * (rnd() > .5 ? 1 : -1), a: rnd() * 6.28, lift: .7 + rnd() * .9, ph: rnd() * 6 }); }
  });
  const gulls = [];
  for (let i = 0; i < 2; i++) {
    const pv = new THREE.Group(); pv.rotation.set(.3 + rnd() * 2, rnd() * 6, 0);
    const b = bird(); b.wrap.position.set(0, R + 2.2 + rnd() * .9, 0); pv.add(b.wrap);
    pv.userData = { sp: .22 + rnd() * .18, b, ph: rnd() * 6 }; gulls.push(pv); W(pv);
  }
  const starGeo = new THREE.BufferGeometry(), sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) { const v = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize().multiplyScalar(90 + rnd() * 20); sp.set([v.x, v.y, v.z], i * 3); }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // shadows for everything that stands on the ground
  world.traverse((o) => { if (o.isMesh && o !== sea && !o.userData.ribbon && !o.isInstancedMesh) { o.castShadow = true; o.receiveShadow = true; } });
  terrain.receiveShadow = true; terrain.castShadow = false;
  const ORDER = ['Muros arcades', 'Muros old town', 'Church and hórreo', 'Seafarers’ quarter', 'Esteiro harbour', 'Esteiro beach', 'O Freixo pier', 'Fishing boats', 'O Freixo beach', 'Bateas', 'Ponte Nafonso', 'Outes church', 'Cove across the ría', 'Louro beach', 'Monte Louro'];
  spots.sort((a, b) => ORDER.indexOf(a.title) - ORDER.indexOf(b.title));

  // ---- rain: thousands of thin drops falling straight down over the whole planet, a grey sky and darker, bigger clouds
  const RAIN_N = 7000, rdir = new Float32Array(RAIN_N * 6), rph = new Float32Array(RAIN_N * 2), rtip = new Float32Array(RAIN_N * 2);
  for (let i = 0; i < RAIN_N; i++) { const dr0 = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(), f = rnd() * 3.4; for (let k = 0; k < 2; k++) { rdir.set([dr0.x, dr0.y, dr0.z], (i * 2 + k) * 3); rph[i * 2 + k] = f; rtip[i * 2 + k] = k; } }
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rdir, 3)); rainGeo.setAttribute('ph', new THREE.BufferAttribute(rph, 1)); rainGeo.setAttribute('tip', new THREE.BufferAttribute(rtip, 1));
  const rainMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uA: { value: 0 }, uR: { value: R }, uC: { value: new THREE.Color(0xdbeaf6) } },
    vertexShader: 'attribute float ph; attribute float tip; uniform float uT; uniform float uR; varying float vA; void main(){ float h = mod(ph - uT * 2.2, 3.4); vA = smoothstep(0.0, .25, h) * (1.0 - smoothstep(2.9, 3.4, h)); vec3 p = normalize(position) * (uR + .12 + h + tip * .2); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; varying float vA; void main(){ gl_FragColor = vec4(uC, uA * vA * .85); }' });
  const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; rain.visible = false; world.add(rain);
  const cloudMats = []; for (const c of clouds) c.traverse((o) => { if (o.isMesh) cloudMats.push(o.material); });
  const RAINBG = C(0x9fb1c0), RAINSKY = C(0xc6d3dc), CLD_DAY = C(0xfff1dc), CLD_RAIN = C(0x8d9aa8), SEA_RAIN = C(0x5d8fa0);

  // ---- day / night
  const SUN_ORANGE = C(0xff8f3c), HEMI_DUSK = C(0xffc08c), GROUND_DUSK = C(0xe8a0b4), CLD_DUSK = C(0xffb48a), DUSK_BG = C(0xf9a672), DAY = { bg: C(0xaed6f2), hemi: 1.15, sun: 2.1, sunC: C(0xffdfb4), sky: C(0xfff0dc), sea: C(0x62d0ee) };
  const NIGHT = { bg: C(0x0a1430), hemi: .5, sun: .6, sunC: C(0x8fb0ff), sky: C(0x6f8ad0), sea: C(0x1b3a63) };
  let manual = false, night = typeof opts.getDark === 'function' ? opts.getDark() : (opts.night ? 1 : 0), nightT = night; const night0 = night > .5 ? 1 : 0;
  const dnBtn = root.querySelector('.x-pl-dn'), hhEl = root.querySelector('.x-pl-hh'), mmEl = root.querySelector('.x-pl-mm'), ahEl = root.querySelector('.x-pl-ah'), amEl = root.querySelector('.x-pl-am');
  let muteSaved = false; try { muteSaved = localStorage.getItem('xpl-mute') === '1'; } catch (e) {}
  const audio = makeAudio(!!opts.night), muBtn = root.querySelector('.x-pl-mu');
  const paintMu = () => { const m = audio ? audio.muted : true; muBtn.innerHTML = m ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'; muBtn.setAttribute('aria-pressed', m ? 'true' : 'false'); };
  if (!audio) muBtn.style.display = 'none'; else { if (muteSaved) audio.mute(true); audio.start(); audio.sfx('open'); paintMu(); }
  muBtn.addEventListener('click', () => { if (!audio) return; audio.mute(!audio.muted); try { localStorage.setItem('xpl-mute', audio.muted ? '1' : '0'); } catch (e) {} paintMu(); if (!audio.muted) audio.sfx('tick'); });
  let lastNight = night0;
  let mStepRef = 0;
  const info = root.querySelector('.x-pl-info'), moreBtn = root.querySelector('.x-pl-more');
  const toggleInfo = (on) => { if (on === !info.hidden) return; if (on) { info.hidden = false; requestAnimationFrame(() => info.classList.add('x-on')); } else { info.classList.remove('x-on'); setTimeout(() => { if (!info.classList.contains('x-on')) info.hidden = true; }, 420); } moreBtn.classList.toggle('x-open', on); if (audio) audio.sfx(on ? 'learn' : 'learnoff'); };
  // for now the "Aprende más" button is only a placeholder: it does nothing (to switch it on again: moreBtn.addEventListener('click', () => toggleInfo(info.hidden)))
  // "Aprende más": Mochi, the little assistant, appears in front of a blurred map and tells two short messages (a click anywhere moves on / closes it)
  const mochi = root.querySelector('.x-pl-mochi'), mSp = mochi.querySelector('.x-pl-ms'), mCv = mSp.querySelector('canvas'), mBub = mochi.querySelector('.x-pl-bub p'), MSG = new Proxy([], { get: (t, k) => k === 'length' ? mochiLen : /^\d+$/.test(k) ? mochiText(+k) : t[k] });   // the six texts, in the language of the site
  const mRect = { x: 0, y: 0, n: 0 }; let M3 = null, mex = innerWidth / 2, mey = innerHeight / 2, mStep = -1, mType = 0, mEye = 4, mBlink = 0, mt2 = 0, mpx = innerWidth / 2, mpy = innerHeight / 2;
  const mTxt = (txt, i) => { if (!mBub.children.length) mBub.innerHTML = '<span></span><span style="opacity:0"></span>'; mBub.children[0].textContent = txt.slice(0, i); mBub.children[1].textContent = txt.slice(i); };   // the whole text is laid out from the start (the unwritten part is invisible), so typing never reflows the bubble
  const typeMsg = (txt) => { clearInterval(mType); mochi.classList.remove('x-done'); mTxt(txt, 0); let i = 0; mType = setInterval(() => { if (i >= txt.length) { clearInterval(mType); mochi.classList.add('x-done'); return; } mTxt(txt, ++i); if (i % 3 === 1 && audio) audio.sfx('mochitalk'); }, 34); };
  const mochiClose = () => { mochi.classList.remove('x-load'); if (M3) { try { M3.r.dispose(); M3.r.forceContextLoss(); } catch (e) {} M3 = null; } clearInterval(mType); mochi.classList.remove('x-on', 'x-ctaw', 'x-cta', 'x-ctaon'); root.classList.remove('x-mochi'); mStep = -1; setTimeout(() => { if (mStep < 0) mochi.hidden = true; }, 700); if (audio) audio.sfx('mochiend'); };
  const mochiPop = () => { mSp.classList.remove('x-hop'); mochi.classList.remove('x-pop'); void mSp.offsetWidth; mSp.classList.add('x-hop'); mochi.classList.add('x-pop'); };
  const mochiCta = () => {                                 // after the last text: Mochi hides behind a box and peeks out over its top edge
    mochi.classList.add('x-ctaw'); if (audio) audio.sfx('mochinext');
    setTimeout(() => { if (mStep < MSG.length) return; mochi.classList.add('x-cta'); mochiPop(); setTimeout(() => mochi.classList.add('x-ctaon'), 80); }, 450);
  };
  const mochiNext = () => { if (mStep < 0 || mStep >= MSG.length) return; if (!mochi.classList.contains('x-done')) { clearInterval(mType); mTxt(MSG[mStep], 1e4); mochi.classList.add('x-done'); return; } mStep++; if (mStep >= MSG.length) { mochiCta(); return; } if (audio) audio.sfx('mochinext'); mochiPop(); if (mStep === 1) look(-9, 1.5, .68); typeMsg(MSG[mStep]); };
  const buildMochi = async () => {
    if (M3) return; const bm = await import('/extras/blob-model.js?v=1'), m = bm.buildBlob(THREE), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 320 / 262, .1, 20);
    m.body.geometry.attributes.color.array.forEach((v, i, a) => { a[i] = v + (1 - v) * .18; });                    // pastel: lighter and softer
    m.body.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .55, metalness: 0 });
    for (const e of m.eyes) e.eye.children[0].material = new THREE.MeshStandardMaterial({ color: 0xb9b6f2, roughness: 1 });
    m.inner.position.y = 0; sc.add(m.root); sc.add(new THREE.HemisphereLight(0xffffff, 0xcfc4f0, 1.5)); const dl = new THREE.DirectionalLight(0xfff3e0, 1.9); dl.position.set(2, 3, 4); sc.add(dl);
    cam.position.set(0, .1, 5.4); cam.lookAt(0, .02, 0);
    const r = new THREE.WebGLRenderer({ canvas: mCv, alpha: true, antialias: false, powerPreference: 'low-power' }); r.setClearColor(0, 0); r.setPixelRatio(1); r.setSize(264, 216, false);
    M3 = { m, sc, cam, r, px: 0, py: 0, rx: 0, ry: 0, sig: '', n: 0 };
  };
  moreBtn.addEventListener('click', () => { if (mStep >= 0) return; buildMochi().catch(() => {}); mStep = 0; look(3, 3, .62); mochi.hidden = false; root.classList.add('x-mochi'); requestAnimationFrame(() => requestAnimationFrame(() => mochi.classList.add('x-on'))); if (audio) audio.sfx('mochi'); setTimeout(() => mStep === 0 && typeMsg(MSG[0]), 1100); });
  mochi.addEventListener('click', () => mochiNext());
  // "Start the tour": everything blurs and Mochi bobs up and down softly while the seabed is made ready, then the dive under the sea opens
  let tourOn = false, tourMuted = false;
  const endTour = () => { tourOn = false; root.classList.remove('x-tour'); if (audio && !tourMuted) audio.mute(false); };
  const startTour = () => {
    if (tourOn) return; tourOn = true; tourMuted = !!(audio && audio.muted);
    mochi.classList.remove('x-ctaon'); mochi.classList.add('x-load'); root.classList.add('x-tour'); if (audio) { audio.sfx('mochinext'); setTimeout(() => audio && audio.mute(true), 500); }
    const t0 = performance.now();
    import('./conducir.js?v=13').then((m) => new Promise((ok) => setTimeout(() => ok(m), Math.max(0, 2800 - (performance.now() - t0)))))
      .then((m) => { const ab = m.open({ onClose: endTour, getDark: () => nightT }); if (!ab) throw new Error('no webgl'); setTimeout(mochiClose, 700); })
      .catch(() => { endTour(); mochiClose(); });
  };
  mochi.querySelector('.x-pl-cta').addEventListener('click', (e) => { e.stopPropagation(); startTour(); });
  addEventListener('pointermove', (e) => { mpx = e.clientX; mpy = e.clientY; });
  const mo = mochi.querySelector('.x-pl-mo'), mshadow = mochi.querySelector('.x-pl-sh'), J = { x: 0, y: 0, vx: 0, vy: 0, p: 1, since: 9, sq: 0, last: 0, dir: 1, rot: 0 };
  const mochiSwim = (now) => {                       // swims like a jellyfish: a soft pulse every ~2 s squeezes it, shoots it up and sideways, then it glides and sinks slowly
    const dt = Math.min(.05, (now - (J.last || now)) / 1000); J.last = now; J.p -= dt;
    if (J.p <= 0) { J.p = 2.6 + Math.random() * 1.0; J.since = 0; J.dir = Math.random() < .5 ? -1 : 1; if (Math.abs(J.x) > 30) J.dir = J.x > 0 ? -1 : 1; J.vy -= mStep >= MSG.length ? 10 : 46; J.vx += mStep >= MSG.length ? 0 : J.dir * 18; }
    J.since += dt; const sq = J.since < .8 ? Math.sin(J.since / .8 * PI) : 0; J.sq += (sq * .075 - J.sq) * Math.min(1, dt * 5);
    J.vy += 12 * dt; J.vy += -J.y * 1.1 * dt; J.vx += -J.x * .9 * dt; const dr = Math.exp(-1.5 * dt); J.vx *= dr; J.vy *= dr; J.x += J.vx * dt; J.y += J.vy * dt;
    J.rot += (J.vx * .07 - J.rot) * Math.min(1, dt * 2.5);
    mo.style.transform = 'translate3d(' + J.x.toFixed(1) + 'px,' + J.y.toFixed(1) + 'px,0) rotate(' + J.rot.toFixed(2) + 'deg) scale(' + (1 - J.sq * .9).toFixed(3) + ',' + (1 + J.sq).toFixed(3) + ')';
    mshadow.style.transform = 'translateX(' + (J.x * .6).toFixed(1) + 'px) scale(' + (1 - Math.max(-.2, Math.min(.3, -J.y / 120))).toFixed(3) + ')'; mshadow.style.opacity = (.8 + Math.max(-.3, Math.min(.2, J.y / 200))).toFixed(2);
  };
  const mochiTick = (now) => { if (mStep < 0 && mochi.hidden) return; requestAnimationFrame(mochiTick); mochiSwim(now); if (!(mRect.n++ % 20)) { const b = mSp.getBoundingClientRect(); mRect.x = b.left + b.width / 2 - J.x; mRect.y = b.top + b.height / 2 - J.y; } const ccx = mRect.x + J.x, ccy = mRect.y + J.y; mex += (mpx - mex) * .06; mey += (mpy - mey) * .06; const dx = mex - ccx, dy = mey - ccy, d = Math.hypot(dx, dy); const lean = 0; mBlink -= .016; if (mBlink < -3.6) mBlink = .22;
    if (M3) {                                          // the live 3D Mochi: pupils glide to where the mouse is, the head and body turn softly after them
      const gx = Math.max(-1, Math.min(1, dx / 420)), gy = Math.max(-1, Math.min(1, dy / 320));
      M3.px += (gx - M3.px) * .075; M3.py += (gy - M3.py) * .075; M3.ry += (gx * .5 - M3.ry) * .05; M3.rx += (gy * .32 - M3.rx) * .05;
      for (const e of M3.m.eyes) { e.pupil.position.x = M3.px * .15; e.pupil.position.y = -M3.py * .13; e.pupil.rotation.y = M3.px * .3; }
      const bk = mBlink > 0 ? Math.max(.08, 1 - Math.sin(Math.min(1, (.22 - mBlink) / .22) * PI)) : 1; for (const e of M3.m.eyes) e.eye.scale.y = bk;
      M3.m.inner.rotation.y = M3.ry; M3.m.inner.rotation.x = M3.rx * .6; M3.m.inner.rotation.z = -M3.ry * .1; M3.m.root.position.x = M3.ry * .12;
      const sg = M3.px.toFixed(3) + M3.py.toFixed(3) + M3.ry.toFixed(3) + M3.rx.toFixed(3) + bk.toFixed(2); if (sg !== M3.sig || M3.n++ < 3) { M3.sig = sg; M3.r.render(M3.sc, M3.cam); }   // draw only when something actually moved
    } };
  new MutationObserver(() => { if (!mochi.hidden) requestAnimationFrame(mochiTick); }).observe(mochi, { attributes: true, attributeFilter: ['hidden'] });
  // ESC closes it too; the planet keeps turning behind the blur
  info.querySelector('.x-pl-ix').addEventListener('click', () => toggleInfo(false));
  if (audio) for (const bt of root.querySelectorAll('button:not(.x-pl-more)')) {                 // every button answers with a little pop when the pointer touches it and a deeper one when pressed
    bt.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') audio.sfx('hover'); });
    bt.addEventListener('pointerdown', () => audio.sfx('press'));
  }
  const paintBtn = () => { dnBtn.innerHTML = nightT > .5 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; root.classList.toggle('x-night', nightT > .5); };
  const bgc = new THREE.Color();
  const rnBtn = root.querySelector('.x-pl-rn');
  let rainT = 0, rainTarget = 0;
  const paintRn = () => { rnBtn.innerHTML = rainTarget ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.2 7.6 3.7 3.7 0 0 1 17 15"/><path d="M8 18l-1 2.4M12 17l-1 2.4M16 18l-1 2.4"/></svg>'; rnBtn.setAttribute('aria-pressed', rainTarget ? 'true' : 'false'); root.classList.toggle('x-rain', !!rainTarget); };
  rnBtn.addEventListener('click', () => { rainTarget = rainTarget ? 0 : 1; if (audio) { audio.setRain(!!rainTarget); audio.sfx(rainTarget ? 'rain' : 'sun'); } paintRn(); });
  paintRn();
  const light = (k) => {
    const r = rainT, dsk = Math.max(0, Math.min(1, 4 * k * (1 - k))) * (1 - r * .75);        // 0 by day and by night, 1 in the golden hour
    bgc.copy(DAY.bg).lerp(DUSK_BG, sstep(0, .5, k)).lerp(NIGHT.bg, sstep(.45, 1, k)).lerp(RAINBG, r * (1 - k * .75)); scene.background = bgc;
    const kI = Math.pow(Math.max(0, (k - .45) / .55), 1.2);       // the light only really fades once the sun is down: the golden hour stays bright
    hemi.intensity = (DAY.hemi + (NIGHT.hemi - DAY.hemi) * kI) * (1 - r * .12); hemi.color.copy(DAY.sky).lerp(NIGHT.sky, kI).lerp(RAINSKY, r * (1 - k * .6));
    sun.intensity = (DAY.sun + (NIGHT.sun - DAY.sun) * kI) * (1 - r * .62); sun.color.copy(DAY.sunC).lerp(NIGHT.sunC, kI).lerp(SUN_ORANGE, dsk * .92).lerp(RAINSKY, r * .6); sun.intensity *= 1 + dsk * .55; sun.position.set(16 + 12 * dsk, 20 - 14 * dsk, 24 - 6 * dsk); hemi.color.lerp(HEMI_DUSK, dsk * .75); hemi.groundColor.copy(HEMI_GROUND).lerp(GROUND_DUSK, dsk); hemi.intensity *= 1 - dsk * .12;
    sea.material.color.copy(DAY.sea).lerp(NIGHT.sea, kI).lerp(SEA_RAIN, r * (1 - k)); if (riverMat) riverMat.color.copy(sea.material.color); for (const m of cloudMats) m.color.copy(CLD_DAY).lerp(CLD_DUSK, dsk * .85).lerp(CLD_RAIN, r * (1 - k * .5));
    rainMat.uniforms.uA.value = r; rain.visible = r > .01;
    winMat.emissiveIntensity = Math.min(1.5, k * 1.5 + r * .9);
 lampMat.emissiveIntensity = .4 + k * 3.2; if (lampMats.length) { lampMats[0].opacity = Math.min(.8, k * 1.1) * .55; lampMats[1].opacity = Math.min(.8, k * 1.1) * .5; } lamp.intensity = k * 2.2; starMat.opacity = k;
  };
  dnBtn.addEventListener('click', () => { manual = true; night = night > .5 ? 0 : 1; });
  light(nightT); paintBtn();

  // the turn that brings direction d (on the planet) in front of the camera, with north (towards -z on the map) kept at the top of the screen
  const faceCamera = (d, tilt) => {
    const [px, pz] = planeOf(d), north = dirFrom(px, pz - .05, new THREE.Vector3()).sub(d);
    north.addScaledVector(d, -north.dot(d));
    if (north.lengthSq() < 1e-8) north.set(1, 0, 0);
    north.normalize();
    const right = new THREE.Vector3().crossVectors(north, d).normalize();
    const t = new THREE.Vector3(0, tilt, 1).normalize(), up = new THREE.Vector3(0, 1, 0); up.addScaledVector(t, -up.dot(t)).normalize();
    const rt = new THREE.Vector3().crossVectors(up, t).normalize();
    const src = new THREE.Matrix4().makeBasis(right, north, d), dst = new THREE.Matrix4().makeBasis(rt, up, t);
    return new THREE.Quaternion().setFromRotationMatrix(dst.multiply(src.transpose()));
  };
  let cur = -1, focus = null;
  const show = () => {}, hideCard = () => {};

  // ---- camera, dragging, zoom
  let baseDist = 40, dist = 110, distT = 40;
  const size = () => {
    const w = root.clientWidth || innerWidth, h = root.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    baseDist = Math.max(34, Math.min(86, 39 / Math.min(1, camera.aspect * 1.05)));
    distT = Math.min(Math.max(distT, 14.3), baseDist * 2.7);
  };
  size();
  distT = baseDist; dist = baseDist * 2.6;
  world.quaternion.copy(faceCamera(dirFrom(-6, 3.0, new THREE.Vector3()), .4));
  const vel = new THREE.Vector2(), ptrs = new Map();
  let pinch = 0, lastInput = performance.now(), moved = 0;
  const rot = (dx, dy) => {
    const s = PI / Math.max(300, root.clientHeight) * 1.15 * (dist / baseDist);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * s).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * s));
    world.quaternion.premultiply(q);
  };
  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); focus = null; moved = 0; lastInput = performance.now();
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  cv.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; lastInput = performance.now(); moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 1) { rot(dx, dy); vel.set(dx, dy); }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) distT = Math.min(baseDist * 2.7, Math.max(14.3, distT * pinch / d)); pinch = d; }
  });
  const up = (e) => { ptrs.delete(e.pointerId); pinch = 0; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); distT = Math.min(baseDist * 2.7, Math.max(14.3, distT * Math.exp(e.deltaY * .0016))); lastInput = performance.now(); focus = null; }, { passive: false });
  cv.addEventListener('click', () => { if (moved < 6 && cur >= 0) hideCard(); });

  // ---- the island kit: little things to put on the island (a tree, flowers, a house, a granary, a sheep, a lighthouse, a boat).
  // Press a button to drop one in the middle of the view, or drag it onto the map and let go where you want it; grab any of them later
  // to move it, and drop it on the buttons to take it away. Only the sheep and the boat move by themselves. Nothing is kept for the next visit.
  const placed = new THREE.Group(); world.add(placed);
  const KIT = [
    ['tree', 'Tree', '<circle cx="12" cy="9" r="6"/><path d="M12 15v6"/>', 0],
    ['flowers', 'Flowers', '<circle cx="12" cy="8" r="3"/><path d="M12 11v10M12 17c-3 0-4-2-5-3M12 15c3 0 4-2 5-3"/>', 0],
    ['house', 'House', '<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5"/>', 0],
    ['horreo', 'Granary', '<path d="M3 9l9-5 9 5M5 9v6h14V9M7 15v5M17 15v5M10 9v6M14 9v6"/>', 0],
    ['sheep', 'Sheep', '<path d="M6 14a4 4 0 0 1 1-7 4 4 0 0 1 8 0 4 4 0 0 1 3 7z"/><path d="M8 14v5M15 14v5M18 11l3 1"/>', 0],
    ['lighthouse', 'Lighthouse', '<path d="M9 21l1.5-14h3L15 21zM9 4h6M10.5 7V4M13.5 7V4M3 9l5 1M21 9l-5 1"/>', 0],
    ['boat', 'Boat', '<path d="M3 15h18l-3 5H6zM12 15V4l6 9"/>', 1]
  ];
  const LANDW = [0xf7f1e4, 0xf3d9c4, 0xdbe8f0, 0xe9dcc2, 0xf1d6d9];
  const BUILD = {
    tree() {
      const g = new THREE.Group(), tk = new THREE.Mesh(new THREE.CylinderGeometry(.02, .03, .28, 7), std(0x7a5a3c)); tk.position.y = .14; g.add(tk);
      const gc = [0x62ae4a, 0x7cc25a, 0x58a07a][Math.floor(Math.random() * 3)];
      const a = new THREE.Mesh(new THREE.IcosahedronGeometry(.19, 2), std(gc)); a.position.y = .4; g.add(a);
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.12, 2), std(gc)); b.position.set(.1, .52, .03); g.add(b); return g;
    },
    flowers() {
      const g = new THREE.Group(), cols = [0xf4a3b8, 0xffd86b, 0xffffff, 0xc9a7f2, 0xff9d7a];
      for (let k = 0; k < 8; k++) { const a = k * 2.4, r = .02 + .07 * Math.sqrt(k / 8) * 1.6, st = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .1 + (k % 3) * .02, 4), std(0x5a9a48)); st.position.set(Math.cos(a) * r, .05, Math.sin(a) * r); g.add(st);
        const bl = new THREE.Mesh(new THREE.IcosahedronGeometry(.032, 1), std(cols[k % cols.length])); bl.position.set(st.position.x, .11 + (k % 3) * .02, st.position.z); g.add(bl); }
      const gr = new THREE.Mesh(new THREE.IcosahedronGeometry(.12, 1), std(0x74b058)); gr.scale.set(1, .25, 1); gr.position.y = .015; g.add(gr); return g;
    },
    house() { return house({ w: .42, d: .36, floors: 1 + Math.floor(Math.random() * 2), wall: LANDW[Math.floor(Math.random() * LANDW.length)], roof: ROOF[Math.floor(Math.random() * ROOF.length)], gal: false, shut: 0x2f6fa8, fr: 2, door: 0x2f6fa8 }); },
    horreo() { const g = horreo(); g.scale.setScalar(.7); const o = new THREE.Group(); o.add(g); return o; },
    sheep() {
      const g = new THREE.Group(), wool = std(0xf6f2ea), dk = std(0x4a4038), body = new THREE.Mesh(new THREE.IcosahedronGeometry(.1, 2), wool); body.scale.set(1.25, .95, .95); body.position.y = .17; g.add(body);
      for (const [x, y, z] of [[.06, .24, .05], [-.06, .25, -.04], [0, .27, .0]]) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(.055, 1), wool); t.position.set(x, y, z); g.add(t); }
      const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.052, 2), dk); hd.scale.set(1.1, 1, .9); hd.position.set(.14, .2, 0); g.add(hd);
      for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(.02, 1), dk); e.position.set(.12, .26, sz * .045); e.scale.set(1, .5, 1.4); g.add(e); }
      for (const [x, z] of [[.07, .045], [.07, -.045], [-.07, .045], [-.07, -.045]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .1, 5), dk); l.position.set(x, .05, z); g.add(l); }
      return g;
    },
    lighthouse() {
      const g = new THREE.Group(), wh = std(0xf7f1e4), rd = std(0xc9473a);
      for (let k = 0; k < 4; k++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(.085 - k * .012, .097 - k * .012, .16, 12), k % 2 ? rd : wh); seg.position.y = .08 + k * .16; g.add(seg); }
      const gal = new THREE.Mesh(new THREE.CylinderGeometry(.1, .08, .03, 12), std(0x4a4540)); gal.position.y = .66; g.add(gal);
      const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(.055, 1), lampMat); lamp.position.y = .72; g.add(lamp);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(.08, .1, 12), rd); roof.position.y = .83; g.add(roof); return g;
    },
    boat() {
      const g = new THREE.Group(), col = [0xc9473a, 0x2f6fa8, 0xe9b94a][Math.floor(Math.random() * 3)];
      const hull = box(.5, .09, .2, std(col)); hull.position.y = .05; g.add(hull);
      const bow = new THREE.Mesh(new THREE.ConeGeometry(.1, .16, 4), std(col)); bow.rotation.z = -PI / 2; bow.rotation.y = PI / 4; bow.position.set(.32, .05, 0); bow.scale.set(1, 1, .8); g.add(bow);
      const cab = box(.16, .1, .13, std(0xf7f1e4)); cab.position.set(-.06, .15, 0); g.add(cab);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .34, 5), std(0x7a5a3c)); mast.position.set(.1, .26, 0); g.add(mast);
      const sail = box(.012, .24, .17, std(0xfff8ea)); sail.position.set(.1, .27, .0); sail.rotation.y = 0; g.add(sail); return g;
    }
  };
  const kitUI = document.createElement('div'); kitUI.className = 'x-pl-build'; kitUI.setAttribute('role', 'toolbar'); kitUI.setAttribute('aria-label', tr('Add to the island'));
  for (const [id, label, svg] of KIT) { const b = document.createElement('button'); b.type = 'button'; b.className = 'x-pl-bi'; b.dataset.k = id; b.title = tr(label); b.setAttribute('aria-label', tr(label)); b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + svg + '</svg>'; kitUI.appendChild(b); }
  root.appendChild(kitUI);
  const isSea = (k) => k === 'boat';
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), _o = new THREE.Vector3(), _v = new THREE.Vector3(), _qi = new THREE.Quaternion();
  // where on the map a point of the screen is (a few passes, so that mountains are hit at their own height)
  function mapAt(cx, cy) {
    const r = cv.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1)); rc.setFromCamera(ndc, camera);
    world.updateMatrixWorld(); _qi.copy(world.quaternion).invert();
    const o = _o.copy(rc.ray.origin).sub(world.position).applyQuaternion(_qi), d = rc.ray.direction.clone().applyQuaternion(_qi); let res = null;
    for (const r0 of [R + 1.6, R]) {                                // first guess a little above the sea (land), then the sea itself
      let rad = r0, ok = true;
      for (let i = 0; i < 4; i++) {
        const b = o.dot(d), c = o.lengthSq() - rad * rad, ds = b * b - c; if (ds < 0) { ok = false; break; }
        _v.copy(o).addScaledVector(d, -b - Math.sqrt(ds)).normalize(); const [x, z] = planeOf(_v), h = groundH(x, z); res = [x, z, h]; rad = R + Math.max(h, SEA);
      }
      if (ok) return res;
    }
    return null;
  }
  const okAt = (k, m) => m && (isSea(k) ? m[2] < SEA - .1 : m[2] > SEA + .07);
  const kitSave = () => {};                                        // nothing is kept: every visit starts with a bare island
  try { localStorage.removeItem('xplanet-kit'); } catch (e) {}
  const anims = []; let animOn = false;
  function animTick(now) {
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i], u = Math.min(1, (now - a.t0) / a.d); if (!a.step(u)) anims.splice(i, 1); else if (u >= 1) { a.end && a.end(); anims.splice(i, 1); } }
    if (anims.length) requestAnimationFrame(animTick); else animOn = false;
  }
  const anim = (d, step, end) => { anims.push({ t0: performance.now(), d, step, end }); if (!animOn) { animOn = true; requestAnimationFrame(animTick); } };
  const elastic = (u) => u >= 1 ? 1 : 1 - Math.pow(1 - u, 3) * Math.cos(u * 9.4) ;
  function standAt(o, x, z, lift) { o.userData.x = x; o.userData.z = z; o.userData.ax = x; o.userData.az = z; put(o, x, z, o.userData.yaw, (isSea(o.userData.kit) ? .02 : -.01) + (lift || 0), isSea(o.userData.kit)); }
  function make(k) { const o = BUILD[k](); o.userData.kit = k; o.userData.yaw = Math.random() * PI * 2; addOutline(o); o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; }
  function pop(o, delay) {                                         // it grows in with a little overshoot and a puff of shadow
    o.scale.setScalar(.001); const t0 = performance.now() + (delay || 0);
    anim(700 + (delay || 0), (u) => { const t = Math.max(0, (performance.now() - t0) / 700); o.scale.setScalar(Math.max(.001, elastic(Math.min(1, t)))); return true; }, () => o.scale.setScalar(1));
  }
  function settle(o) {                                             // dropped: a small squash
    const x = o.userData.x, z = o.userData.z; anim(520, (u) => { const k = Math.sin(u * PI * 2.2) * (1 - u) * .16; o.scale.set(1 + k, 1 - k * 1.3, 1 + k); return true; }, () => o.scale.setScalar(1));
  }
  function add(k, x, z, yaw, withPop, delay) {
    const o = make(k); if (yaw !== undefined) o.userData.yaw = yaw; standAt(o, x, z); placed.add(o); if (withPop) pop(o, delay); return o;
  }
  function spotNearCentre(k) {                                     // a free spot near the middle of the view
    const r = cv.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bd = 1e9; const rad = Math.min(r.width, r.height) * .42;
    for (let i = 0; i < 220; i++) { const a = Math.random() * PI * 2, rr = Math.sqrt(Math.random()) * rad, m = mapAt(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); if (okAt(k, m) && rr < bd && !placed.children.some((q) => q.userData.x !== undefined && Math.hypot(q.userData.x - m[0], q.userData.z - m[1]) < .6)) { bd = rr; best = m; } }
    if (best) return best;
    return null;
  }
  // drag: from a button (a new thing) or from the island (a thing that is already there)
  let dragging = null;
  function beginDrag(o, isNew, e) {
    const from = o.userData.x !== undefined ? [o.userData.x, o.userData.z] : null, k = o.userData.kit;
    dragging = { o, isNew, from, k, id: e.pointerId, over: false, moved: false, sx: e.clientX, sy: e.clientY };
    if (isNew) { o.visible = false; placed.add(o); }
    if (audio) audio.sfx('pick');
    root.classList.add('x-kitdrag'); cv.style.cursor = 'grabbing';
    addEventListener('pointermove', dragMove); addEventListener('pointerup', dragEnd); addEventListener('pointercancel', dragEnd);
    dragMove(e);
  }
  function overKit(e) { const r = kitUI.getBoundingClientRect(); return e.clientX >= r.left - 6 && e.clientX <= r.right + 6 && e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6; }
  function dragMove(e) {
    const d = dragging; if (!d || e.pointerId !== d.id) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) d.moved = true;
    d.over = overKit(e); kitUI.classList.toggle('x-del', d.over && !d.isNew);
    const m = d.over ? null : mapAt(e.clientX, e.clientY); d.ok = okAt(d.k, m);
    if (d.ok) { const o = d.o, ox = o.userData.x, oz = o.userData.z; o.visible = true; o.userData.x = m[0]; o.userData.z = m[1]; put(o, m[0], m[1], o.userData.yaw, (isSea(d.k) ? .02 : -.01) + .16, isSea(d.k)); }
    else if (d.isNew) d.o.visible = false;
    cv.style.cursor = d.ok || d.over ? 'grabbing' : 'not-allowed';
  }
  function dragEnd(e) {
    const d = dragging; if (!d || e.pointerId !== d.id) return;
    removeEventListener('pointermove', dragMove); removeEventListener('pointerup', dragEnd); removeEventListener('pointercancel', dragEnd);
    dragging = null; root.classList.remove('x-kitdrag'); kitUI.classList.remove('x-del'); cv.style.cursor = '';
    const o = d.o;
    if (e.type === 'pointercancel') { if (d.isNew) placed.remove(o); else if (d.from) { standAt(o, d.from[0], d.from[1]); } return; }
    if (d.over && !d.isNew) {                                       // dropped on the buttons: it shrinks away
      if (audio) audio.sfx('trash'); anim(380, (u) => { o.scale.setScalar(Math.max(.001, 1 - u * u)); return true; }, () => { placed.remove(o); kitSave(); }); return;
    }
    if (d.ok) { standAt(o, o.userData.x, o.userData.z); o.visible = true; settle(o); if (audio) audio.sfx('place_' + d.k); kitSave(); return; }
    if (d.isNew) {
      if (!d.moved) { const m = spotNearCentre(d.k); if (m) { standAt(o, m[0], m[1]); o.visible = true; pop(o); if (audio) audio.sfx('place_' + d.k); kitSave(); return; } }
      placed.remove(o); if (audio) audio.sfx('nope'); return;
    }
    if (d.from) { standAt(o, d.from[0], d.from[1]); settle(o); if (audio) audio.sfx('nope'); }
  }

  // only the sheep and the boat have a life of their own: the sheep wander and graze near where they were put, the boat sails slowly about
  let kitLast = performance.now();
  function kitStep(now) {
    if (!root.isConnected) return; requestAnimationFrame(kitStep);
    const dt = Math.min(.05, (now - kitLast) / 1000); kitLast = now; if (document.hidden) return;
    for (const o of placed.children) {
      const u = o.userData, k = u.kit; if (k !== 'sheep' && k !== 'boat') continue;
      if (!o.visible || (dragging && dragging.o === o) || u.x === undefined) continue;
      const sea = k === 'boat', m = u.m || (u.m = { h: u.yaw, w: Math.random() * 2, sp: 0, ph: Math.random() * 9 }), t = now / 1000;
      if (sea) { m.sp = .2; m.h += Math.sin(t * .35 + m.ph) * .16 * dt; }
      else { m.w -= dt; if (m.w <= 0) { if (m.sp > 0) { m.sp = 0; m.w = 1.6 + Math.random() * 3.2; } else { m.sp = .13; m.w = 1.2 + Math.random() * 2.4; m.h += (Math.random() - .5) * 2.4; } } }
      const far = Math.hypot(u.x - u.ax, u.z - u.az);
      if (far > (sea ? 4 : 1.6)) { const back = Math.atan2(-(u.az - u.z), u.ax - u.x); let dh = ((back - m.h + PI * 3) % (PI * 2)) - PI; m.h += dh * Math.min(1, dt * 1.6); }   // drifts back towards where it was put
      if (m.sp > 0) {
        const nx = u.x + Math.cos(m.h) * m.sp * dt, nz = u.z - Math.sin(m.h) * m.sp * dt, gh = groundH(nx, nz);
        if (sea ? gh < SEA - .16 : gh > SEA + .1) { u.x = nx; u.z = nz; } else { m.h += 1.9 + Math.random(); if (!sea) { m.sp = 0; m.w = .7; } }
      }
      const dh2 = ((m.h - u.yaw + PI * 3) % (PI * 2)) - PI; u.yaw += dh2 * Math.min(1, dt * 3);
      const lift = sea ? Math.sin(t * 1.7 + m.ph) * .01 : (m.sp > 0 ? Math.abs(Math.sin(t * 9 + m.ph)) * .014 : 0);
      put(o, u.x, u.z, u.yaw, (sea ? .02 : -.01) + lift, sea);
      if (sea) o.rotateX(Math.sin(t * 1.3 + m.ph) * .05);
    }
  }
  requestAnimationFrame(kitStep);
  kitUI.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.x-pl-bi'); if (!b || e.button) return; e.preventDefault();
    beginDrag(make(b.dataset.k), true, e);
  });
  // the thing nearest to the pointer (within a finger's reach) on the side of the planet that faces us
  function nearestItem(cx, cy) {
    const r = cv.getBoundingClientRect(); let best = null, bd = 30; world.updateMatrixWorld(); camera.updateMatrixWorld();
    for (const o of placed.children) {
      if (!o.visible) continue; _v.setFromMatrixPosition(o.matrixWorld); const nrm = _v.clone().normalize(); if (nrm.dot(_o.copy(camera.position).normalize()) < .05) continue;
      _v.y += .12; _v.project(camera); const sx = r.left + (_v.x + 1) / 2 * r.width, sy = r.top + (1 - _v.y) / 2 * r.height, dd = Math.hypot(sx - cx, sy - cy);
      if (dd < bd) { bd = dd; best = o; }
    }
    return best;
  }
  // grabbing something that is already on the island (before the planet itself would turn)
  cv.addEventListener('pointerdown', (e) => {
    if (dragging || e.button || !placed.children.length) return;
    const o = nearestItem(e.clientX, e.clientY); if (!o) return;
    e.stopImmediatePropagation(); e.preventDefault(); beginDrag(o, false, e);
  }, true);
  const onKey = (e) => {
    if (tourOn) return;
    if (e.key === 'Escape' && mStep >= 0) { mochiClose(); }
    else if (e.key === 'Escape') { if (!info.hidden) toggleInfo(false); else if (cur >= 0) hideCard(); else close(); }
    else if (e.key === 'n' || e.key === 'N') { manual = true; night = night > .5 ? 0 : 1; }
    else if (/^[wasd]$/i.test(e.key)) { const k = e.key.toLowerCase(); rot(k === 'a' ? 28 : k === 'd' ? -28 : 0, k === 'w' ? 28 : k === 's' ? -28 : 0); focus = null; }
    else return;
    e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true);
  addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ---- frame
  let _crestO = null, fieldsList = null;
  let raf = 0, last = performance.now(), t = 0, frame = 0, closed = false;
  const tv = new THREE.Vector3(), camDir = new THREE.Vector3(0, 0, 1), prj = new THREE.Vector3();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (tourOn) { last = now; return; }            // the planet rests while the dive under the sea is open
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; frame++;
    if (!manual && opts.getDark) night = opts.getDark();       // the planet follows the real hour of the visitor (and the dial of the page)
    const nb2 = night > .5 ? 1 : 0; if (audio && nb2 !== lastNight) { lastNight = nb2; audio.setNight(!!nb2); audio.sfx(nb2 ? 'night' : 'day'); }
    nightT += (night - nightT) * (1 - Math.exp(-dt * (manual ? 1.2 : 1.0))); if (Math.abs(night - nightT) < .002) nightT = night;
    light(nightT); if ((nightT > .5) !== root.classList.contains('x-night')) paintBtn();
    rainT += (rainTarget - rainT) * (1 - Math.exp(-dt * 1.1)); if (Math.abs(rainTarget - rainT) < .003) rainT = rainTarget; rainMat.uniforms.uT.value = t;
    if (frame % 20 === 1) { const hr = opts.getHour ? opts.getHour() : new Date().getHours() + new Date().getMinutes() / 60; const hh = Math.floor(hr) % 24, mm = Math.floor((hr - Math.floor(hr)) * 60); hhEl.textContent = String(hh).padStart(2, '0'); mmEl.textContent = String(mm).padStart(2, '0'); ahEl.style.transform = 'rotate(' + (((hr % 12) / 12) * 360).toFixed(1) + 'deg)'; amEl.style.transform = 'rotate(' + ((hr % 1) * 360).toFixed(1) + 'deg)'; }
    if (audio && frame % 8 === 3) {
      const zl = THREE.MathUtils.clamp((baseDist * .8 - dist) / (baseDist * .3), 0, 1);
      if (zl <= 0) audio.zone('', 0); else {
        camDir.set(0, 0, 1).applyQuaternion(_q.copy(world.quaternion).invert()).normalize(); const [cx, cz] = planeOf(camDir), at = (x, z, r) => Math.hypot(cx - x, cz - z) < r;
        let kind = 'sea';
        const far = Math.hypot(cx, cz) > 25 || cz < -22 || cz > 13;
        if (kickers.some((k) => { const [kx, kz] = k.loc(k.qx, k.qz); return at(kx, kz, 1.7); })) kind = 'kids';
        else if (at(fiestaFx.x, fiestaFx.z, 3.1)) kind = 'fiesta';
        else if (COVES.some((c) => at(c[0], c[1], 2.2))) kind = 'beach';
        else if (!far && groundH(cx, cz) < -.03 && (at(pierX, shoreZ + 1.5, 3) || at(INLET[0][0], INLET[0][1], 2.4) || at(-13, shore(-13) + 1.5, 5) || at(INLET2[0][0], INLET2[0][1], 2.4))) kind = 'harbour';
        else if (HOMES.some((h) => at(h[0], h[1], 1.5))) kind = 'village';
        else if (groundH(cx, cz) > 1.7) kind = 'mountain';
        else if (far) kind = 'sea';
        else kind = groundH(cx, cz) < -.03 ? 'ria' : 'village';
        audio.zone(kind, zl);
      }
    }
    dist += (distT - dist) * (1 - Math.exp(-dt * 3.4));
    if (focus) { world.quaternion.slerp(focus.q, 1 - Math.exp(-dt * 3.2)); distT += (focus.dist - distT) * (1 - Math.exp(-dt * 3)); }
    else if (!ptrs.size) {
      if (vel.lengthSq() > .01) { rot(vel.x, vel.y); vel.multiplyScalar(Math.exp(-dt * 3.5)); }
      else if (!reduce && now - lastInput > 3000 && cur < 0) world.quaternion.premultiply(_q.setFromAxisAngle(Y, dt * .05));
    }
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
    { const z = Math.max(0, Math.min(1, (24 - dist) / 9.5)); root.style.setProperty('--tsb', (5 + z * 11).toFixed(1) + 'px'); root.style.setProperty('--tsh', (22 + z * 14).toFixed(1) + '%'); }
    if (frame % 2 === 0) {
      const p = sea.geometry.attributes.position, a = p.array;
      for (let i = 0; i < a.length; i += 3) { const k = 1 + (Math.sin(t * 1.3 + seaOrig[i] * .9 + seaOrig[i + 2] * .4) + Math.sin(t * 1.7 + seaOrig[i + 2] * 1.1 - seaOrig[i + 1] * .5)) * .0011; a[i] = seaOrig[i] * k; a[i + 1] = seaOrig[i + 1] * k; a[i + 2] = seaOrig[i + 2] * k; }
      p.needsUpdate = true;
    }
    for (const b of boats) {
      const k = b.calm ? .4 : 1;
      b.b.position.y = b.base + Math.sin(t * 1.4 + b.ph) * .018 * k;
      b.b.rotation.z = Math.sin(t * 1.1 + b.ph) * .045 * k; b.b.rotation.x = Math.sin(t * .9 + b.ph * 2) * .03 * k;
    }
    if (frame % 2 === 0) { const o = _crestO || (_crestO = new THREE.Object3D()); for (let i = 0; i < crestData.length; i++) { const c = crestData[i], a = t * c.sp + c.ph, sw = Math.max(0, Math.sin(a)), x = c.x + Math.cos(c.yaw) * c.drift * t, z = c.z - Math.sin(c.yaw) * c.drift * t; put(o, x, z, c.yaw, .012 + sw * .012, true); o.scale.set(c.w * (.32 + sw * .55), .01 + sw * .008, .016 + sw * .016); o.updateMatrix(); crests.setMatrixAt(i, o.matrix); } crests.instanceMatrix.needsUpdate = true; crestMat.opacity = (.55 + .4 * (1 - nightT)) * (1 - rainT * .2); }
    foamMat.opacity = .42 + Math.sin(t * 1.4) * .16;
    for (const c of critters) {
      const w = Math.sin(t * c.sp + c.ph), w2 = Math.cos(t * c.sp * .8 + c.ph * 2), ax2 = c.hx + w * c.r, az2 = c.hz + w2 * c.r * .6;
      const dx = Math.cos(t * c.sp + c.ph) * c.r * c.sp, dz = -Math.sin(t * c.sp * .8 + c.ph * 2) * c.r * .6 * c.sp * .8;
      put(c.g, ax2, az2, Math.atan2(-dz, dx), .0);
      const graze = Math.max(0, Math.sin(t * .45 + c.ph * 3)) > .3 ? 1 : 0; c.head.rotation.z = c.kind === 'rabbit' ? -graze * .5 : -graze * .8 + Math.sin(t * 1.6 + c.ph) * .05;
      c.legs.forEach((l, i) => { l.rotation.z = graze ? 0 : Math.sin(t * 4 + i * PI / 2 + c.ph) * .25; });
      if (c.kind === 'rabbit' && !graze) c.g.position.addScaledVector(c.g.position.clone().normalize(), Math.max(0, Math.sin(t * 5 + c.ph)) * .03);
    }
    for (const o of horses) { const g = Math.max(0, Math.sin(t * .5 + o.ph)); o.h.head.rotation.z = -g * .9 + Math.sin(t * 2 + o.ph) * .03; }
    for (const f of falls) {
      if (f.mist) { f.mist.scale.set(1.4 + Math.sin(t * 2) * .1, .55 + Math.sin(t * 2) * .05, 1.1); f.mist.material.opacity = .36 + Math.sin(t * 1.6) * .07; }
      else if (f.foam) { const u = (t * .5 + f.k / 16) % 1, r = .14 + u * .5; f.foam.position.set(Math.cos(f.a + f.k) * r * .8 + Math.sin(t * 1.3 + f.k) * .03, .035 + Math.sin(t * 4 + f.k) * .012, .72 + Math.abs(Math.sin(f.a + f.k * 2)) * r * .9); f.foam.material.opacity = .9 * (1 - u); f.foam.scale.setScalar(.7 + u * .8); }
      else if (f.spray) { const u = (t * .9 + f.ph) % 1, ang = f.k * 1.1; f.spray.position.set(Math.cos(ang) * u * .22, .08 + Math.sin(u * PI) * .22, .7 + Math.sin(ang) * u * .18); f.spray.material.opacity = .8 * (1 - u); }
      else { const u = ((t * f.sp * .9 + f.k / 14) % 1); f.m.position.set(f.x0 + Math.sin(t * 3 + f.k) * .008, 1.02 - u * .96, .64); f.m.material.opacity = .95 - u * .5; f.m.scale.y = .6 + u * .9; }
    }
    for (const o of seaLife) {
      if (o.kind === 'fish') {                         // a shoal swims along the ría all together, its fish keeping their places with a little wobble
        o.a += o.sp * dt; const sg = Math.sign(o.sp), tx = -o.rx * Math.sin(o.a) * sg, tz = o.rz * Math.cos(o.a) * sg;
        put(o.w, o.cx + o.rx * Math.cos(o.a), o.cz + o.rz * Math.sin(o.a), Math.atan2(-tz, tx), -.11, true);
        for (const f of o.fs) { f.h.position.set(f.lx + Math.sin(t * 2.2 + f.ph) * .03, Math.sin(t * 2 + f.ph) * .01, f.lz + Math.sin(t * 1.6 + f.ph * 2) * .02); f.h.rotation.y = Math.sin(t * 3.2 + f.ph) * .22; }
        continue;
      }
      o.a += o.sp * dt; const sg = Math.sign(o.sp), tx = -o.rx * Math.sin(o.a) * sg, tz = o.rz * Math.cos(o.a) * sg;
      const yaw = Math.atan2(-tz, tx);
      if (o.kind === 'dol') {                          // swims under the surface, then leaps in an arc and dives back in
        const c = (t * .42 + o.ph) % 3.2, leap = c < 1 ? Math.sin(c * PI) : 0, vy = c < 1 ? Math.cos(c * PI) : 0;
        if (c < 1 && !o.up) { o.up = 1; if (audio && Math.random() < .5) audio.sfx('splash'); } else if (c >= 1) o.up = 0;
        put(o.w, o.cx + o.rx * Math.cos(o.a) + Math.sin(o.a) * 0, o.cz + o.rz * Math.sin(o.a) + o.off, yaw, -.09 + leap * .42, true);
        o.d.g.rotation.z = c < 1 ? vy * -.7 : Math.sin(t * 2 + o.ph) * .04; o.d.tail.rotation.z = Math.sin(t * 7 + o.ph) * .35;
      } else if (o.kind === 'turtle') {
        put(o.w, o.cx + o.rx * Math.cos(o.a), o.cz + o.rz * Math.sin(o.a), yaw, -.02 + Math.sin(t * .8 + o.ph) * .008, true);
        o.g.rotation.z = Math.sin(t * 1.2) * .04;
      } else {                                         // the whale glides far out, raises its tail now and then and blows
        put(o.w, o.cx + o.rx * Math.cos(o.a), o.cz + o.rz * Math.sin(o.a), yaw, -.1, true);
        const c = (t * .13) % 1; o.tail.rotation.z = Math.sin(t * .9) * .14 + (c > .8 ? Math.sin((c - .8) / .2 * PI) * .5 : 0); o.spout.visible = c > .45 && c < .6; o.g.rotation.z = Math.sin(t * .5) * .03;
      }
    }
    for (const c of clouds) { c.rotation.y += c.userData.sp * dt; c.scale.setScalar(1 + rainT * .55); }
    for (const g of gulls) { g.rotateY(g.userData.sp * dt * .35); const f = Math.sin(t * 7 + g.userData.ph) * .5; g.userData.b.w1.rotation.z = f; g.userData.b.w2.rotation.z = -f; }
    for (const f of flyers) {
      f.a += f.sp * dt; const sg = Math.sign(f.sp), tx = -f.rx * Math.sin(f.a) * sg, tz = f.rz * Math.cos(f.a) * sg;
      put(f.b.wrap, f.cx + f.rx * Math.cos(f.a), f.cz + f.rz * Math.sin(f.a), Math.atan2(-tz, tx), f.lift + Math.sin(t * 1.3 + f.ph) * .12, true);
      const fl = Math.sin(t * 8 + f.ph) * .55; f.b.w1.rotation.z = fl; f.b.w2.rotation.z = -fl;
    }
    for (const c of cars) {
      if (c.offT === undefined) { c.offT = c.off; c.v0 = Math.abs(c.v); c.dir = Math.sign(c.v) || 1; c.vm = 1; }
      const edge = Math.min(c.u, 1 - c.u) * c.r.total, ahead = c.dir > 0 ? (1 - c.u) * c.r.total : c.u * c.r.total;
      c.vm += (Math.min(1, .25 + ahead * .9) - c.vm) * Math.min(1, dt * 6);          // slows down smoothly before the end of the road
      c.u += c.dir * c.v0 * c.vm / c.r.total * dt; c.v = c.dir * c.v0 * c.vm;
      if (ahead < .02) { c.dir = -c.dir; c.offT = -c.offT; c.vm = .25; c.u = Math.max(0, Math.min(1, c.u)); }
      c.off += (c.offT - c.off) * Math.min(1, dt * 3);
      const [x, z, yaw] = routeAt(c.r, c.u), sy = Math.sin(yaw), cy = Math.cos(yaw), px = x + sy * c.off, pz = z + cy * c.off, onW = 0;
      const hd = yaw + (c.v < 0 ? PI : 0), hx = Math.cos(hd), hz = -Math.sin(hd);
      { const want = roadLift(px, pz, .028 + Math.max(0, .07 - groundH(px, pz))) + .012; c.ly = c.ly === undefined ? want : c.ly + (want - c.ly) * Math.min(1, dt * 16); put(c.w, px, pz, hd, c.ly + (onW > 0 ? onW * Math.max(0, (Math.abs(px - INLET[0][0]) < 1.5 ? .2 : .28) - groundH(px, pz)) : 0)); }
      if (onW <= 0) c.w.quaternion.multiply(_q.setFromAxisAngle(Zax, Math.atan2(groundH(px + hx * .12, pz + hz * .12) - groundH(px - hx * .12, pz - hz * .12), .24)));
    }
    for (const s of sailers) {
      s.a += s.sp * dt; const sg = Math.sign(s.sp), tx = -s.rx * Math.sin(s.a) * sg, tz = s.rz * Math.cos(s.a) * sg;
      put(s.w, s.cx + s.rx * Math.cos(s.a), s.cz + s.rz * Math.sin(s.a), Math.atan2(-tz, tx), 0, true);
      s.b.position.y = Math.sin(t * 1.5 + s.ph) * .02; s.b.rotation.z = Math.sin(t * 1.1 + s.ph) * .05 - .04; s.b.rotation.x = Math.sin(t * .9 + s.ph * 2) * .035;
    }
    for (const q of strollers) {
      if (q.still) { put(q.p, q.x + Math.cos(q.a) * q.rx * Math.cos(q.yaw), q.z - Math.cos(q.a) * q.rx * Math.sin(q.yaw), q.yaw + q.a, 0); continue; }
      q.a += q.sp * dt; const sg = Math.sign(q.sp), lx = Math.cos(q.a) * q.rx, lz = Math.sin(q.a) * q.rz, c = Math.cos(q.yaw), sn = Math.sin(q.yaw);
      put(q.p, q.x + lx * c + lz * sn, q.z - lx * sn + lz * c, q.yaw + Math.atan2(-Math.cos(q.a) * q.rz * sg, -Math.sin(q.a) * q.rx * sg), Math.abs(Math.sin(t * 6 + q.a * 3)) * .006);
    }
    for (const q of pathers) {
      if (!q.still) { q.u += q.v * dt / Math.max(.5, q.r.total); if (q.u > 1 || q.u < 0) { q.u = Math.min(1, Math.max(0, q.u)); q.v = -q.v; q.off = -q.off; } }
      const [x, z, yaw] = routeAt(q.r, q.u), sy = Math.sin(yaw), cy = Math.cos(yaw);
      const qx = x + sy * q.off, qz = z + cy * q.off;
      if (q.bridge) { const B = q.bridge, tgt = Math.hypot(qx - B.cx, qz - B.cz) <= B.half ? Math.max(0, B.top - groundH(qx, qz)) : 0; q.lift = (q.lift || 0) + (tgt - (q.lift || 0)) * Math.min(1, dt * 12); }   // on the deck they stand on its planks, on the banks on the ground
      put(q.p, qx, qz, yaw + (q.v < 0 ? PI : 0), (q.still ? 0 : Math.abs(Math.sin(t * 7 + q.u * 30)) * .008) + (q.lift || 0));
    }
    for (const k of kickers) {                                              // the ball drifts across the pitch, every child runs after it, and now and then it is kicked towards a goal
      const hw = k.small ? .5 : .5, hd = k.small ? .27 : .27;
      k.bx = Math.sin(t * .6 + k.ph) * hw + Math.sin(t * 1.7 + k.ph) * .06; k.bz = Math.sin(t * .83 + k.ph * 2) * hd;
      const [bx, bz] = k.loc(k.qx + k.bx, k.qz + k.bz); put(k.ball, bx, bz, 0, .125 + Math.abs(Math.sin(t * 5 + k.ph)) * .04);
      for (const c of k.kids) {
        const tx = k.bx + (c.team ? .22 : -.22) + Math.sin(t * .9 + c.ph) * .16, tz = k.bz + Math.cos(t * 1.1 + c.ph) * .15, dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz);
        const sp = Math.min(d, .55) * 1.8 * dt; if (d > .001) { c.x += dx / d * sp; c.z += dz / d * sp; c.x = Math.max(-hw, Math.min(hw, c.x)); c.z = Math.max(-hd, Math.min(hd, c.z)); }
        const [wx, wz] = k.loc(k.qx + c.x, k.qz + c.z);
        put(c.kd, wx, wz, Math.atan2(-dz, dx) , .1 + Math.abs(Math.sin(t * 9 + c.ph)) * .012);
      }
    }
    for (const fl of flags) fl.rotation.y = Math.sin(t * 3 + fl.position.x * 5) * .35;
    { const fo = fiestaObj; for (const m of fo) { if (m.lh2) { beamPivot.rotation.y = t * .8; beamPivot.userData.m.material.opacity = .32 * nightT + rainT * .1; m.lh2.userData.sl.intensity = 1.8 * nightT; m.lh2.userData.lan.material.emissiveIntensity = .5 + 2.2 * nightT; continue; } if (m.curve) { m.cars.forEach((g, k) => { const u = ((t * .07 + .96 - k * .06) % 1 + 1) % 1, p = m.curve.getPointAt(u), q = m.curve.getPointAt((u + .01) % 1); g.position.copy(p); _m.lookAt(q, p, p.clone().normalize()); g.quaternion.setFromRotationMatrix(_m); }); } else m.rotation.z = Math.sin(t * 6 + m.position.x * 40) * .08; } }
    if (window.__crowd) for (const c of window.__crowd) { if (c.night) { const v = Math.max(.001, nightT); c.p.scale.setScalar(c.s0 * v); c.p.visible = nightT > .03; if (!c.p.visible) continue; } const a = t * (c.dance ? 1.1 : .35) + c.a; put(c.p, c.cx + Math.cos(a) * (c.dance ? .05 : .18), c.cz + Math.sin(a) * (c.dance ? .05 : .12), a + PI / 2, Math.abs(Math.sin(t * (c.dance ? 5 : 7) + c.a)) * (c.dance ? .018 : .006)); }
    for (const l of fiestaLights) l[0].intensity = l[1] * nightT * (1 - rainT * .4);
    { // fireworks: now and then, at night, a soft burst rises over the fiesta, opens into a sphere of sparks and fades
      if (nightT > .8 && now > fwNext) { fwNext = now + 3500 + Math.random() * 7000; const pos = new Float32Array(70 * 3), col = new Float32Array(70 * 3), base = new THREE.Color().setHSL(Math.random(), .85, .62), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const dirs = []; for (let k = 0; k < 70; k++) { const v = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(.5 + Math.random() * .5); dirs.push(v); const c2 = k % 5 === 0 ? new THREE.Color(0xfff2c0) : base; col.set([c2.r, c2.g, c2.b], k * 3); }
        const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .09, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })); pts.frustumCulled = false;
        const origin = dirFrom(fiestaFx.x + (Math.random() - .5) * 1.6, fiestaFx.z + (Math.random() - .5) * 1.4, new THREE.Vector3()).multiplyScalar(R + 1.9 + Math.random() * .7); world.add(pts); fireworks.push({ pts, dirs, origin, t0: t, up: origin.clone().normalize() }); if (audio) audio.sfx('boom'); }
      for (let i = fireworks.length - 1; i >= 0; i--) { const f = fireworks[i], u = t - f.t0; if (u > 3.2) { world.remove(f.pts); f.pts.geometry.dispose(); fireworks.splice(i, 1); continue; }
        const a = f.pts.geometry.attributes.position.array, rise = Math.min(1, u / .5), e = Math.max(0, u - .5), r = 1 - Math.exp(-e * 2.2);
        for (let k = 0; k < f.dirs.length; k++) { const d = f.dirs[k]; if (u < .5) { a[k * 3] = f.origin.x - f.up.x * (1 - rise) * .9; a[k * 3 + 1] = f.origin.y - f.up.y * (1 - rise) * .9; a[k * 3 + 2] = f.origin.z - f.up.z * (1 - rise) * .9; } else { a[k * 3] = f.origin.x + d.x * r * .9 - f.up.x * e * e * .09; a[k * 3 + 1] = f.origin.y + d.y * r * .9 - f.up.y * e * e * .09; a[k * 3 + 2] = f.origin.z + d.z * r * .9 - f.up.z * e * e * .09; } }
        f.pts.geometry.attributes.position.needsUpdate = true; f.pts.material.opacity = u < .5 ? .9 : Math.max(0, 1 - e / 2.6); } }
    if (!fieldsList) { fieldsList = []; world.children.forEach((c) => { if (c.userData && c.userData.prod) { const farmer = person(SHIRTS[(fieldsList.length * 3 + 1) % SHIRTS.length], { skin: SKINS[fieldsList.length % 4], role: 'farm', hat: 0xe9d79a }); farmer.visible = false; farmer.scale.setScalar(.8); W(farmer); fieldsList.push({ g: c, farmer, state: 0, t0: 0, picked: 0, ph: Math.random() * 6 }); } }); }
    for (const f of fieldsList) {
      const u = f.g.userData, pr = u.prod, n = pr.length, wsx = Math.sin(u.fang), wsz = Math.cos(u.fang);
      if (f.state === 0 && rainT > .55) { f.state = 1; f.t0 = t; for (const m of pr) m.visible = true; }
      if (f.state === 1) { const k = Math.min(1, (t - f.t0) / 6); pr.forEach((m, i) => { const e = Math.max(0, Math.min(1, k * 1.6 - (i / n) * .6)); m.scale.setScalar(.001 + e * .999 + Math.sin(t * 2 + i) * .02 * e); }); if (k >= 1 && rainT < .3) { f.state = 2; f.t0 = t; f.farmerPos = 0; } }
      else if (f.state === 2) {                                                 // the farmer walks in, picks the produce one by one and walks away
        const arrive = Math.min(1, (t - f.t0) / 3.2), edge = (u.fd / 2 + .13), far = edge + .9 + (f.ph % 1) * .5;
        const off = f.picked < n ? far - (far - edge) * arrive : edge + (t - f.t1) * .2;
        f.farmer.visible = true; put(f.farmer, u.fx + wsx * off, u.fz + wsz * off, u.fang + PI + (arrive < 1 ? 0 : Math.sin(t * 1.3 + f.ph) * .3), .03 + (arrive < 1 ? Math.abs(Math.sin(t * 9)) * .01 : Math.abs(Math.sin(t * 5)) * .014));
        if (arrive >= 1 && f.picked < n) { const nx = Math.floor((t - f.t0 - 3.2) / .55); while (f.picked < Math.min(n, Math.max(0, nx))) { pr[f.picked].scale.setScalar(.001); pr[f.picked].visible = false; f.picked++; } if (f.picked >= n) f.t1 = t; }
        if (f.picked >= n && (t - f.t1) > 4) { f.state = 3; f.farmer.visible = false; }
      } else if (f.state === 3) { f.state = 0; f.picked = 0; }
    }
    for (const c of canoes) {
      if (!c.okOff) { let o = Math.abs(c.off), tries = 0; const dir = c.south ? -1 : 1, fnn = c.south ? shoreS : shore, bad = (oo) => { for (let q = -8; q <= 8; q++) { const xx = c.cx + q / 8 * c.half, zz = fnn(xx) + dir * oo; for (const [dx, dz] of [[0, 0], [.2, 0], [-.2, 0], [0, .2], [0, -.2]]) if (groundH(xx + dx, zz + dz) > -.15 || inletD(xx + dx, zz + dz) < .4) return true; } return false; }; while (bad(o) && tries++ < 20) o += .12; c.off = o * (c.off < 0 ? -1 : 1); c.okOff = 1; }
      const a = t * c.sp * .35 + c.ph, x = c.cx + Math.sin(a) * c.half, dx = Math.cos(a) * c.half * c.sp * .35, fn = c.south ? shoreS : shore, z = fn(x) + (c.south ? -1 : 1) * Math.abs(c.off), dz = (fn(x + .05) - fn(x - .05)) / .1 * dx, yaw = Math.atan2(-dz, dx);
      put(c.g, x, z, yaw, .03 + Math.sin(t * 1.3 + c.ph) * .006, true); c.g.rotation.z = 0; c.pad.rotation.x = Math.sin(t * 2.4 + c.ph) * .5; c.pad.rotation.z = Math.sin(t * 2.4 + c.ph + 1.2) * .22;
    }
    for (const bl of balls) { const c = Math.cos(t * 2.6 + bl.ph), h = .07 + .24 * Math.abs(Math.sin(t * 2.6 + bl.ph)); put(bl.m, bl.x, bl.z + c * .3 * bl.sg, 0, h); }
    for (const s of swimmers) {
      const a = t * s.sp + s.ph, x = s.x + Math.sin(a) * s.rx;
      put(s.p, x, s.fn(x) - s.sg * s.off + Math.sin(a * 1.7) * .08, PI / 2 * Math.sign(Math.cos(a)), -.05 + Math.sin(t * 2.2 + s.ph) * .012, true);
    }
    for (const w of walkers) {
      const a = t * w.sp + w.ph, x = w.cx + Math.sin(a) * w.half;
      put(w.p, x, w.fn(x) + w.sg * w.off, PI / 2 * Math.sign(Math.cos(a)), Math.abs(Math.sin(t * 7 + w.ph)) * .008);
    }
    // people react to the weather: when it rains or night falls they run to the nearest house, then wait at its door (some go in); when it clears they run back to what they were doing
    for (const g of ALLP) {
      const u = g.userData, role = u.role; if (role === 'fish' || role === 'bike' || role === 'fest' || role === 'farm') continue;
      if (g.parent !== world) continue;                       // those on a stage, a boat or a pitch live in the space of their group: sending them 'home' as if in the world's space threw them up into the sky
      if (u.s0 === undefined) { u.s0 = g.scale.x; u.v = 1; u.mode = 0; u.lastX = null; const pp = planeOf(_d.copy(g.position).normalize()); u.p0 = pp; }
      if (u.umb) u.umb.visible = rainT > .5 && u.mode !== 3;
      const h = (u.idx * 37 % 100) / 100;
      if (role === 'sunL') { const w = rainT > .35 || nightT > .35 ? 0 : 1; u.v += (w - u.v) * (1 - Math.exp(-dt * 2.6)); g.scale.setScalar(u.s0 * Math.max(.001, u.v)); g.visible = u.v > .03; continue; }
      let shelter = false;
      if (role === 'sun' || role === 'swim') shelter = rainT > .35 || nightT > .35;
      else if (role === 'kid') shelter = nightT > .3 || (rainT > .85 && h > .4);
      else if (role === 'walk') shelter = nightT > .4 || (rainT > .7 && h > .5);
      else shelter = (nightT > .5 && h > .3) || (rainT > .85 && h > .7) || (rainT > .5 && role === 'town' && h > .85);
      const cur = planeOf(_d.copy(g.position).normalize());
      if (u.mode === 0) { u.p0 = cur; if (shelter && HOMES.length) {            // pick the nearest house and leave
        let best = null, bd = 1e9; for (const hm of HOMES) { const d2 = Math.hypot(hm[0] - cur[0], hm[1] - cur[1]); if (d2 < bd) { bd = d2; best = hm; } }
        const ang = Math.atan2(cur[1] - best[1], cur[0] - best[0]), r = best[2] * .8; u.door = [best[0] + Math.cos(ang) * r, best[1] + Math.sin(ang) * r, ang]; u.mode = 1; u.pos = cur; u.inside = (u.idx * 53 % 100) / 100 < .45; }
        else continue; }
      if (u.mode === 1 || u.mode === 2) {
        if (!shelter) { u.mode = 4; }
        else if (u.mode === 1) { const dx = u.door[0] - u.pos[0], dz = u.door[1] - u.pos[1], d = Math.hypot(dx, dz), st = Math.min(d, 1.05 * dt); if (d < .03) u.mode = 2; else { u.pos = [u.pos[0] + dx / d * st, u.pos[1] + dz / d * st]; put(g, u.pos[0], u.pos[1], Math.atan2(-dz, dx), Math.abs(Math.sin(t * 16 + u.idx)) * .014); } }
        if (u.mode === 2) { put(g, u.door[0], u.door[1], Math.atan2(-Math.sin(u.door[2] + PI), Math.cos(u.door[2] + PI)), Math.abs(Math.sin(t * 1.5 + u.idx)) * .004); const want = u.inside ? 0 : 1; u.v += (want - u.v) * (1 - Math.exp(-dt * 3)); g.scale.setScalar(u.s0 * Math.max(.001, u.v)); g.visible = u.v > .03; }
      }
      if (u.mode === 4) {                                                       // out again: back to where the day left them
        g.visible = true; u.v += (1 - u.v) * (1 - Math.exp(-dt * 4)); g.scale.setScalar(u.s0 * Math.max(.001, u.v));
        const mv = u.lp && Math.hypot(cur[0] - u.lp[0], cur[1] - u.lp[1]) > .002, target = mv ? cur : u.p0, dx = target[0] - u.pos[0], dz = target[1] - u.pos[1], d = Math.hypot(dx, dz), st = Math.min(d, 1.05 * dt);
        if (d < .04) { u.mode = 0; put(g, u.p0[0], u.p0[1], 0, 0); } else { u.pos = [u.pos[0] + dx / d * st, u.pos[1] + dz / d * st]; put(g, u.pos[0], u.pos[1], Math.atan2(-dz, dx), Math.abs(Math.sin(t * 16 + u.idx)) * .014); }
      }
      u.lp = planeOf(_d.copy(g.position).normalize());
    }
    if (!(root.classList.contains('x-mochi') && (frame & 1))) renderer.render(scene, camera);      // behind Mochi's blur the planet only needs every other frame
  };
  raf = requestAnimationFrame(loop);

  function close() {
    if (closed) return; closed = true;
    if (audio) { audio.sfx('close'); setTimeout(() => audio.stop(), 450); }
    cancelAnimationFrame(raf); removeEventListener('keydown', onKey, true); removeEventListener('resize', size);
    root.classList.remove('x-in');
    setTimeout(() => {
      try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {}
      scene.traverse((o) => { if (o.geometry && !boxG.has(o.geometry)) o.geometry.dispose(); });
      root.remove();
      document.documentElement.style.overflow = prevOverflow;
    }, 600);
    opts.onClose && opts.onClose();
  }
  root.querySelector('.x-pl-x').addEventListener('click', close);
  const look = (x, z, zoom, snap, tilt) => { focus = { q: faceCamera(dirFrom(x, z, new THREE.Vector3()), tilt === undefined ? .45 : tilt), dist: baseDist * (zoom || .5) }; if (snap) { world.quaternion.copy(focus.q); dist = distT = focus.dist; focus = null; } };
  return { bridgeAt: () => (typeof BRIDGE_C !== 'undefined' ? BRIDGE_C : null), audio, close, root, spots, show, look, scene, camera, world, dbg: { shore, shoreS, LOURO, HILL2, INLET, INLET2 } };
}

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = [
    '.x-pl{position:fixed;inset:0;z-index:90;background:#bfe0f6;opacity:0;transition:opacity .9s cubic-bezier(.4,0,.2,1);color:#4a3340;font:500 13px/1.45 "Switzer","Switzer Placeholder",system-ui,sans-serif;overscroll-behavior:contain;-webkit-user-select:none;user-select:none}',
    '.x-pl.x-in{opacity:1}',
    '.x-pl.x-night{color:#cbe3ff;background:#0a1430}',
    '.x-pl-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}',
    '.x-pl-cv:active{cursor:grabbing}',
    '.x-pl-ts{position:absolute;left:0;right:0;pointer-events:none;-webkit-backdrop-filter:blur(var(--tsb,5px));backdrop-filter:blur(var(--tsb,5px))}',
    '.x-pl-ts-t{top:0;height:var(--tsh,22%);-webkit-mask-image:linear-gradient(#000,rgba(0,0,0,0));mask-image:linear-gradient(#000,rgba(0,0,0,0))}',
    '.x-pl-ts-b{bottom:0;height:calc(var(--tsh,22%) + 4%);-webkit-mask-image:linear-gradient(to top,#000,rgba(0,0,0,0));mask-image:linear-gradient(to top,#000,rgba(0,0,0,0))}',
    '.x-pl-top{z-index:30;position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:max(16px,env(safe-area-inset-top)) 18px 0;pointer-events:none}',
    '.x-pl-t{display:flex;flex-direction:column;gap:2px}',
    '.x-pl-t b{font:600 19px/1.15 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:-.01em}',
    '.x-pl-t span{opacity:.7;font-size:12px}',
    '.x-pl-clock{display:flex;align-items:baseline;gap:6px;margin-top:6px;opacity:.85!important;font:500 12px/1.2 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;letter-spacing:.06em;text-transform:uppercase}',
    '.x-pl-clock em{font-style:normal;opacity:.7}.x-pl-clock b{font:500 12px/1.2 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;letter-spacing:.06em}.x-pl-clock i{font-style:normal;display:inline-block;width:.5em;text-align:center;animation:x-pl-blink 1s step-end infinite}',
    '@keyframes x-pl-blink{50%{opacity:0}}',
    '.x-pl-an{align-self:center;margin-left:4px;opacity:.75;overflow:visible}.x-pl-ah,.x-pl-am{transform-origin:12px 12px}',
    '.x-pl-btns{display:flex;gap:10px;pointer-events:auto}',
    '.x-pl button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.x-pl-dn,.x-pl-x,.x-pl-mu,.x-pl-rn{width:44px;height:44px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 2px 10px rgba(20,50,80,.12);transition:background .5s ease,transform .5s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl.x-night .x-pl-dn,.x-pl.x-night .x-pl-x,.x-pl.x-night .x-pl-mu,.x-pl.x-night .x-pl-rn{background:rgba(20,34,66,.65)}',
    '.x-pl-dn:hover,.x-pl-x:hover,.x-pl-mu:hover,.x-pl-rn:hover{transform:scale(1.06)}',
    '.x-pl-rn[aria-pressed="true"]{background:rgba(120,170,215,.75)}',
    '.x-pl.x-rain{background:#aebfcb}.x-pl.x-rain.x-night{background:#0b1426}',
    '.x-pl-pins{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
    '.x-pl-pin{position:absolute;left:0;top:0;margin:0;padding:0;border:0;background:none;display:flex;align-items:center;transition:opacity .4s ease;will-change:transform;white-space:nowrap}',
    '.x-pl-pin i{flex:none;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#b9623f;color:#fff;font:600 11px/26px "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;font-style:normal;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:transform .4s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl-pin span{display:none;margin:-13px 0 0 8px;align-items:baseline;gap:8px;padding-right:2px}',
    '.x-pl-pin b{font:600 14px/26px "Switzer","Switzer Placeholder",system-ui,sans-serif;color:#1a2a33}',
    '.x-pl-pin em{font:400 14px/26px "Switzer","Switzer Placeholder",system-ui,sans-serif;font-style:normal;color:#7a7f83}',
    '.x-pl-pin.x-lab,.x-pl-pin:hover,.x-pl-pin.x-on{background:#fffdf8;border-radius:999px;margin-left:-13px;padding:0 14px 0 0;box-shadow:0 4px 16px rgba(20,50,80,.2);animation:x-pl-pop .5s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl-pin.x-lab span,.x-pl-pin:hover span,.x-pl-pin.x-on span{display:flex}',
    '.x-pl-pin.x-lab i,.x-pl-pin:hover i,.x-pl-pin.x-on i{margin:0 0 0 0}',
    '.x-pl-pin.x-lab span,.x-pl-pin:hover span,.x-pl-pin.x-on span{margin:0 0 0 8px}',
    '.x-pl-pin.x-on{background:#1f7a64}.x-pl-pin.x-on b{color:#fff}.x-pl-pin.x-on em{color:rgba(255,255,255,.75)}',
    '.x-pl-pin:hover{z-index:2}',
    '@keyframes x-pl-pop{from{opacity:.4;transform-origin:left}to{opacity:1}}',
    '.x-pl.x-night .x-pl-pin.x-lab,.x-pl.x-night .x-pl-pin:hover{background:rgba(20,34,66,.92)}.x-pl.x-night .x-pl-pin b{color:#e6f0ff}.x-pl.x-night .x-pl-pin em{color:#9db4d6}',
    '.x-pl-card{position:absolute;left:18px;bottom:max(18px,env(safe-area-inset-bottom));width:min(380px,calc(100% - 36px));padding:16px 18px 14px;border-radius:20px;background:rgba(255,253,248,.88);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 8px 30px rgba(20,50,80,.18);color:#12304a;animation:x-pl-up .6s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl.x-night .x-pl-card{background:rgba(16,28,56,.86);color:#cbe3ff}',
    '.x-pl-card[hidden]{display:none}',
    '@keyframes x-pl-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '.x-pl-n{font:500 11px "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.12em;opacity:.65;text-transform:uppercase}',
    '.x-pl-card h2{margin:4px 0 6px;font:600 20px/1.2 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:-.01em}',
    '.x-pl-card p{margin:0 0 12px;font:400 14px/1.5 "Switzer","Switzer Placeholder",system-ui,sans-serif}',
    '.x-pl-nav{display:flex;gap:8px;align-items:center}',
    '.x-pl-nav button{border:0;border-radius:999px;padding:8px 14px;background:rgba(18,48,74,.1);font:500 12px "Switzer","Switzer Placeholder",system-ui,sans-serif;transition:background .4s ease}',
    '.x-pl.x-night .x-pl-nav button{background:rgba(203,227,255,.14)}',
    '.x-pl-nav button:hover{background:rgba(18,48,74,.2)}',
    '.x-pl-nav .x-pl-cx{margin-left:auto;width:34px;height:34px;padding:0;display:grid;place-items:center;font-size:13px}',
    '.x-pl-more{position:absolute;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);border:0;border-radius:999px;padding:9px 20px 10px;background:rgba(255,253,248,.72);color:#2c4a5a;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 2px 14px rgba(20,50,80,.12);font:500 13px/1 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:.02em;transition:background .5s ease,transform .6s cubic-bezier(.22,.8,.24,1),box-shadow .6s ease}',
    '.x-pl-ms{will-change:transform}',
    '.x-pl-ms.x-hop{animation:x-ms-hop .9s cubic-bezier(.3,1.5,.5,1)}',
    '@keyframes x-ms-hop{0%{transform:none}22%{transform:translateY(8px) scale(1.1,.86)}52%{transform:translateY(-26px) scale(.93,1.1) rotate(-3deg)}76%{transform:translateY(2px) scale(1.05,.95) rotate(1.5deg)}100%{transform:none}}',
    '.x-pl-st{position:absolute;width:16px;height:16px;opacity:0;pointer-events:none;background:radial-gradient(closest-side,#fff,rgba(255,255,255,0));clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)}',
    '.x-pl-st.s1{left:6%;top:14%}.x-pl-st.s2{right:4%;top:6%}.x-pl-st.s3{left:-2%;top:56%}.x-pl-st.s4{right:0;top:52%}',
    '.x-pl-mochi.x-pop .x-pl-st{animation:x-st-pop 1.2s ease-out}.x-pl-mochi.x-pop .x-pl-st.s2{animation-delay:.12s}.x-pl-mochi.x-pop .x-pl-st.s3{animation-delay:.24s}.x-pl-mochi.x-pop .x-pl-st.s4{animation-delay:.34s}',
    '@keyframes x-st-pop{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1;transform:scale(1.5) rotate(40deg)}100%{opacity:0;transform:translateY(-22px) scale(.6) rotate(90deg)}}',
    '.x-pl-bub.x-swap{animation:x-bub-swap .6s ease}@keyframes x-bub-swap{0%{transform:scale(.96)}50%{transform:scale(1.02)}100%{transform:none}}',
    '.x-pl-more{cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 20px 10px 16px;background:rgba(255,255,255,.55);box-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 2px 14px rgba(20,50,80,.1);font:500 12px/1 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace!important;letter-spacing:.14em;text-transform:uppercase}',
    '.x-pl-more svg{opacity:.8}',
    '.x-pl-more:hover{transform:translateX(-50%) translateY(-2px);box-shadow:0 6px 22px rgba(20,50,80,.18);background:rgba(255,255,255,.85)}',
    '.x-pl-mochi{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:24px;cursor:pointer;background:rgba(251,222,196,0);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);transition:background .9s ease,-webkit-backdrop-filter .9s ease,backdrop-filter .9s ease}',
    '.x-pl-mochi[hidden]{display:none}.x-pl-mochi.x-on{background:rgba(251,226,206,.1);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)}',
    '.x-pl.x-night .x-pl-mochi.x-on{background:rgba(14,22,48,.45)}',
    '.x-pl-ms{transition:filter 1.4s ease}',
    '.x-pl.x-night .x-pl-ms{-webkit-filter:hue-rotate(22deg) saturate(.7) brightness(1.5) contrast(.86) drop-shadow(0 0 10px rgba(205,190,255,.9)) drop-shadow(0 0 30px rgba(170,150,255,.75));filter:hue-rotate(22deg) saturate(.7) brightness(1.5) contrast(.86) drop-shadow(0 0 10px rgba(205,190,255,.9)) drop-shadow(0 0 30px rgba(170,150,255,.75))}',
    '.x-pl.x-night .x-pl-mq:before{content:"";position:absolute;inset:-35%;border-radius:50%;background:radial-gradient(closest-side,rgba(190,170,255,.45),rgba(190,170,255,0));animation:x-mo-glow 3.6s ease-in-out infinite;pointer-events:none}',
    '@keyframes x-mo-glow{50%{transform:scale(1.16);opacity:.7}}',
    '.x-pl-mq{position:relative;width:min(132px,32vw);aspect-ratio:224/183;opacity:0;transform:translateY(34px) scale(.6);transition:opacity .8s ease .15s,transform 1.1s cubic-bezier(.22,1.3,.3,1) .15s}',
    '.x-pl-mochi.x-on .x-pl-mq{opacity:1;transform:none}',
    '.x-pl-mo{position:absolute;inset:0;will-change:transform}',
    '.x-pl-mc{position:absolute;inset:0;width:100%;height:100%;display:block}',
    '.x-pl-ms{position:absolute;inset:0;-webkit-filter:hue-rotate(22deg) saturate(.75) brightness(1.12) contrast(.9);filter:hue-rotate(22deg) saturate(.75) brightness(1.12) contrast(.86)}',
    '.x-pl-sh{position:absolute;left:14%;right:2%;bottom:-12%;height:16%;border-radius:50%;background:radial-gradient(closest-side,rgba(120,72,64,.3),rgba(120,72,64,0));}',
    '@keyframes x-mo-float{50%{transform:translateY(-14px) rotate(1.6deg)}}@keyframes x-mo-sh{50%{transform:scale(.86);opacity:.7}}',
    '.x-pl-bub{position:relative;max-width:min(430px,86vw);padding:16px 22px 18px;border-radius:24px;background:rgba(255,253,248,.92);color:#4a3340;box-shadow:0 10px 36px rgba(80,40,40,.18);opacity:0;transform:translateY(14px);transition:opacity .6s ease .5s,transform .8s cubic-bezier(.22,.8,.24,1) .5s}',
    '.x-pl-mochi.x-on .x-pl-bub{opacity:1;transform:none}',
    '.x-pl-mochi.x-ctaw .x-pl-bub{opacity:0!important;transform:translateY(10px)!important;transition:opacity .4s ease,transform .4s ease;pointer-events:none}',
    '.x-pl-mochi.x-cta .x-pl-bub{display:none}',
    '.x-pl-cta{display:none;position:relative;z-index:3;font:500 15px/1 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.08em;text-transform:uppercase;padding:20px 40px;border-radius:20px;border:0;background:rgba(255,253,248,.96);color:#4a3340;box-shadow:0 12px 34px rgba(80,40,40,.2);cursor:pointer;opacity:0;transform:translateY(12px);transition:opacity .6s ease,transform .8s cubic-bezier(.22,.8,.24,1),box-shadow .3s ease}',
    '.x-pl-cta:hover{box-shadow:0 14px 40px rgba(80,40,40,.3)}',
    '.x-pl-mochi.x-cta .x-pl-cta{display:block}.x-pl-mochi.x-ctaon .x-pl-cta{opacity:1;transform:none}',
    '.x-pl-mochi.x-cta .x-pl-mq{z-index:1;margin-bottom:-62px}.x-pl-mochi.x-cta .x-pl-sh{display:none}',
    '.x-pl-mochi.x-load{-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);background:rgba(190,232,240,.4);cursor:progress}',
    '.x-pl-top,.x-pl-more,.x-pl-build{transition:opacity .5s ease}.x-pl.x-tour .x-pl-top,.x-pl.x-tour .x-pl-more,.x-pl.x-tour .x-pl-build{opacity:0;pointer-events:none}',
    '.x-pl-mochi.x-load .x-pl-cta,.x-pl-mochi.x-load .x-pl-bub{display:none}',
    '.x-pl-mochi.x-load .x-pl-mq{margin-bottom:0;animation:x-mo-load 1.7s ease-in-out infinite}@keyframes x-mo-load{0%,100%{transform:translateY(-18px)}50%{transform:translateY(18px)}}',
    '.x-pl.x-night .x-pl-cta{background:rgba(24,34,64,.95);color:#e4eeff}',
    '.x-pl.x-night .x-pl-bub{background:rgba(24,34,64,.92);color:#e4eeff}',
    '.x-pl-bub p{margin:0;min-height:3em;font:500 17px/1.5 "Switzer","Switzer Placeholder",system-ui,sans-serif}',
    '.x-pl-go{position:absolute;right:16px;bottom:6px;opacity:0;font-size:14px;animation:x-mo-nudge 1.3s ease-in-out infinite}.x-pl-mochi.x-done .x-pl-go{opacity:.5}',
    '@keyframes x-mo-nudge{50%{transform:translateY(4px)}}',
    '.x-pl.x-mochi .x-pl-more{opacity:0;pointer-events:none}',
    '.x-pl-more.x-open{opacity:0;pointer-events:none}',
    '.x-pl.x-night .x-pl-more{background:rgba(20,34,66,.6);color:#cbe3ff}',
    '.x-pl-build{position:absolute;left:14px;top:50%;transform:translateY(-50%);z-index:24;display:flex;flex-direction:column;gap:9px;padding:10px 8px;border-radius:28px;background:rgba(255,252,246,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 8px 28px rgba(60,50,60,.14);max-height:calc(100% - 190px);overflow:auto;scrollbar-width:none;touch-action:none;transition:opacity .5s ease,background .3s ease,box-shadow .3s ease,outline-color .3s}',
    '.x-pl-build::-webkit-scrollbar{display:none}',
    '.x-pl-bi{flex:none;width:44px;height:44px;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.88);color:#4a3340;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;transition:transform .35s cubic-bezier(.3,1.5,.5,1),background .25s,box-shadow .25s}',
    '.x-pl-bi:hover{transform:translateY(-2px) scale(1.08);box-shadow:0 6px 16px rgba(60,50,60,.22)}.x-pl-bi:active{cursor:grabbing;transform:scale(.94)}',
    '.x-pl-build.x-del{background:rgba(255,214,214,.7);box-shadow:0 0 0 3px rgba(224,120,120,.55),0 8px 28px rgba(60,50,60,.14)}',
    '.x-pl.x-mochi .x-pl-build{opacity:0;pointer-events:none}',
    '.x-pl.x-night .x-pl-build{background:rgba(20,30,60,.45)}.x-pl.x-night .x-pl-bi{background:rgba(32,46,86,.85);color:#e4eeff}',
    '@media(max-width:600px){.x-pl-build{left:8px;gap:7px;padding:8px 6px}.x-pl-bi{width:40px;height:40px}}',
    '.x-pl-info{position:absolute;left:50%;bottom:max(16px,env(safe-area-inset-bottom));width:min(430px,calc(100% - 28px));max-height:min(62vh,520px);overflow:auto;padding:20px 22px 16px;border-radius:22px;background:rgba(255,253,248,.88);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);box-shadow:0 10px 36px rgba(20,50,80,.2);color:#12304a;opacity:0;transform:translate(-50%,16px);transition:opacity .45s ease,transform .6s cubic-bezier(.22,.8,.24,1);-webkit-user-select:text;user-select:text}',
    '.x-pl-info.x-on{opacity:1;transform:translate(-50%,0)}.x-pl-info[hidden]{display:none}',
    '.x-pl.x-night .x-pl-info{background:rgba(16,28,56,.88);color:#cbe3ff}',
    '.x-pl-info h2{margin:0 28px 2px 0;font:600 21px/1.2 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:-.01em}',
    '.x-pl-info p{margin:8px 0;font:400 14px/1.5 "Switzer","Switzer Placeholder",system-ui,sans-serif}',
    '.x-pl-info .x-pl-sub{margin:0 0 8px;opacity:.65;font-size:12.5px}',
    '.x-pl-info ul{margin:8px 0;padding:0;list-style:none}.x-pl-info li{margin:7px 0;padding-left:16px;position:relative;font:400 13.5px/1.45 "Switzer","Switzer Placeholder",system-ui,sans-serif}',
    '.x-pl-info li:before{content:"";position:absolute;left:2px;top:.55em;width:6px;height:6px;border-radius:50%;background:#b9623f}',
    '.x-pl-info .x-pl-tip{margin:12px 0 0;opacity:.6;font:500 10.5px/1.5 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.06em;text-transform:uppercase}',
    '.x-pl-ix{position:absolute;right:12px;top:12px;width:32px;height:32px;border:0;border-radius:50%;display:grid;place-items:center;padding:0;background:rgba(18,48,74,.1)}',
    '.x-pl.x-night .x-pl-ix{background:rgba(203,227,255,.14)}',
    '@media(max-width:600px){.x-pl-card{left:12px;right:12px;width:auto}.x-pl-t b{font-size:16px}.x-pl-t span{font-size:11px}.x-pl-pin b,.x-pl-pin em{font-size:12.5px}}'
  ].join('\n');
  document.head.appendChild(s);
}
