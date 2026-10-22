// Contact page: a 3D bee that flies about with a soft shadow on the ground, in the manner of the bee on leoparpeix.com/about.
// A fruit (an orange, then a raisin, alternating) follows the pointer; a click/tap drops it, the bee pursues it, lands on it,
// eats it and flies off again. Built from primitives with three.js (no model files). start() returns a function that removes everything.
import * as THREE from './three.module.min.js';

export function start() {
  const S = { W: innerWidth, H: innerHeight, R: innerWidth < 600 ? 26 : 34 };
  const canvas = document.createElement('canvas');
  canvas.className = 'x-bee'; canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  document.body.appendChild(canvas);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6dccb, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4; sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.3, color: 0x142038 }));
  ground.receiveShadow = true; scene.add(ground);

  const matte = (color, vertex, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, vertexColors: !!vertex, roughness: 1, metalness: 0 }, extra || {}));

  // ---- the bee: nose along +y; heading group (rotation.z) > tilt group (head a little towards the viewer) > parts
  const bee = new THREE.Group(), tilt = new THREE.Group(), parts = new THREE.Group();
  bee.add(tilt); tilt.add(parts); scene.add(bee); tilt.rotation.x = 0.55;
  const striped = (sx, sy, sz, y0) => {
    const g = new THREE.SphereGeometry(1, 40, 32), pos = g.attributes.position, col = [], c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const band = Math.floor((y + 1) * 3.2);
      c.set(band % 2 === 0 ? '#f7c93e' : '#2a1d14');
      if (y < -0.82) c.set('#2a1d14');
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, matte(0xffffff, true)); m.scale.set(sx, sy, sz); m.position.y = y0; m.castShadow = true; return m;
  };
  parts.add(striped(0.42, 0.64, 0.42, -0.42));
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), matte(0xf2b72e)); thorax.scale.set(0.42, 0.4, 0.4); thorax.position.y = 0.28; thorax.castShadow = true; parts.add(thorax);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), matte(0xf4c04a)); head.scale.set(0.36, 0.33, 0.34); head.position.y = 0.72; head.castShadow = true; parts.add(head);
  [-1, 1].forEach((sd) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), matte(0x1d1410)); eye.scale.set(0.1, 0.12, 0.12); eye.position.set(sd * 0.21, 0.82, 0.14); parts.add(eye);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 8), matte(0x2a1d14)); ant.position.set(sd * 0.12, 1.02, 0.1); ant.rotation.z = -sd * 0.45; parts.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), matte(0x2a1d14)); tip.position.set(sd * 0.2, 1.17, 0.1); parts.add(tip);
  });
  const sting = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 10), matte(0x2a1d14)); sting.position.y = -1.08; sting.rotation.x = Math.PI; parts.add(sting);
  const wings = [];
  [-1, 1].forEach((sd) => {
    const pivot = new THREE.Group(); pivot.position.set(sd * 0.2, 0.3, 0.3);
    const w = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, transparent: true, opacity: 0.75 }));
    w.scale.set(0.62, 0.26, 0.02); w.position.set(sd * 0.55, -0.1, 0); w.castShadow = true;
    pivot.add(w); parts.add(pivot); wings.push({ pivot, sd });
  });

  // ---- fruits: an orange (with a leaf) and a raisin (wrinkled)
  const orange = new THREE.Group();
  { const o = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 32), matte(0xf49a22)); o.castShadow = true; orange.add(o);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), matte(0x5a9a3c)); leaf.scale.set(0.34, 0.16, 0.05); leaf.position.set(0.18, 0.12, 0.98); leaf.rotation.z = 0.5; orange.add(leaf); }
  const raisin = new THREE.Group();
  { const g = new THREE.SphereGeometry(1, 40, 32), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), n = 1 + 0.07 * Math.sin(x * 9 + z * 5) * Math.sin(y * 8 + x * 3); pos.setXYZ(i, x * 0.8 * n, y * 1.15 * n, z * 0.78 * n); }
    g.computeVertexNormals();
    const r = new THREE.Mesh(g, matte(0x5b2f55)); r.castShadow = true; raisin.add(r); }
  const fruitHolder = new THREE.Group(); fruitHolder.add(orange, raisin); scene.add(fruitHolder);
  fruitHolder.visible = false;

  function resize() {
    S.W = innerWidth; S.H = innerHeight; S.R = innerWidth < 600 ? 26 : 34;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(S.W, S.H, false);
    canvas.style.width = S.W + 'px'; canvas.style.height = S.H + 'px';
    camera.aspect = S.W / S.H;
    const dist = S.H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, 0, dist); camera.updateProjectionMatrix();
    ground.position.z = G.z = -S.R * 2.6; ground.scale.set(S.W * 3, S.H * 3, 1);
    sun.position.set(-S.R * 1.6, S.R * 2.6, S.R * 9); sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera, ext = Math.max(S.W, S.H) * 0.75;
    sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = S.R * 40; sc.updateProjectionMatrix();
  }
  const G = { z: 0 };
  resize();

  // ---- state; world units = pixels, origin at the middle of the screen, y up
  const toW = (x, y) => [x - S.W / 2, S.H / 2 - y];
  const b = { x: S.W * 0.6, y: S.H * 0.35, vx: 40, vy: 10, z: 0, head: 0, t: 0, mode: 'idle', eat: 0, fly: 0 };
  const f = { mode: 'hidden', n: 0, x: 0, y: 0, z: 0, vz: 0, s: 0, kind: null, rot: 0, landedT: 0, spin: 0 };
  const ptr = { x: S.W * 0.5, y: S.H * 0.5, seen: false, touch: false };
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function showCursorFruit() {
    f.kind = f.n++ % 2 === 0 ? orange : raisin;
    orange.visible = f.kind === orange; raisin.visible = f.kind === raisin;
    f.mode = 'cursor'; f.s = 0; f.z = S.R * 0.2; f.x = ptr.x; f.y = ptr.y; f.rot = 0; fruitHolder.visible = true;
  }
  function dropFruit() {
    if (f.mode !== 'cursor') return;
    f.mode = 'falling'; f.vz = 0; b.mode = 'chase';
  }
  const onMove = (e) => {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.touch = e.pointerType === 'touch';
    if (!ptr.seen && !ptr.touch) { ptr.seen = true; if (f.mode === 'hidden') showCursorFruit(); }
  };
  const onDown = (e) => {
    if (e.button || (e.target.closest && e.target.closest('a,button,input,textarea,select,.x-dial'))) return;
    ptr.x = e.clientX; ptr.y = e.clientY;
    if (e.pointerType === 'touch') { if (f.mode === 'hidden') { showCursorFruit(); } }
    dropFruit();
  };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown, { passive: true });
  addEventListener('resize', resize);

  function seek(tx, ty, maxSpeed, force, dt, arrive) {
    const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1;
    let sp = maxSpeed * (arrive ? Math.min(1, d / arrive) : 1);
    const ax = (dx / d * sp - b.vx) * Math.min(1, force * dt), ay = (dy / d * sp - b.vy) * Math.min(1, force * dt);
    b.vx += ax; b.vy += ay;
    return d;
  }

  function step(dt) {
    const R = S.R, slow = reduce ? 0.55 : 1;
    b.t += dt;
    // fruit
    if (f.mode === 'cursor') {
      const k = 1 - Math.exp(-14 * dt);
      f.x += (ptr.x - f.x) * k; f.y += (ptr.y - f.y) * k;
      f.s += (1 - f.s) * (1 - Math.exp(-9 * dt));
      f.rot += (Math.max(-0.5, Math.min(0.5, (ptr.x - f.x) / 60)) - f.rot) * Math.min(1, dt * 8);
    } else if (f.mode === 'falling') {
      f.vz -= 2600 * dt; f.z += f.vz * dt;
      const floor = G.z + R * 0.9 * (f.kind === orange ? 1 : 0.7);
      if (f.z <= floor) { f.z = floor; if (Math.abs(f.vz) > 260) f.vz = -f.vz * 0.32; else { f.vz = 0; f.mode = 'landed'; f.landedT = 0; } }
    } else if (f.mode === 'landed') {
      f.landedT += dt;
    } else if (f.mode === 'eaten') {
      f.s = Math.max(0, f.s - dt * 1.1);
      if (f.s <= 0) { f.mode = 'hidden'; fruitHolder.visible = false; if (ptr.seen || ptr.touch) { b.mode = 'idle'; showCursorFruit(); if (ptr.touch) { fruitHolder.visible = false; f.mode = 'hidden'; } } else b.mode = 'idle'; }
    }
    // bee
    const home = [S.W * 0.62 + Math.sin(b.t * 0.5) * S.W * 0.2, S.H * 0.42 + Math.sin(b.t * 0.8 + 1) * S.H * 0.18];
    let targetZ = 0;
    if (b.mode === 'idle') {
      seek(home[0], home[1], 130 * slow, 1.6, dt, 0);
      b.z += (0 - b.z) * Math.min(1, dt * 3);
    } else if (b.mode === 'chase') {
      const d = seek(f.x, f.y, 520 * slow, 5, dt, 0);
      if (f.mode === 'landed' || f.mode === 'falling') { /* keep pursuing the landing spot */ }
      if (f.mode === 'landed' && d < R * 1.1) { b.mode = 'eat'; b.eat = 0; }
      b.z += (R * 0.3 - b.z) * Math.min(1, dt * 3);
    } else if (b.mode === 'eat') {
      b.vx *= Math.exp(-6 * dt); b.vy *= Math.exp(-6 * dt);
      b.x += (f.x - b.x) * Math.min(1, dt * 6); b.y += (f.y - b.y) * Math.min(1, dt * 6);
      b.eat += dt;
      b.z += ((G.z + R * 1.5) - b.z) * Math.min(1, dt * 5);
      f.s = Math.max(0, 1 - Math.max(0, b.eat - 0.5) / 1.6);
      if (b.eat > 2.1) { f.mode = 'eaten'; b.mode = 'idle'; b.vy += 200; }
    }
    b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(b.t * 9) * 18 * dt;
    if (b.mode !== 'eat') {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 25) { const want = Math.atan2(-b.vy, b.vx) - Math.PI / 2; let dh = want - b.head; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); b.head += dh * Math.min(1, dt * 7); }
    }
    b.x = Math.max(-R, Math.min(S.W + R, b.x)); b.y = Math.max(-R, Math.min(S.H + R, b.y));
  }

  function pose() {
    const R = S.R, t = b.t, [wx, wy] = toW(b.x, b.y);
    const bob = Math.sin(t * 6) * R * 0.08;
    bee.position.set(wx, wy, b.z + bob);
    bee.scale.setScalar(R);
    bee.rotation.z = b.head;
    const sp = Math.hypot(b.vx, b.vy);
    tilt.rotation.x = 0.55 + Math.min(0.35, sp / 1500) + (b.mode === 'eat' ? 0.5 : 0);
    parts.rotation.y = Math.sin(t * 3) * 0.08;
    const flap = Math.sin(t * 75);
    wings.forEach((w) => { w.pivot.rotation.y = w.sd * (0.35 + flap * 0.55); w.pivot.rotation.z = w.sd * -0.15; });
    // fruit
    if (fruitHolder.visible) {
      const [fx, fy] = toW(f.x, f.y), base = f.kind === orange ? R * 0.75 : R * 0.62;
      const pop = f.s * f.s * (3 - 2 * f.s);
      fruitHolder.position.set(fx, fy, f.z);
      fruitHolder.scale.setScalar(Math.max(0.001, base * pop));
      fruitHolder.rotation.set(0, 0, f.rot * 0.6 + (f.mode === 'falling' ? f.vz * 0.0006 : 0));
    }
    // the cursor fruit hovers just above the page; a little bigger while it falls towards the ground
  }

  let raf = 0, last = performance.now(), dead = false;
  function frame(now) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    step(dt); pose(); renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return function stop() {
    dead = true; cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
    canvas.remove();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    renderer.dispose();
  };
}
