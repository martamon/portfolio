// Casa Martamon, by inside: a traditional Galician house made cosy. A stone hearth (lareira) with its big old hood (campana) and an iron pot, a wooden
// table with filloas, a dining corner with a grandmother knitting in a rocking chair, and two kittens: a fluffy white one and a small brown one.
// Built as a dolls-house cut-away that you can turn with the mouse or a finger.
export function buildCasa(THREE, D) {
  const { std, rbox, PI } = D;
  const RB = (w, h, d) => rbox(w, h, d, Math.min(.12, Math.min(w, h, d) * .35)), CY = (a, b, h, n, ...r) => new THREE.CylinderGeometry(a, b, h, Math.max(n || 8, 18), ...r);   // everything soft and round
  let sd = 21; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x585a64);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 80);
  const add = (parent, geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, typeof col === 'number' ? std(col, extra) : col); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const tex = (draw, w, h, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
  // ---- the room: wood floor, granite and lime-washed walls, rafters
  const W = 14, Dp = 9, HH = 3.7;
  const floorT = tex((g, w, h) => { g.fillStyle = '#ecd8aa'; g.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(${90 + rnd() * 40},${60 + rnd() * 30},${30},${.12 + rnd() * .1})`; g.fillRect(0, i * h / 14, w, h / 14 - 2); g.fillStyle = 'rgba(70,45,25,.5)'; g.fillRect(0, i * h / 14 - 1, w, 2); } for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(70,45,25,.15)'; g.fillRect(rnd() * w, rnd() * h, 14 + rnd() * 50, 1.5); } }, 256, 256, [4, 2.2]);
  const floor = add(scene, RB(W, .3, Dp), new THREE.MeshStandardMaterial({ map: floorT, roughness: .85 }), 0, -.15, 0); floor.castShadow = false;
  const stoneT = tex((g, w, h) => { g.fillStyle = '#9a6a3c'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const v = 130 + rnd() * 40; g.fillStyle = `rgb(${v + 30},${v - 10},${v - 60})`; g.fillRect(x + 1, 0, 30, h); g.fillStyle = 'rgba(60,30,10,.25)'; g.fillRect(x, 0, 2, h); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(70,40,15,.12)'; g.fillRect(x + 4 + rnd() * 20, rnd() * h, 2, 14 + rnd() * 30); } } }, 256, 256, [5, 1]);
  const plaster = std(0x5d90ba), stoneM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 1 }), wood = std(0xa8743f), darkWood = std(0x7d4c28);
  const wallBack = new THREE.Group(), wallLeft = new THREE.Group(), wallRight = new THREE.Group(); scene.add(wallBack, wallLeft, wallRight);
  add(wallBack, RB(W, 1.3, .4), stoneM, 0, .65, -Dp / 2 - .2); add(wallBack, RB(W, HH - 1.3, .4), plaster, 0, 1.3 + (HH - 1.3) / 2, -Dp / 2 - .2);
  add(wallLeft, RB(.4, 1.3, Dp), stoneM, -W / 2 - .2, .65, 0); add(wallLeft, RB(.4, HH - 1.3, Dp), plaster, -W / 2 - .2, 1.3 + (HH - 1.3) / 2, 0);
  add(wallRight, RB(.4, 1.3, Dp), stoneM, W / 2 + .2, .65, 0); add(wallRight, RB(.4, HH - 1.3, Dp), plaster, W / 2 + .2, 1.3 + (HH - 1.3) / 2, 0);
  for (let i = -3; i <= 3; i += 3) add(scene, RB(.28, .32, Dp + .3), darkWood, i * 2.2, HH - .16, 0);                    // the rafters
  add(scene, RB(W, .28, .28), darkWood, 0, HH - .5, -Dp / 2 + .2);
  // ---- windows with white frames, small panes, lace curtains, shutters and flowers on the sill
  const win = (parent, x, y, z, ry, w, h) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    add(g, RB(w, h, .08), new THREE.MeshStandardMaterial({ color: 0xffe9a0, emissive: 0xffd666, emissiveIntensity: 1.6, roughness: 1 }), 0, 0, -.2).castShadow = false;
    const fr = 0x9a6232; add(g, RB(w + .24, .12, .22), fr, 0, h / 2 + .06, 0); add(g, RB(w + .24, .12, .22), fr, 0, -h / 2 - .06, 0); add(g, RB(.12, h, .22), fr, -w / 2 - .06, 0, 0); add(g, RB(.12, h, .22), fr, w / 2 + .06, 0, 0);
    for (let i = 1; i < 3; i++) add(g, RB(.06, h, .12), fr, -w / 2 + i * w / 3, 0, 0); add(g, RB(w, .06, .12), fr, 0, 0, 0); add(g, RB(w + .5, .1, .5), 0xf0e4cc, 0, -h / 2 - .2, .2);
    for (const sx of [-1, 1]) { add(g, RB(.5, h + .2, .06), 0x3f6f98, sx * (w / 2 + .35), 0, .18); add(g, RB(.34, h - .15, .05), 0xfff8ea, sx * (w / 2 - .12), .05, .12, { transparent: true, opacity: .85 }); }
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
  add(T, rbox(2.9, .14, 1.5, .05), 0xb78452, 0, .98, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(T, CY(.07, .1, .98, 8), darkWood, sx * 1.25, .49, sz * .6);
  add(T, RB(2.4, .08, .08), darkWood, 0, .35, 0);
  const plate = add(T, CY(.5, .42, .05, 18), 0xf6efe0, -.3, 1.08, .1); add(T, new THREE.TorusGeometry(.46, .025, 6, 20), 0x4f8fc0, -.3, 1.1, .1).rotation.x = PI / 2;
  for (let i = 0; i < 7; i++) { const f = add(T, CY(.34 - i * .004, .34 - i * .004, .022, 20), [0xe6bd72, 0xf0cf8e, 0xdcae5e][i % 3], -.3 + (i % 2) * .015, 1.115 + i * .021, .1 + (i % 3) * .01); f.castShadow = true; }
  for (let k = 0; k < 2; k++) { const fo = add(T, CY(.2, .2, .03, 14, 1, false, 0, PI), 0xe2b565, .5 + k * .45, 1.08, -.25 + k * .1); fo.rotation.z = PI / 2; fo.rotation.y = k * 1.4; add(T, new THREE.SphereGeometry(.07, 6, 5), 0xfff8ea, .5 + k * .45, 1.15, -.25 + k * .1); }
  add(T, CY(.16, .2, .4, 10), 0xf6efe0, .95, 1.25, .35); add(T, new THREE.SphereGeometry(.1, 6, 5), 0xf6efe0, 1.08, 1.4, .35);
  add(T, CY(.12, .12, .2, 8), 0xe0a63c, 1.0, 1.15, -.35); add(T, CY(.13, .13, .04, 8), 0x8a6a44, 1.0, 1.27, -.35);
  const bread = add(T, new THREE.SphereGeometry(.3, 10, 8), 0xd9a45a, .5, 1.2, .45); bread.scale.y = .55;
  for (const sz of [-1, 1]) add(T, CY(.09, .08, .1, 8), 0xc9674f, -1.0, 1.1, sz * .3);
  add(T, rbox(2.8, .12, .42, .04), 0xa77848, 0, .62, 1.05); for (const sx of [-1, 1]) add(T, RB(.12, .62, .4), darkWood, sx * 1.25, .31, 1.05);
  for (const [sx, sz, ry] of [[2.0, .1, -PI / 2], [-2.0, .1, PI / 2]]) { const g = new THREE.Group(); g.position.set(sx, 0, sz); g.rotation.y = ry; T.add(g); add(g, rbox(.8, .08, .8, .03), 0xa8743f, 0, .6, 0); add(g, rbox(.7, .1, .7, .04), 0x2f8a96, 0, .68, 0); add(g, RB(.8, 1.0, .07), 0xa8743f, 0, 1.15, -.37); add(g, RB(.6, .5, .06), 0x2f8a96, 0, 1.3, -.34); for (const lx of [-.34, .34]) for (const lz of [-.34, .34]) add(g, CY(.04, .04, .6, 5), 0x7d4c28, lx, .3, lz); }
  // ---- kitchen shelf, strings of onions and peppers, cupboard
  const sh = new THREE.Group(); sh.position.set(-1.0, 1.9, -Dp / 2 + .25); scene.add(sh); add(sh, RB(2.6, .08, .4), darkWood, 0, 0, 0);
  for (let k = 0; k < 6; k++) add(sh, CY(.12, .09, .16, 8), [0xf6efe0, 0x4f8fc0, 0xc9674f, 0xf6efe0, 0xe0a63c, 0x4f8fc0][k], -1.05 + k * .42, .13, 0);
  for (let k = 0; k < 4; k++) { const s = new THREE.Group(); s.position.set(-5.6 + k * .5, HH - .55, -3.2 + (k % 2) * .5); scene.add(s); add(s, CY(.008, .008, .5, 3), 0x8a6a44, 0, -.25, 0); for (let q = 0; q < 4; q++) add(s, new THREE.IcosahedronGeometry(.07 + (q % 2) * .02, 1), k % 2 ? 0xe0a63c : 0xc9473a, 0, -.15 - q * .12, (q % 2) * .02); }
  const cup = new THREE.Group(); cup.position.set(1.2, 0, -Dp / 2 + .45); scene.add(cup); add(cup, rbox(1.6, 2.5, .7, .05), 0xc58a4a, 0, 1.25, 0); for (const sx of [-.4, .4]) add(cup, RB(.7, 1.0, .06), 0xad7436, sx, 1.7, .38); for (const sx of [-.4, .4]) add(cup, new THREE.SphereGeometry(.05, 6, 5), 0xe9dcc2, sx * .5, 1.7, .42);
  // ---- the dining corner: a rug, the rocking chair with the grandmother knitting, a little table with a lamp
  const rug = add(scene, CY(2.4, 2.4, .03, 36), 0xd9806a, 3.3, .02, .9); add(scene, CY(1.8, 1.8, .035, 36), 0xf0d9a8, 3.3, .025, .9); add(scene, CY(1.1, 1.1, .04, 36), 0x6f9db6, 3.3, .03, .9); rug.castShadow = false;
  const chair = new THREE.Group(); chair.position.set(3.3, 0, .6); chair.rotation.y = -.35; scene.add(chair);
  const seatG = new THREE.Group(); chair.add(seatG);
  add(seatG, rbox(1.0, .12, .95, .04), 0xb27e4a, 0, .68, 0); add(seatG, rbox(1.0, 1.15, .1, .04), 0xb27e4a, 0, 1.28, -.45); for (let i = 0; i < 5; i++) add(seatG, RB(.06, 1.0, .06), darkWood, -.36 + i * .18, 1.3, -.4);
  for (const sx of [-1, 1]) { add(seatG, RB(.08, .08, .8), darkWood, sx * .52, 1.0, .05); add(seatG, CY(.04, .04, .35, 6), darkWood, sx * .52, .84, .38); const rk = add(seatG, new THREE.TorusGeometry(1.3, .045, 6, 24, PI * .42), darkWood, sx * .46, -.35, 0); rk.rotation.set(0, PI / 2, PI / 2 + PI * .29); add(seatG, CY(.04, .04, .65, 5), darkWood, sx * .46, .35, -.15); }
  const gran = new THREE.Group(); gran.position.set(0, .75, .02); seatG.add(gran);
  const dress = add(gran, new THREE.SphereGeometry(.42, 14, 10), 0x5a6a8a, 0, .38, 0); dress.scale.set(1, 1.25, .9);
  add(gran, CY(.42, .5, .5, 14), 0x5a6a8a, 0, .1, .1);
  const apron = add(gran, CY(.3, .38, .46, 12, 1, false, -.9, 1.8), 0xfaf4e8, 0, .12, .28); apron.rotation.y = PI / 2 - .15;
  const shawl = add(gran, new THREE.SphereGeometry(.4, 12, 8, 0, PI * 2, 0, PI * .55), 0xb98a78, 0, .72, 0); shawl.scale.set(1.05, .9, 1);
  add(gran, new THREE.SphereGeometry(.23, 12, 10), 0xf2c9a2, 0, 1.12, .05); for (const sx of [-1, 1]) { add(gran, new THREE.SphereGeometry(.035, 6, 5), 0x2b2530, sx * .08, 1.14, .26); add(gran, new THREE.SphereGeometry(.045, 6, 5), 0xf0a0a0, sx * .13, 1.07, .24).scale.set(1, .6, .5); const lens = add(gran, new THREE.TorusGeometry(.065, .01, 5, 12), 0x3a3a3f, sx * .08, 1.14, .275); lens.castShadow = false; }
  add(gran, CY(.012, .012, .16, 4), 0x3a3a3f, 0, 1.14, .28).rotation.z = PI / 2;
  const hair = add(gran, new THREE.SphereGeometry(.245, 12, 8, 0, PI * 2, 0, PI * .55), 0xe3e3e8, 0, 1.15, -.01); hair.rotation.x = -.25; add(gran, new THREE.SphereGeometry(.11, 8, 6), 0xe3e3e8, 0, 1.3, -.17);
  const needles = new THREE.Group(); needles.position.set(0, .62, .5); gran.add(needles); for (const sx of [-1, 1]) { const nd = add(needles, CY(.01, .01, .55, 4), 0xcfcfd4, sx * .1, 0, 0); nd.rotation.z = sx * .7; }
  add(needles, RB(.4, .26, .06), 0xe9577a, 0, -.12, .02);
  const arms = []; for (const sx of [-1, 1]) { const a = add(gran, CY(.075, .065, .62, 7), 0x5a6a8a, sx * .36, .72, .26); a.rotation.set(1.0, 0, sx * -.25); arms.push(a); add(gran, new THREE.SphereGeometry(.07, 6, 5), 0xf2c9a2, sx * .2, .64, .5); }
  for (const sx of [-1, 1]) add(gran, new THREE.SphereGeometry(.12, 8, 6), 0xc9a0a0, sx * .2, -.18, .55).scale.set(.9, .55, 1.4);
  const ball = add(scene, new THREE.SphereGeometry(.17, 12, 10), 0xe9577a, 2.55, .2, 1.55); ball.castShadow = true; const thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2.55, .3, 1.55), new THREE.Vector3(2.8, .3, 1.35), new THREE.Vector3(3.1, .55, 1.15), new THREE.Vector3(3.3, 1.0, 1.1)]), 14, .007, 4), std(0xe9577a)); scene.add(thread);
  const side = new THREE.Group(); side.position.set(5.3, 0, 1.0); scene.add(side); add(side, CY(.42, .42, .06, 14), darkWood, 0, .85, 0); add(side, CY(.06, .1, .85, 6), darkWood, 0, .42, 0); add(side, CY(.14, .17, .14, 8), 0xf6efe0, 0, .95, 0);
  const lampShade = add(side, CY(.2, .3, .38, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0xffe3b0, emissive: 0xffd08a, emissiveIntensity: .9, side: THREE.DoubleSide }), 0, 1.25, 0); const lampL = new THREE.PointLight(0xffd9a0, 1.5, 8); lampL.position.set(5.3, 2.2, 1.0); scene.add(lampL);
  // ---- big plants, pictures, a clock
  for (const [px, pz, c] of [[6.3, -3.4, 0x8fa9e8], [.4, 4.0, 0xf59ab8]]) { const g = new THREE.Group(); g.position.set(px, 0, pz); scene.add(g); add(g, CY(.34, .26, .5, 10), 0xc9674f, 0, .25, 0); for (let k = 0; k < 9; k++) add(g, new THREE.IcosahedronGeometry(.28, 1), k % 3 ? 0x5fae8a : c, Math.cos(k * 2.4) * .3, .8 + (k % 3) * .25, Math.sin(k * 2.4) * .3); }
  for (const [px, py, col] of [[-6.0, 2.7, 0xcfe0ea], [2.2, 2.9, 0xf2d4c4], [6.0, 2.8, 0xe3efe6]]) { add(wallBack, RB(.9, 1.1, .08), 0x6b4a2e, px, py, -Dp / 2 + .03); add(wallBack, RB(.72, .92, .09), col, px, py, -Dp / 2 + .05).castShadow = false; }
  const clock = new THREE.Group(); clock.position.set(5.8, 3.0, -Dp / 2 + .08); scene.add(clock); add(clock, CY(.28, .28, .1, 20), 0x6b4a2e, 0, 0, 0).rotation.x = PI / 2; add(clock, CY(.23, .23, .11, 20), 0xfff8ea, 0, 0, .01).rotation.x = PI / 2; add(clock, RB(.03, .18, .02), 0x2b2b30, 0, .06, .07); add(clock, RB(.14, .03, .02), 0x2b2b30, .04, 0, .07);
  // ---- the two kittens
  const cat = (fur, belly, eye, scale, fluffy) => {
    const g = new THREE.Group(), body = add(g, new THREE.SphereGeometry(.3, 12, 10), fur, 0, .27, 0); body.scale.set(1.2, 1, .95);
    const head = new THREE.Group(); head.position.set(.3, .5, 0); g.add(head); add(head, new THREE.SphereGeometry(.22, 12, 10), fur, 0, 0, 0).scale.set(1.05, .95, 1.05);
    for (const sz of [-1, 1]) { add(head, new THREE.ConeGeometry(.08, .17, 4), fur, -.02, .2, sz * .13).rotation.set(sz * .22, 0, -.1); add(head, new THREE.ConeGeometry(.045, .1, 4), 0xf4b6b6, -.01, .19, sz * .13).rotation.set(sz * .22, 0, -.1); const ey = add(head, new THREE.SphereGeometry(.036, 8, 6), eye, .18, .03, sz * .085); add(head, new THREE.SphereGeometry(.018, 6, 5), 0x1b1b20, .2, .03, sz * .085); add(head, new THREE.SphereGeometry(.014, 5, 4), 0xffffff, .205, .045, sz * .075); ey.castShadow = false; add(head, new THREE.SphereGeometry(.05, 6, 5), 0xf4b6b6, .17, -.04, sz * .17).scale.set(.5, .6, 1); }
    add(head, new THREE.SphereGeometry(.03, 6, 5), 0xf08a9a, .22, -.03, 0); add(head, new THREE.SphereGeometry(.12, 8, 6), belly, .13, -.08, 0).scale.set(.9, .7, .9);
    for (const sz of [-1, 1]) { add(g, CY(.06, .07, .22, 6), fur, .22, .11, sz * .13); add(g, CY(.065, .07, .16, 6), fur, -.2, .08, sz * .17); }
    const tail = new THREE.Group(); tail.position.set(-.34, .3, 0); g.add(tail); for (let i = 0; i < 6; i++) add(tail, new THREE.SphereGeometry(.075 - i * .004 + (fluffy ? .03 : 0), 7, 6), fur, -.07 * i, .06 * i + .02 * Math.sin(i), 0);
    if (fluffy) for (let i = 0; i < 36; i++) { const a = rnd() * 6.28, b = rnd() * PI, r = .31; const f = add(g, new THREE.IcosahedronGeometry(.09 + rnd() * .05, 1), fur, Math.cos(a) * Math.sin(b) * r * 1.2, .28 + Math.cos(b) * r * .9, Math.sin(a) * Math.sin(b) * r); f.castShadow = false; }
    if (fluffy) for (let i = 0; i < 10; i++) { const a = i * .63; add(head, new THREE.IcosahedronGeometry(.07, 1), fur, Math.cos(a) * .1, -.1 + Math.sin(a) * .02, Math.sin(a) * .2); }
    g.scale.setScalar(scale); g.userData = { head, tail }; return g; };
  const white = cat(0xfaf6ee, 0xffffff, 0x6fb4e6, 1.0, true); white.position.set(-3.3, .02, 2.9); white.rotation.y = .6; scene.add(white);
  const brown = cat(0x8c6a48, 0xcdb08a, 0x7cc47a, .62, false); brown.position.set(2.0, .02, 1.7); brown.rotation.y = -2.6; scene.add(brown);
  for (let i = 0; i < 7; i++) { const st = add(brown, RB(.04, .02, .22), 0x4a3524, -.1 + i * .08, .55, 0); st.rotation.z = .1; st.castShadow = false; st.scale.set(1, 1, .8); }

  // ---- a diorama: the room sits on a chunky wooden plinth in the dusk
  add(scene, RB(W + 1.6, .7, Dp + 1.6), 0xe6d3a2, 0, -.62, 0); add(scene, RB(W + 2.1, .18, Dp + 2.1), 0xcdb685, 0, -1.05, 0);
  for (const [cw, cd, cx, cz] of [[W + .9, .5, 0, -Dp / 2 - .2], [.5, Dp, -W / 2 - .2, 0], [.5, Dp, W / 2 + .2, 0]]) add(scene, RB(cw, .16, cd), 0xe9e4da, cx, HH + .02, cz);
  // ---- a blue spiral staircase with a copper rail, up to a little loft
  { const st = new THREE.Group(); scene.add(st); const NS = 12, cx = -5.5, cz = 2.6, a1 = 4.38, da = .5, pts = [];
    add(st, CY(.09, .09, 3.2, 8), 0xc0703a, cx, 1.6, cz);
    for (let i = 0; i < NS; i++) { const a = a1 - (NS - 1 - i) * da, y = .3 + i * .26, sx = cx + Math.cos(a) * .66, sz = cz + Math.sin(a) * .66; const stp = add(st, rbox(1.3, .1, .62, .03), 0x5a95c4, sx, y, sz); stp.rotation.y = -a; pts.push(new THREE.Vector3(cx + Math.cos(a) * 1.24, y + .95, cz + Math.sin(a) * 1.24)); }
    st.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .035, 5), std(0xc0703a)));
    add(st, rbox(1.9, .14, 1.7, .04), 0x5a95c4, -6.0, 3.2, .3); add(st, new THREE.TorusGeometry(.5, .04, 5, 12, PI), 0xc0703a, -5.2, 3.7, .3).rotation.y = PI / 2;
    add(st, CY(.5, .5, .04, 22), 0x3d7aa8, cx, .03, cz); }
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
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); const cl = new THREE.Mesh(RB(2.9, .02, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); cl.position.set(-1.9, 1.07, 1.1); cl.receiveShadow = true; scene.add(cl); add(scene, rbox(3.1, .62, 1.7, .05), 0xfffaf0, -1.9, .76, 1.1); add(scene, RB(3.12, .06, 1.72), 0x2f8a96, -1.9, .47, 1.1);
    const bk = new THREE.Group(); bk.position.set(-2.9, 0, -3.5); scene.add(bk); add(bk, CY(.5, .38, .5, 10), 0xc99a52, 0, .25, 0); for (let i = 0; i < 4; i++) add(bk, CY(.09, .09, .6, 6), 0x7d4c28, -.2 + i * .13, .6, 0).rotation.z = PI / 2 + i * .25;
    const kt = new THREE.Group(); kt.position.set(-4.0, .58, -1.3); scene.add(kt); add(kt, new THREE.SphereGeometry(.26, 10, 8), 0xcf7a3c, 0, .26, 0).scale.y = .85; add(kt, CY(.05, .09, .3, 6), 0xcf7a3c, .3, .36, 0).rotation.z = -.9; add(kt, new THREE.TorusGeometry(.17, .02, 5, 12, PI), 0x4a2a14, 0, .5, 0);
    const br = new THREE.Group(); br.position.set(6.2, 0, 3.3); scene.add(br); add(br, CY(.5, .56, .9, 10), 0x9a6232, 0, .45, 0); for (const y of [.15, .75]) add(br, new THREE.TorusGeometry(.53, .03, 5, 14), 0x3f3a36, 0, y, 0).rotation.x = PI / 2; add(br, CY(.46, .46, .04, 10), 0xb67a40, 0, .92, 0);
    add(scene, CY(.03, .03, 1.9, 5), 0x7d4c28, 2.6, .95, -4.2).rotation.z = .12; add(scene, CY(.14, .08, .4, 6), 0xd9b45a, 2.45, .15, -4.2);
    const ln = new THREE.Group(); ln.position.set(-1.9, 3.3, 1.1); scene.add(ln); add(ln, CY(.01, .01, .6, 3), 0x2b2b30, 0, .3, 0); add(ln, RB(.3, .38, .3), new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc860, emissiveIntensity: 1.2 }), 0, -.1, 0); add(ln, new THREE.ConeGeometry(.27, .2, 4), 0x2b2b30, 0, .18, 0).rotation.y = PI / 4;
    const ll = new THREE.PointLight(0xffc878, 1.3, 9); ll.position.set(-1.9, 3.1, 1.1); scene.add(ll); }
  // ---- soft sunbeams from the back windows
  for (const bx of [-3.6, 3.8]) { const bm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); bm.position.set(bx + 1.0, 1.6, -2.2); bm.rotation.set(-.55, 0, .25); scene.add(bm); }
  // ---- warm light, a sunny window, and a bed of soft shadow
  scene.add(new THREE.HemisphereLight(0xffe6c0, 0x6a4a3c, .8));
  const sun = new THREE.DirectionalLight(0xffe2a8, 1.9); sun.position.set(2, 8, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -.0008; scene.add(sun);
  // ---- orbit camera
  const view = { az: .2, pol: 1.05, dist: 12.5, tx: 0, ty: 1.3, tz: 0 };
  const smoke = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.14, 6, 5), new THREE.MeshBasicMaterial({ color: 0xcfcfd4, transparent: true, opacity: .0 })); m.userData.ph = i / 8; H0.add(m); smoke.push(m); }
  const update = (dt, t, size) => {
    view.az = Math.max(-1.15, Math.min(1.15, view.az)); view.pol = Math.max(.7, Math.min(1.45, view.pol)); view.dist = Math.max(6, Math.min(17, view.dist));
    camera.position.set(view.tx + Math.sin(view.az) * Math.sin(view.pol) * view.dist, view.ty + Math.cos(view.pol) * view.dist, view.tz + Math.cos(view.az) * Math.sin(view.pol) * view.dist); camera.lookAt(view.tx, view.ty, view.tz);
    camera.aspect = size.w / size.h; camera.fov = size.w / size.h < .8 ? 62 : 42; camera.updateProjectionMatrix();
    flames.forEach((f, i) => { const k = 1 + Math.sin(t * 9 + i * 1.7) * .16 + Math.sin(t * 15 + i) * .08; f.scale.set(1 / Math.sqrt(k), k, 1 / Math.sqrt(k)); f.position.y = .95 + (k - 1) * .3; f.rotation.z = Math.sin(t * 5 + i) * .07; });
    fire.intensity = 3.0 + Math.sin(t * 11) * .5 + Math.sin(t * 23) * .3; crane.rotation.y = Math.sin(t * .7) * .03; pot.position.y = -.28 + Math.sin(t * 1.3) * .006;
    smoke.forEach((m) => { const u = (t * .16 + m.userData.ph) % 1; m.position.set(Math.sin(u * 6 + m.userData.ph * 9) * .12, 3.2 + u * 1.6, -.1); m.scale.setScalar(.6 + u * 1.4); m.material.opacity = (1 - u) * .22 * Math.min(1, u * 6); });
    seatG.rotation.z = Math.sin(t * 1.15) * .035; gran.rotation.z = Math.sin(t * 1.15 + .4) * -.012; arms[0].rotation.x = 1.0 + Math.sin(t * 3.2) * .06; arms[1].rotation.x = 1.0 + Math.sin(t * 3.2 + 2) * .06; needles.rotation.y = Math.sin(t * 3.2) * .08; needles.rotation.x = Math.sin(t * 3.2 + 1) * .05;
    const wh = white.userData, bh = brown.userData; wh.tail.rotation.z = Math.sin(t * 1.3) * .22; wh.tail.rotation.y = Math.sin(t * .9) * .3; white.scale.y = 1 + Math.sin(t * 1.8) * .012; wh.head.rotation.z = Math.sin(t * .6) * .06; wh.head.rotation.y = Math.sin(t * .4) * .25;
    bh.tail.rotation.z = Math.sin(t * 4) * .3; brown.position.y = .02 + Math.max(0, Math.sin(t * 2.2)) * .06; brown.rotation.y = -2.6 + Math.sin(t * 1.1) * .2; ball.position.x = 2.55 + Math.sin(t * 2.2) * .04; ball.rotation.z = t * 2;
  };
  const dispose = () => { scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); };
  // ---- the soft, felted finish: smooth round surfaces, a velvet sheen and a fine fibre bump, like a plush toy
  const feltT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g2 = c.getContext('2d'); g2.fillStyle = '#808080'; g2.fillRect(0, 0, 128, 128); for (let i = 0; i < 900; i++) { const v = rnd() < .5 ? 40 : 220; g2.strokeStyle = `rgba(${v},${v},${v},${.12 + rnd() * .16})`; g2.lineWidth = .8; g2.beginPath(); const x = rnd() * 128, y = rnd() * 128, a2 = rnd() * 6.28; g2.moveTo(x, y); g2.lineTo(x + Math.cos(a2) * (2 + rnd() * 5), y + Math.sin(a2) * (2 + rnd() * 5)); g2.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; })();
  const mats = new Map(); scene.traverse((o) => { if (!o.isMesh || !o.material || Array.isArray(o.material)) return; const m = o.material; if (m.isMeshBasicMaterial) return; let c = mats.get(m); if (!c) { c = new THREE.MeshPhysicalMaterial({ color: m.color, map: m.map || null, emissive: m.emissive || new THREE.Color(0), emissiveIntensity: m.emissiveIntensity || 0, roughness: 1, metalness: 0, transparent: m.transparent, opacity: m.opacity, side: m.side, bumpMap: feltT, bumpScale: .6, sheen: 1, sheenRoughness: .55, sheenColor: new THREE.Color(m.color).lerp(new THREE.Color(0xfff3e4), .5) }); mats.set(m, c); } o.material = c; });
  return { scene, camera, view, update, dispose };
}
