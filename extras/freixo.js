// The coast of the ría de Muros e Noia as a little 3D planet: Muros and its stone arcades, Esteiro and its inlet, O Freixo and its pier, Outes and
// the old bridge, with Monte Louro across the water. Villages are spread over the whole globe and joined by roads, with people on the beaches,
// fishermen on anchored boats, cars, boats under sail, birds and clouds that keep moving. Opened from the Contact page (three clicks on the creature).
// open({ night, onClose }) shows it on top of the page and returns { close }.
import * as THREE from './three.module.min.js';

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
const INLETS = [INLET, INLET2];
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
function groundH(x, z) {
  const i = whichIsl(x, z), r = isl(i, x, z);
  if (r >= 1) return -.02 - .75 * sstep(1, 1.1, r);
  const k = 1 - r;
  let h = -.02 + .42 * Math.pow(k, .55) + ISL[i].hh * Math.pow(k, 1.3) * (.65 + .35 * n2(x + i * 7, z));
  if (i === 0) h += 4.2 * Math.exp(-((x - LOURO[0]) ** 2 + (z - LOURO[1]) ** 2) / (2 * 2.6 * 2.6)) + 2.8 * Math.exp(-((x - HILL2[0]) ** 2 + (z - HILL2[1]) ** 2) / (2 * 2.4 * 2.4));
  const g = cove(x, z);
  if (g > 0) h = -.02 + (h + .02) * (1 - .8 * g);
  if (i === 0) { const c = 1 - sstep(.26, .5, inletD(x, z)); if (c > 0) h = h * (1 - c) - .16 * c; }
  const lg = 1 - sstep(.45, .8, Math.hypot(x - LAG[0], z - LAG[1])); if (lg > 0) h = h * (1 - lg) - .14 * lg;
  return h;
}
const Y = new THREE.Vector3(0, 1, 0), Zax = new THREE.Vector3(0, 0, 1);
const _d = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
// stands an object on the planet at map position (x, z), facing yaw (0 = along the map's z axis), lift above the ground (sea = on the water)
function put(obj, x, z, yaw, lift, sea) {
  dirFrom(x, z, _d); dirFrom(x + .05, z, _e); _e.sub(_d); _e.addScaledVector(_d, -_e.dot(_d)).normalize();
  _f.crossVectors(_e, _d);
  obj.quaternion.setFromRotationMatrix(_m.makeBasis(_e, _d, _f));
  if (yaw) obj.quaternion.multiply(_q.setFromAxisAngle(Y, yaw));
  obj.position.copy(_d).multiplyScalar(R + (sea ? SEA : groundH(x, z)) + (lift || 0));
  return obj;
}

// ---- colours (soft, like a miniature)
const C = (h) => new THREE.Color(h);
const SAND = C(0xf2e5b8), SEABED_SHORE = C(0xeee2b8), SEABED_DEEP = C(0x1f6f8f), FAR = C(0x2b7f9c), GRASS_A = C(0xa3d36f), GRASS_B = C(0x8fc862),
  WOOD = C(0x6fae53), ROCK = C(0xb2ab9a), ROCK_G = C(0x8aa070), HEATH = C(0xb9a3c6);
const FIELDS = [C(0xc2de78), C(0xe6d77e), C(0x9fd36a), C(0xd2e48f), C(0xdcc983)];

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
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 1 }));
}

// ---- small building blocks
const matCache = new Map();
const std = (color, extra) => {
  const key = extra ? null : color;
  if (key !== null && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .85 }, extra || {}));
  if (key !== null) matCache.set(key, m);
  return m;
};
const winMat = new THREE.MeshStandardMaterial({ color: 0x2c2a33, emissive: 0xffc46b, emissiveIntensity: 0, roughness: .5 });
const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .4, roughness: .3 });
const boxG = new Map();
const box = (w, h, d, mat) => {
  const k = w + ',' + h + ',' + d; let g = boxG.get(k);
  if (!g) { g = new THREE.BoxGeometry(w, h, d); boxG.set(k, g); }
  return new THREE.Mesh(g, mat);
};
const gable = (len, span, rh, mat) => {              // a gabled roof, ridge along x
  const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  g.rotateY(PI / 2); g.translate(-len / 2, 0, 0);
  return new THREE.Mesh(g, mat);
};
const ROOF = [0xc4623a, 0xb85a38, 0xd0744a, 0xbd5b3c, 0xcc6b43], SLATE = 0x5d636b;
const GRANITE = [0xb8b19f, 0xaaa391, 0xc2bba9];
const WALLS = [0xf7f1e4, 0xf1e0b8, 0xf0d2bd, 0xf7f1e4, 0xe8d6a5, 0xf2e8d2, 0xcfe0e8, 0xf7f1e4];
const FRAMEC = [0xffffff, 0x2f6fa8, 0x3b8f6a, 0xffffff, 0xa23a30];

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
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * (w / n);
      if (f === 0 && Math.abs(x) < w / n * .55 && n % 2 === 1) continue;
      const fr = box(.07, .1, .014, fm); fr.position.set(x, y, z + .004); g.add(fr);
      const gl = box(.046, .075, .018, winMat); gl.position.set(x, y, z + .008); g.add(gl);
      if (o.shut) for (const sx of [-1, 1]) { const sw = box(.022, .095, .014, std(o.shut)); sw.position.set(x + sx * .052, y, z + .005); g.add(sw); }
    }
  }
  const door = box(.07, .12, .02, std(o.door || 0x7a4a2e)); door.position.set(0, .06, z + .008); g.add(door);
  if (!o.stone) for (const sx of [-1, 1]) { const q = box(.03, bodyH, .03, std(0xc9c2b0)); q.position.set(sx * (w / 2 - .004), bodyH / 2, z - .004); g.add(q); }
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
  return g;
}
// a granite church with a porch under a tiled roof and a tall bell tower with a lantern (after the church of the photo)
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
  return g;
}
function person(shirt, o) {
  o = o || {};
  const g = new THREE.Group(), skin = std(o.skin || 0xf0c9a0);
  const legs = box(.034, .05, .026, std(o.pants || 0x3a4a63)); legs.position.y = .025;
  const torso = box(.044, .06, .03, std(shirt)); torso.position.y = .08;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.021, 8, 6), skin); head.position.y = .124;
  g.add(legs, torso, head);
  if (o.hat) { const hat = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .008, 8), std(o.hat)); hat.position.y = .142; g.add(hat); const hc = new THREE.Mesh(new THREE.CylinderGeometry(.016, .02, .02, 8), std(o.hat)); hc.position.y = .152; g.add(hc); }
  return g;
}
function lying(shirt, o) {
  o = o || {};
  const g = new THREE.Group();
  const torso = box(.06, .026, .042, std(shirt)); torso.position.set(-.01, .018, 0);
  const legs = box(.06, .022, .034, std(o.pants || 0x3a4a63)); legs.position.set(.05, .016, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.02, 8, 6), std(o.skin || 0xf0c9a0)); head.position.set(-.058, .024, 0);
  g.add(torso, legs, head);
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

export function open(opts) {
  opts = opts || {};
  injectCss();
  const root = document.createElement('div');
  root.className = 'x-pl';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Ría de Muros e Noia');
  root.innerHTML = '<canvas class="x-pl-cv"></canvas><div class="x-pl-ts x-pl-ts-t"></div><div class="x-pl-ts x-pl-ts-b"></div>' +
    '<div class="x-pl-top"><div class="x-pl-t"><b>Ría de Muros e Noia</b><span>A Coruña</span></div><div class="x-pl-btns">' +
    '<button type="button" class="x-pl-dn" aria-label="Day / night"></button>' +
    '<button type="button" class="x-pl-x" aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<div class="x-pl-hint">Drag to turn · scroll to zoom · N for day / night</div>';
  document.body.appendChild(root);
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('x-in')));

  const cv = root.querySelector('.x-pl-cv');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) {
    root.querySelector('.x-pl-hint').textContent = 'Your browser cannot show the 3D map.';
    root.querySelector('.x-pl-x').addEventListener('click', () => { root.remove(); document.documentElement.style.overflow = prevOverflow; opts.onClose && opts.onClose(); });
    return { close() { root.remove(); document.documentElement.style.overflow = prevOverflow; } };
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 400);
  const world = new THREE.Group();
  scene.add(world);
  const W = (o) => { world.add(o); return o; };

  // lights stay with the camera, so the sun does not move when the planet turns (the shadows do)
  const hemi = new THREE.HemisphereLight(0xeaf6ff, 0xb5cf8a, 1.05); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.5); sun.position.set(16, 20, 24); scene.add(sun);
  sun.castShadow = true; sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;

  const terrain = buildTerrain(); W(terrain);
  const sea = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 30), new THREE.MeshStandardMaterial({ color: 0x4ab5c4, transparent: true, opacity: .78, flatShading: true, roughness: .25, metalness: .05 }));
  sea.scale.setScalar((R + SEA) / R); W(sea);
  const seaOrig = sea.geometry.attributes.position.array.slice();
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
  const SQ = [[-13.95, -11.65, 1.8, 3.55], [-8.9, -7.4, 2.1, 3.4], [1.1, 2.5, 2.1, 3.4], [8.9, 10.4, 2.1, 3.4]];
  const inSq = (x, inl) => SQ.some((q) => x > q[0] && x < q[1] && inl > q[2] && inl < q[3]);
  const JX = [-1.9, 7.0], LINKX = [-20.0, -1.9, 7.0];
  const roadClear = (x, inl) => LINKX.some((lx) => Math.abs(x - lx) < .65 && inl > .9 && inl < 7.9) || (x > -18 && x < 14.5 && inl > 6.5 && inl < 7.9) || JX.some((jx) => Math.abs(x - jx) < 1.05 && inl < 2.6 && inl > .5);
  let hk = 0; const thin = () => (hk++ % 5) > 1;
  const hh = (x, inl, floors, extra) => { if (thin() || inSq(x, inl) || roadClear(x, inl) || (cove(x, shore(x) - inl) > .04 && inl < 3.7)) return null; const o = mk(floors, extra); if (o.stone) { o.wall = GRANITE[hc % 3]; o.gal = false; o.roof = ROOF[hc % 3]; } const [px, pz] = onShore(x, inl); const hs = house(o); W(put(hs, px, pz, seaYaw(px) + o.turn, -.02)); return hs; };
  const hhS = (x, inl, floors, extra) => { if (thin() || (cove(x, shoreS(x) + inl) > .04 && inl < 3.7)) return null; const o = mk(floors, extra); if (o.stone) { o.wall = GRANITE[hc % 3]; o.gal = false; } const [px, pz] = onShoreS(x, inl); const hs = house(o); W(put(hs, px, pz, seaYawS(px) + o.turn, -.02)); return hs; };
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
    const [hx, hz] = onShore(-11.4, 4.5); const hr = horreo(); hr.scale.setScalar(1.15); W(put(hr, hx, hz, seaYaw(hx) + .35, -.02));
    spot('Church and hórreo', 'Old town', 'A granite church with its tall bell tower, and in front of it a hórreo on stone legs: the two pieces that make up the heart of a Galician old town.', ch, .55);
    spot('Muros arcades', 'Soportales', 'The arcades (soportales) of Muros: granite arches along the waterfront, shops at street level and white galleries above, all looking at the sea.', hubAt(-14.6, shore(-14.6) - 1.2, .4), .5);
    spot('Muros old town', 'Casco antiguo', 'Granite houses, narrow cobbled lanes and a stone cruceiro in the little square: the old town of Muros climbs up the slope behind the arcades.', hubAt(-13.1, shore(-13.1) - 2.6, .5), .5); }
  // the quay and the seafarers’ quarter of Muros
  for (let x = -17.2; x < -9.6; x += .4) { const q = new THREE.Group(); q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, shore(x) + .1, 0, .02, true)); }
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
  for (let s = 0; s < 8; s++) { const x = -8.9 + s * .38, z = shore(x) + .12; const q = new THREE.Group(); q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }
  for (let s = 1; s < 4; s++) { const x = -6.2, z = shore(-6.2) + .12 + s * .4; const q = new THREE.Group(); q.add(box(.5, .5, .46, std(0xb2ac9c))); const c = box(.54, .06, .5, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }
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
    const z = shoreZ - .6 + s * .5, p = new THREE.Group(); p.add(box(.4, .6, .6, std(0xb2ac9c))); const top = box(.46, .08, .6, std(0xd0cabb)); top.position.y = .34; p.add(top);
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
  const roadN = smooth(shore, -22.5, 21, -1.4), roadS = smooth(shoreS, -13.5, 9, 1.45);
  const walkMat = std(0xe6dcc4, { roughness: 1, side: THREE.DoubleSide }), asphalt = std(0x565b62, { roughness: 1, side: THREE.DoubleSide }), lineMat = std(0xf4f0e4, { roughness: 1, side: THREE.DoubleSide }), pathMat = std(0xeee5d0, { roughness: 1, side: THREE.DoubleSide });
  const sideOf = (pts, d) => pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1; return [q[0] - tz / l * d, q[1] + tx / l * d]; });
  const relax = (pts, passes) => { let q = pts; for (let k = 0; k < passes; k++) q = q.map((p, i) => (i === 0 || i === q.length - 1) ? p : [(q[i - 1][0] + 2 * p[0] + q[i + 1][0]) / 4, (q[i - 1][1] + 2 * p[1] + q[i + 1][1]) / 4]); return q; };
  const roadList = [];
  const buildRoad = (pts, up) => { roadList.push([pts, up || 0]); };
  const flushRoads = () => {
    for (const [pts, up] of roadList) W(ribbon(pts, .56, walkMat, .012 + up, false, undefined, true));
    for (const [pts, up] of roadList) W(ribbon(pts, .4, asphalt, .022 + up, false, undefined, true));
  };
  // two roundabouts on the coast road: the road goes round the inland half of each ring, a link road leaves from its top
  const RB = 0.52;
  for (const jx of JX) {
    let c = 0; for (let q = 0; q < roadN.length; q++) if (Math.abs(roadN[q][0] - jx) < Math.abs(roadN[c][0] - jx)) c = q;
    const z0 = roadN[c][1];
    for (let q = 0; q < roadN.length; q++) { const dx = roadN[q][0] - jx; if (Math.abs(dx) <= RB) roadN[q] = [roadN[q][0], z0 - Math.sqrt(Math.max(0, RB * RB - dx * dx))]; }
    roadN.rb = roadN.rb || []; roadN.rb.push([jx, z0]);
  }
  let roadN2 = relax(roadN, 3); roadN2.rb = roadN.rb; roadN.length = 0; roadN2.forEach((q) => roadN.push(q));
  for (const [jx, z0] of roadN.rb) {
    const ring = []; for (let k = 0; k <= 24; k++) { const a = k / 24 * PI * 2; ring.push([jx + Math.cos(a) * RB, z0 + Math.sin(a) * RB]); }
    buildRoad(ring, .004);
    const isl2 = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .05, 16), std(0x7fb35a)); const ig = new THREE.Group(); ig.add(isl2);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.015, .02, .16, 5), std(0x7a5a3c)); tr.position.y = .1; ig.add(tr); const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.1, 1), std(0x62ae4a)); cr.position.y = .22; ig.add(cr);
    W(put(ig, jx, z0, 0, .035));
  }
  buildRoad(roadN); buildRoad(roadS);
  // an inland route running behind the villages, joined to the coast road by three links
  const inl7 = relax(smooth(shore, -17.5, 14, -7.2), 6);
  buildRoad(inl7, .02);
  const linkRoads = [];
  for (const lx of LINKX) {
    let c = 0; for (let q = 0; q < roadN.length; q++) if (Math.abs(roadN[q][0] - lx) < Math.abs(roadN[c][0] - lx)) c = q;
    const rb = roadN.rb.some((r) => Math.abs(r[0] - lx) < .1), a = rb ? [lx, roadN.rb.find((r) => Math.abs(r[0] - lx) < .1)[1] - RB] : roadN[c];
    let e = 0; for (let q = 0; q < inl7.length; q++) if (Math.abs(inl7[q][0] - lx) < Math.abs(inl7[e][0] - lx)) e = q;
    const b = lx < -17.4 ? [lx, shore(lx) - 7.2] : inl7[e], n = 18, pts = [];
    for (let k = 0; k <= n; k++) { const t = k / n, w = Math.sin(t * PI) * .28; pts.push([a[0] + (b[0] - a[0]) * t + w, a[1] + (b[1] - a[1]) * t]); }
    const rp = relax(pts, 4); buildRoad(rp, .02); linkRoads.push(route(rp));
  }
  const inlRoute = route(inl7);
  for (const [a, b] of [[-17.2, -9.6], [-9.2, -2.8], [-.9, 3.6], [7.4, 13.2]]) W(ribbon(smooth(shore, a, b, -.3), .14, pathMat, .012));
  const posts = [];
  for (let i = 3; i < roadN.length - 3; i += 14) if (inletD(roadN[i][0], roadN[i][1]) > .6) posts.push([roadN[i][0], roadN[i][1] - .34]);
  for (const [x, z] of posts) { const lp = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .015, .34, 5), std(0x2b3036)); pole.position.y = .17; lp.add(pole); const lb = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), lampMat); lb.position.y = .36; lp.add(lb); W(put(lp, x, z, 0, 0)); }
  // mountain roads: winding up Monte Louro and the hill above Outes, with a little chapel at the top of each
  const winding = (a, b, amp, turns) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len, n = Math.round(len / .2), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, w = Math.sin(t * PI * 2 * turns) * amp * Math.pow(Math.sin(Math.min(1, t * 2.5) * PI / 2), 2) * (1 - t * .5); pts.push([a[0] + dx * t + nx * w, a[1] + dz * t + nz * w]); }
    return relax(pts, 14);
  };
  const nearOn = (road, x) => road.reduce((m, p) => Math.abs(p[0] - x) < Math.abs(m[0] - x) ? p : m);
  const mtRoads = [];
  for (const [sx, top, amp, turns] of [[-18.2, LOURO, .55, 1.5], [13.4, HILL2, .55, 1.5]]) {
    const pts = winding(nearOn(roadN, sx), top, amp, turns); mtRoads.push(route(pts));
    buildRoad(pts, .04);
    const ch = house({ w: .3, d: .28, floors: 1, wall: 0xf7f1e4, roof: ROOF[0], gal: false, chim: false, fr: 2, door: 0x2f6fa8 });
    const cr1 = box(.016, .12, .016, std(0xdddddd)); cr1.position.set(0, .3, 0); ch.add(cr1); const cr2 = box(.07, .016, .016, std(0xdddddd)); cr2.position.set(0, .33, 0); ch.add(cr2);
    W(put(ch, top[0], top[1], .8, -.02));
  }
  flushRoads();
  // the bridges carry the road itself: same line, same width, arches under it
  const roadBridge = (x, nA, span) => {
    let k = 1; for (let q = 1; q < roadN.length - 1; q++) if (Math.abs(roadN[q][0] - x) < Math.abs(roadN[k][0] - x)) k = q;
    const a = roadN[k - 1], b = roadN[k + 1], yaw = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
    const br = stoneBridge(span, nA, .7, std(0xa9a28f), std(0x9d978a), 0); br.scale.y = .5; br.position.y = 0;
    const g = new THREE.Group(); g.add(br); W(put(g, roadN[k][0], roadN[k][1], yaw, 0, true));
  };
  roadBridge(INLET[0][0], 3, .42); roadBridge(INLET2[0][0], 4, .46);
  const routes = [route(roadN), route(roadS), mtRoads[0], mtRoads[1], inlRoute];
  for (const lr of linkRoads) mtRoads.push(lr);
  mtRoads.push(inlRoute);
  const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false, side: THREE.DoubleSide });
  W(ribbon(smooth(shore, -22, 21, .07), .13, foamMat, .085, false, -1)); W(ribbon(smooth(shoreS, -23, 15, -.07), .13, foamMat, .085, false, -1));
  function car(color, bus) {
    const g = new THREE.Group(), L = bus ? .5 : .3;
    const bd = box(L, bus ? .12 : .07, bus ? .17 : .15, std(color)); bd.position.y = bus ? .09 : .07; g.add(bd);
    if (!bus) { const ca = box(.16, .07, .13, std(color)); ca.position.set(-.02, .13, 0); g.add(ca); const ws = box(.165, .045, .135, winMat); ws.position.set(-.02, .135, 0); g.add(ws); }
    else { const ws = box(L * .9, .04, .172, winMat); ws.position.set(0, .11, 0); g.add(ws); }
    for (const [wx, wz] of [[-L * .3, -.075], [L * .3, -.075], [-L * .3, .075], [L * .3, .075]]) { const wl = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .03, 10), std(0x1d1f23)); wl.rotation.x = PI / 2; wl.position.set(wx, .03, wz); g.add(wl); }
    return g;
  }
  const cars = [];
  // every lane carries its cars at one speed and evenly spaced, so a car never catches up with the one in front
  const addCars = (ri, dir, n, speed, colors, bus, ping) => {
    for (let k = 0; k < n; k++) {
      const m = car(colors[k % colors.length], bus && k === 0), w = new THREE.Group(); m.scale.setScalar(.66); w.add(m); W(w);
      cars.push({ w, r: routes[ri], u: (k + (dir > 0 ? .1 : .6)) / n, v: speed * dir, off: dir > 0 ? .095 : -.095, ping: !!ping });
    }
  };
  addCars(4, 1, 2, .45, [0x3b8f6a, 0xf2efe6]); addCars(4, -1, 2, .45, [0xe9b94a, 0x2f6fa8]);
  addCars(0, 1, 5, .5, [0xc23b2e, 0xf2efe6, 0x2f6fa8, 0xe9b94a, 0x3b8f6a]);
  addCars(0, -1, 4, .5, [0xd0744a, 0xf2efe6, 0x3a3f47, 0xc23b2e], true);
  addCars(1, 1, 2, .45, [0x2f6fa8, 0xe9b94a]);
  addCars(1, -1, 2, .45, [0xc23b2e, 0xf2efe6]);
  addCars(2, 1, 1, .3, [0xc23b2e], false, true);
  addCars(3, 1, 1, .3, [0x2f6fa8], false, true);

  // ---- the south coast across the ría: Louro, its dune beach and lagoon, the mountain, a second village and farms
  for (let x = -10.2; x < -6.2; x += .72) hhS(x, .62, 1 + (hc % 2)); for (let x = -9.8; x < -6.4; x += .78) hhS(x, 2.15, 2); hhS(-8.6, 3.2, 1);
  for (let x = 2.0; x < 5.8; x += .72) hhS(x, .62, 1 + (hc % 2)); for (let x = 2.4; x < 5.6; x += .8) hhS(x, 2.15, 2);
  for (const [fx, inl] of [[-2.4, 3.1]]) { hhS(fx, inl, 2); hhS(fx + .7, inl + .4, 1); const [hx, hz] = onShoreS(fx + .3, inl + 1.0); const hr = horreo(); W(put(hr, hx, hz, seaYawS(hx) + .2, -.02)); }
  for (let s = 0; s < 6; s++) { const x = 2.2 + s * .38, z = shoreS(x) - .12; const q = new THREE.Group(); q.add(box(.46, .5, .5, std(0xb2ac9c))); const c = box(.5, .06, .52, std(0xd0cabb)); c.position.y = .26; q.add(c); W(put(q, x, z, 0, .02, true)); }

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
    if (!free(x, z, r) || groundH(x, z) > -.03) return null;
    occupied.push([x, z]);
    const bc = BOATS[bi++ % BOATS.length], b = boat(bc[0], bc[1], kind); b.scale.setScalar(sc || 1);
    const w = new THREE.Group(); w.add(b);
    if (kind === 'fisher') {                          // a fisherman on the deck with his rod and line
      const p = person(SHIRTS[bi % SHIRTS.length], { hat: [0xf2c14a, 0xe9e2d2, 0x2f6fa8][bi % 3], skin: SKINS[bi % 4] }); p.position.set(.28, .13, .05); p.scale.setScalar(.9); b.add(p);
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
    sailers.push({ w, b, cx, cz, rx, rz, sp, a: ph, ph: rnd() * 6.28 });
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

  // ---- people on the beaches: sunbathers, parasols, swimmers and walkers along the water
  const swimmers = [], walkers = [], balls = [];
  function parasol(col) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .36, 5), std(0xeeeeee)); pole.position.y = .18; g.add(pole);
    const top = new THREE.Mesh(new THREE.ConeGeometry(.19, .1, 10), std(col)); top.position.y = .37; g.add(top);
    return g;
  }
  function beach(cx, fn, sg, nSun, nSwim, nWalk, title, type, text) {
    const wl = (x) => fn(x);
    for (let k = 0; k < nSun; k++) {
      const x = cx + (rnd() - .5) * 2.8, off = .3 + rnd() * .55, z = wl(x) + sg * off;
      if (groundH(x, z) < .02) continue;
      const tw = new THREE.Group(), tc = SHIRTS[(k * 3) % SHIRTS.length];
      tw.add(box(.17, .008, .085, std(tc === 0xf2efe6 ? 0xe277a0 : tc)));
      const ly = lying(SHIRTS[(k * 5 + 2) % SHIRTS.length], { skin: SKINS[k % 4] }); ly.position.y = .01; tw.add(ly);
      W(put(tw, x, z, rnd() * 6.28, .0));
      if (k % 3 === 0) { const pz = parasol([0xc9473a, 0x2f6fa8, 0xe9b94a, 0xf2efe6, 0xe277a0][k % 5]); W(put(pz, x + .14, z + .04, 0, .0)); }
    }
    for (let k = 0; k < 1; k++) { const x = cx + (rnd() - .5) * 2.4, z = wl(x) + sg * (.5 + rnd() * .35); if (groundH(x, z) < .02) continue; const p1 = person(SHIRTS[(k * 2 + 1) % SHIRTS.length], { skin: SKINS[k % 4] }); W(put(p1, x, z, rnd() * 6, 0)); const p2 = person(SHIRTS[(k * 2 + 4) % SHIRTS.length], { skin: SKINS[(k + 1) % 4] }); W(put(p2, x + .07, z + .03, rnd() * 6, 0)); }
    for (let k = 0; k < nSwim; k++) {
      const p = person(SHIRTS[(k * 3 + 1) % SHIRTS.length], { skin: SKINS[k % 4] }); W(p);
      swimmers.push({ p, x: cx + (rnd() - .5) * 2.2, off: .45 + rnd() * .55, fn, sg, ph: rnd() * 6.28, sp: .25 + rnd() * .2, rx: .25 + rnd() * .35 });
    }
    for (let k = 0; k < nWalk; k++) {
      const p = person(SHIRTS[(k * 2 + 5) % SHIRTS.length], { skin: SKINS[(k + 2) % 4] }); W(p);
      walkers.push({ p, cx, fn, sg, half: 1.0 + rnd() * .5, ph: rnd() * 6.28, sp: .13 + rnd() * .08, off: .1 + rnd() * .12 });
    }
    // boardwalk along the back of the sand, tufts of dune grass, a lifeguard tower, a kiosk with an awning and a volleyball net
    for (let k = 0; k < 0; k++) { const x = cx + (rnd() - .5) * 3.6, z = wl(x) + sg * (1.45 + rnd() * .3); if (groundH(x, z) < .05) continue; const tu = new THREE.Group(); for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.ConeGeometry(.018, .14, 4), std(0x8fb35a)); bl.position.set((b - 1) * .025, .07, (b % 2) * .02); bl.rotation.z = (b - 1) * .25; tu.add(bl); } W(put(tu, x, z, rnd() * 6, 0)); }
    { const vx = cx - .9, vz = wl(vx) + sg * .72, g = new THREE.Group();            // a volleyball game: net, four players and a ball going back and forth
      for (const sx of [-.2, .2]) { const po = box(.012, .16, .012, std(0x6b4a2a)); po.position.set(sx, .08, 0); g.add(po); }
      const net = box(.4, .06, .004, std(0xffffff, { transparent: true, opacity: .7 })); net.position.y = .13; g.add(net);
      W(put(g, vx, vz, 0, 0));
      for (const [px, pz, c] of [[-.2, .28, 0], [.2, .3, 3], [-.15, -.28, 5], [.22, -.3, 1]]) { const pp = person(SHIRTS[c], { skin: SKINS[c % 4] }); pp.scale.setScalar(.95); W(put(pp, vx + px, vz + pz * sg * -1, pz > 0 ? PI : 0, 0)); }
      const bl = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), std(0xf6f1e4)); W(bl); balls.push({ m: bl, x: vx, z: vz, ph: rnd() * 6, sg });
    }
    { const kx = cx + 1.1, kz = wl(kx) + sg * .95, g = new THREE.Group();
      const kb = box(.22, .12, .16, std(0xf7f1e4)); kb.position.y = .06; g.add(kb); const aw = box(.26, .02, .1, std(0xc9473a)); aw.position.set(0, .15, .13); aw.rotation.x = .25; g.add(aw);
      const aw2 = box(.065, .021, .1, std(0xf7f1e4)); aw2.position.set(-.06, .151, .13); aw2.rotation.x = .25; g.add(aw2); const aw3 = box(.065, .021, .1, std(0xf7f1e4)); aw3.position.set(.07, .151, .13); aw3.rotation.x = .25; g.add(aw3);
      W(put(g, kx, kz, 0, 0)); }
    spot(title, type, text, hubAt(cx, wl(cx) + sg * .5, .05), .5);
  }
  beach(-4.2, shore, -1, 11, 2, 1, 'Area Maior beach', 'Playa', 'A long white sand spit that closes the inlet of Esteiro, with pines behind it. People take the sun, swim and walk along the water.');
  beach(3.9, shore, -1, 9, 2, 1, 'O Freixo beach', 'Playa', 'The sand of O Freixo, just beside the harbour: a few steps from the houses to the water.');
  beach(15.6, shore, -1, 10, 2, 1, 'Paramean beach', 'Playa', '');
  beach(18.7, shore, -1, 9, 2, 1, 'Ancoradoiro beach', 'Playa', '');
  beach(-19.0, shore, -1, 10, 2, 1, 'Louro beach', 'Playa y laguna', 'The long dune beach of Louro, with a lagoon behind the sand, at the foot of the mountain.');
  beach(-8.8, shoreS, 1, 4, 1, 0, 'Cove across the ría', 'Playa', 'A small beach on the other shore of the ría, in front of the fishermen’s houses.');

  // ---- village squares: a paved plaza with a tree or two, benches, café terraces and people; Muros has the main square (with the cruceiro)
  const strollers = [];
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
    W(put(slab, px, pz, yaw, -.04));
    for (const [qx, qz] of [[-.5, -.4], [.5, -.4], [-.5, .4], [.5, .4]].slice(0, o.trees === undefined ? 2 : o.trees)) {
      const tr = new THREE.Group(), tk = new THREE.Mesh(new THREE.CylinderGeometry(.02, .028, .24, 6), std(0x7a5a3c)); tk.position.y = .12; tr.add(tk);
      const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.17, 1), std(0x62ae4a)); cr.position.y = .36; tr.add(cr);
      const a = yaw, tx = px + (qx * w * .8) * Math.cos(a) - (qz * d * .8) * Math.sin(a), tz = pz - (qx * w * .8) * Math.sin(a) + (qz * d * .8) * Math.cos(a);
      W(put(tr, tx, tz, 0, .03));
    }
    for (const sx of [-1, 1]) { const bn = new THREE.Group(); bn.add(box(.2, .035, .06, std(0x8a6a44))); const bk = box(.2, .06, .012, std(0x8a6a44)); bk.position.set(0, .05, -.03); bn.add(bk); const a = yaw, tx = px + sx * w * .3 * Math.cos(a) - d * .38 * Math.sin(a), tz = pz - sx * w * .3 * Math.sin(a) + d * .38 * Math.cos(a); W(put(bn, tx, tz, yaw, .045)); }
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

  // rocks on the tips of the capes (puntas)
  for (const cx of [-2.3, 14.1, 17.1, 20.3, -21.4]) for (let k = 0; k < 3; k++) {
    const x = cx + (rnd() - .5) * 1.4, z = shore(x) + (rnd() - .35) * .5, g = new THREE.Mesh(new THREE.IcosahedronGeometry(.07 + rnd() * .1, 2), std(0x9a968a, { flatShading: false }));
    g.scale.y = .7; W(put(g, x, z, rnd() * 6, .0, groundH(x, z) < -.02));
  }
  // ---- trees: round oaks, pines and eucalyptus, only where nobody lives or drives
  const forbid = (x, z) => {
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

  const oaks = [], pines = [], euc = [];
  const dd = new THREE.Vector3();
  for (let i = 0; i < 14000 && oaks.length + pines.length + euc.length < 330; i++) {
    dd.set(rnd() - .5, rnd() - .5, rnd() - .5).normalize();
    const [x, z] = planeOf(dd), r = islandR(x, z), h = groundH(x, z);
    const spit = x > -5.8 && x < -2.6 && z > shore(x) - 1.7 && z < shore(x) - .5;
    if (r > .985 || h < (spit ? .04 : .28) || (!spit && (forbid(x, z) || cove(x, z) > .45))) continue;
    const inl = z < shore(x) - 5.2;
    if (spit) { pines.push([x, z, .85 + rnd() * .4]); continue; }
    const q = rnd();
    if (h > 1.6) { if (q < .5) pines.push([x, z, .8 + rnd() * .7]); else oaks.push([x, z, .8 + rnd() * .5]); }
    else if (q < .6) oaks.push([x, z, .75 + rnd() * .6]); else if (q < .74) pines.push([x, z, .75 + rnd() * .6]); else if (inl || q > .9) euc.push([x, z, .8 + rnd() * .6]);
    else oaks.push([x, z, .6 + rnd() * .4]);
  }
  const trunkG = new THREE.CylinderGeometry(.028, .04, .26, 6), trunkM = std(0x7a5a3c);
  const oakG = new THREE.IcosahedronGeometry(.27, 2), pineG = new THREE.ConeGeometry(.2, .75, 8), pine2G = new THREE.ConeGeometry(.15, .5, 8);
  const eucG = new THREE.SphereGeometry(.16, 8, 6), eucT = new THREE.CylinderGeometry(.014, .026, .8, 5);
  const inst = (geo, mat, list, place) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), o = new THREE.Object3D(), hold = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((t, i) => { put(hold, t[0], t[1], rnd() * 6.28, -.02); o.position.copy(hold.position); o.quaternion.copy(hold.quaternion); o.scale.setScalar(t[2]); place(o, t); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, place.color ? place.color(c, t) : c.set(0xffffff)); });
    m.count = list.length; m.castShadow = true; m.receiveShadow = true; return m;
  };
  const green = (base, v) => (c) => c.set(base).offsetHSL((rnd() - .5) * .03, (rnd() - .5) * .08, (rnd() - .5) * v);
  const pl = (fn, colFn) => { fn.color = colFn; return fn; };
  W(inst(trunkG, trunkM, oaks, pl((o) => o.translateY(.13 * o.scale.x))));
  W(inst(oakG, std(0xffffff, { flatShading: false, roughness: .8 }), oaks, pl((o) => { o.translateY(.5 * o.scale.x); o.scale.y *= .9; }, green(0x62ae4a, .12))));
  W(inst(trunkG, trunkM, pines, pl((o) => o.translateY(.13 * o.scale.x))));
  W(inst(pineG, std(0xffffff, { roughness: .8 }), pines, pl((o) => o.translateY(.48 * o.scale.x), green(0x1f6b3a, .1))));
  W(inst(pine2G, std(0xffffff, { roughness: .8 }), pines, pl((o) => o.translateY(.84 * o.scale.x), green(0x24763f, .1))));
  W(inst(eucT, std(0xcfc7b0), euc, pl((o) => o.translateY(.4 * o.scale.x))));
  W(inst(eucG, std(0xffffff, { roughness: .8 }), euc, pl((o) => { o.translateY(.88 * o.scale.x); o.scale.y *= 1.5; }, green(0x7da45a, .1))));

  // Monte Louro
  spot('Monte Louro', 'Monte', 'Across the water, Monte Louro rises over the mouth of the ría, with pines on its slopes and the sea on three sides.', hubAt(LOURO[0], LOURO[1], 1.9), .6);

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

  // ---- day / night
  const DAY = { bg: C(0xcfe9f4), hemi: 1.05, sun: 2.5, sunC: C(0xfff2dc), sky: C(0xeaf6ff), sea: C(0x4ab5c4) };
  const NIGHT = { bg: C(0x0a1430), hemi: .5, sun: .6, sunC: C(0x8fb0ff), sky: C(0x6f8ad0), sea: C(0x1b3a63) };
  let night = opts.night ? 1 : 0, nightT = night;
  const dnBtn = root.querySelector('.x-pl-dn');
  const paintBtn = () => { dnBtn.innerHTML = nightT > .5 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; root.classList.toggle('x-night', nightT > .5); };
  const bgc = new THREE.Color();
  const light = (k) => {
    bgc.copy(DAY.bg).lerp(NIGHT.bg, k); scene.background = bgc;
    hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * k; hemi.color.copy(DAY.sky).lerp(NIGHT.sky, k);
    sun.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * k; sun.color.copy(DAY.sunC).lerp(NIGHT.sunC, k);
    sea.material.color.copy(DAY.sea).lerp(NIGHT.sea, k);
    winMat.emissiveIntensity = k * 1.5; lampMat.emissiveIntensity = .4 + k * 2.4; lamp.intensity = k * 2.2; starMat.opacity = k;
  };
  dnBtn.addEventListener('click', () => { night = night ? 0 : 1; });
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
    distT = Math.min(Math.max(distT, 18), baseDist * 1.7);
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
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) distT = Math.min(baseDist * 1.7, Math.max(18, distT * pinch / d)); pinch = d; }
  });
  const up = (e) => { ptrs.delete(e.pointerId); pinch = 0; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); distT = Math.min(baseDist * 1.7, Math.max(18, distT * Math.exp(e.deltaY * .0012))); lastInput = performance.now(); focus = null; }, { passive: false });
  cv.addEventListener('click', () => { if (moved < 6 && cur >= 0) hideCard(); });
  const onKey = (e) => {
    if (e.key === 'Escape') { if (cur >= 0) hideCard(); else close(); }
    else if (e.key === 'n' || e.key === 'N') night = night ? 0 : 1;
    else if (/^[wasd]$/i.test(e.key)) { const k = e.key.toLowerCase(); rot(k === 'a' ? 28 : k === 'd' ? -28 : 0, k === 'w' ? 28 : k === 's' ? -28 : 0); focus = null; }
    else return;
    e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true);
  addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ---- frame
  let raf = 0, last = performance.now(), t = 0, frame = 0, closed = false;
  const tv = new THREE.Vector3(), camDir = new THREE.Vector3(0, 0, 1), prj = new THREE.Vector3();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; frame++;
    nightT += (night - nightT) * (1 - Math.exp(-dt * 2.2)); if (Math.abs(night - nightT) < .002) nightT = night;
    light(nightT); if ((nightT > .5) !== root.classList.contains('x-night')) paintBtn();
    dist += (distT - dist) * (1 - Math.exp(-dt * 3.4));
    if (focus) { world.quaternion.slerp(focus.q, 1 - Math.exp(-dt * 3.2)); distT += (focus.dist - distT) * (1 - Math.exp(-dt * 3)); }
    else if (!ptrs.size) {
      if (vel.lengthSq() > .01) { rot(vel.x, vel.y); vel.multiplyScalar(Math.exp(-dt * 3.5)); }
      else if (!reduce && now - lastInput > 3000 && cur < 0) world.quaternion.premultiply(_q.setFromAxisAngle(Y, dt * .05));
    }
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
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
    foamMat.opacity = .42 + Math.sin(t * 1.4) * .16;
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
    for (const c of clouds) c.rotation.y += c.userData.sp * dt;
    for (const g of gulls) { g.rotateY(g.userData.sp * dt * .35); const f = Math.sin(t * 7 + g.userData.ph) * .5; g.userData.b.w1.rotation.z = f; g.userData.b.w2.rotation.z = -f; }
    for (const f of flyers) {
      f.a += f.sp * dt; const sg = Math.sign(f.sp), tx = -f.rx * Math.sin(f.a) * sg, tz = f.rz * Math.cos(f.a) * sg;
      put(f.b.wrap, f.cx + f.rx * Math.cos(f.a), f.cz + f.rz * Math.sin(f.a), Math.atan2(-tz, tx), f.lift + Math.sin(t * 1.3 + f.ph) * .12, true);
      const fl = Math.sin(t * 8 + f.ph) * .55; f.b.w1.rotation.z = fl; f.b.w2.rotation.z = -fl;
    }
    for (const c of cars) {
      c.u += c.v / c.r.total * dt;
      if (c.ping) { if (c.u > 1) { c.u = 1; c.v = -c.v; c.off = -c.off; } else if (c.u < 0) { c.u = 0; c.v = -c.v; c.off = -c.off; } }
      else if (c.u > 1) c.u -= 1; else if (c.u < 0) c.u += 1;
      const [x, z, yaw] = routeAt(c.r, c.u), sy = Math.sin(yaw), cy = Math.cos(yaw), px = x + sy * c.off, pz = z + cy * c.off, onW = 0;
      const hd = yaw + (c.v < 0 ? PI : 0), hx = Math.cos(hd), hz = -Math.sin(hd);
      put(c.w, px, pz, hd, .028 + Math.max(0, .07 - groundH(px, pz)) + (onW > 0 ? onW * Math.max(0, (Math.abs(px - INLET[0][0]) < 1.5 ? .2 : .28) - groundH(px, pz)) : 0));
      if (onW <= 0) c.w.quaternion.multiply(_q.setFromAxisAngle(Zax, Math.atan2(groundH(px + hx * .12, pz + hz * .12) - groundH(px - hx * .12, pz - hz * .12), .24)));
      c.w.scale.setScalar(Math.max(.001, Math.min(1, Math.min(c.u, 1 - c.u) * 14)));
    }
    for (const s of sailers) {
      s.a += s.sp * dt; const sg = Math.sign(s.sp), tx = -s.rx * Math.sin(s.a) * sg, tz = s.rz * Math.cos(s.a) * sg;
      put(s.w, s.cx + s.rx * Math.cos(s.a), s.cz + s.rz * Math.sin(s.a), Math.atan2(-tz, tx), 0, true);
      s.b.position.y = Math.sin(t * 1.5 + s.ph) * .02; s.b.rotation.z = Math.sin(t * 1.1 + s.ph) * .05 - .04; s.b.rotation.x = Math.sin(t * .9 + s.ph * 2) * .035;
    }
    for (const q of strollers) {
      if (q.still) { put(q.p, q.x + Math.cos(q.a) * q.rx * Math.cos(q.yaw), q.z - Math.cos(q.a) * q.rx * Math.sin(q.yaw), q.yaw + q.a, 0); continue; }
      q.a += q.sp * dt; const sg = Math.sign(q.sp), lx = Math.cos(q.a) * q.rx, lz = Math.sin(q.a) * q.rz, c = Math.cos(q.yaw), sn = Math.sin(q.yaw);
      put(q.p, q.x + lx * c - lz * sn, q.z - lx * sn + lz * c, q.yaw + Math.atan2(-Math.cos(q.a) * q.rz * sg, -Math.sin(q.a) * q.rx * sg), Math.abs(Math.sin(t * 6 + q.a * 3)) * .006);
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
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  function close() {
    if (closed) return; closed = true;
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
  const look = (x, z, zoom, snap) => { focus = { q: faceCamera(dirFrom(x, z, new THREE.Vector3()), .45), dist: baseDist * (zoom || .5) }; if (snap) { world.quaternion.copy(focus.q); dist = distT = focus.dist; focus = null; } };
  return { close, root, spots, show, look, scene, camera, world, dbg: { shore, shoreS, LOURO, HILL2, INLET, INLET2 } };
}

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = [
    '.x-pl{position:fixed;inset:0;z-index:90;background:#cfe9f4;opacity:0;transition:opacity .9s cubic-bezier(.4,0,.2,1);color:#12304a;font:500 13px/1.45 "Switzer","Switzer Placeholder",system-ui,sans-serif;overscroll-behavior:contain;-webkit-user-select:none;user-select:none}',
    '.x-pl.x-in{opacity:1}',
    '.x-pl.x-night{color:#cbe3ff;background:#0a1430}',
    '.x-pl-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}',
    '.x-pl-cv:active{cursor:grabbing}',
    '.x-pl-ts{position:absolute;left:0;right:0;pointer-events:none;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}',
    '.x-pl-ts-t{top:0;height:22%;-webkit-mask-image:linear-gradient(#000,rgba(0,0,0,0));mask-image:linear-gradient(#000,rgba(0,0,0,0))}',
    '.x-pl-ts-b{bottom:0;height:26%;-webkit-mask-image:linear-gradient(to top,#000,rgba(0,0,0,0));mask-image:linear-gradient(to top,#000,rgba(0,0,0,0))}',
    '.x-pl-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:max(16px,env(safe-area-inset-top)) 18px 0;pointer-events:none}',
    '.x-pl-t{display:flex;flex-direction:column;gap:2px}',
    '.x-pl-t b{font:600 19px/1.15 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:-.01em}',
    '.x-pl-t span{opacity:.7;font-size:12px}',
    '.x-pl-btns{display:flex;gap:10px;pointer-events:auto}',
    '.x-pl button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.x-pl-dn,.x-pl-x{width:44px;height:44px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.7);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 2px 10px rgba(20,50,80,.12);transition:background .5s ease,transform .5s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl.x-night .x-pl-dn,.x-pl.x-night .x-pl-x{background:rgba(20,34,66,.65)}',
    '.x-pl-dn:hover,.x-pl-x:hover{transform:scale(1.06)}',
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
    '.x-pl-hint{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));text-align:center;font:500 11px "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.12em;text-transform:uppercase;opacity:.6;pointer-events:none}',
    '.x-pl-card:not([hidden])~.x-pl-hint{display:none}',
    '@media(max-width:600px){.x-pl-card{left:12px;right:12px;width:auto}.x-pl-t b{font-size:16px}.x-pl-t span{font-size:11px}.x-pl-pin b,.x-pl-pin em{font-size:12.5px}}'
  ].join('\n');
  document.head.appendChild(s);
}
