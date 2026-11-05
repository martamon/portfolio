// Casa Martamon, by inside: a traditional Galician house made cosy. A stone hearth (lareira) with its big old hood (campana) and an iron pot, a wooden
// table with filloas, a dining corner with a grandmother knitting in a rocking chair, and two kittens: a fluffy white one and a small brown one.
// Built as a dolls-house cut-away that you can turn with the mouse or a finger.
export function buildCasa(THREE, D) {
  const { std, PI } = D; const rbox = (w, h, d, r) => D.rbox(w, h, d, Math.min(Math.max(r || 0, .2), Math.min(w, h, d) * .48));   // every corner softened
  const RB = (w, h, d) => rbox(w, h, d, .3), CY = (a, b, h, n, ...r) => new THREE.CylinderGeometry(a, b, h, Math.max(n || 8, 18), ...r);   // everything soft and round
  let sd = 21; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xd9b48e);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 80);
  const add = (parent, geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, typeof col === 'number' ? std(col, extra) : col); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const tex = (draw, w, h, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
  // ---- the room: wood floor, granite and lime-washed walls, rafters
  const W = 14, Dp = 9, HH = 3.7;
  const floorT = tex((g, w, h) => { g.fillStyle = '#e9cfa2'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const v = (i + j) % 2 ? 0 : 1; g.fillStyle = v ? 'rgba(200,150,90,.28)' : 'rgba(255,240,210,.22)'; g.fillRect(i * w / 8 + 2, j * h / 8 + 2, w / 8 - 4, h / 8 - 4); } g.strokeStyle = 'rgba(120,80,40,.3)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, 256, 256, [3, 2]);
  const floor = add(scene, RB(W, .3, Dp), new THREE.MeshStandardMaterial({ map: floorT, roughness: .85 }), 0, -.15, 0); floor.castShadow = false;
  const stoneT = tex((g, w, h) => { g.fillStyle = '#e2a98f'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(255,225,170,.9)'; g.fillRect(x, 0, 7, h); g.fillStyle = 'rgba(120,70,40,.18)'; g.fillRect(x + 7, 0, 3, h); } }, 256, 256, [4, 1]);
  const plaster = std(0xdc9a78), stoneM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 1 }), wood = std(0xa8743f), darkWood = std(0x7d4c28);
  const wallBack = new THREE.Group(), wallLeft = new THREE.Group(), wallRight = new THREE.Group(); scene.add(wallBack, wallLeft, wallRight);
  add(wallBack, RB(W, 1.3, .4), stoneM, 0, .65, -Dp / 2 - .2); add(wallBack, RB(W, HH - 1.3, .4), plaster, 0, 1.3 + (HH - 1.3) / 2, -Dp / 2 - .2);
  add(wallLeft, RB(.4, 1.3, Dp), stoneM, -W / 2 - .2, .65, 0); add(wallLeft, RB(.4, HH - 1.3, Dp), plaster, -W / 2 - .2, 1.3 + (HH - 1.3) / 2, 0);
  add(wallRight, RB(.4, 1.3, Dp), stoneM, W / 2 + .2, .65, 0); add(wallRight, RB(.4, HH - 1.3, Dp), plaster, W / 2 + .2, 1.3 + (HH - 1.3) / 2, 0);
  for (let i = -3; i <= 3; i += 3) add(scene, RB(.28, .32, Dp + .3), darkWood, i * 2.2, HH - .16, 0);                    // the rafters
  add(scene, RB(W, .28, .28), darkWood, 0, HH - .5, -Dp / 2 + .2);
  // ---- windows with white frames, small panes, lace curtains, shutters and flowers on the sill
  const flo = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d'); g2.fillStyle = '#f3f1e8'; g2.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { g2.fillStyle = ['#9fd0d6', '#f2b6a8', '#b9d8a4', '#f2d27a'][i % 4]; g2.beginPath(); g2.arc(rnd() * 128, rnd() * 128, 3 + rnd() * 3, 0, 6.3); g2.fill(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: 1 }); })();

  // ---- old Galician textiles: linen with red cross-stitch and a sun (sol) border, red-and-white check (cuadros), woven stripe blankets (mantas) and rag-rug rings
  const textile = (draw, rx, ry) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g2 = c.getContext('2d'); draw(g2, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ map: t, roughness: 1 }); };
  const linen = (g2, N) => { g2.fillStyle = '#f4ead4'; g2.fillRect(0, 0, N, N); g2.strokeStyle = 'rgba(180,150,110,.25)'; g2.lineWidth = 1; for (let i = 0; i < N; i += 4) { g2.beginPath(); g2.moveTo(i, 0); g2.lineTo(i, N); g2.moveTo(0, i); g2.lineTo(N, i); g2.stroke(); } };
  const cross = (g2, x, y, sz, col) => { g2.strokeStyle = col; g2.lineWidth = sz * .22; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x - sz / 2, y - sz / 2); g2.lineTo(x + sz / 2, y + sz / 2); g2.moveTo(x + sz / 2, y - sz / 2); g2.lineTo(x - sz / 2, y + sz / 2); g2.stroke(); };
  const sol = (g2, x, y, r, col) => { g2.strokeStyle = col; g2.fillStyle = col; g2.lineWidth = 3; g2.beginPath(); g2.arc(x, y, r * .45, 0, 6.3); g2.stroke(); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g2.beginPath(); g2.moveTo(x + Math.cos(a) * r * .6, y + Math.sin(a) * r * .6); g2.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g2.stroke(); } g2.beginPath(); g2.arc(x, y, r * .15, 0, 6.3); g2.fill(); };
  const curtainM = textile((g2, N) => { linen(g2, N); for (let k = 0; k < 4; k++) { cross(g2, 32 + k * 64, 22, 14, '#c0453a'); cross(g2, 32 + k * 64, 234, 14, '#c0453a'); } sol(g2, 128, 128, 52, '#c0453a'); for (let k = 0; k < 8; k++) cross(g2, 14 + k * 32, 70, 8, '#3f6f98'); }, 1, 1);
  const clothM = textile((g2, N) => { g2.fillStyle = '#fbf3e2'; g2.fillRect(0, 0, N, N); g2.fillStyle = 'rgba(192,69,58,.55)'; for (let i = 0; i < N; i += 64) { g2.fillRect(i, 0, 32, N); } g2.fillStyle = 'rgba(192,69,58,.55)'; for (let j = 0; j < N; j += 64) g2.fillRect(0, j, N, 32); g2.fillStyle = 'rgba(122,28,24,.25)'; for (let i = 0; i < N; i += 64) for (let j = 0; j < N; j += 64) g2.fillRect(i, j, 32, 32); }, 4, 2.4);
  const mantaM = textile((g2, N) => { const cols = ['#c0453a', '#f4ead4', '#3f6f98', '#e9b94a', '#f4ead4', '#6a8f6a', '#f4ead4']; let y = 0, k = 0; while (y < N) { const h = k % 2 ? 10 : 34; g2.fillStyle = cols[k % cols.length]; g2.fillRect(0, y, N, h); if (!(k % 2)) { g2.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 0; x < N; x += 16) g2.fillRect(x, y + h / 2 - 2, 8, 4); } y += h; k++; } g2.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 0; x < N; x += 3) g2.fillRect(x, 0, 1, N); }, 2, 2);
  const ragM = textile((g2, N) => { const cols = ['#c0453a', '#f4ead4', '#3f6f98', '#e9b94a', '#6a8f6a', '#f2b6a8']; for (let k = 0; k < 14; k++) { g2.fillStyle = cols[(k * 5) % cols.length]; g2.beginPath(); g2.arc(128, 128, 128 - k * 9, 0, 6.3); g2.fill(); } g2.strokeStyle = 'rgba(0,0,0,.06)'; for (let k = 0; k < 40; k++) { g2.beginPath(); g2.arc(128, 128, k * 3.2, 0, 6.3); g2.stroke(); } }, 1, 1);
  const solRug = textile((g2, N) => { g2.fillStyle = '#f4ead4'; g2.fillRect(0, 0, N, N); g2.fillStyle = '#c0453a'; g2.fillRect(0, 0, N, 22); g2.fillRect(0, N - 22, N, 22); g2.fillStyle = '#3f6f98'; g2.fillRect(0, 26, N, 6); g2.fillRect(0, N - 32, N, 6); sol(g2, 128, 128, 80, '#3f6f98'); for (let k = 0; k < 8; k++) cross(g2, 20 + k * 31, 50, 10, '#c0453a'); for (let k = 0; k < 8; k++) cross(g2, 20 + k * 31, 206, 10, '#c0453a'); }, 1, 1);
  const win = (parent, x, y, z, ry, w, h) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    add(g, RB(w, h, .08), new THREE.MeshStandardMaterial({ color: 0xffe9a0, emissive: 0xffd666, emissiveIntensity: 1.6, roughness: 1 }), 0, 0, -.2).castShadow = false;
    const fr = 0x9a6232; add(g, RB(w + .24, .12, .22), fr, 0, h / 2 + .06, 0); add(g, RB(w + .24, .12, .22), fr, 0, -h / 2 - .06, 0); add(g, RB(.12, h, .22), fr, -w / 2 - .06, 0, 0); add(g, RB(.12, h, .22), fr, w / 2 + .06, 0, 0);
    for (let i = 1; i < 3; i++) add(g, RB(.06, h, .12), fr, -w / 2 + i * w / 3, 0, 0); add(g, RB(w, .06, .12), fr, 0, 0, 0); add(g, RB(w + .5, .1, .5), 0xf0e4cc, 0, -h / 2 - .2, .2);
    for (const sx of [-1, 1]) { add(g, RB(.55, h + .25, .08), curtainM, sx * (w / 2 + .38), 0, .18); add(g, RB(.34, h - .15, .05), 0xfff8ea, sx * (w / 2 - .12), .05, .12, { transparent: true, opacity: .85 }); }
    const pot = add(g, CY(.14, .1, .2, 8), 0xc9674f, -w / 4, -h / 2 - .05, .24); for (let k = 0; k < 6; k++) add(g, new THREE.IcosahedronGeometry(.1, 1), [0xf59ab8, 0xffffff, 0xf2c14a][k % 3], -w / 4 + (k - 2.5) * .06, -h / 2 + .12 + (k % 2) * .06, .24);
    const lamp = new THREE.PointLight(0xffe2a0, 1.1, 10); lamp.position.set(0, 0, .6); g.add(lamp); return g; };
  win(wallBack, -3.6, 2.0, -Dp / 2 + .02, 0, 1.7, 1.4); win(wallBack, 3.8, 2.0, -Dp / 2 + .02, 0, 1.7, 1.4); win(wallLeft, -W / 2 + .02, 2.0, -1.8, PI / 2, 1.5, 1.3); win(wallRight, W / 2 - .02, 2.0, -1.4, -PI / 2, 1.5, 1.3);
  // ---- the hearth (lareira): a granite platform, the fire, the iron pot on its crane, and the great hood (campana) rising into a chimney
  const H0 = new THREE.Group(); H0.position.set(-5.2, 0, -2.3); scene.add(H0);
  add(H0, RB(3.6, .45, 2.4), std(0xc9c1b0), 0, .22, 0); add(H0, RB(3.0, .12, 1.9), std(0xaaa391), 0, .5, 0);
  for (let i = 0; i < 6; i++) add(H0, RB(.55, .5, .06), 0x8c8576, -1.4 + i * .56, .25, 1.22);
  const hood = new THREE.Mesh(CY(.55, 1.95, 1.9, 4, 1, true), new THREE.MeshStandardMaterial({ color: 0xe9dfc8, roughness: 1, side: THREE.DoubleSide, map: stoneT })); hood.rotation.y = PI / 4; hood.scale.set(1.0, 1, .8); hood.position.set(0, 2.55, 0); hood.castShadow = true; H0.add(hood);
  add(H0, RB(1.0, 1.4, .9), std(0xe9dfc8), 0, 3.9, -.1); add(H0, RB(3.7, .2, 2.6), std(0x6b4a2e), 0, 1.58, 0);
  for (let i = 0; i < 7; i++) add(H0, CY(.03, .03, .9, 4), 0x3a3a3f, -1.4 + i * .47, 1.25, 1.2);
  for (const [lx, lz, r] of [[-.35, 0, .2], [.3, .1, .18], [0, -.3, .16]]) add(H0, CY(r, r, .9, 7), 0x6b4a2e, lx, .62, lz).rotation.z = PI / 2 + lz;
  const flames = []; for (let i = 0; i < 6; i++) { const f = add(H0, new THREE.ConeGeometry(.2 + (i % 3) * .05, .75 + (i % 2) * .25, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffb347 : 0xff7a2a, emissive: i % 2 ? 0xffc15e : 0xff7a2a, emissiveIntensity: 1.4, transparent: true, opacity: .92 }), -.5 + i * .2, .95, -.1 + (i % 2) * .15); f.castShadow = false; flames.push(f); }
  const fire = new THREE.PointLight(0xff8a3a, 3.2, 12, 1.6); fire.position.set(-5.2, 1.4, -1.2); fire.castShadow = false; scene.add(fire);
  const crane = new THREE.Group(); crane.position.set(.9, 1.5, -.3); H0.add(crane); add(crane, CY(.04, .04, 1.3, 5), 0x2b2b30, 0, -.2, 0); add(crane, RB(1.1, .06, .06), 0x2b2b30, -.5, .45, 0);
  add(crane, CY(.015, .015, .6, 4), 0x2b2b30, -.95, .15, 0); const pot = add(crane, new THREE.SphereGeometry(.42, 12, 8, 0, PI * 2, PI * .15, PI * .8), new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: .5, metalness: .4, side: THREE.DoubleSide }), -.95, -.28, 0); pot.scale.y = .85;
  add(crane, new THREE.TorusGeometry(.4, .03, 6, 16), 0x24242a, -.95, -.02, 0).rotation.x = PI / 2;
  // ---- the wooden table with filloas, a jug, honey and bread, a bench and stools
  const T = new THREE.Group(); T.position.set(-1.9, 0, 1.1); scene.add(T);
  add(T, rbox(2.9, .14, 1.5, .05), 0xd0733a, 0, .98, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(T, CY(.07, .1, .98, 8), darkWood, sx * 1.25, .49, sz * .6);
  add(T, RB(2.4, .08, .08), darkWood, 0, .35, 0);
  const plate = add(T, CY(.5, .42, .05, 18), 0xf6efe0, -.3, 1.08, .1); add(T, new THREE.TorusGeometry(.46, .025, 6, 20), 0x4f8fc0, -.3, 1.1, .1).rotation.x = PI / 2;
  for (let i = 0; i < 7; i++) { const f = add(T, CY(.34 - i * .004, .34 - i * .004, .022, 20), [0xe6bd72, 0xf0cf8e, 0xdcae5e][i % 3], -.3 + (i % 2) * .015, 1.115 + i * .021, .1 + (i % 3) * .01); f.castShadow = true; }
  for (let k = 0; k < 2; k++) { const fo = add(T, CY(.2, .2, .03, 14, 1, false, 0, PI), 0xe2b565, .5 + k * .45, 1.08, -.25 + k * .1); fo.rotation.z = PI / 2; fo.rotation.y = k * 1.4; add(T, new THREE.SphereGeometry(.07, 6, 5), 0xfff8ea, .5 + k * .45, 1.15, -.25 + k * .1); }
  add(T, CY(.16, .2, .4, 10), 0xf6efe0, .95, 1.25, .35); add(T, new THREE.SphereGeometry(.1, 6, 5), 0xf6efe0, 1.08, 1.4, .35);
  add(T, CY(.12, .12, .2, 8), 0xe0a63c, 1.0, 1.15, -.35); add(T, CY(.13, .13, .04, 8), 0x8a6a44, 1.0, 1.27, -.35);
  const bread = add(T, new THREE.SphereGeometry(.3, 10, 8), 0xd9a45a, .5, 1.2, .45); bread.scale.y = .55;
  for (const sz of [-1, 1]) add(T, CY(.09, .08, .1, 8), 0xc9674f, -1.0, 1.1, sz * .3);
  add(T, rbox(2.8, .12, .42, .04), 0xa77848, 0, .62, 1.05); for (const sx of [-1, 1]) add(T, RB(.12, .62, .4), darkWood, sx * 1.25, .31, 1.05);
  for (const [sx, sz, ry] of [[2.0, .1, -PI / 2], [-2.0, .1, PI / 2]]) { const g = new THREE.Group(); g.position.set(sx, 0, sz); g.rotation.y = ry; T.add(g); add(g, rbox(.8, .08, .8, .03), 0xa8743f, 0, .6, 0); add(g, rbox(.7, .1, .7, .04), 0xf6e7b8, 0, .68, 0); add(g, RB(.8, 1.0, .07), 0xa8743f, 0, 1.15, -.37); add(g, RB(.6, .5, .06), 0xf6e7b8, 0, 1.3, -.34); for (const lx of [-.34, .34]) for (const lz of [-.34, .34]) add(g, CY(.04, .04, .6, 5), 0x7d4c28, lx, .3, lz); }
  // ---- kitchen shelf, strings of onions and peppers, cupboard
  const sh = new THREE.Group(); sh.position.set(-1.0, 1.9, -Dp / 2 + .25); scene.add(sh); add(sh, RB(2.6, .08, .4), darkWood, 0, 0, 0);
  for (let k = 0; k < 6; k++) add(sh, CY(.12, .09, .16, 8), [0xf6efe0, 0x4f8fc0, 0xc9674f, 0xf6efe0, 0xe0a63c, 0x4f8fc0][k], -1.05 + k * .42, .13, 0);
  for (let k = 0; k < 4; k++) { const s = new THREE.Group(); s.position.set(-5.6 + k * .5, HH - .55, -3.2 + (k % 2) * .5); scene.add(s); add(s, CY(.008, .008, .5, 3), 0x8a6a44, 0, -.25, 0); for (let q = 0; q < 4; q++) add(s, new THREE.IcosahedronGeometry(.07 + (q % 2) * .02, 1), k % 2 ? 0xe0a63c : 0xc9473a, 0, -.15 - q * .12, (q % 2) * .02); }
  const cup = new THREE.Group(); cup.position.set(1.2, 0, -Dp / 2 + .45); scene.add(cup); add(cup, rbox(1.6, 2.5, .7, .05), 0xc58a4a, 0, 1.25, 0); for (const sx of [-.4, .4]) add(cup, RB(.7, 1.0, .06), 0xad7436, sx, 1.7, .38); for (const sx of [-.4, .4]) add(cup, new THREE.SphereGeometry(.05, 6, 5), 0xe9dcc2, sx * .5, 1.7, .42);
  // ---- the dining corner: a rug, the rocking chair with the grandmother knitting, a little table with a lamp
  const rug = add(scene, CY(2.4, 2.4, .04, 40), ragM, 3.3, .02, .9); rug.castShadow = false; add(scene, RB(3.4, .05, 1.5), mantaM, -2.2, .03, 3.6).castShadow = false; add(scene, RB(1.7, .05, 2.6), solRug, 0.3, .03, -1.2).rotation.y = .08; add(scene, RB(1.5, .05, 2.2), mantaM, -2.8, .03, -.6).rotation.y = Math.PI / 2;
  const chair = new THREE.Group(); chair.position.set(3.3, 0, .6); chair.rotation.y = -.35; scene.add(chair);
  const seatG = new THREE.Group(); chair.add(seatG);
  add(seatG, rbox(1.0, .12, .95, .04), 0xb27e4a, 0, .68, 0); add(seatG, rbox(1.0, 1.15, .1, .04), 0xb27e4a, 0, 1.28, -.45); for (let i = 0; i < 5; i++) add(seatG, RB(.06, 1.0, .06), darkWood, -.36 + i * .18, 1.3, -.4);
  for (const sx of [-1, 1]) { add(seatG, RB(.08, .08, .8), darkWood, sx * .52, 1.0, .05); add(seatG, CY(.04, .04, .35, 6), darkWood, sx * .52, .84, .38); const rk = add(seatG, new THREE.TorusGeometry(1.3, .045, 6, 24, PI * .42), darkWood, sx * .46, -.35, 0); rk.rotation.set(0, PI / 2, PI / 2 + PI * .29); add(seatG, CY(.04, .04, .65, 5), darkWood, sx * .46, .35, -.15); }
  // the grandmother, rebuilt: a soft body with a real lap, neck, shoulders, upper arms and forearms joined at the elbows, hands on the needles, and legs that hang from the chair
  const gran = new THREE.Group(); gran.position.set(0, .75, .02); seatG.add(gran);
  const DR = 0x4f5f86, SK = 0xe8b894, HAIR = 0xe9e6e1;
  const skirt = add(gran, CY(.3, .5, .6, 20), DR, 0, .26, .02); skirt.scale.set(1, 1, .95);
  for (const sx of [-1, 1]) { const th = add(gran, CY(.13, .12, .52, 12), DR, sx * .14, .16, .27); th.rotation.x = PI / 2 - .05; add(gran, new THREE.SphereGeometry(.125, 12, 10), DR, sx * .14, .15, .52); const sh = add(gran, CY(.095, .08, .6, 10), 0xe9c5a8, sx * .14, -.17, .54); add(gran, new THREE.SphereGeometry(.1, 10, 8), 0x3a2f2c, sx * .14, -.5, .6).scale.set(.95, .6, 1.5); }
  const torso = new THREE.Group(); torso.position.set(0, .6, 0); gran.add(torso);
  const body = add(torso, new THREE.SphereGeometry(.3, 18, 14), DR, 0, 0, 0); body.scale.set(1.05, 1.22, .8);
  const apron = add(torso, new THREE.SphereGeometry(.31, 16, 10, 0, PI * 2, PI * .35, PI * .5), 0xfaf4e8, 0, -.08, .02); apron.scale.set(1.0, 1.0, .88); apron.rotation.x = .12;
  const shawl = add(torso, new THREE.SphereGeometry(.34, 18, 10, 0, PI * 2, 0, PI * .42), 0xc9735a, 0, .12, -.02); shawl.scale.set(1.08, .9, .85);
  const neck = add(gran, CY(.07, .08, .14, 10), SK, 0, .94, .03);
  const head = new THREE.Group(); head.position.set(0, 1.13, .04); gran.add(head);
  const hd = add(head, new THREE.SphereGeometry(.2, 20, 16), SK, 0, 0, 0); hd.scale.set(1, 1.1, 1);
  add(head, new THREE.SphereGeometry(.035, 8, 6), 0xdca486, 0, -.02, .2);                                                   // the nose
  for (const sx of [-1, 1]) { add(head, new THREE.SphereGeometry(.026, 8, 6), 0x2b2530, sx * .075, .03, .185); add(head, new THREE.SphereGeometry(.04, 8, 6), 0xf0a0a0, sx * .125, -.05, .15).scale.set(1, .6, .5); add(head, new THREE.SphereGeometry(.035, 8, 6), SK, sx * .2, -.02, 0).scale.set(.5, 1, .8); const lens = add(head, new THREE.TorusGeometry(.058, .01, 6, 16), 0x3a3a3f, sx * .075, .03, .195); lens.castShadow = false; }
  add(head, CY(.01, .01, .1, 5), 0x3a3a3f, 0, .03, .2).rotation.z = PI / 2;
  const hair = add(head, new THREE.SphereGeometry(.215, 18, 12, 0, PI * 2, 0, PI * .52), HAIR, 0, .02, -.02); hair.rotation.x = -.35; add(head, new THREE.SphereGeometry(.09, 12, 10), HAIR, 0, .2, -.13);
  add(head, new THREE.SphereGeometry(.02, 8, 6), 0xdca486, 0, -.12, .185).scale.set(2.4, .5, .6);                           // a small smile
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * .3, .84, 0); gran.add(sh); add(sh, new THREE.SphereGeometry(.09, 10, 8), DR, 0, 0, 0);
    const up = new THREE.Group(); sh.add(up); add(up, CY(.075, .065, .36, 10), DR, 0, -.18, 0);
    const el = new THREE.Group(); el.position.set(0, -.36, 0); up.add(el); add(el, new THREE.SphereGeometry(.07, 10, 8), DR, 0, 0, 0); add(el, CY(.062, .052, .34, 10), DR, 0, -.17, 0);
    const hand = add(el, new THREE.SphereGeometry(.06, 10, 8), SK, 0, -.37, 0); hand.scale.set(1, 1.1, .85);
    up.rotation.set(-.4, 0, -sx * .12); el.rotation.set(-1.1, 0, sx * .18); arms.push({ up, el, sx });
  }
  const needles = new THREE.Group(); needles.position.set(0, .5, .48); gran.add(needles); for (const sx of [-1, 1]) { const nd = add(needles, CY(.01, .01, .5, 6), 0xcfcfd4, sx * .08, .02, 0); nd.rotation.set(.5, 0, sx * .75); }
  add(needles, RB(.36, .24, .1), 0xd9383a, 0, -.12, .02);
  const ball = add(scene, new THREE.SphereGeometry(.17, 12, 10), 0xe9577a, 2.55, .2, 1.55); ball.castShadow = true; const thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2.55, .3, 1.55), new THREE.Vector3(2.8, .3, 1.35), new THREE.Vector3(3.1, .55, 1.15), new THREE.Vector3(3.3, 1.0, 1.1)]), 14, .007, 4), std(0xe9577a)); scene.add(thread);
  const side = new THREE.Group(); side.position.set(5.3, 0, 1.0); scene.add(side); add(side, CY(.42, .42, .06, 14), darkWood, 0, .85, 0); add(side, CY(.06, .1, .85, 6), darkWood, 0, .42, 0); add(side, CY(.14, .17, .14, 8), 0xf6efe0, 0, .95, 0);
  const lampShade = add(side, CY(.2, .3, .38, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0xffe3b0, emissive: 0xffd08a, emissiveIntensity: .9, side: THREE.DoubleSide }), 0, 1.25, 0); const lampL = new THREE.PointLight(0xffd9a0, 1.5, 8); lampL.position.set(5.3, 2.2, 1.0); scene.add(lampL);
  // ---- big plants, pictures, a clock
  for (const [px, pz, c] of [[6.5, 4.2, 0x8fa9e8], [-6.5, 4.5, 0xf59ab8]]) { const g = new THREE.Group(); g.position.set(px, 0, pz); scene.add(g); add(g, CY(.34, .26, .5, 10), 0xc9674f, 0, .25, 0); for (let k = 0; k < 9; k++) add(g, new THREE.IcosahedronGeometry(.28, 1), k % 3 ? 0x5fae8a : c, Math.cos(k * 2.4) * .3, .8 + (k % 3) * .25, Math.sin(k * 2.4) * .3); }
  for (const [px, py, col] of [[-6.0, 2.7, 0xcfe0ea], [2.2, 2.9, 0xf2d4c4], [6.0, 2.8, 0xe3efe6]]) { add(wallBack, RB(.9, 1.1, .08), 0x6b4a2e, px, py, -Dp / 2 + .03); add(wallBack, RB(.72, .92, .09), col, px, py, -Dp / 2 + .05).castShadow = false; }
  const clock = new THREE.Group(); clock.position.set(5.8, 3.0, -Dp / 2 + .08); scene.add(clock); add(clock, CY(.28, .28, .1, 20), 0x6b4a2e, 0, 0, 0).rotation.x = PI / 2; add(clock, CY(.23, .23, .11, 20), 0xfff8ea, 0, 0, .01).rotation.x = PI / 2; add(clock, RB(.03, .18, .02), 0x2b2b30, 0, .06, .07); add(clock, RB(.14, .03, .02), 0x2b2b30, .04, 0, .07);
  // ---- the two kittens
  const cat = (fur, belly, eye, scale, fluffy) => {
    const g = new THREE.Group(), body = add(g, new THREE.SphereGeometry(.3, 12, 10), fur, 0, .27, 0); body.scale.set(1.2, 1, .95);
    const head = new THREE.Group(); head.position.set(.3, .5, 0); g.add(head); add(head, new THREE.SphereGeometry(.22, 12, 10), fur, 0, 0, 0).scale.set(1.05, .95, 1.05);
    for (const sz of [-1, 1]) { add(head, new THREE.ConeGeometry(.08, .17, 4), fur, -.02, .2, sz * .13).rotation.set(sz * .22, 0, -.1); add(head, new THREE.ConeGeometry(.045, .1, 4), 0xf4b6b6, -.01, .19, sz * .13).rotation.set(sz * .22, 0, -.1); const ey = add(head, new THREE.SphereGeometry(.036, 8, 6), eye, .18, .03, sz * .085); add(head, new THREE.SphereGeometry(.018, 6, 5), 0x1b1b20, .2, .03, sz * .085); add(head, new THREE.SphereGeometry(.014, 5, 4), 0xffffff, .205, .045, sz * .075); ey.castShadow = false; add(head, new THREE.SphereGeometry(.05, 6, 5), 0xf4b6b6, .17, -.04, sz * .17).scale.set(.5, .6, 1); }
    add(head, new THREE.SphereGeometry(.03, 6, 5), 0xf08a9a, .22, -.03, 0); add(head, new THREE.SphereGeometry(.12, 8, 6), belly, .13, -.08, 0).scale.set(.9, .7, .9);
    for (const sz of [-1, 1]) { add(g, CY(.06, .07, .22, 6), fur, .22, .11, sz * .13); add(g, CY(.065, .07, .16, 6), fur, -.2, .08, sz * .17); }
    const tail = new THREE.Group(); tail.position.set(-.34, .3, 0); g.add(tail); for (let i = 0; i < 6; i++) add(tail, new THREE.SphereGeometry(.075 - i * .004 + (fluffy ? .02 : 0), 10, 8), fur, -.07 * i, .06 * i + .02 * Math.sin(i), 0);
    if (fluffy) { const ch = add(g, new THREE.SphereGeometry(.27, 14, 10), fur, .12, .24, 0); ch.scale.set(1, 1.05, 1.1); add(g, new THREE.SphereGeometry(.26, 14, 10), fur, -.12, .3, 0).scale.set(1.2, 1, 1.05); }
    if (fluffy) for (const sz of [-1, 1]) add(head, new THREE.SphereGeometry(.1, 10, 8), fur, .05, -.08, sz * .17).scale.set(1, .85, .9);
    g.scale.setScalar(scale); g.userData = { head, tail }; return g; };
  const white = cat(0xf1e9dc, 0xfff6ea, 0x6fb4e6, .88, true); white.position.set(-3.3, .02, 2.9); white.rotation.y = .6; scene.add(white);
  const brown = cat(0x8c6a48, 0xcdb08a, 0x7cc47a, .62, false); brown.position.set(2.0, .02, 1.7); brown.rotation.y = -2.6; scene.add(brown);
  for (let i = 0; i < 7; i++) { const st = add(brown, RB(.04, .02, .22), 0x4a3524, -.1 + i * .08, .55, 0); st.rotation.z = .1; st.castShadow = false; st.scale.set(1, 1, .8); }

  // ---- a diorama: the room sits on a chunky wooden plinth in the dusk
  add(scene, RB(W + 1.6, .7, Dp + 1.6), 0xd9a870, 0, -.62, 0); add(scene, RB(W + 2.1, .18, Dp + 2.1), 0xb8864f, 0, -1.05, 0);
  for (const [cw, cd, cx, cz] of [[W + .9, .5, 0, -Dp / 2 - .2], [.5, Dp, -W / 2 - .2, 0], [.5, Dp, W / 2 + .2, 0]]) add(scene, RB(cw, .16, cd), 0xe9e4da, cx, HH + .02, cz);
  // ---- a blue spiral staircase with a copper rail, up to a little loft
  { const st = new THREE.Group(); scene.add(st); const NS = 12, cx = -5.5, cz = 2.6, a1 = 4.38, da = .5, pts = [];
    add(st, CY(.09, .09, 3.2, 8), 0xc0703a, cx, 1.6, cz);
    for (let i = 0; i < NS; i++) { const a = a1 - (NS - 1 - i) * da, y = .3 + i * .26, sx = cx + Math.cos(a) * .66, sz = cz + Math.sin(a) * .66; const stp = add(st, rbox(1.3, .1, .62, .03), 0xe6b24a, sx, y, sz); stp.rotation.y = -a; pts.push(new THREE.Vector3(cx + Math.cos(a) * 1.24, y + .95, cz + Math.sin(a) * 1.24)); }
    st.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .035, 5), std(0xc0703a)));
    add(st, rbox(1.9, .14, 1.7, .04), 0xe6b24a, -6.0, 3.2, .3); add(st, new THREE.TorusGeometry(.5, .04, 5, 12, PI), 0xc0703a, -5.2, 3.7, .3).rotation.y = PI / 2;
    add(st, CY(.5, .5, .04, 22), 0xd69a38, cx, .03, cz); }
  // ---- honey-wood shelves with plants, cups and a climbing vine, on the right wall
  { const sh2 = new THREE.Group(); sh2.position.set(6.55, 0, -1.6); scene.add(sh2);
    for (const [y, l] of [[1.9, 2.6], [2.6, 2.2], [3.2, 1.6]]) { add(sh2, RB(.55, .09, l), 0xc58a4a, 0, y, 0); }
    add(sh2, RB(.45, 1.4, .08), 0xad7436, 0, 2.55, 1.2);
    for (const [y, z, c] of [[1.9, -.8, 0x5fae8a], [1.9, .6, 0xe9a0c0], [2.6, -.5, 0x7cc47a]]) { add(sh2, CY(.16, .12, .22, 8), 0xc9674f, 0, y + .15, z); for (let k = 0; k < 5; k++) add(sh2, new THREE.IcosahedronGeometry(.1, 1), c, Math.cos(k * 2.4) * .08, y + .34 + (k % 2) * .08, z + Math.sin(k * 2.4) * .08); }
    for (let k = 0; k < 4; k++) add(sh2, CY(.08, .06, .12, 7), [0x4f8fc0, 0xf6efe0, 0xe0a63c, 0x4f8fc0][k], 0, 2.7 + .06, .1 + k * .26);
    const vine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.2, 3.6, -1.1), new THREE.Vector3(-.3, 3.1, -.6), new THREE.Vector3(-.2, 2.5, -.9), new THREE.Vector3(-.3, 1.9, -.4), new THREE.Vector3(-.2, 1.4, -.8)]), 20, .02, 4), std(0x5fae8a)); sh2.add(vine);
    for (let k = 0; k < 7; k++) add(sh2, new THREE.SphereGeometry(.045, 6, 5), k % 2 ? 0xe9573a : 0xf2a43a, -.25, 3.5 - k * .3, -1.0 + (k % 3) * .25); }
  // ---- copper pots and pans hanging from a beam over the table, and a rack of blue-and-white plates
  { const bm = add(scene, RB(3.4, .12, .12), 0x7d4c28, 0, 3.1, -3.0); const cu = [0xcf7a3c, 0xb8652f, 0xd98a4a, 0xc16f35, 0xcf7a3c];
    for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(-1.4 + i * .7, 3.0, -3.0); scene.add(g); add(g, CY(.01, .01, .35, 3), 0x3a3a3f, 0, -.15, 0); if (i % 2) { add(g, CY(.22, .18, .26, 9), cu[i], 0, -.5, 0); add(g, new THREE.TorusGeometry(.2, .02, 5, 12), 0x8a4a24, 0, -.38, 0).rotation.x = PI / 2; } else { add(g, CY(.3, .3, .06, 10), cu[i], 0, -.42, 0); add(g, CY(.03, .03, .5, 5), 0x6e4524, 0, -.7, 0); } }
    for (let i = 0; i < 6; i++) { const pl = add(scene, CY(.34, .34, .04, 14), i % 2 ? 0xf6efe0 : 0xfaf4e8, -2.6 + i * .5, 2.35 + (i % 2) * .5, -Dp / 2 + .1); pl.rotation.x = PI / 2 - .08; add(scene, new THREE.TorusGeometry(.2, .03, 5, 14), 0x3f6fa8, -2.6 + i * .5, 2.35 + (i % 2) * .5, -Dp / 2 + .14); } }
  // ---- the stone bread oven built into the back wall, mouth glowing
  { const ov = new THREE.Group(); ov.position.set(-1.7, 0, -3.65); scene.add(ov);
    add(ov, RB(1.8, .9, 1.4), 0xcfc4ae, 0, .45, 0); const dome = add(ov, new THREE.SphereGeometry(.95, 10, 8, 0, PI * 2, 0, PI / 2), 0xd9cdb3, 0, .9, 0); dome.scale.set(1, .9, .75);
    const mouth = add(ov, CY(.36, .36, .1, 10, 1, false, 0, PI), new THREE.MeshStandardMaterial({ color: 0xffa030, emissive: 0xff7a1c, emissiveIntensity: 1.5 }), 0, .78, .66); mouth.rotation.x = PI / 2; mouth.rotation.z = PI / 2; mouth.castShadow = false;
    add(ov, RB(.72, .02, .4), 0x2b2b30, 0, .74, .78); add(ov, CY(.12, .16, .9, 6), 0xcfc4ae, .3, 2.0, -.2); }
  // ---- a checked cloth on the table, a basket of logs, a kettle, a barrel, a broom, a hanging lantern
  { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#fff6e8'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#fff6e8'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) c.fillRect(i * 32, j * 32, 32, 32);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); const cl = new THREE.Mesh(RB(2.9, .02, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); cl.visible = false; add(scene, RB(3.1, .08, 1.7), clothM, -1.9, 1.06, 1.1); add(scene, RB(3.1, .6, 1.7), clothM, -1.9, .78, 1.1).scale.set(1, 1, 1);
    const bk = new THREE.Group(); bk.position.set(-2.9, 0, -3.5); scene.add(bk); add(bk, CY(.5, .38, .5, 10), 0xc99a52, 0, .25, 0); for (let i = 0; i < 4; i++) add(bk, CY(.09, .09, .6, 6), 0x7d4c28, -.2 + i * .13, .6, 0).rotation.z = PI / 2 + i * .25;
    const kt = new THREE.Group(); kt.position.set(-4.0, .58, -1.3); scene.add(kt); add(kt, new THREE.SphereGeometry(.26, 10, 8), 0xcf7a3c, 0, .26, 0).scale.y = .85; add(kt, CY(.05, .09, .3, 6), 0xcf7a3c, .3, .36, 0).rotation.z = -.9; add(kt, new THREE.TorusGeometry(.17, .02, 5, 12, PI), 0x4a2a14, 0, .5, 0);
    const br = new THREE.Group(); br.position.set(6.2, 0, 3.3); scene.add(br); add(br, CY(.5, .56, .9, 10), 0x9a6232, 0, .45, 0); for (const y of [.15, .75]) add(br, new THREE.TorusGeometry(.53, .03, 5, 14), 0x3f3a36, 0, y, 0).rotation.x = PI / 2; add(br, CY(.46, .46, .04, 10), 0xb67a40, 0, .92, 0);
    add(scene, CY(.03, .03, 1.9, 5), 0x7d4c28, 2.6, .95, -4.2).rotation.z = .12; add(scene, CY(.14, .08, .4, 6), 0xd9b45a, 2.45, .15, -4.2);
    const ln = new THREE.Group(); ln.position.set(-1.9, 3.3, 1.1); scene.add(ln); add(ln, CY(.01, .01, .6, 3), 0x2b2b30, 0, .3, 0); add(ln, RB(.3, .38, .3), new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc860, emissiveIntensity: 1.2 }), 0, -.1, 0); add(ln, new THREE.ConeGeometry(.27, .2, 4), 0x2b2b30, 0, .18, 0).rotation.y = PI / 4;
    const ll = new THREE.PointLight(0xffc878, 1.3, 9); ll.position.set(-1.9, 3.1, 1.1); scene.add(ll); }

  // ---- a round-shouldered retro fridge (honey-orange, with paper notes) and a pale-green cooker beside it, as in the reference kitchen
  { const fr2 = new THREE.Group(); fr2.position.set(5.5, 0, -3.7); scene.add(fr2); add(fr2, rbox(1.4, 3.2, 1.2, .25), 0xeaa43a, 0, 1.6, 0); add(fr2, rbox(1.3, .06, 1.1, .03), 0xd48a22, 0, 1.95, .04);
    for (const y of [2.5, 1.5]) add(fr2, rbox(.8, .1, .08, .04), 0xd7d3c4, -.3, y, .62);
    for (let k = 0; k < 7; k++) add(fr2, rbox(.26, .3, .02, .01), [0xb9c3e8, 0xe7b8d0, 0xcfe0b8, 0xf6e7b8][k % 4], -.35 + (k % 3) * .32, 2.2 + Math.floor(k / 3) * .45 - (k % 2) * .1, .62);
    const cook = new THREE.Group(); cook.position.set(3.0, 0, -3.8); scene.add(cook); add(cook, rbox(1.5, 1.9, 1.15, .18), 0xc9d98a, 0, .95, 0); add(cook, rbox(1.2, .8, .06, .05), 0x8f9f5a, 0, .85, .58);
    for (let k = 0; k < 4; k++) add(cook, CY(.17, .17, .05, 14), 0x2b2b30, -.4 + (k % 2) * .8, 1.93, -.25 + Math.floor(k / 2) * .5); for (let k = 0; k < 4; k++) add(cook, new THREE.SphereGeometry(.07, 8, 6), 0xf2d27a, -.5 + k * .33, 1.55, .6);
    add(cook, new THREE.SphereGeometry(.28, 12, 9), 0xd9d9d4, .3, 2.2, -.2); add(cook, CY(.04, .06, .3, 6), 0xd9d9d4, .6, 2.2, -.2).rotation.z = -.9; }

  // ---- realistic window light: sun spots shaped like window panes, with shadows, falling across the floor and the table (as in the reference)
  const gobo = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g2 = c.getContext('2d'); g2.fillStyle = '#000'; g2.fillRect(0, 0, 256, 256); g2.filter = 'blur(10px)'; g2.fillStyle = '#bbb'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g2.fillRect(38 + i * 60, 44 + j * 78, 50, 64); return new THREE.CanvasTexture(c); })();
  for (const [wx, tx, tz] of [[-3.6, -2.0, 2.2], [3.8, 2.6, 2.4]]) { const sp = new THREE.SpotLight(0xffe6c0, 55, 30, .5, 1, 1.2); sp.position.set(wx, 2.4, -Dp / 2 - 1.2); sp.target.position.set(tx, 0, tz); sp.map = gobo; sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.radius = 8; sp.shadow.bias = -.0006; scene.add(sp, sp.target); }
  { const sp = new THREE.SpotLight(0xffe6c0, 40, 30, .5, 1, 1.2); sp.position.set(-W / 2 - 1.5, 2.4, -1.8); sp.target.position.set(-3.0, 0, 1.6); sp.map = gobo; sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.radius = 8; sp.shadow.bias = -.0006; scene.add(sp, sp.target); }
  for (const [gx, gy, gz, ry, gw] of [[-3.6, 2.0, -Dp / 2 + .6, 0, 3.2], [3.8, 2.0, -Dp / 2 + .6, 0, 3.2], [-W / 2 + .6, 2.0, -1.8, PI / 2, 3.0], [W / 2 - .6, 2.0, -1.4, -PI / 2, 3.0]]) { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,244,214,.75)'); gr.addColorStop(.55, 'rgba(255,236,200,.25)'); gr.addColorStop(1, 'rgba(255,230,190,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128); const hz = new THREE.Mesh(new THREE.PlaneGeometry(gw, gw * .8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); hz.position.set(gx, gy, gz); hz.rotation.y = ry; scene.add(hz); }
  // ---- a pineapple on the cupboard door, garlic braids and a loaf-sized toaster, as little reference touches
  { const pn = new THREE.Group(); pn.position.set(.8, 2.0, -Dp / 2 + .8); scene.add(pn); add(pn, new THREE.SphereGeometry(.26, 12, 9), 0xf2d46a, 0, 0, 0).scale.set(.8, 1.3, .5); for (let k = 0; k < 5; k++) add(pn, new THREE.ConeGeometry(.06, .3, 4), 0x7cc47a, (k - 2) * .07, .42, 0).rotation.z = (k - 2) * .25; }
  { const gl = new THREE.Group(); gl.position.set(-6.7, 3.4, -Dp / 2 + .4); scene.add(gl); add(gl, new THREE.CylinderGeometry(.015, .015, 1.0, 4), 0x8a6a44, 0, -.5, 0); for (let k = 0; k < 7; k++) add(gl, new THREE.SphereGeometry(.12, 8, 6), 0xf6efe0, (k % 2) * .08 - .04, -.15 - k * .13, 0).scale.set(1, 1.15, 1); }
  // ---- warm light, a sunny window, and a bed of soft shadow
  scene.add(new THREE.HemisphereLight(0xfff0dc, 0xd9b8a8, 1.0));
  const sun = new THREE.DirectionalLight(0xffeccf, 1.0); sun.position.set(2, 8, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 9; Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -.0008; scene.add(sun);
  // ---- orbit camera
  const view = { az: .2, pol: 1.05, dist: 12.5, tx: 0, ty: 1.3, tz: 0 };
  const WP = [[-3.5, 3.4], [.6, 3.3], [2.5, 1.9], [3.8, -1.1], [.4, -1.7], [-2.6, -1.0], [4.8, 3.1], [-1.2, 2.9]], wanderW = { g: white, pts: WP, i: 0, sp: .5, rest: 1.5, ph: 0, sc: .88 }, wanderB = { g: brown, pts: WP.slice().reverse(), i: 0, sp: .95, rest: .5, ph: 2, sc: .62 };
  const smoke = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.14, 6, 5), new THREE.MeshBasicMaterial({ color: 0xcfcfd4, transparent: true, opacity: .0 })); m.userData.ph = i / 8; H0.add(m); smoke.push(m); }
  const update = (dt, t, size) => {
    view.az = Math.max(-1.15, Math.min(1.15, view.az)); view.pol = Math.max(.7, Math.min(1.45, view.pol)); view.dist = Math.max(6, Math.min(17, view.dist));
    camera.position.set(view.tx + Math.sin(view.az) * Math.sin(view.pol) * view.dist, view.ty + Math.cos(view.pol) * view.dist, view.tz + Math.cos(view.az) * Math.sin(view.pol) * view.dist); camera.lookAt(view.tx, view.ty, view.tz);
    camera.aspect = size.w / size.h; camera.fov = size.w / size.h < .8 ? 62 : 42; camera.updateProjectionMatrix();
    flames.forEach((f, i) => { const k = 1 + Math.sin(t * 9 + i * 1.7) * .16 + Math.sin(t * 15 + i) * .08; f.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k)); f.position.y = .95 + (k - 1) * .3; f.rotation.z = Math.sin(t * 5 + i) * .07; });
    fire.intensity = 3.0 + Math.sin(t * 11) * .5 + Math.sin(t * 23) * .3; crane.rotation.y = Math.sin(t * .7) * .03; pot.position.y = -.28 + Math.sin(t * 1.3) * .006;
    smoke.forEach((m) => { const u = (t * .16 + m.userData.ph) % 1; m.position.set(Math.sin(u * 6 + m.userData.ph * 9) * .12, 3.2 + u * 1.6, -.1); m.scale.setScalar(.6 + u * 1.4); m.material.opacity = (1 - u) * .22 * Math.min(1, u * 6); });
    seatG.rotation.z = Math.sin(t * 1.15) * .03; gran.rotation.z = Math.sin(t * 1.15 + .4) * -.01; torso.scale.y = 1 + Math.sin(t * 1.4) * .012;
    { const k = t * 3.0, look = Math.max(0, Math.sin(t * .35)) ** 3; arms.forEach((a, i) => { const ph = k + i * 2.2; a.up.rotation.x = -.4 + Math.sin(ph) * .05; a.el.rotation.x = -1.1 + Math.sin(ph + .6) * .1; a.el.rotation.z = a.sx * .18 + Math.sin(ph * .5) * .03; }); needles.rotation.y = Math.sin(k) * .06; needles.rotation.x = Math.sin(k + 1) * .035; head.rotation.x = .16 - look * .2 + Math.sin(t * .8) * .02; head.rotation.y = look * .22 * Math.sin(t * .7); head.position.y = 1.13 + look * .01; }
    const wh = white.userData, bh = brown.userData; wh.head.rotation.z = Math.sin(t * .6) * .06; bh.head.rotation.z = Math.sin(t * 1.3) * .08;
    for (const c of [wanderW, wanderB]) { const g = c.g, u = g.userData, wp = c.pts[c.i], dx = wp[0] - g.position.x, dz = wp[1] - g.position.z, d = Math.hypot(dx, dz);
      if (c.rest > 0) { c.rest -= dt; u.tail.rotation.z = Math.sin(t * 2 + c.ph) * .25; u.tail.rotation.y = Math.sin(t * 1.1 + c.ph) * .3; g.position.y = .02; g.scale.y = c.sc * (1 + Math.sin(t * 1.8 + c.ph) * .015); }
      else if (d < .12) { c.i = (c.i + 1) % c.pts.length; c.rest = 1.5 + rnd() * 3.5; }
      else { const a = Math.atan2(dz, dx); let da = -a - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 5); const sp = c.sp * Math.min(1, d * 2 + .2) * (Math.abs(da) > 1 ? .3 : 1); g.position.x += dx / d * sp * dt; g.position.z += dz / d * sp * dt; g.position.y = .02 + Math.abs(Math.sin(t * 9 * c.sp / .6 + c.ph)) * .03; g.rotation.z = Math.sin(t * 9 * c.sp / .6 + c.ph) * .04; u.tail.rotation.z = .25 + Math.sin(t * 5 + c.ph) * .15; u.tail.rotation.y = Math.sin(t * 3) * .2; g.scale.y = c.sc; } }
    ball.rotation.z = t * 1.2;
  };
  const dispose = () => { scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); };
  // ---- plants and flowers all over the house: floor pots, window boxes, vases, hanging baskets, a fern by the stairs and a vine along the beam
  { const GR = [0x5fae8a, 0x7cc47a, 0x4f9a6c, 0x8fcf8a], FL = [0xf59ab8, 0xffffff, 0xf2c14a, 0xc9a0e8, 0xff8f7a, 0x8fa9e8];
    const leaf = (g, n, R0, y0, h0) => { for (let k2 = 0; k2 < n; k2++) { const a = k2 * 2.4, r = R0 * (.3 + (k2 % 4) * .22); add(g, new THREE.IcosahedronGeometry(R0 * .5, 1), GR[k2 % 4], Math.cos(a) * r, y0 + (k2 % 3) * h0, Math.sin(a) * r).scale.set(1, 1.2, 1); } };
    const blooms = (g, n, R0, y0) => { for (let k2 = 0; k2 < n; k2++) { const a = k2 * 2.1 + .5, r = R0 * (.4 + (k2 % 3) * .25); add(g, new THREE.SphereGeometry(R0 * .22, 8, 6), FL[k2 % 6], Math.cos(a) * r, y0 + (k2 % 2) * R0 * .35, Math.sin(a) * r); add(g, new THREE.SphereGeometry(R0 * .08, 6, 5), 0xf2c14a, Math.cos(a) * r, y0 + (k2 % 2) * R0 * .35 + R0 * .1, Math.sin(a) * r); } };
    const pot = (x, z, col, big, flowers, y) => { const g = new THREE.Group(); g.position.set(x, y || 0, z); scene.add(g); const sc = big ? 1.25 : .85; add(g, CY(.36 * sc, .27 * sc, .5 * sc, 14), col, 0, .25 * sc, 0); add(g, CY(.4 * sc, .4 * sc, .07, 14), 0xf6efe0, 0, .52 * sc, 0); leaf(g, big ? 11 : 7, .5 * sc, .75 * sc, .22 * sc); if (flowers) blooms(g, big ? 9 : 6, .5 * sc, .95 * sc); return g; };
    pot(6.5, 1.5, 0xc9674f, true, true); pot(-6.6, 0.3, 0x8fb8e8, true, false); pot(2.6, 3.9, 0xf6efe0, false, true);
    // the fern beside the staircase and a big leafy plant with a trunk by the fridge
    // window boxes full of flowers under the two back windows and the side windows
    for (const [wx, wy, wz, ry] of [[-3.6, 1.2, -Dp / 2 + .5, 0], [3.8, 1.2, -Dp / 2 + .5, 0], [-W / 2 + .5, 1.3, -1.8, PI / 2], [W / 2 - .5, 1.3, -1.4, -PI / 2]]) { const g = new THREE.Group(); g.position.set(wx, wy, wz); g.rotation.y = ry; scene.add(g); add(g, RB(1.7, .34, .42), 0xd0a070, 0, 0, 0); for (let k2 = 0; k2 < 6; k2++) { add(g, new THREE.IcosahedronGeometry(.17, 1), GR[k2 % 4], -.7 + k2 * .28, .3, 0); add(g, new THREE.SphereGeometry(.09, 8, 6), FL[(k2 + wx) % 6 | 0], -.7 + k2 * .28 + (k2 % 2) * .06, .5, (k2 % 2) * .08); } }
    // vases of flowers on the table, the shelf, the side table and the hearth
    const vase = (parent, x, y, z, col, n) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); add(g, CY(.12, .09, .3, 12), col, 0, .15, 0); add(g, CY(.06, .1, .06, 12), col, 0, .32, 0); for (let k2 = 0; k2 < n; k2++) { const a = k2 * 2.0, r = .06 + (k2 % 2) * .05; add(g, CY(.012, .012, .4 + (k2 % 3) * .08, 4), 0x5fae8a, Math.cos(a) * r * .5, .5, Math.sin(a) * r * .5).rotation.z = Math.cos(a) * .3; add(g, new THREE.SphereGeometry(.09 + (k2 % 2) * .02, 8, 6), FL[k2 % 6], Math.cos(a) * r, .78 + (k2 % 3) * .08, Math.sin(a) * r); } };
    vase(T, -.95, 1.05, -.45, 0x8fb8e8, 7); vase(T, 1.1, 1.05, .6, 0xf6efe0, 5); vase(scene, 5.3, .93, 1.0, 0xe9a0c0, 5); vase(H0, 1.2, .53, 0, 0xf6efe0, 5); vase(sh, 1.0, .05, 0, 0x8fb8e8, 4); vase(sh, -1.2, .05, 0, 0xf2c14a, 4);
    // hanging baskets with trailing leaves from the rafters, and a vine along the beam
    for (const [hx, hy, hz] of [[2.2, 3.0, -.5]]) { const g = new THREE.Group(); g.position.set(hx, hy, hz); scene.add(g); add(g, CY(.012, .012, .6, 3), 0x8a6a44, 0, .3, 0); add(g, new THREE.SphereGeometry(.32, 12, 8, 0, PI * 2, PI * .5, PI * .5), 0xd9a45a, 0, -.05, 0); for (let k2 = 0; k2 < 9; k2++) { const a = k2 * 2.4; add(g, new THREE.IcosahedronGeometry(.13, 1), GR[k2 % 4], Math.cos(a) * .26, .05 - (k2 % 3) * .14, Math.sin(a) * .26); } for (let k2 = 0; k2 < 4; k2++) add(g, new THREE.SphereGeometry(.07, 6, 5), FL[k2 % 6], Math.cos(k2 * 1.6) * .18, .12, Math.sin(k2 * 1.6) * .18); }
  }
  // ---- the soft, felted finish: smooth round surfaces, a velvet sheen and a fine fibre bump, like a plush toy
  const feltT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d'); g2.fillStyle = '#808080'; g2.fillRect(0, 0, 128, 128); for (let i = 0; i < 900; i++) { const v = rnd() < .5 ? 40 : 220; g2.strokeStyle = `rgba(${v},${v},${v},${.12 + rnd() * .16})`; g2.lineWidth = .8; g2.beginPath(); const x = rnd() * 128, y = rnd() * 128, a2 = rnd() * 6.28; g2.moveTo(x, y); g2.lineTo(x + Math.cos(a2) * (2 + rnd() * 5), y + Math.sin(a2) * (2 + rnd() * 5)); g2.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; })();
  const grainT = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g2 = c.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, 256, 256); for (let i = 0; i < 140; i++) { const y = rnd() * 256, a = .05 + rnd() * .12; g2.strokeStyle = `rgba(90,45,15,${a})`; g2.lineWidth = .6 + rnd() * 1.8; g2.beginPath(); g2.moveTo(0, y); for (let x = 0; x <= 256; x += 32) g2.lineTo(x, y + Math.sin(x * .03 + i) * 3 + (rnd() - .5) * 2); g2.stroke(); } for (let i = 0; i < 6; i++) { const x = rnd() * 256, y = rnd() * 256; g2.strokeStyle = 'rgba(90,45,15,.18)'; g2.lineWidth = 1; for (let r = 3; r < 14; r += 3) { g2.beginPath(); g2.ellipse(x, y, r * 2, r * .7, 0, 0, 6.3); g2.stroke(); } } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const paintT = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g2 = c.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, 256, 256); for (let i = 0; i < 60; i++) { const gr = g2.createRadialGradient(0, 0, 0, 0, 0, 60 + rnd() * 60), x = rnd() * 256, y = rnd() * 256; g2.save(); g2.translate(x, y); gr.addColorStop(0, `rgba(${rnd() < .5 ? '255,235,215' : '190,140,110'},${.12 + rnd() * .14})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(-120, -120, 240, 240); g2.restore(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const WOODS = new Set([0xd0733a, 0xc58a4a, 0xad7436, 0xa8743f, 0x7d4c28, 0xc08a4f, 0x8d5a30, 0x9a6232, 0xb27e4a, 0xb78452, 0x9a6f45, 0x6e4524, 0xeaa43a, 0xd48a22]), PAINTS = new Set([0xe9b9a2, 0xf6e7b8, 0xfff8ea, 0xc9d98a, 0xf2d46a]);
  const pastel = (col) => { const c = new THREE.Color(col), h = {}; c.getHSL(h); return c.setHSL(h.h, Math.min(1, h.s * 1.12), h.l * .93); };   /* warm, full colours (no pastels) */
  const mats = new Map(); scene.traverse((o) => { if (!o.isMesh || !o.material || Array.isArray(o.material)) return; const m = o.material; if (m.isMeshBasicMaterial) return; let c = mats.get(m); if (!c) { c = new THREE.MeshPhysicalMaterial({ color: pastel(m.color), map: m.map || (WOODS.has(m.color.getHex()) ? grainT : PAINTS.has(m.color.getHex()) ? paintT : null), emissive: m.emissive || new THREE.Color(0), emissiveIntensity: m.emissiveIntensity || 0, roughness: 1, metalness: 0, transparent: m.transparent, opacity: m.opacity, side: m.side, bumpMap: feltT, bumpScale: .35, sheen: 1.4, sheenRoughness: .6, sheenColor: pastel(m.color).lerp(new THREE.Color(0xfff0dc), .35) }); mats.set(m, c); } o.material = c; });
  return { scene, camera, view, update, dispose };
}
