// Casa Martamon, by inside: a traditional Galician house made cosy. A stone hearth (lareira) with its big old hood (campana) and an iron pot, a wooden
// table with filloas, a dining corner with a grandmother knitting in a rocking chair, and two kittens: a fluffy white one and a small brown one.
// Built as a dolls-house cut-away that you can turn with the mouse or a finger.
export function buildCasa(THREE, D) {
  const { std, rbox, PI } = D;
  let sd = 21; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf3dfc2);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 80);
  const add = (parent, geo, col, x, y, z, extra) => { const o = new THREE.Mesh(geo, typeof col === 'number' ? std(col, extra) : col); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const tex = (draw, w, h, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
  // ---- the room: wood floor, granite and lime-washed walls, rafters
  const W = 14, Dp = 9, HH = 3.7;
  const floorT = tex((g, w, h) => { g.fillStyle = '#c99a62'; g.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(${90 + rnd() * 40},${60 + rnd() * 30},${30},${.12 + rnd() * .1})`; g.fillRect(0, i * h / 14, w, h / 14 - 2); g.fillStyle = 'rgba(70,45,25,.5)'; g.fillRect(0, i * h / 14 - 1, w, 2); } for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(70,45,25,.15)'; g.fillRect(rnd() * w, rnd() * h, 14 + rnd() * 50, 1.5); } }, 256, 256, [4, 2.2]);
  const floor = add(scene, new THREE.BoxGeometry(W, .3, Dp), new THREE.MeshStandardMaterial({ map: floorT, roughness: .85 }), 0, -.15, 0); floor.castShadow = false;
  const stoneT = tex((g, w, h) => { g.fillStyle = '#b9b2a2'; g.fillRect(0, 0, w, h); let y = 0; while (y < h) { const rh = 26 + rnd() * 18; let x = -rnd() * 50; while (x < w) { const sw = 50 + rnd() * 50, v = 168 + rnd() * 40; g.fillStyle = `rgb(${v},${v - 4},${v - 16})`; g.fillRect(x + 2, y + 2, sw - 4, rh - 4); x += sw; } y += rh; } }, 256, 256, [4, 1]);
  const plaster = std(0xf6ead2), stoneM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 1 }), wood = std(0x9a6f45), darkWood = std(0x6b4a2e);
  const wallBack = new THREE.Group(), wallLeft = new THREE.Group(), wallRight = new THREE.Group(); scene.add(wallBack, wallLeft, wallRight);
  add(wallBack, new THREE.BoxGeometry(W, 1.3, .4), stoneM, 0, .65, -Dp / 2 - .2); add(wallBack, new THREE.BoxGeometry(W, HH - 1.3, .4), plaster, 0, 1.3 + (HH - 1.3) / 2, -Dp / 2 - .2);
  add(wallLeft, new THREE.BoxGeometry(.4, 1.3, Dp), stoneM, -W / 2 - .2, .65, 0); add(wallLeft, new THREE.BoxGeometry(.4, HH - 1.3, Dp), plaster, -W / 2 - .2, 1.3 + (HH - 1.3) / 2, 0);
  add(wallRight, new THREE.BoxGeometry(.4, 1.3, Dp), stoneM, W / 2 + .2, .65, 0); add(wallRight, new THREE.BoxGeometry(.4, HH - 1.3, Dp), plaster, W / 2 + .2, 1.3 + (HH - 1.3) / 2, 0);
  for (let i = -3; i <= 3; i++) add(scene, new THREE.BoxGeometry(.28, .32, Dp + .3), darkWood, i * 2.2, HH - .16, 0);                    // the rafters
  add(scene, new THREE.BoxGeometry(W, .28, .28), darkWood, 0, HH - .5, -Dp / 2 + .2);
  // ---- windows with white frames, small panes, lace curtains, shutters and flowers on the sill
  const win = (parent, x, y, z, ry, w, h) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    add(g, new THREE.BoxGeometry(w, h, .08), new THREE.MeshStandardMaterial({ color: 0xcfeaf6, emissive: 0xcfeaf6, emissiveIntensity: .9, roughness: 1 }), 0, 0, -.2).castShadow = false;
    const fr = 0xfaf4e8; add(g, new THREE.BoxGeometry(w + .24, .12, .22), fr, 0, h / 2 + .06, 0); add(g, new THREE.BoxGeometry(w + .24, .12, .22), fr, 0, -h / 2 - .06, 0); add(g, new THREE.BoxGeometry(.12, h, .22), fr, -w / 2 - .06, 0, 0); add(g, new THREE.BoxGeometry(.12, h, .22), fr, w / 2 + .06, 0, 0);
    for (let i = 1; i < 3; i++) add(g, new THREE.BoxGeometry(.06, h, .12), fr, -w / 2 + i * w / 3, 0, 0); add(g, new THREE.BoxGeometry(w, .06, .12), fr, 0, 0, 0); add(g, new THREE.BoxGeometry(w + .5, .1, .5), 0xf0e4cc, 0, -h / 2 - .2, .2);
    for (const sx of [-1, 1]) { add(g, new THREE.BoxGeometry(.5, h + .2, .06), 0x6f9db6, sx * (w / 2 + .35), 0, .18); add(g, new THREE.BoxGeometry(.34, h - .15, .05), 0xfff8ea, sx * (w / 2 - .12), .05, .12, { transparent: true, opacity: .85 }); }
    const pot = add(g, new THREE.CylinderGeometry(.14, .1, .2, 8), 0xc9674f, -w / 4, -h / 2 - .05, .24); for (let k = 0; k < 6; k++) add(g, new THREE.IcosahedronGeometry(.1, 1), [0xf59ab8, 0xffffff, 0xf2c14a][k % 3], -w / 4 + (k - 2.5) * .06, -h / 2 + .12 + (k % 2) * .06, .24);
    const lamp = new THREE.PointLight(0xfff0d0, .55, 9); lamp.position.set(0, 0, .6); g.add(lamp); return g; };
  win(wallBack, -3.6, 2.0, -Dp / 2 + .02, 0, 1.7, 1.4); win(wallBack, 3.8, 2.0, -Dp / 2 + .02, 0, 1.7, 1.4); win(wallLeft, -W / 2 + .02, 2.0, -1.8, PI / 2, 1.5, 1.3); win(wallRight, W / 2 - .02, 2.0, -1.4, -PI / 2, 1.5, 1.3);
  // ---- the hearth (lareira): a granite platform, the fire, the iron pot on its crane, and the great hood (campana) rising into a chimney
  const H0 = new THREE.Group(); H0.position.set(-5.2, 0, -2.3); scene.add(H0);
  add(H0, new THREE.BoxGeometry(3.6, .45, 2.4), std(0xc9c1b0), 0, .22, 0); add(H0, new THREE.BoxGeometry(3.0, .12, 1.9), std(0xaaa391), 0, .5, 0);
  for (let i = 0; i < 6; i++) add(H0, new THREE.BoxGeometry(.55, .5, .06), 0x8c8576, -1.4 + i * .56, .25, 1.22);
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(.55, 1.95, 1.9, 4, 1, true), new THREE.MeshStandardMaterial({ color: 0xe9dfc8, roughness: 1, side: THREE.DoubleSide, map: stoneT })); hood.rotation.y = PI / 4; hood.scale.set(1.0, 1, .8); hood.position.set(0, 2.55, 0); hood.castShadow = true; H0.add(hood);
  add(H0, new THREE.BoxGeometry(1.0, 1.4, .9), std(0xe9dfc8), 0, 3.9, -.1); add(H0, new THREE.BoxGeometry(3.7, .2, 2.6), std(0x6b4a2e), 0, 1.58, 0);
  for (let i = 0; i < 7; i++) add(H0, new THREE.CylinderGeometry(.03, .03, .9, 4), 0x3a3a3f, -1.4 + i * .47, 1.25, 1.2);
  for (const [lx, lz, r] of [[-.35, 0, .2], [.3, .1, .18], [0, -.3, .16]]) add(H0, new THREE.CylinderGeometry(r, r, .9, 7), 0x6b4a2e, lx, .62, lz).rotation.z = PI / 2 + lz;
  const flames = []; for (let i = 0; i < 6; i++) { const f = add(H0, new THREE.ConeGeometry(.2 + (i % 3) * .05, .75 + (i % 2) * .25, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffb347 : 0xff7a2a, emissive: i % 2 ? 0xffc15e : 0xff7a2a, emissiveIntensity: 1.4, transparent: true, opacity: .92 }), -.5 + i * .2, .95, -.1 + (i % 2) * .15); f.castShadow = false; flames.push(f); }
  const fire = new THREE.PointLight(0xff8a3a, 3.2, 12, 1.6); fire.position.set(-5.2, 1.4, -1.2); fire.castShadow = false; scene.add(fire);
  const crane = new THREE.Group(); crane.position.set(.9, 1.5, -.3); H0.add(crane); add(crane, new THREE.CylinderGeometry(.04, .04, 1.3, 5), 0x2b2b30, 0, -.2, 0); add(crane, new THREE.BoxGeometry(1.1, .06, .06), 0x2b2b30, -.5, .45, 0);
  add(crane, new THREE.CylinderGeometry(.015, .015, .6, 4), 0x2b2b30, -.95, .15, 0); const pot = add(crane, new THREE.SphereGeometry(.42, 12, 8, 0, PI * 2, PI * .15, PI * .8), new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: .5, metalness: .4, side: THREE.DoubleSide }), -.95, -.28, 0); pot.scale.y = .85;
  add(crane, new THREE.TorusGeometry(.4, .03, 6, 16), 0x24242a, -.95, -.02, 0).rotation.x = PI / 2;
  // ---- the wooden table with filloas, a jug, honey and bread, a bench and stools
  const T = new THREE.Group(); T.position.set(-1.9, 0, 1.1); scene.add(T);
  add(T, rbox(2.9, .14, 1.5, .05), 0xb78452, 0, .98, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(T, new THREE.CylinderGeometry(.07, .1, .98, 8), darkWood, sx * 1.25, .49, sz * .6);
  add(T, new THREE.BoxGeometry(2.4, .08, .08), darkWood, 0, .35, 0);
  const plate = add(T, new THREE.CylinderGeometry(.5, .42, .05, 18), 0xf6efe0, -.3, 1.08, .1); add(T, new THREE.TorusGeometry(.46, .025, 6, 20), 0x4f8fc0, -.3, 1.1, .1).rotation.x = PI / 2;
  for (let i = 0; i < 7; i++) { const f = add(T, new THREE.CylinderGeometry(.34 - i * .004, .34 - i * .004, .022, 20), [0xe6bd72, 0xf0cf8e, 0xdcae5e][i % 3], -.3 + (i % 2) * .015, 1.115 + i * .021, .1 + (i % 3) * .01); f.castShadow = true; }
  for (let k = 0; k < 2; k++) { const fo = add(T, new THREE.CylinderGeometry(.2, .2, .03, 14, 1, false, 0, PI), 0xe2b565, .5 + k * .45, 1.08, -.25 + k * .1); fo.rotation.z = PI / 2; fo.rotation.y = k * 1.4; add(T, new THREE.SphereGeometry(.07, 6, 5), 0xfff8ea, .5 + k * .45, 1.15, -.25 + k * .1); }
  add(T, new THREE.CylinderGeometry(.16, .2, .4, 10), 0xf6efe0, .95, 1.25, .35); add(T, new THREE.SphereGeometry(.1, 6, 5), 0xf6efe0, 1.08, 1.4, .35);
  add(T, new THREE.CylinderGeometry(.12, .12, .2, 8), 0xe0a63c, 1.0, 1.15, -.35); add(T, new THREE.CylinderGeometry(.13, .13, .04, 8), 0x8a6a44, 1.0, 1.27, -.35);
  const bread = add(T, new THREE.SphereGeometry(.3, 10, 8), 0xd9a45a, .5, 1.2, .45); bread.scale.y = .55;
  for (const sz of [-1, 1]) add(T, new THREE.CylinderGeometry(.09, .08, .1, 8), 0xc9674f, -1.0, 1.1, sz * .3);
  add(T, rbox(2.8, .12, .42, .04), 0xa77848, 0, .62, 1.05); for (const sx of [-1, 1]) add(T, new THREE.BoxGeometry(.12, .62, .4), darkWood, sx * 1.25, .31, 1.05);
  for (const [sx, sz] of [[1.9, .3], [1.5, -1.0]]) { const g = new THREE.Group(); g.position.set(sx, 0, sz); T.add(g); add(g, new THREE.CylinderGeometry(.26, .26, .08, 12), darkWood, 0, .6, 0); for (let k = 0; k < 3; k++) { const a = k * 2.1; add(g, new THREE.CylinderGeometry(.03, .04, .6, 5), darkWood, Math.cos(a) * .18, .3, Math.sin(a) * .18); } }
  // ---- kitchen shelf, strings of onions and peppers, cupboard
  const sh = new THREE.Group(); sh.position.set(-1.0, 1.9, -Dp / 2 + .25); scene.add(sh); add(sh, new THREE.BoxGeometry(2.6, .08, .4), darkWood, 0, 0, 0);
  for (let k = 0; k < 6; k++) add(sh, new THREE.CylinderGeometry(.12, .09, .16, 8), [0xf6efe0, 0x4f8fc0, 0xc9674f, 0xf6efe0, 0xe0a63c, 0x4f8fc0][k], -1.05 + k * .42, .13, 0);
  for (let k = 0; k < 4; k++) { const s = new THREE.Group(); s.position.set(-5.6 + k * .5, HH - .55, -3.2 + (k % 2) * .5); scene.add(s); add(s, new THREE.CylinderGeometry(.008, .008, .5, 3), 0x8a6a44, 0, -.25, 0); for (let q = 0; q < 4; q++) add(s, new THREE.IcosahedronGeometry(.07 + (q % 2) * .02, 1), k % 2 ? 0xe0a63c : 0xc9473a, 0, -.15 - q * .12, (q % 2) * .02); }
  const cup = new THREE.Group(); cup.position.set(1.2, 0, -Dp / 2 + .45); scene.add(cup); add(cup, rbox(1.6, 2.5, .7, .05), 0x7a8f6a, 0, 1.25, 0); for (const sx of [-.4, .4]) add(cup, new THREE.BoxGeometry(.7, 1.0, .06), 0x6a7d5b, sx, 1.7, .38); for (const sx of [-.4, .4]) add(cup, new THREE.SphereGeometry(.05, 6, 5), 0xe9dcc2, sx * .5, 1.7, .42);
  // ---- the dining corner: a rug, the rocking chair with the grandmother knitting, a little table with a lamp
  const rug = add(scene, new THREE.CylinderGeometry(2.4, 2.4, .03, 36), 0xd9806a, 3.3, .02, .9); add(scene, new THREE.CylinderGeometry(1.8, 1.8, .035, 36), 0xf0d9a8, 3.3, .025, .9); add(scene, new THREE.CylinderGeometry(1.1, 1.1, .04, 36), 0x6f9db6, 3.3, .03, .9); rug.castShadow = false;
  const chair = new THREE.Group(); chair.position.set(3.3, 0, .6); chair.rotation.y = -.35; scene.add(chair);
  const seatG = new THREE.Group(); chair.add(seatG);
  add(seatG, rbox(1.0, .12, .95, .04), 0xb27e4a, 0, .68, 0); add(seatG, rbox(1.0, 1.15, .1, .04), 0xb27e4a, 0, 1.28, -.45); for (let i = 0; i < 5; i++) add(seatG, new THREE.BoxGeometry(.06, 1.0, .06), darkWood, -.36 + i * .18, 1.3, -.4);
  for (const sx of [-1, 1]) { add(seatG, new THREE.BoxGeometry(.08, .08, .8), darkWood, sx * .52, 1.0, .05); add(seatG, new THREE.CylinderGeometry(.04, .04, .35, 6), darkWood, sx * .52, .84, .38); const rk = add(seatG, new THREE.TorusGeometry(1.3, .045, 6, 24, PI * .42), darkWood, sx * .46, -.35, 0); rk.rotation.set(0, PI / 2, PI / 2 + PI * .29); add(seatG, new THREE.CylinderGeometry(.04, .04, .65, 5), darkWood, sx * .46, .35, -.15); }
  const gran = new THREE.Group(); gran.position.set(0, .75, .02); seatG.add(gran);
  const dress = add(gran, new THREE.SphereGeometry(.42, 14, 10), 0x5a6a8a, 0, .38, 0); dress.scale.set(1, 1.25, .9);
  add(gran, new THREE.CylinderGeometry(.42, .5, .5, 14), 0x5a6a8a, 0, .1, .1);
  const apron = add(gran, new THREE.CylinderGeometry(.3, .38, .46, 12, 1, false, -.9, 1.8), 0xfaf4e8, 0, .12, .28); apron.rotation.y = PI / 2 - .15;
  const shawl = add(gran, new THREE.SphereGeometry(.4, 12, 8, 0, PI * 2, 0, PI * .55), 0xb98a78, 0, .72, 0); shawl.scale.set(1.05, .9, 1);
  add(gran, new THREE.SphereGeometry(.23, 12, 10), 0xf2c9a2, 0, 1.12, .05); for (const sx of [-1, 1]) { add(gran, new THREE.SphereGeometry(.035, 6, 5), 0x2b2530, sx * .08, 1.14, .26); add(gran, new THREE.SphereGeometry(.045, 6, 5), 0xf0a0a0, sx * .13, 1.07, .24).scale.set(1, .6, .5); const lens = add(gran, new THREE.TorusGeometry(.065, .01, 5, 12), 0x3a3a3f, sx * .08, 1.14, .275); lens.castShadow = false; }
  add(gran, new THREE.CylinderGeometry(.012, .012, .16, 4), 0x3a3a3f, 0, 1.14, .28).rotation.z = PI / 2;
  const hair = add(gran, new THREE.SphereGeometry(.245, 12, 8, 0, PI * 2, 0, PI * .55), 0xe3e3e8, 0, 1.15, -.01); hair.rotation.x = -.25; add(gran, new THREE.SphereGeometry(.11, 8, 6), 0xe3e3e8, 0, 1.3, -.17);
  const needles = new THREE.Group(); needles.position.set(0, .62, .5); gran.add(needles); for (const sx of [-1, 1]) { const nd = add(needles, new THREE.CylinderGeometry(.01, .01, .55, 4), 0xcfcfd4, sx * .1, 0, 0); nd.rotation.z = sx * .7; }
  add(needles, new THREE.BoxGeometry(.4, .26, .06), 0xe9577a, 0, -.12, .02);
  const arms = []; for (const sx of [-1, 1]) { const a = add(gran, new THREE.CylinderGeometry(.075, .065, .62, 7), 0x5a6a8a, sx * .36, .72, .26); a.rotation.set(1.0, 0, sx * -.25); arms.push(a); add(gran, new THREE.SphereGeometry(.07, 6, 5), 0xf2c9a2, sx * .2, .64, .5); }
  for (const sx of [-1, 1]) add(gran, new THREE.SphereGeometry(.12, 8, 6), 0xc9a0a0, sx * .2, -.18, .55).scale.set(.9, .55, 1.4);
  const ball = add(scene, new THREE.SphereGeometry(.17, 12, 10), 0xe9577a, 2.55, .2, 1.55); ball.castShadow = true; const thread = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2.55, .3, 1.55), new THREE.Vector3(2.8, .3, 1.35), new THREE.Vector3(3.1, .55, 1.15), new THREE.Vector3(3.3, 1.0, 1.1)]), 14, .007, 4), std(0xe9577a)); scene.add(thread);
  const side = new THREE.Group(); side.position.set(5.3, 0, 1.0); scene.add(side); add(side, new THREE.CylinderGeometry(.42, .42, .06, 14), darkWood, 0, .85, 0); add(side, new THREE.CylinderGeometry(.06, .1, .85, 6), darkWood, 0, .42, 0); add(side, new THREE.CylinderGeometry(.14, .17, .14, 8), 0xf6efe0, 0, .95, 0);
  const lampShade = add(side, new THREE.CylinderGeometry(.2, .3, .38, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0xffe3b0, emissive: 0xffd08a, emissiveIntensity: .9, side: THREE.DoubleSide }), 0, 1.25, 0); const lampL = new THREE.PointLight(0xffd9a0, 1.5, 8); lampL.position.set(5.3, 2.2, 1.0); scene.add(lampL);
  // ---- big plants, pictures, a clock
  for (const [px, pz, c] of [[6.3, -3.4, 0x8fa9e8], [-6.4, 3.0, 0xf59ab8]]) { const g = new THREE.Group(); g.position.set(px, 0, pz); scene.add(g); add(g, new THREE.CylinderGeometry(.34, .26, .5, 10), 0xc9674f, 0, .25, 0); for (let k = 0; k < 9; k++) add(g, new THREE.IcosahedronGeometry(.28, 1), k % 3 ? 0x5fae8a : c, Math.cos(k * 2.4) * .3, .8 + (k % 3) * .25, Math.sin(k * 2.4) * .3); }
  for (const [px, py, col] of [[-6.0, 2.7, 0xcfe0ea], [2.2, 2.9, 0xf2d4c4], [6.0, 2.8, 0xe3efe6]]) { add(wallBack, new THREE.BoxGeometry(.9, 1.1, .08), 0x6b4a2e, px, py, -Dp / 2 + .03); add(wallBack, new THREE.BoxGeometry(.72, .92, .09), col, px, py, -Dp / 2 + .05).castShadow = false; }
  const clock = new THREE.Group(); clock.position.set(5.8, 3.0, -Dp / 2 + .08); scene.add(clock); add(clock, new THREE.CylinderGeometry(.28, .28, .1, 20), 0x6b4a2e, 0, 0, 0).rotation.x = PI / 2; add(clock, new THREE.CylinderGeometry(.23, .23, .11, 20), 0xfff8ea, 0, 0, .01).rotation.x = PI / 2; add(clock, new THREE.BoxGeometry(.03, .18, .02), 0x2b2b30, 0, .06, .07); add(clock, new THREE.BoxGeometry(.14, .03, .02), 0x2b2b30, .04, 0, .07);
  // ---- the two kittens
  const cat = (fur, belly, eye, scale, fluffy) => {
    const g = new THREE.Group(), body = add(g, new THREE.SphereGeometry(.3, 12, 10), fur, 0, .27, 0); body.scale.set(1.2, 1, .95);
    const head = new THREE.Group(); head.position.set(.3, .5, 0); g.add(head); add(head, new THREE.SphereGeometry(.22, 12, 10), fur, 0, 0, 0).scale.set(1.05, .95, 1.05);
    for (const sz of [-1, 1]) { add(head, new THREE.ConeGeometry(.08, .17, 4), fur, -.02, .2, sz * .13).rotation.set(sz * .22, 0, -.1); add(head, new THREE.ConeGeometry(.045, .1, 4), 0xf4b6b6, -.01, .19, sz * .13).rotation.set(sz * .22, 0, -.1); const ey = add(head, new THREE.SphereGeometry(.036, 8, 6), eye, .18, .03, sz * .085); add(head, new THREE.SphereGeometry(.018, 6, 5), 0x1b1b20, .2, .03, sz * .085); add(head, new THREE.SphereGeometry(.014, 5, 4), 0xffffff, .205, .045, sz * .075); ey.castShadow = false; add(head, new THREE.SphereGeometry(.05, 6, 5), 0xf4b6b6, .17, -.04, sz * .17).scale.set(.5, .6, 1); }
    add(head, new THREE.SphereGeometry(.03, 6, 5), 0xf08a9a, .22, -.03, 0); add(head, new THREE.SphereGeometry(.12, 8, 6), belly, .13, -.08, 0).scale.set(.9, .7, .9);
    for (const sz of [-1, 1]) { add(g, new THREE.CylinderGeometry(.06, .07, .22, 6), fur, .22, .11, sz * .13); add(g, new THREE.CylinderGeometry(.065, .07, .16, 6), fur, -.2, .08, sz * .17); }
    const tail = new THREE.Group(); tail.position.set(-.34, .3, 0); g.add(tail); for (let i = 0; i < 6; i++) add(tail, new THREE.SphereGeometry(.075 - i * .004 + (fluffy ? .03 : 0), 7, 6), fur, -.07 * i, .06 * i + .02 * Math.sin(i), 0);
    if (fluffy) for (let i = 0; i < 36; i++) { const a = rnd() * 6.28, b = rnd() * PI, r = .31; const f = add(g, new THREE.IcosahedronGeometry(.09 + rnd() * .05, 1), fur, Math.cos(a) * Math.sin(b) * r * 1.2, .28 + Math.cos(b) * r * .9, Math.sin(a) * Math.sin(b) * r); f.castShadow = false; }
    if (fluffy) for (let i = 0; i < 10; i++) { const a = i * .63; add(head, new THREE.IcosahedronGeometry(.07, 1), fur, Math.cos(a) * .1, -.1 + Math.sin(a) * .02, Math.sin(a) * .2); }
    g.scale.setScalar(scale); g.userData = { head, tail }; return g; };
  const white = cat(0xfaf6ee, 0xffffff, 0x6fb4e6, 1.0, true); white.position.set(-3.3, .02, 2.9); white.rotation.y = .6; scene.add(white);
  const brown = cat(0x8c6a48, 0xcdb08a, 0x7cc47a, .62, false); brown.position.set(2.0, .02, 1.7); brown.rotation.y = -2.6; scene.add(brown);
  for (let i = 0; i < 7; i++) { const st = add(brown, new THREE.BoxGeometry(.04, .02, .22), 0x4a3524, -.1 + i * .08, .55, 0); st.rotation.z = .1; st.castShadow = false; st.scale.set(1, 1, .8); }
  // ---- warm light, a sunny window, and a bed of soft shadow
  scene.add(new THREE.HemisphereLight(0xfff0d6, 0x8a6a4c, 1.0));
  const sun = new THREE.DirectionalLight(0xfff0c8, 1.6); sun.position.set(2, 8, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -.0008; scene.add(sun);
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
  return { scene, camera, view, update, dispose };
}
