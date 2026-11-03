// O Freixo (Outes, A Coruña) as a little 3D planet: the pier, the fishing boats, the seafarers' houses, the hórreos and the church of
// the village on a small island you can turn with a finger or the mouse. Opened from the Contact page (three clicks on the creature).
// open({ night, onClose }) shows it on top of the page and returns { close }.
import * as THREE from './three.module.min.js';

const R = 12;                              // radius of the planet
// two islands on the planet's top cap: the coast of O Freixo (the villages on its south shore, +z) and, across the water, Monte Louro
const ISL = [
  { cx: 0, cz: -4.5, a: 9.5, b: 5, hh: 2.6 },
  { cx: -2.4, cz: 8.8, a: 5, b: 2.1, hh: 3.6 }
];
const CX = ISL[0].cx, CZ = ISL[0].cz, A = ISL[0].a, B = ISL[0].b;

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n2 = (x, z) => Math.sin(x * .9 + 1.3) * Math.cos(z * .8 - .4) * .5 + Math.sin(x * 2.1 + z * 1.7) * .25 + Math.sin(x * .35 - z * .5 + 2) * .6;
function isl(i, x, z) {
  const s = ISL[i], rx = (x - s.cx) / s.a, rz = (z - s.cz) / s.b, a = Math.atan2(rz, rx);
  return Math.hypot(rx, rz) + .06 * Math.sin(a * 3 + 1 + i * 2) + .04 * Math.sin(a * 7 + i) + .03 * Math.sin(a * 13 + 2);
}
const islandR = (x, z) => Math.min(isl(0, x, z), isl(1, x, z));
const shoreMemo = {};
function shore(x) {                       // z of the south shore of the main island at x
  const k = Math.round(x * 20);
  if (shoreMemo[k] === undefined) { let z = ISL[0].cz; while (z < 14 && isl(0, k / 20, z) < 1) z += .04; shoreMemo[k] = z; }
  return shoreMemo[k];
}
const COVES = [[-2.6, shore(-2.6) - .2], [3.7, shore(3.7) - .2], [-5.9, 9.4]];   // wide sandy beaches: Esteiro's spit, O Freixo, Louro
const INLET = [[-3.95, shore(-3.95) + .5], [-3.95, shore(-3.95) - .9], [-3.8, shore(-3.95) - 2.0], [-3.95, shore(-3.95) - 3.0]];   // Esteiro's little inlet
const INLET2 = [[4.5, shore(4.5) + .5], [4.5, shore(4.5) - 1.0], [4.35, shore(4.5) - 2.4], [4.5, shore(4.5) - 3.8]];   // the river of Outes, under the old bridge
const INLETS = [INLET, INLET2];
function inletD(x, z) {
  let m = 9;
  for (const P of INLETS) for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], az = P[i][1], dx = P[i + 1][0] - ax, dz = P[i + 1][1] - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    m = Math.min(m, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return m;
}
function cove(x, z) { let g = 0; for (const c of COVES) g = Math.max(g, Math.exp(-((x - c[0]) ** 2 + (z - c[1]) ** 2) / (2 * 2.1 * 2.1))); return g; }
function groundH(x, z) {
  const i = isl(0, x, z) <= isl(1, x, z) ? 0 : 1, r = isl(i, x, z);
  if (r >= 1) return -.02 - .7 * sstep(1, 1.3, r);
  const k = 1 - r;
  let h = -.02 + .45 * Math.pow(k, .6) + ISL[i].hh * Math.pow(k, 1.25) * (.7 + .3 * n2(x + i * 7, z));
  const g = cove(x, z);
  if (g > 0) h = -.02 + (h + .02) * (1 - .78 * g);
  if (i === 0) { const c = 1 - sstep(.26, .5, inletD(x, z)); if (c > 0) h = h * (1 - c) - .16 * c; }
  return h;
}
const Y = new THREE.Vector3(0, 1, 0);
const _d = new THREE.Vector3(), _q = new THREE.Quaternion();
function dirAt(x, z) { return new THREE.Vector3(x / R, Math.sqrt(Math.max(1e-4, 1 - (x * x + z * z) / (R * R))), z / R); }
// puts an object on the planet at plane position (x, z): standing on the ground (or on the sea level), turned by yaw
function put(obj, x, z, yaw, lift, sea) {
  _d.set(x / R, Math.sqrt(Math.max(1e-4, 1 - (x * x + z * z) / (R * R))), z / R);
  const h = sea ? 0 : groundH(x, z);
  obj.position.copy(_d).multiplyScalar(R + h + (lift || 0));
  obj.quaternion.setFromUnitVectors(Y, _d);
  if (yaw) obj.quaternion.multiply(_q.setFromAxisAngle(Y, yaw));
  return obj;
}
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

const C = (h) => new THREE.Color(h);
const SAND = C(0xe2d4a4), SEABED_SHORE = C(0xd8c796), SEABED_DEEP = C(0x1b5170), FAR = C(0x174a66), GRASS_A = C(0x6ea14b), GRASS_B = C(0x57903f),
  HEATH = C(0x8a7a9a), ROCK = C(0x8b8776), ROCK_G = C(0x6e7a52);

function buildTerrain() {
  const g = new THREE.IcosahedronGeometry(R, 44);
  const pos = g.attributes.position, n = pos.count, col = new Float32Array(n * 3);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), m = new THREE.Vector3(), out = new THREE.Color();
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(pos, i).normalize(); b.fromBufferAttribute(pos, i + 1).normalize(); c.fromBufferAttribute(pos, i + 2).normalize();
    m.copy(a).add(b).add(c).normalize();
    if (m.y <= .05) out.copy(FAR);
    else {
      const x = m.x * R, z = m.z * R, r = islandR(x, z), h = groundH(x, z);
      if (r >= 1 || h < -.03) out.copy(SEABED_SHORE).lerp(SEABED_DEEP, sstep(0, .6, -h));
      else {
        const nz = n2(x * 1.7, z * 1.7) * .5 + .5;
        if (h < .14 || (cove(x, z) > .3 && h < .45)) out.copy(SAND);
        else {
          out.copy(GRASS_A).lerp(GRASS_B, nz);
          if (h > 1.1 && h < 2.1 && nz > .62) out.lerp(HEATH, .55);
          if (h > 2.1) out.copy(ROCK).lerp(ROCK_G, nz * .6);
        }
      }
    }
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = out.r; col[(i + k) * 3 + 1] = out.g; col[(i + k) * 3 + 2] = out.b; }
  }
  for (let i = 0; i < n; i++) {
    m.fromBufferAttribute(pos, i).normalize();
    const h = m.y <= .05 ? -.7 : groundH(m.x * R, m.z * R);
    pos.setXYZ(i, m.x * (R + h), m.y * (R + h), m.z * (R + h));
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
}

export function open(opts) {
  opts = opts || {};
  injectCss();
  const root = document.createElement('div');
  root.className = 'x-pl';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'O Freixo');
  root.innerHTML = '<canvas class="x-pl-cv"></canvas>' +
    '<div class="x-pl-top"><div class="x-pl-t"><b>O Freixo</b><span>Outes · A Coruña</span></div><div class="x-pl-btns">' +
    '<button type="button" class="x-pl-dn" aria-label="Day / night"></button>' +
    '<button type="button" class="x-pl-x" aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div></div>' +
    '<div class="x-pl-pins"></div>' +
    '<div class="x-pl-card" hidden><div class="x-pl-n"></div><h2></h2><p></p><div class="x-pl-nav"><button type="button" class="x-pl-prev">Previous</button><button type="button" class="x-pl-next">Next</button><button type="button" class="x-pl-cx" aria-label="Close">✕</button></div></div>' +
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
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 400);
  const world = new THREE.Group();
  scene.add(world);

  // lights stay with the camera, so the sun does not move when the planet turns
  const hemi = new THREE.HemisphereLight(0xdff1ff, 0x6a7a55, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.6); sun.position.set(14, 18, 22); scene.add(sun);

  world.add(buildTerrain());
  const sea = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 26), new THREE.MeshStandardMaterial({ color: 0x3d9bc4, transparent: true, opacity: .8, flatShading: true, roughness: .25, metalness: .05 }));
  world.add(sea);
  const seaOrig = sea.geometry.attributes.position.array.slice();

  const std = (color, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true, roughness: .9 }, extra || {}));
  const winMat = new THREE.MeshStandardMaterial({ color: 0xbcd7e3, emissive: 0xffc46b, emissiveIntensity: 0, flatShading: true, roughness: .4 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: .4, roughness: .3 });
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const spots = [];
  const spot = (title, text, obj, vill) => spots.push({ title, text, obj, vill });

  // ---- the coast: villages from west to east: Muros (arcades), Esteiro, O Freixo (harbour), Outes; the road runs behind the first row
  const slopeAt = (x) => (shore(x + .3) - shore(x - .3)) / .6;
  const seaYaw = (x) => Math.atan2(-slopeAt(x), 1);           // yaw that turns a front towards the sea
  const onShore = (x, inland) => [x, shore(x) - inland];
  const GRANITE = 0xa8a396;
  const WALLS = [0xf7f3ea, GRANITE, 0xe8c46a, 0xe7a58b, 0xf7f3ea, 0x8fb5cf, GRANITE, 0xb7d0a0, 0xf7f3ea, 0xb4503f, 0xe8c46a, GRANITE];
  const ARC = [0xf7f3ea, 0xe8c46a, 0x8fb5cf, 0xe7a58b, 0xb7d0a0, 0xf7f3ea];
  const ROOFS = [0x5d636b, 0x4a4f57, 0x5d636b, 0x9a5140, 0x4a4f57];
  const white = std(0xffffff), stoneM = std(0x9a9488), woodM = std(0x7a4a2e);
  const SHUT = [std(0x2f6fa8), std(0x3b8f6a), std(0xa23a30), std(0x3a5d7a)];
  const FRAMES = [white, white, std(0x2f6fa8), std(0x3b8f6a), white, std(0xa23a30)], granF = std(0xc9c4b8);
  const FLOW = [std(0xd9507a), std(0xe9b94a), std(0xc23b2e)];
  const gable = (len, span, rh, mat) => {            // a gabled roof, ridge along x
    const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(0, rh); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
    g.rotateY(Math.PI / 2); g.translate(-len / 2, 0, 0);
    return new THREE.Mesh(g, mat);
  };
  const windowAt = (g, x, y, z, shut, flow, fm) => {
    const fr = box(.085, .1, .02, fm || white); fr.position.set(x, y, z + .006); g.add(fr);
    const gl = box(.056, .075, .024, winMat); gl.position.set(x, y, z + .01); g.add(gl);
    if (shut) for (const sx of [-1, 1]) { const sw = box(.026, .1, .018, shut); sw.position.set(x + sx * .06, y, z + .006); g.add(sw); }
    if (flow) { const fb = box(.085, .03, .04, flow); fb.position.set(x, y - .065, z + .025); g.add(fb); }
  };
  function house(o) {
    const g = new THREE.Group(), fh = .2, bodyH = o.floors * fh, w = o.w, d = o.d;
    const base = box(w + .03, .06, d + .03, stoneM); base.position.y = .03; g.add(base);
    const body = box(w, bodyH, d, std(o.wall)); body.position.y = .06 + bodyH / 2; g.add(body);
    const rh = Math.min(.34, d * .42), roof = gable(w * 1.08, d * 1.14, rh, std(o.roof)); roof.position.y = .06 + bodyH; g.add(roof);
    if (o.chim !== false) { const ch = box(.06, .16, .06, stoneM); ch.position.set(w * (.22 + rnd() * .1), .06 + bodyH + rh * .62, -d * .1); g.add(ch); const cp = box(.075, .02, .075, std(0x4a4f57)); cp.position.set(ch.position.x, ch.position.y + .09, ch.position.z); g.add(cp); }
    const fm = o.stone ? granF : FRAMES[(o.fr || 0) % FRAMES.length];
    if (!o.stone) for (const sx of [-1, 1]) { const q = box(.035, bodyH, .035, stoneM); q.position.set(sx * (w / 2 + .004), .06 + bodyH / 2, d / 2 + .004); g.add(q); }   // granite corner stones
    const z = d / 2, n = Math.max(2, Math.round(w / .19)), shut = o.shut ? SHUT[o.shut % SHUT.length] : null, flow = o.flow ? FLOW[o.flow % FLOW.length] : null;
    for (let f = 0; f < o.floors; f++) {
      const y = .06 + fh * f + fh * .55;
      if (f === 1 && o.gal) {                          // a glazed gallery across the first floor
        const gl = box(w * .88, fh * .62, .03, winMat); gl.position.set(0, y, z + .012); g.add(gl);
        for (let i = 0; i <= 6; i++) { const bar = box(.016, fh * .66, .036, fm); bar.position.set(-w * .44 + i * w * .88 / 6, y, z + .016); g.add(bar); }
        const top = box(w * .92, .018, .04, fm); top.position.set(0, y + fh * .33, z + .016); g.add(top);
        const bot = box(w * .92, .018, .04, fm); bot.position.set(0, y - fh * .33, z + .016); g.add(bot);
        continue;
      }
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * (w / n);
        if (f === 0 && Math.abs(x) < w / n * .55 && n % 2 === 1) continue;     // the door's place
        windowAt(g, x, y, z, shut, f > 0 ? flow : null, fm);
      }
    }
    const dr = box(.075, .125, .03, o.stone || (o.fr || 0) % 3 === 0 ? woodM : SHUT[(o.fr || 0) % SHUT.length]), df = box(.1, .14, .024, fm); dr.position.set(0, .06 + .0625, z + .014); df.position.set(0, .06 + .07, z + .006); g.add(df, dr);
    const st = box(.14, .025, .06, stoneM); st.position.set(0, .0125, z + .04); g.add(st);
    return g;
  }
  // an arcaded front (soportales): shops under round arches, two storeys above with glazed galleries, one long roof
  function arcade(n, wu, d) {
    const g = new THREE.Group(), W = n * wu, gh = .2, fh = .2, r = wu / 4;
    const rec = box(W, gh, d - .16, std(0x75695e)); rec.position.set(0, gh / 2, -.08); g.add(rec);
    const slab = box(W + .02, .03, d, stoneM); slab.position.set(0, gh + .005, 0); g.add(slab);
    for (let k = 0; k <= n * 2; k++) {
      const x = -W / 2 + k * wu / 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(.024, .03, gh - r, 6), stoneM); col.position.set(x, (gh - r) / 2, d / 2 - .04); g.add(col);
      if (k < n * 2) { const ar = new THREE.Mesh(new THREE.TorusGeometry(r * .92, .02, 5, 8, Math.PI), stoneM); ar.position.set(x + wu / 4, gh - r, d / 2 - .04); g.add(ar); }
    }
    for (let i = 0; i < n; i++) {
      const cx = -W / 2 + wu * (i + .5), wall = std(ARC[(i * 2 + n) % ARC.length]);
      const up = box(wu - .008, fh * 2, d, wall); up.position.set(cx, gh + .02 + fh, 0); g.add(up);
      const dr = box(.07, .12, .02, std([0x2f6fa8, 0x7a4a2e, 0x3b8f6a][i % 3])); dr.position.set(cx, .06, d / 2 - .12); g.add(dr);
      const gl = box(wu * .78, fh * .62, .03, winMat); gl.position.set(cx, gh + .02 + fh * .55, d / 2 + .012); g.add(gl);
      for (let b = 0; b <= 4; b++) { const bar = box(.016, fh * .66, .036, white); bar.position.set(cx - wu * .39 + b * wu * .78 / 4, gh + .02 + fh * .55, d / 2 + .016); g.add(bar); }
      windowAt(g, cx - wu * .22, gh + .02 + fh * 1.5, d / 2, SHUT[i % SHUT.length], null); windowAt(g, cx + wu * .22, gh + .02 + fh * 1.5, d / 2, SHUT[i % SHUT.length], null);
    }
    const roof = gable(W * 1.02, d * 1.1, .3, std(0x9a5140)); roof.position.y = gh + .02 + fh * 2; g.add(roof);
    for (let i = 0; i < n; i += 2) { const ch = box(.06, .16, .06, stoneM); ch.position.set(-W / 2 + wu * (i + .5), gh + .02 + fh * 2 + .2, -d * .1); g.add(ch); }
    return g;
  }
  const hut = (x, inland, o) => { const [px, pz] = onShore(x, inland); const hs = house(o); world.add(put(hs, px, pz, seaYaw(px) + (o.turn || 0), -.02)); return hs; };
  let hc = 0;
  const hh = (x, inland, floors, extra) => { const r = hut(x, inland, Object.assign({ w: .42 + rnd() * .18, d: .38 + rnd() * .06, floors, wall: WALLS[hc % WALLS.length], stone: WALLS[hc % WALLS.length] === GRANITE, fr: hc, roof: ROOFS[(hc * 2 + 1) % ROOFS.length], gal: floors > 1 && hc % 2 === 0 && WALLS[hc % WALLS.length] !== GRANITE, shut: hc % 3 === 0 ? hc + 1 : 0, flow: hc % 4 === 1 ? hc : 0, turn: (rnd() - .5) * .16 }, extra || {})); hc++; return r; };
  const hub = (x, inland, lift) => { const o = new THREE.Object3D(); const [px, pz] = onShore(x, inland); world.add(put(o, px, pz, 0, lift)); return o; };

  // Muros: two arcaded blocks on the front (a little square between them), houses behind and the church above
  { const [ax, az] = onShore(-8.0, .7); world.add(put(arcade(4, .44, .42), ax, az, seaYaw(ax), -.02));
    const [bx, bz] = onShore(-6.15, .62); world.add(put(arcade(3, .44, .42), bx, bz, seaYaw(bx), -.02));
    for (const x of [-8.7, -7.9, -7.1, -6.4]) hh(x, 1.9, 2, { wall: GRANITE, stone: true, gal: false });
    for (const x of [-8.5, -7.7, -6.9, -6.2]) hh(x, 2.7, 2 + (hc % 2), { wall: GRANITE, stone: true, gal: false, roof: 0x4a4f57 });
    for (const x of [-8.3, -7.4, -6.6]) hh(x, 3.5, 2, { wall: [GRANITE, 0xf7f3ea, GRANITE][hc % 3], stone: true, gal: false });
    // narrow lanes of cobbles between the old houses, and a stone cruceiro in the little square between the arcades
    const lane = std(0xb5afa3);
    for (const lx of [-8.3, -7.5, -6.55]) for (let k = 0; k < 6; k++) { const [px, pz] = onShore(lx, 1.15 + k * .42); const lq = box(.2, .02, .46, lane); world.add(put(lq, px, pz, seaYaw(px), .0)); }
    { const [cx2, cz2] = onShore(-7.05, .5); const cr = new THREE.Group();
      for (let k = 0; k < 3; k++) { const st = box(.34 - k * .08, .05, .34 - k * .08, stoneM); st.position.y = .025 + k * .05; cr.add(st); }
      const sh = box(.045, .5, .045, std(0xb9b4a6)); sh.position.y = .42; cr.add(sh);
      const cb = box(.2, .045, .045, std(0xb9b4a6)); cb.position.y = .56; cr.add(cb);
      world.add(put(cr, cx2, cz2, 0, -.01)); } }
  // Muros' seafarers' quarter: sheds, stacked creels and nets by the quay
  for (const [x, inl] of [[-7.55, .35], [-6.55, .35], [-8.75, .45]]) { const [px, pz] = onShore(x, inl); const shed = house({ w: .34, d: .26, floors: 1, wall: 0xf7f3ea, roof: 0x5d636b, gal: false, shut: 1, fr: 2, chim: false }); world.add(put(shed, px, pz, seaYaw(px), -.02)); }
  for (const [x, inl] of [[-7.15, .25], [-6.1, .3], [-8.4, .3]]) { const [px, pz] = onShore(x, inl); const cs = new THREE.Group(); for (let k = 0; k < 6; k++) { const cr2 = box(.1, .07, .08, std(0x7a5a3a)); cr2.position.set((k % 3 - 1) * .11, .035 + Math.floor(k / 3) * .075, 0); cs.add(cr2); } world.add(put(cs, px, pz, seaYaw(px) + .3, -.01)); }
  for (const x of [-7.9, -5.3]) { const [px, pz] = onShore(x, .35); const nt = new THREE.Group(); for (const dx of [-.3, .3]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .34, 4), std(0x6b5a46)); pole.position.set(dx, .17, 0); nt.add(pole); } const net = box(.6, .2, .01, std(0x5f8f8a, { transparent: true, opacity: .6 })); net.position.y = .22; nt.add(net); world.add(put(nt, px, pz, seaYaw(px), -.01)); }
  // Esteiro: houses on both banks of its little inlet, the harbour building at the mole, the footbridge, the boats in the inlet
  hh(-5.4, 1.7, 2, {}); hh(-4.8, 1.7, 1, {}); hh(-5.2, 2.6, 2, {}); hh(-4.6, 2.6, 2, {}); hh(-4.2, 2.5, 1, {});
  for (const x of [-3.3, -2.7, -2.1, -1.5]) hh(x, 2.3 + rnd() * .15, 2, {});
  for (const x of [-3.0, -2.3, -1.6]) hh(x, 3.2, 1 + (hc % 2), {});
  { const [mx, mz] = onShore(-4.85, 1.0); const lonja = new THREE.Group();
    const b1 = box(.92, .26, .56, std(0xbab6ad)); b1.position.y = .13; lonja.add(b1);
    const b2 = box(.96, .03, .6, std(0x70747a)); b2.position.y = .275; lonja.add(b2);
    for (let k = 0; k < 6; k++) { const w2 = box(.09, .06, .02, winMat); w2.position.set(-.4 + k * .16, .17, .29); lonja.add(w2); }
    const dr2 = box(.2, .16, .02, std(0x7a8f9a)); dr2.position.set(0, .09, .29); lonja.add(dr2);
    world.add(put(lonja, mx, mz, seaYaw(mx), -.02));
    const [rx, rz] = onShore(-5.8, 1.15); const rh2 = house({ w: .5, d: .4, floors: 1, wall: 0xf0c9c0, roof: 0xd9743a, gal: false, shut: 2, flow: 1 }); world.add(put(rh2, rx, rz, seaYaw(rx), -.02)); }
  // O Freixo: the houses round the harbour
  for (const x of [-.55, 0, .45, 1.75, 2.3, 2.85]) hh(x, .6, 1 + (hc % 2), {});
  for (const x of [-.4, .3, 1.0, 1.7, 2.4, 3.0]) hh(x, 1.9, 2, {});
  // Outes: a bigger place further up the slope
  for (const x of [5.2, 5.8, 6.4, 7.0]) hh(x, .75 + rnd() * .2, 2, {});
  for (const x of [5.5, 6.2, 6.85]) hh(x, 1.9 + rnd() * .2, 2 + (hc % 2), {});
  for (const x of [5.6, 6.5]) hh(x, 3.0, 2, {});
  spot('Muros', 'Muros: the arcades (soportales) along the waterfront, the seafarers’ houses with glazed galleries in white, blue and green, and the old town climbing behind.', hub(-7.0, 1.4, .5), true);
  spot('Muros old town', 'The old town of Muros is made of granite: stone houses with small windows, narrow cobbled lanes between them, a stone cruceiro in the square, and the church above the roofs.', hub(-7.5, 2.6, .35));
  spot('Seafarers’ quarter', 'By the quay of Muros: the fishermen’s sheds, stacked creels and nets put out to dry, and the small boats that go out every morning.', hub(-7.0, .35, .35));
  spot('Esteiro', 'Esteiro opens onto its own little inlet: houses on both banks, a footbridge across the water, the big harbour building at the end of the mole, and a long white sand spit with pines on the other side.', hub(-4.0, 1.0, .5), true);
  spot('O Freixo', 'O Freixo, a harbour village of low houses round its pier, with the sea at the end of every street.', hub(1.2, 1.2, .45), true);
  spot('Outes', 'Outes, the municipality, spreads over the slope above the ría, between the hills and the water.', hub(6.6, 1.8, .5), true);

  // ---- churches (Muros, Outes) and hórreos (Galician granaries on stilts)
  function church(tall) {
    const g = new THREE.Group(), k = tall ? 1.15 : 1;
    const nave = box(.6 * k, .5, 1.1 * k, std(0xe6e0d2)); nave.position.y = .25; g.add(nave);
    const roof = gable(1.2 * k, .74 * k, .3, std(0x5d636b)); roof.position.y = .5; g.add(roof);
    const tw = box(.3, 1.25, .3, std(0xe6e0d2)); tw.position.set(0, .62, -.62 * k); g.add(tw);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(.24, .4, 4), std(0x5d636b)); sp.position.set(0, 1.45, -.62 * k); sp.rotation.y = Math.PI / 4; g.add(sp);
    const c1 = box(.025, .16, .025, std(0xdddddd)); c1.position.set(0, 1.74, -.62 * k); g.add(c1);
    const c2 = box(.1, .025, .025, std(0xdddddd)); c2.position.set(0, 1.76, -.62 * k); g.add(c2);
    const bell = box(.1, .14, .02, std(0x222a33)); bell.position.set(0, 1.12, -.62 * k + .152); g.add(bell);
    const door = box(.14, .22, .02, woodM); door.position.set(0, .11, .55 * k + .01); g.add(door);
    return g;
  }
  { const [x, z] = onShore(-7.1, 3.3); world.add(put(church(false), x, z, seaYaw(x), -.03));
    const [x2, z2] = onShore(6.0, 3.9); world.add(put(church(true), x2, z2, seaYaw(x2), -.03)); }
  const horreos = [];
  for (const [x, inland, yaw] of [[-1.0, 3.3, .3], [3.0, 3.4, -.4], [7.1, 3.6, .1], [-5.6, 3.4, .2]]) {
    const hg = new THREE.Group();
    const body2 = box(.3, .26, .9, std(0xb9a98d)); body2.position.y = .52; hg.add(body2);
    const hr = gable(1.0, .42, .17, std(0x7a6f60)); hr.rotation.y = Math.PI / 2; hr.position.y = .65; hg.add(hr);
    for (const [lx, lz] of [[-.1, -.34], [.1, -.34], [-.1, .34], [.1, .34]]) { const lg = box(.05, .4, .05, std(0x8c8579)); lg.position.set(lx, .2, lz); hg.add(lg); const cap = box(.12, .025, .12, std(0xa09a8d)); cap.position.set(lx, .39, lz); hg.add(cap); }
    const cr = box(.02, .1, .02, std(0xcccccc)); cr.position.set(0, .88, .5); hg.add(cr);
    const [px, pz] = onShore(x, inland); world.add(put(hg, px, pz, yaw, -.02)); horreos.push(hg);
  }
  spot('Hórreos', 'Granaries raised on stone legs, with ventilated walls, kept the harvest dry and out of the reach of mice. They are all over rural Galicia.', horreos[0]);

  // ---- the road along the coast, with street lamps and cars
  const road = [];
  for (let x = -8.7; x <= 8.4; x += .22) { let zz = 0; for (let k = -3; k <= 3; k++) zz += shore(x + k * .22) - 1.2; road.push([x, zz / 7]); }
  const roadMat = std(0x45494f), dashMat = std(0xe8e4d6), lampPost = std(0x2b3036);
  const roadG = new THREE.Group(); world.add(roadG);
  for (let i = 0; i < road.length - 1; i++) {
    const [x, z] = road[i], [x2, z2] = road[i + 1], len = Math.hypot(x2 - x, z2 - z) + .03, yaw = Math.atan2(-(z2 - z), x2 - x);
    if (inletD((x + x2) / 2, (z + z2) / 2) < .46) continue;
    const seg = box(len + .06, .035, .24, roadMat); roadG.add(put(seg, (x + x2) / 2, (z + z2) / 2, yaw, .0));
    if (i % 3 === 0) { const dsh = box(len * .55, .038, .02, dashMat); roadG.add(put(dsh, (x + x2) / 2, (z + z2) / 2, yaw, .0)); }
    if (i % 6 === 2) { const lp = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .015, .34, 5), lampPost); pole.position.y = .17; lp.add(pole); const lb = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), lampMat); lb.position.y = .36; lp.add(lb); roadG.add(put(lp, x, z - .17, 0, 0)); }
  }
  const roadLen = []; let rl = 0; roadLen.push(0);
  for (let i = 1; i < road.length; i++) { rl += Math.hypot(road[i][0] - road[i - 1][0], road[i][1] - road[i - 1][1]); roadLen.push(rl); }
  function car(color) {
    const g = new THREE.Group();
    const bd = box(.3, .07, .15, std(color)); bd.position.y = .07; g.add(bd);
    const ca = box(.16, .07, .13, std(color)); ca.position.set(-.02, .13, 0); g.add(ca);
    const ws = box(.165, .045, .135, winMat); ws.position.set(-.02, .135, 0); ws.scale.set(.96, 1, 1.02); g.add(ws);
    for (const [wx, wz] of [[-.09, -.075], [.09, -.075], [-.09, .075], [.09, .075]]) { const wl = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .03, 8), std(0x1d1f23)); wl.rotation.x = Math.PI / 2; wl.position.set(wx, .03, wz); g.add(wl); }
    const hl = box(.015, .025, .1, lampMat); hl.position.set(.15, .075, 0); g.add(hl);
    return g;
  }
  const cars = [];
  [0xc23b2e, 0xf2efe6, 0x2f6fa8, 0xe9b94a, 0x3b8f6a, 0x3a3f47].forEach((c, i) => {
    const m = car(c), w = new THREE.Group(); w.add(m); world.add(w);
    cars.push({ w, u: i / 6 + rnd() * .05, sp: (.012 + rnd() * .008) * (i % 2 ? -1 : 1), off: i % 2 ? -.065 : .065 });
  });
  const roadAt = (u) => {                               // position and direction on the road at fraction u
    const s = u * rl; let i = 1; while (i < road.length - 1 && roadLen[i] < s) i++;
    const f = (s - roadLen[i - 1]) / Math.max(1e-4, roadLen[i] - roadLen[i - 1]);
    const x = road[i - 1][0] + (road[i][0] - road[i - 1][0]) * f, z = road[i - 1][1] + (road[i][1] - road[i - 1][1]) * f;
    return [x, z, Math.atan2(-(road[i][1] - road[i - 1][1]), road[i][0] - road[i - 1][0])];
  };

  // ---- the pier (muelle): a stone mole built in short pieces so that it follows the curve of the planet
  const stone = std(0xa7a39a), cap = std(0xc9c4b8);
  const pier = new THREE.Group(); world.add(pier);
  const pierX = 1.0, shoreZ = shore(pierX), PIER_LEN = 4.4;
  for (let s = 0; s * .5 < PIER_LEN; s++) {
    const z = shoreZ - .6 + s * .5;
    const p = box(.4, .6, .6, stone); const top = box(.46, .08, .6, cap); top.position.y = .34; p.add(top);
    pier.add(put(p, pierX, z, 0, .02, true));
    if (s % 2 === 1) { const bol = new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, .12, 6), std(0x2b3036)); bol.position.y = .44; const pb = new THREE.Group(); pb.add(bol); pier.add(put(pb, pierX + .15, z, 0, .02, true)); }
  }
  const endZ = shoreZ - .6 + (Math.ceil(PIER_LEN / .5) - 1) * .5;
  const lh = new THREE.Group();
  const lbase = new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, .7, 8), std(0xf3f1ea)); lbase.position.y = .35; lh.add(lbase);
  const lband = new THREE.Mesh(new THREE.CylinderGeometry(.16, .17, .16, 8), std(0xc23b2e)); lband.position.y = .42; lh.add(lband);
  const lroom = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .14, 8), lampMat); lroom.position.y = .77; lh.add(lroom);
  const lroof = new THREE.Mesh(new THREE.ConeGeometry(.19, .2, 8), std(0x2b3036)); lroof.position.y = .94; lh.add(lroof);
  pier.add(put(lh, pierX, endZ, 0, .34, true));
  const lamp = new THREE.PointLight(0xffd36b, 0, 6, 1.6); lamp.position.set(0, .78, 0); lh.add(lamp);
  // a short breakwater curving round from the east
  for (let s = 0; s < 9; s++) {
    const t = s / 8, x = 2.4 + t * 3.0, z = shore(x) + .2 + Math.sin(t * 1.5) * 1.3;
    const p = box(.5, .5, .62, stone); p.rotation.y = .5 - t * .6; const g = new THREE.Group(); g.add(p);
    world.add(put(g, x, z, 0, .02, true));
  }
  // Esteiro: the mole, the footbridge and the boats in the inlet
  for (let s = 0; s < 7; s++) { const x = -5.5 + s * .38, z = shore(x) + .12; const p = box(.46, .5, .5, stone); const g = new THREE.Group(); g.add(p); world.add(put(g, x, z, 0, .02, true)); }
  for (let s = 1; s < 4; s++) { const x = -4.35, z = shore(-4.35) + .12 + s * .4; const p = box(.5, .5, .46, stone); const g = new THREE.Group(); g.add(p); world.add(put(g, x, z, 0, .02, true)); }
  { const bx = INLET[0][0], bz = shore(bx) - 1.25;
    const br = new THREE.Group(); const dk = box(1.15, .04, .26, std(0xc9c4b8)); dk.position.y = .1; br.add(dk);
    for (const sx of [-.55, .55]) { const pp = box(.08, .12, .26, stone); pp.position.set(sx, .06, 0); br.add(pp); }
    for (const sx of [-.5, -.25, 0, .25, .5]) for (const sz of [-1, 1]) { const rl = box(.015, .06, .015, std(0x5d636b)); rl.position.set(sx, .15, sz * .12); br.add(rl); }
    world.add(put(br, bx, bz, 0, .02, true)); }
  // the old stone bridge over the river of Outes (Ponte Nafonso): arches, a humped deck and parapets
  const bridgeObj = new THREE.Group();
  { const bx = INLET2[0][0], bz = (road.find(function (q) { return q[0] >= bx; }) || road[0])[1], span = .46, nA = 4, bw = .3;
    const br = new THREE.Group(), gran = std(0x9b968a), L = span * nA;
    for (let k = 0; k < nA; k++) {
      const sh = new THREE.Shape(); sh.moveTo(-span / 2, 0); sh.lineTo(span / 2, 0); sh.lineTo(span / 2, .24); sh.lineTo(-span / 2, .24); sh.closePath();
      const ra = span * .38, hole = new THREE.Path(); hole.moveTo(-ra, .012); hole.absarc(0, .012, ra, Math.PI, 0, true); hole.closePath(); sh.holes.push(hole);
      const g2 = new THREE.ExtrudeGeometry(sh, { depth: bw, bevelEnabled: false }); g2.translate(0, 0, -bw / 2);
      const m = new THREE.Mesh(g2, gran); m.position.x = (k - (nA - 1) / 2) * span; br.add(m);
    }
    for (let k = 0; k < 11; k++) {
      const u = k / 10 * 2 - 1, y = .24 + (1 - u * u) * .07, seg = L / 11 + .02;
      const dk = box(seg, .05, bw + .02, gran); dk.position.set(u * L / 2, y + .02, 0); br.add(dk);
      for (const sz of [-1, 1]) { const pr = box(seg, .07, .035, std(0xaba69a)); pr.position.set(u * L / 2, y + .075, sz * (bw / 2 - .005)); br.add(pr); }
    }
    bridgeObj.position.set(0, 0, 0); br.position.y = -.03; bridgeObj.add(br);
    world.add(put(bridgeObj, bx, bz, -Math.atan(slopeAt(bx)), .0, true));
    spot('Old bridge', 'The old stone bridge of Outes (Ponte Nafonso), with its arches over the river, where the road crosses on the way to Noia.', bridgeObj); }
  // Muros' quay
  for (let s = 0; s < 5; s++) { const x = -6.9 + s * .01, z = shore(-6.9) + .0 + s * .5; const p = box(.46, .5, .56, stone); const g = new THREE.Group(); g.add(p); world.add(put(g, x, z, 0, .02, true)); }
  spot('The pier', 'The mole of O Freixo reaches out into the ría. The boats tie up along it, and a small light at its end shows the way in at night.', lh);

  // ---- boats: moored, sailing and rocking
  function boat(color, trim, sail) {
    const g = new THREE.Group();
    const sh = new THREE.Shape();
    sh.moveTo(-.4, .13); sh.lineTo(-.34, -.05); sh.lineTo(.2, -.06); sh.lineTo(.5, .17); sh.lineTo(.1, .12); sh.closePath();
    const hg = new THREE.ExtrudeGeometry(sh, { depth: .27, bevelEnabled: false }); hg.translate(0, 0, -.135);
    g.add(new THREE.Mesh(hg, std(color)));
    const deck = box(.85, .02, .22, std(0xe9e2d2)); deck.position.set(.02, .125, 0); g.add(deck);
    if (sail) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, .85, 5), std(0x59514a)); mast.position.set(.08, .55, 0); g.add(mast);
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([.07, .16, 0, .07, .92, .0, -.36, .18, .0, .09, .22, 0, .09, .8, .02, .44, .2, .03]), 3)); sg.computeVertexNormals();
      g.add(new THREE.Mesh(sg, std(0xffffff, { side: THREE.DoubleSide, flatShading: true })));
      return g;
    }
    const cab = box(.22, .15, .18, std(trim)); cab.position.set(-.12, .21, 0); g.add(cab);
    const cw = box(.025, .06, .19, winMat); cw.position.set(-.012, .23, 0); g.add(cw);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.012, .014, .5, 5), std(0x59514a)); mast.position.set(.14, .38, 0); g.add(mast);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .34, 4), std(0x59514a)); boom.rotation.z = Math.PI / 2; boom.position.set(-.01, .48, 0); g.add(boom);
    return g;
  }
  const BOATS = [[0xf2efe6, 0x2f6fa8], [0x2f6fa8, 0xf2efe6], [0xc9473a, 0xf2efe6], [0xe9b94a, 0x2f6fa8], [0x3b8f6a, 0xf2efe6], [0xf2efe6, 0xc9473a]];
  const boats = [], sailers = [];
  const moor = (x, z, yaw, i, sc) => {
    const b = boat(BOATS[i % BOATS.length][0], BOATS[i % BOATS.length][1]); b.scale.setScalar((sc || 1) * 1.5);
    const w = new THREE.Group(); w.add(b); put(w, x, z, yaw, .0, true); world.add(w);
    boats.push({ w, b, ph: rnd() * 6.28, base: b.position.y });
    return w;
  };
  let bi = 0;
  const along = shoreZ + 1.0;
  const m1 = moor(pierX - .62, along + .2, Math.PI / 2 + .06, bi++);
  moor(pierX - .75, along + 1.6, Math.PI / 2 - .05, bi++, 1.1);
  moor(pierX + .62, along + .6, Math.PI / 2 - .08, bi++);
  moor(pierX + .76, along + 2.3, Math.PI / 2 + .04, bi++, .95);
  moor(pierX - .7, along + 3.2, Math.PI / 2, bi++);
  // beached or moored at Esteiro and Muros
  moor(-3.2, shore(-3.2) + .55, 1.3, bi++, .9); moor(-2.5, shore(-2.5) + .7, 1.8, bi++, .85);
  moor(-6.6, shore(-6.6) + .9, 1.6, bi++, .95); moor(-7.3, shore(-7.3) + 1.1, 2.0, bi++);
  for (let k = 0; k < 6; k++) moor(INLET[0][0] + (k % 2 ? .13 : -.13), shore(INLET[0][0]) - .3 - k * .38, Math.PI / 2 + (rnd() - .5) * .25, bi++, .75);
  // moving about: fishing boats going out and back, and a sailing boat across the bay
  const sail = (kind, cx, cz, rx, rz, sp, ph, color, sc) => {
    const b = kind === 'sail' ? boat(0xf2efe6, 0, true) : boat(color[0], color[1]); b.scale.setScalar(sc);
    const w = new THREE.Group(); w.add(b); world.add(w);
    sailers.push({ w, b, cx, cz, rx, rz, sp, a: ph, ph: rnd() * 6.28 });
  };
  sail('fish', 4.4, 3.5, 2.2, .75, .22, 0, BOATS[3], 1.5);
  sail('fish', -3.6, 2.9, 1.7, .6, -.26, 2, BOATS[4], 1.4);
  sail('fish', .3, 6.1, 3.4, .7, .17, 1, BOATS[2], 1.5);
  sail('sail', -1.2, 5.3, 5.8, .9, -.15, 3, null, 1.6);
  sail('sail', 3.2, 5.2, 3.4, .8, .2, 5, null, 1.3);
  spot('Fishing boats', 'Small fishing boats rest alongside the pier between trips, while others come and go along the ría. Each has its own colours, so the owner knows it from far away.', m1);

  // ---- bateas: the floating wooden rafts of the Galician rías, with their buoys
  const bateas = [];
  for (const [x, z, yaw] of [[-7.6, shoreZ + 2.3, .15], [-6.0, shoreZ + 3.5, .1], [6.8, shoreZ + 3.0, -.1]]) {
    const g = new THREE.Group();
    const deck = box(1.5, .06, .9, std(0x6b5a46)); deck.position.y = .02; g.add(deck);
    for (const [bx, bz] of [[-.7, -.4], [.7, -.4], [-.7, .4], [.7, .4], [0, -.43], [0, .43]]) { const bu = new THREE.Mesh(new THREE.IcosahedronGeometry(.07, 0), std(0xf2efe6)); bu.position.set(bx, .0, bz); g.add(bu); }
    const hut2 = box(.28, .18, .22, std(0xe9b94a)); hut2.position.set(-.45, .14, 0); g.add(hut2);
    const w = new THREE.Group(); w.add(g); put(w, x, z, yaw, 0, true); world.add(w);
    boats.push({ w, b: g, ph: rnd() * 6.28, base: 0, calm: true }); bateas.push(w);
  }
  spot('Bateas', 'Floating wooden rafts, called bateas, are typical of the Galician rías. Ropes hang from them under the water.', bateas[0]);

  // ---- trees and rocks (instanced), only on the slopes behind the villages
  const trees = [];
  for (let i = 0; i < 1500 && trees.length < 170; i++) {
    const x = CX + (rnd() * 2 - 1) * A, z = CZ + (rnd() * 2 - 1) * B, r = islandR(x, z);
    if (r > .9 || r < .06 || groundH(x, z) < .3) continue;
    if (z > shore(x) - 3.7) continue;                      // keep the villages and the road free
    trees.push([x, z, .7 + rnd() * .7, rnd() > .35]);
  }
  for (let i = 0, n = 0; i < 400 && n < 40; i++) {
    const x = ISL[1].cx + (rnd() * 2 - 1) * ISL[1].a, z = ISL[1].cz + (rnd() * 2 - 1) * ISL[1].b, r = isl(1, x, z);
    if (r > .8 || r < .25 || groundH(x, z) < .4 || groundH(x, z) > 2.3) continue;
    trees.push([x, z, .6 + rnd() * .5, rnd() > .5]); n++;
  }
  for (let x = -3.3; x < -1.5; x += .32) trees.push([x, shore(x) - .75 - rnd() * .7, .75 + rnd() * .4, true]);   // the pines of Esteiro's sand spit
  const cone = new THREE.InstancedMesh(new THREE.ConeGeometry(.2, .75, 6), std(0xffffff), trees.length);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.03, .04, .22, 5), std(0x5b4636), trees.length);
  const tm = new THREE.Object3D(), tc = new THREE.Color();
  trees.forEach((t, i) => {
    const holder = new THREE.Object3D(); put(holder, t[0], t[1], rnd() * 6.28, -.02);
    tm.position.copy(holder.position); tm.quaternion.copy(holder.quaternion); tm.scale.setScalar(t[2]);
    tm.translateY(.1 * t[2]); tm.updateMatrix(); trunk.setMatrixAt(i, tm.matrix);
    tm.position.copy(holder.position); tm.quaternion.copy(holder.quaternion); tm.scale.set(t[2], t[2], t[2]);
    tm.translateY(.55 * t[2]); tm.updateMatrix(); cone.setMatrixAt(i, tm.matrix);
    cone.setColorAt(i, tc.set(t[3] ? 0x2f6b3a : 0x4c8a3f).offsetHSL((rnd() - .5) * .03, 0, (rnd() - .5) * .08));
  });
  world.add(cone, trunk);

  // ---- little fields on the slopes, as round Esteiro and Outes
  [[-5.0, 4.4], [-3.4, 4.6], [-2.0, 4.8], [4.6, 4.6], [6.2, 5.0], [7.4, 4.4], [-7.6, 4.6], [0.6, 4.9], [2.2, 5.0]].forEach((f, i) => {
    const [px, pz] = onShore(f[0], f[1] + rnd() * .3);
    const fl = box(.7 + rnd() * .3, .03, .4 + rnd() * .2, std([0x9ec35a, 0xcbb85a, 0x7fb04d, 0xb5c768][i % 4])); world.add(put(fl, px, pz, (rnd() - .5) * .6 + seaYaw(px), 0));
  });

  // ---- the beaches: parasols and towels on the sand, and Monte Louro itself
  function parasol(col) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .34, 4), std(0xeeeeee)); pole.position.y = .17; g.add(pole);
    const top = new THREE.Mesh(new THREE.ConeGeometry(.17, .09, 8), std(col)); top.position.y = .36; g.add(top);
    const tw = box(.2, .008, .12, std(0xf2efe6)); tw.position.set(.14, .004, .05); tw.rotation.y = .4; g.add(tw);
    return g;
  }
  const beachSpot = (cx, title, text) => {
    const cz = shore(cx) - .25, hubo = new THREE.Object3D(); world.add(put(hubo, cx, cz, 0, .05));
    [[-.5, .2, 0xc9473a], [.1, -.15, 0x2f6fa8], [.6, .25, 0xe9b94a], [-.1, .55, 0xf2efe6], [.9, -.1, 0xd9507a]].forEach((q) => {
      const x = cx + q[0], z = cz + q[1];
      if (groundH(x, z) < .02) return;
      world.add(put(parasol(q[2]), x, z, rnd() * 6, -.01));
    });
    spot(title, text, hubo);
  };
  beachSpot(COVES[0][0], 'Esteiro beach', 'A long white sand spit that closes the inlet of Esteiro, with pines behind it and the calm water of the ría on the other side.');
  beachSpot(COVES[1][0], 'O Freixo beach', 'The sand of O Freixo, just beside the harbour: a few steps from the houses to the water.');
  const louro = new THREE.Object3D(); world.add(put(louro, ISL[1].cx + .3, ISL[1].cz - .2, 0, 0));
  spot('Monte Louro', 'Across the water, Monte Louro rises over the mouth of the ría. At its foot there is a long dune beach, with a lagoon behind the sand.', louro);

  // ---- sky: clouds and birds
  const clouds = [];
  for (let i = 0; i < 8; i++) {
    const pv = new THREE.Group(); pv.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    const cl = new THREE.Group();
    for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.5 + rnd() * .35, 1), std(0xffffff, { roughness: 1, transparent: true, opacity: .92 })); s.position.set(k * .55 - .8, rnd() * .25, rnd() * .3); s.scale.y = .7; cl.add(s); }
    cl.position.set(0, R + 3.6 + rnd() * 1.2, 0); pv.add(cl); pv.userData.sp = (.1 + rnd() * .12) * (rnd() > .5 ? 1 : -1); clouds.push(pv); world.add(pv);
  }
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, .3, .02, .07, 0, 0, .14]), 3)); wingG.computeVertexNormals();
  const birdMat = std(0xffffff, { side: THREE.DoubleSide });
  function bird() {
    const g = new THREE.Group();
    const w1 = new THREE.Mesh(wingG, birdMat), w2 = new THREE.Mesh(wingG, birdMat); w2.scale.x = -1; w1.position.z = w2.position.z = -.07;
    const bd = new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 0), birdMat); bd.scale.set(1, .8, 1.9);
    const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.04, 0), birdMat); hd.position.set(0, .01, .11);
    g.add(w1, w2, bd, hd); g.rotation.order = 'YXZ';
    const wrap = new THREE.Group(); wrap.add(g); g.rotation.y = Math.PI / 2;           // flies along +x
    return { wrap, w1, w2 };
  }
  const flyers = [];                                  // gulls round the harbour and along the coast
  for (let i = 0; i < 9; i++) {
    const b = bird(); world.add(b.wrap);
    flyers.push({ b, cx: -6 + rnd() * 12, cz: shoreZ - 1 + rnd() * 4, rx: 1.4 + rnd() * 2.6, rz: .8 + rnd() * 1.4, sp: (.28 + rnd() * .3) * (rnd() > .5 ? 1 : -1), a: rnd() * 6.28, lift: .7 + rnd() * .9, ph: rnd() * 6 });
  }
  const gulls = [];                                   // a few high ones going right round the planet
  for (let i = 0; i < 5; i++) {
    const pv = new THREE.Group(); pv.rotation.set(.3 + rnd() * 2, rnd() * 6, 0);
    const b = bird(); b.wrap.position.set(0, R + 2.2 + rnd() * .9, 0); pv.add(b.wrap);
    pv.userData = { sp: .35 + rnd() * .25, b, ph: rnd() * 6 }; gulls.push(pv); world.add(pv);
  }
  const starGeo = new THREE.BufferGeometry(), sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) { const v = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize().multiplyScalar(90 + rnd() * 20); sp.set([v.x, v.y, v.z], i * 3); }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false });
  scene.add(new THREE.Points(starGeo, starMat));
  const ORDER = ['Muros', 'Muros old town', 'Seafarers’ quarter', 'Esteiro', 'Esteiro beach', 'O Freixo', 'The pier', 'Fishing boats', 'Bateas', 'O Freixo beach', 'Outes', 'Old bridge', 'Hórreos', 'Monte Louro'];
  spots.sort((a, b) => ORDER.indexOf(a.title) - ORDER.indexOf(b.title));

  // ---- day / night
  const DAY = { bg: C(0xbfe3f5), hemi: 1.1, sun: 2.6, sunC: C(0xfff1d6), sky: C(0xdff1ff), sea: C(0x3d9bc4) };
  const NIGHT = { bg: C(0x0a1430), hemi: .45, sun: .55, sunC: C(0x8fb0ff), sky: C(0x6f8ad0), sea: C(0x1b3a63) };
  let night = opts.night ? 1 : 0, nightT = night;
  const dnBtn = root.querySelector('.x-pl-dn');
  const paintBtn = () => { dnBtn.innerHTML = nightT > .5 ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; root.classList.toggle('x-night', nightT > .5); };
  const bgc = new THREE.Color();
  const light = (k) => {
    bgc.copy(DAY.bg).lerp(NIGHT.bg, k); scene.background = bgc;
    hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * k; hemi.color.copy(DAY.sky).lerp(NIGHT.sky, k);
    sun.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * k; sun.color.copy(DAY.sunC).lerp(NIGHT.sunC, k);
    sea.material.color.copy(DAY.sea).lerp(NIGHT.sea, k);
    winMat.emissiveIntensity = k * 1.4; lampMat.emissiveIntensity = .4 + k * 2.2; lamp.intensity = k * 2.2; starMat.opacity = k;
  };
  dnBtn.addEventListener('click', () => { night = night ? 0 : 1; });
  light(nightT); paintBtn();

  // ---- the pins and the card
  const pinBox = root.querySelector('.x-pl-pins');
  spots.forEach((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'x-pl-pin' + (s.vill ? ' x-v' : ''); b.innerHTML = '<i></i><span>' + s.title + '</span>';
    b.addEventListener('click', (e) => { e.stopPropagation(); show(i); });
    pinBox.appendChild(b); s.pin = b;
  });
  // the turn that brings direction d (on the planet) in front of the camera, with north (towards -z) kept at the top of the screen
  const faceCamera = (d, tilt) => {
    const north = new THREE.Vector3(0, 0, -1); north.addScaledVector(d, -north.dot(d));
    if (north.lengthSq() < 1e-4) north.set(1, 0, 0);
    north.normalize();
    const right = new THREE.Vector3().crossVectors(north, d).normalize();
    const t = new THREE.Vector3(0, tilt, 1).normalize(), up = new THREE.Vector3(0, 1, 0); up.addScaledVector(t, -up.dot(t)).normalize();
    const rt = new THREE.Vector3().crossVectors(up, t).normalize();
    const src = new THREE.Matrix4().makeBasis(right, north, d), dst = new THREE.Matrix4().makeBasis(rt, up, t);
    return new THREE.Quaternion().setFromRotationMatrix(dst.multiply(src.transpose()));
  };
  const card = root.querySelector('.x-pl-card');
  let cur = -1, focus = null;
  const spotDir = (s) => { s.obj.updateWorldMatrix(true, false); const v = new THREE.Vector3(); s.obj.getWorldPosition(v); return v.applyQuaternion(world.quaternion.clone().invert()).normalize(); };
  function show(i) {
    cur = (i + spots.length) % spots.length;
    const s = spots[cur];
    card.hidden = false;
    card.querySelector('.x-pl-n').textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(spots.length).padStart(2, '0');
    card.querySelector('h2').textContent = s.title; card.querySelector('p').textContent = s.text;
    spots.forEach((o, k) => o.pin.classList.toggle('x-on', k === cur));
    const d = spotDir(s);
    const ZOOM = { 'Old bridge': .56, 'Seafarers’ quarter': .46, 'Muros old town': .48, 'Esteiro': .5, 'Esteiro beach': .52, 'Hórreos': .5, 'The pier': .55, 'Bateas': .55 };
    focus = { q: faceCamera(d, .06), dist: Math.min(dist, baseDist * (ZOOM[s.title] || .74)) };
    vel.set(0, 0);
  }
  function hideCard() { cur = -1; card.hidden = true; spots.forEach(o => o.pin.classList.remove('x-on')); focus = null; }
  card.querySelector('.x-pl-prev').addEventListener('click', () => show(cur - 1));
  card.querySelector('.x-pl-next').addEventListener('click', () => show(cur + 1));
  card.querySelector('.x-pl-cx').addEventListener('click', hideCard);

  // ---- camera, dragging, zoom
  let baseDist = 40, dist = 110, distT = 40;
  const size = () => {
    const w = root.clientWidth || innerWidth, h = root.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    baseDist = Math.max(33, Math.min(84, 37 / Math.min(1, camera.aspect * 1.05)));
    distT = Math.min(Math.max(distT, 20), baseDist * 1.7);
  };
  size();
  distT = baseDist; dist = baseDist * 2.6;
  const start = dirAt(-.6, .6);
  world.quaternion.copy(faceCamera(start, .16));
  const vel = new THREE.Vector2(), ptrs = new Map();
  let pinch = 0, lastInput = performance.now(), moved = 0;
  const rot = (dx, dy) => {
    const s = Math.PI / Math.max(300, root.clientHeight) * 1.15 * (dist / baseDist);
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
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) distT = Math.min(baseDist * 1.7, Math.max(20, distT * pinch / d)); pinch = d; }
  });
  const up = (e) => { ptrs.delete(e.pointerId); pinch = 0; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (e) => { e.preventDefault(); distT = Math.min(baseDist * 1.7, Math.max(20, distT * Math.exp(e.deltaY * .0012))); lastInput = performance.now(); focus = null; }, { passive: false });
  cv.addEventListener('click', () => { if (moved < 6 && cur >= 0) hideCard(); });
  const onKey = (e) => {
    if (e.key === 'Escape') { if (cur >= 0) hideCard(); else close(); }
    else if (e.key === 'n' || e.key === 'N') night = night ? 0 : 1;
    else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (/^[wasd]$/i.test(e.key)) { const k = e.key.toLowerCase(); rot(k === 'a' ? 28 : k === 'd' ? -28 : 0, k === 'w' ? 28 : k === 's' ? -28 : 0); focus = null; }
    else return;
    e.preventDefault(); e.stopPropagation();
  };
  addEventListener('keydown', onKey, true);
  addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ---- frame
  let raf = 0, last = performance.now(), t = 0, frame = 0, closed = false;
  const tv = new THREE.Vector3(), camDir = new THREE.Vector3();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; frame++;
    nightT += (night - nightT) * Math.min(1, dt * 2.2); if (Math.abs(night - nightT) < .002) nightT = night;
    light(nightT); if ((nightT > .5) !== root.classList.contains('x-night')) paintBtn();
    dist += (distT - dist) * Math.min(1, dt * 3);
    if (focus) { world.quaternion.slerp(focus.q, Math.min(1, dt * 3.2)); distT += (focus.dist - distT) * Math.min(1, dt * 3); }
    else if (!ptrs.size) {
      if (vel.lengthSq() > .01) { rot(vel.x, vel.y); vel.multiplyScalar(Math.pow(.02, dt)); }
      else if (!reduce && now - lastInput > 2500 && cur < 0) world.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(Y, dt * .06));
    }
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
    if (frame % 2 === 0) {
      const p = sea.geometry.attributes.position, a = p.array;
      for (let i = 0; i < a.length; i += 3) { const k = 1 + (Math.sin(t * 1.3 + seaOrig[i] * .9 + seaOrig[i + 2] * .4) + Math.sin(t * 1.7 + seaOrig[i + 2] * 1.1 - seaOrig[i + 1] * .5)) * .0035; a[i] = seaOrig[i] * k; a[i + 1] = seaOrig[i + 1] * k; a[i + 2] = seaOrig[i + 2] * k; }
      p.needsUpdate = true;
    }
    for (const b of boats) {
      const k = b.calm ? .4 : 1;
      b.b.position.y = b.base + Math.sin(t * 1.4 + b.ph) * .018 * k;
      b.b.rotation.z = Math.sin(t * 1.1 + b.ph) * .045 * k; b.b.rotation.x = Math.sin(t * .9 + b.ph * 2) * .03 * k;
    }
    for (const c of clouds) c.rotation.y += c.userData.sp * dt;
    for (const g of gulls) { g.rotateY(g.userData.sp * dt * .35); const f = Math.sin(t * 7 + g.userData.ph) * .5; g.userData.b.w1.rotation.z = f; g.userData.b.w2.rotation.z = -f; }
    for (const f of flyers) {
      f.a += f.sp * dt; const tx = -f.rx * Math.sin(f.a) * Math.sign(f.sp), tz = f.rz * Math.cos(f.a) * Math.sign(f.sp);
      put(f.b.wrap, f.cx + f.rx * Math.cos(f.a), f.cz + f.rz * Math.sin(f.a), Math.atan2(-tz, tx), f.lift + Math.sin(t * 1.3 + f.ph) * .12, true);
      const fl = Math.sin(t * 8 + f.ph) * .55; f.b.w1.rotation.z = fl; f.b.w2.rotation.z = -fl;
    }
    for (const c of cars) {
      c.u += c.sp * dt; if (c.u > 1) c.u -= 1; else if (c.u < 0) c.u += 1;
      const [x, z, yaw] = roadAt(c.u), dir = c.sp < 0 ? Math.PI : 0, cy = Math.cos(yaw), sy = Math.sin(yaw);
      const px = x + sy * c.off * (c.sp < 0 ? -1 : 1), pz = z + cy * c.off * (c.sp < 0 ? -1 : 1), onW = 1 - sstep(.28, .55, inletD(px, pz));
      put(c.w, px, pz, yaw + dir, .035 + (onW > 0 ? onW * Math.max(0, (px < 0 ? .14 : .3) - groundH(px, pz)) : 0));
      const e = Math.min(1, Math.min(c.u, 1 - c.u) * 14); c.w.scale.setScalar(Math.max(.001, e));
    }
    for (const s of sailers) {
      s.a += s.sp * dt; const sg = Math.sign(s.sp), tx = -s.rx * Math.sin(s.a) * sg, tz = s.rz * Math.cos(s.a) * sg;
      put(s.w, s.cx + s.rx * Math.cos(s.a), s.cz + s.rz * Math.sin(s.a), Math.atan2(-tz, tx), 0, true);
      s.b.position.y = Math.sin(t * 1.5 + s.ph) * .02; s.b.rotation.z = Math.sin(t * 1.1 + s.ph) * .06 - .05; s.b.rotation.x = Math.sin(t * .9 + s.ph * 2) * .04;
    }
    // pins follow their spots and hide on the far side
    camDir.set(0, 0, 1);
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i]; s.obj.getWorldPosition(tv);
      const facing = tv.clone().normalize().dot(camDir);
      const pr = tv.clone().project(camera);
      s.pin.style.transform = 'translate(' + ((pr.x * .5 + .5) * root.clientWidth).toFixed(1) + 'px,' + ((-pr.y * .5 + .5) * root.clientHeight).toFixed(1) + 'px)';
      s.pin.style.opacity = facing > .25 ? '1' : '0'; s.pin.style.pointerEvents = facing > .25 ? 'auto' : 'none';
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
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      root.remove();
      document.documentElement.style.overflow = prevOverflow;
    }, 600);
    opts.onClose && opts.onClose();
  }
  root.querySelector('.x-pl-x').addEventListener('click', close);
  return { close, root, spots, show, scene, camera, world };
}

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = [
    '.x-pl{position:fixed;inset:0;z-index:90;background:#bfe3f5;opacity:0;transition:opacity .9s cubic-bezier(.4,0,.2,1);color:#12304a;font:500 13px/1.45 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;letter-spacing:.02em;overscroll-behavior:contain;-webkit-user-select:none;user-select:none}',
    '.x-pl.x-in{opacity:1}',
    '.x-pl.x-night{color:#cbe3ff;background:#0a1430}',
    '.x-pl-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}',
    '.x-pl-cv:active{cursor:grabbing}',
    '.x-pl-top{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:max(16px,env(safe-area-inset-top)) 18px 0;pointer-events:none}',
    '.x-pl-t{display:flex;flex-direction:column;gap:2px;text-transform:uppercase}',
    '.x-pl-t b{font-weight:500;font-size:18px;letter-spacing:.06em}',
    '.x-pl-t span{opacity:.7;font-size:11px;letter-spacing:.12em}',
    '.x-pl-btns{display:flex;gap:10px;pointer-events:auto}',
    '.x-pl button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.x-pl-dn,.x-pl-x{width:44px;height:44px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background .5s ease,transform .5s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl.x-night .x-pl-dn,.x-pl.x-night .x-pl-x{background:rgba(20,34,66,.6)}',
    '.x-pl-dn:hover,.x-pl-x:hover{transform:scale(1.06)}',
    '.x-pl-pins{position:absolute;inset:0;pointer-events:none;overflow:hidden}',
    '.x-pl-pin{position:absolute;left:0;top:0;margin:0;padding:0;border:0;background:none;display:flex;align-items:center;gap:8px;transition:opacity .4s ease;will-change:transform;white-space:nowrap}',
    '.x-pl-pin i{position:relative;flex:none;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px rgba(18,48,74,.55),0 2px 8px rgba(0,0,0,.25)}',
    '.x-pl-pin i::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:1.5px solid rgba(255,255,255,.9);animation:x-pl-ping 2.4s ease-out infinite}',
    '.x-pl-pin span{margin-top:-7px;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:0;transform:translateX(-4px);transition:opacity .4s ease,transform .5s cubic-bezier(.22,.8,.24,1);color:#12304a}',
    '.x-pl-pin:hover span,.x-pl-pin.x-on span,.x-pl-pin.x-v span{opacity:1;transform:none}',
    '.x-pl-pin.x-v i{width:10px;height:10px;margin:-5px 0 0 -5px}',
    '.x-pl-pin.x-on i{background:#ffd36b}',
    '@keyframes x-pl-ping{from{transform:scale(.6);opacity:.9}to{transform:scale(1.8);opacity:0}}',
    '.x-pl-card{position:absolute;left:18px;bottom:max(18px,env(safe-area-inset-bottom));width:min(360px,calc(100% - 36px));padding:16px 18px 14px;border-radius:18px;background:rgba(255,255,255,.78);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#12304a;animation:x-pl-up .6s cubic-bezier(.22,.8,.24,1)}',
    '.x-pl.x-night .x-pl-card{background:rgba(16,28,56,.78);color:#cbe3ff}',
    '.x-pl-card[hidden]{display:none}',
    '@keyframes x-pl-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '.x-pl-n{font-size:11px;letter-spacing:.14em;opacity:.65}',
    '.x-pl-card h2{margin:4px 0 6px;font:500 18px/1.2 "IBM Plex Mono","IBM Plex Mono Placeholder",monospace;text-transform:uppercase;letter-spacing:.04em}',
    '.x-pl-card p{margin:0 0 12px;font:400 13.5px/1.5 "Switzer","Switzer Placeholder",system-ui,sans-serif;letter-spacing:0}',
    '.x-pl-nav{display:flex;gap:8px;align-items:center}',
    '.x-pl-nav button{border:0;border-radius:999px;padding:8px 14px;background:rgba(18,48,74,.1);font-size:11px;letter-spacing:.08em;text-transform:uppercase;transition:background .4s ease}',
    '.x-pl.x-night .x-pl-nav button{background:rgba(203,227,255,.14)}',
    '.x-pl-nav button:hover{background:rgba(18,48,74,.2)}',
    '.x-pl-nav .x-pl-cx{margin-left:auto;width:34px;height:34px;padding:0;display:grid;place-items:center;font-size:13px}',
    '.x-pl-hint{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));text-align:center;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;opacity:.6;pointer-events:none}',
    '.x-pl-card:not([hidden])~.x-pl-hint{display:none}',
    '@media(max-width:600px){.x-pl-card{left:12px;right:12px;width:auto}.x-pl-t b{font-size:16px}}'
  ].join('\n');
  document.head.appendChild(s);
}
