// Contact page: a 3D matte pufferfish (built from primitives, no model file) that swims about the page with a soft shadow,
// can be picked up and puffs up. Loaded on demand by extras.js; start() returns a function that removes everything.
import * as THREE from './three.module.min.js';

export function start() {
  const mobile = innerWidth < 600;
  const S = { W: innerWidth, H: innerHeight, R: mobile ? 46 : 64 };
  const canvas = document.createElement('canvas');
  canvas.className = 'x-fish'; canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  const hit = document.createElement('div');
  hit.className = 'x-fish-hit'; hit.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas); document.body.appendChild(hit);

  // ---- lights: soft sky light for the volume, one directional light that casts the shadow onto a plane behind the fish
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9c2e6, 1.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 5; sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.2, color: 0x142038 }));
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- the fish. Matte: roughness 1, no specular; the colour gradient is painted on the vertices
  const matte = (color, vertex) => new THREE.MeshStandardMaterial({ color, vertexColors: !!vertex, roughness: 1, metalness: 0 });
  const root = new THREE.Group();      // position, heading
  const body = new THREE.Group();      // squash / puff
  root.add(body);
  scene.add(root);
  const bodyGeo = new THREE.SphereGeometry(1, 72, 56);
  {
    const pos = bodyGeo.attributes.position, col = [], c = new THREE.Color();
    const stops = [[-1, '#b873cb'], [-0.55, '#e3a6d3'], [-0.1, '#f7dcd7'], [0.45, '#e2e8f6'], [1, '#c9d9f3']];
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // rounder at the front, slightly drawn out at the back, a soft bulge under the chin
      const k = z > 0 ? 1 : 1 + z * 0.0;
      pos.setXYZ(i, x * 0.97, y * (0.93 - 0.04 * Math.max(0, z)), z * 1.0 * k);
      let j = 0; while (j < stops.length - 2 && y > stops[j + 1][0]) j++;
      const a = stops[j], b = stops[j + 1], t = Math.max(0, Math.min(1, (y - a[0]) / (b[0] - a[0])));
      c.set(a[1]).lerp(new THREE.Color(b[1]), t);
      // faint blush on the cheeks
      const cheek = Math.max(0, 1 - Math.hypot(Math.abs(x) - 0.62, y + 0.1, z - 0.55) / 0.42);
      c.lerp(new THREE.Color('#f59bb8'), cheek * 0.55);
      col.push(c.r, c.g, c.b);
    }
    bodyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    bodyGeo.computeVertexNormals();
  }
  const bodyMesh = new THREE.Mesh(bodyGeo, matte(0xffffff, true));
  bodyMesh.castShadow = true;
  body.add(bodyMesh);

  // eyes: big cream spheres on the top front, with matte black pupils (no highlights) and a lid that closes to blink
  const eyes = [];
  [-1, 1].forEach((sd) => {
    const g = new THREE.Group();
    g.position.set(sd * 0.5, 0.3, 0.66);
    g.lookAt(sd * 1.6, 0.7, 2.4);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 40, 32), matte(0xfbeee9));
    ball.castShadow = true;
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 24), matte(0x1b1422));
    pupil.position.set(0, 0, 0.3); pupil.scale.z = 0.4;
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.362, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), matte(0xeed0d2));
    lid.rotation.x = -Math.PI / 2; lid.scale.set(1, 1, 0.001);
    g.add(ball, pupil, lid);
    body.add(g);
    eyes.push({ g, pupil, lid });
  });
  // pursed lips
  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.05, 20, 36), matte(0xe88a9e));
  lips.position.set(0, -0.2, 0.97); body.add(lips);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), matte(0x7a2f47));
  mouth.position.set(0, -0.2, 0.99); body.add(mouth);
  // fins and tail: flattened ellipsoids on pivots
  const blue = 0xa5c4ea;
  const fin = (sx, sy, sz, px, py, pz) => {
    const pivot = new THREE.Group(); pivot.position.set(px, py, pz);
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), matte(blue));
    m.scale.set(sx, sy, sz); m.castShadow = true; pivot.add(m); body.add(pivot);
    return { pivot, m };
  };
  const finL = fin(0.08, 0.3, 0.38, -0.95, -0.12, 0.05); finL.m.position.set(-0.04, -0.02, -0.18);
  const finR = fin(0.08, 0.3, 0.38, 0.95, -0.12, 0.05); finR.m.position.set(0.04, -0.02, -0.18);
  const tail = fin(0.06, 0.46, 0.5, 0, 0.0, -0.93); tail.m.position.set(0, 0, -0.38);
  const dorsal = fin(0.05, 0.3, 0.3, 0, 0.9, -0.18); dorsal.m.position.set(0, 0.12, -0.05);
  // spikes: only show when puffed up
  const spikes = new THREE.Group(); body.add(spikes);
  const spikeGeo = new THREE.ConeGeometry(0.075, 0.3, 10), spikeMat = matte(0xe8bdca), up = new THREE.Vector3(0, 1, 0);
  const N = 70;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    const d = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    if (d.z > 0.55 && Math.abs(d.x) < 0.8 && d.y > -0.1) continue;   // keep the face clear
    const sp = new THREE.Mesh(spikeGeo, spikeMat);
    sp.position.copy(d).multiplyScalar(0.98);
    sp.quaternion.setFromUnitVectors(up, d);
    sp.castShadow = true; spikes.add(sp);
  }
  // bubbles
  const bubGeo = new THREE.SphereGeometry(1, 14, 10), bubMat = new THREE.MeshBasicMaterial({ color: 0xcfe4ff, transparent: true, opacity: 0.45, depthWrite: false });
  const bubbles = [];
  for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(bubGeo, bubMat.clone()); m.visible = false; scene.add(m); bubbles.push({ m, life: 9, max: 1, vx: 0, vy: 0, r: 1 }); }
  let bubIdx = 0;
  function bubble(x, y, r, vy) {
    const b = bubbles[bubIdx++ % bubbles.length];
    b.life = 0; b.max = 1.6 + Math.random(); b.vx = (Math.random() - 0.5) * 30; b.vy = vy; b.r = r; b.x = x; b.y = y; b.m.visible = true;
  }

  // ---- state (screen pixels, y down)
  const f = {
    x: S.W * 0.68, y: S.H * 0.4, vx: 0, vy: 0, dir: -1, face: -1, t: 0, ph: 0, infl: 0, inflV: 0, pop: 0,
    ty: S.H * 0.4, tyT: 0, turnT: 3 + Math.random() * 4, blink: 2, blinkT: 0, ex: 0, ey: 0, px: S.W / 2, py: S.H / 2,
    held: false, gx: 0, gy: 0, rot: 0, pitch: 0, bubT: 1.5,
    slow: matchMedia('(prefers-reduced-motion:reduce)').matches ? 0.5 : 1
  };
  function puff() { for (let i = 0; i < 7; i++) bubble(f.x + (Math.random() - 0.5) * S.R * 1.6, f.y - S.R * (0.6 + Math.random() * 0.6), 2 + Math.random() * 5, 40 + Math.random() * 70); }

  function resize() {
    S.W = innerWidth; S.H = innerHeight; S.R = innerWidth < 600 ? 46 : 64;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.setSize(S.W, S.H, false);
    canvas.style.width = S.W + 'px'; canvas.style.height = S.H + 'px';
    camera.aspect = S.W / S.H;
    const dist = S.H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));   // world units = pixels on the z = 0 plane
    camera.position.set(0, 0, dist); camera.updateProjectionMatrix();
    const gz = -S.R * 1.7;                                  // the shadow plane, behind the fish
    ground.position.z = gz; ground.scale.set(S.W * 3, S.H * 3, 1);
    sun.position.set(-S.R * 1.3, S.R * 2.6, S.R * 7); sun.target.position.set(0, 0, 0);
    const sc = sun.shadow.camera, ext = Math.max(S.W, S.H) * 0.75;
    sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = S.R * 30; sc.updateProjectionMatrix();
    hit.style.width = S.R * 2.5 + 'px'; hit.style.height = S.R * 2.3 + 'px';
  }
  resize();

  function step(dt) {
    const R = S.R, m = R * 1.7;
    f.t += dt; f.turnT -= dt;
    if (f.x < m) f.dir = 1; else if (f.x > S.W - m) f.dir = -1; else if (f.turnT < 0) { f.dir = -f.dir; f.turnT = 4 + Math.random() * 6; }
    f.tyT -= dt;
    if (f.tyT < 0) { f.ty = S.H * (0.16 + Math.random() * 0.68); f.tyT = 3 + Math.random() * 4; }
    const beat = 0.55 + 0.45 * Math.max(0, Math.sin(f.ph * 0.5));
    const sp = 75 * beat * f.slow * (1 - Math.min(0.75, f.infl * 0.5));
    if (!f.held) {
      f.vx += (f.dir * sp - f.vx) * Math.min(1, dt * 2.2);
      f.vy += ((f.ty - f.y) * 0.8 - f.vy) * Math.min(1, dt * 1.6);
      f.x += f.vx * dt; f.y += f.vy * dt + Math.sin(f.t * 1.7) * 7 * dt;
    } else {
      const k = Math.min(1, dt * 14), ox = f.x, oy = f.y;
      f.x += (f.px - f.gx - f.x) * k; f.y += (f.py - f.gy - f.y) * k;
      f.vx = (f.x - ox) / Math.max(dt, 0.001); f.vy = (f.y - oy) / Math.max(dt, 0.001);
      if (f.vx > 40) f.dir = 1; else if (f.vx < -40) f.dir = -1;
    }
    f.y = Math.max(R, Math.min(S.H - R, f.y)); f.x = Math.max(-R, Math.min(S.W + R, f.x));
    f.face += (f.dir - f.face) * Math.min(1, dt * 3.2);
    f.ph += dt * (7 + Math.min(10, Math.abs(f.vx) * 0.05) + (f.held ? 6 : 0));
    const target = f.held ? 0.5 + 0.03 * Math.sin(f.t * 16) : 0;
    f.inflV += ((target - f.infl) * 240 - f.inflV * 11) * dt; f.infl += f.inflV * dt;
    f.rot += (Math.max(-0.5, Math.min(0.5, -(f.vx * f.face) / 1400)) - f.rot) * Math.min(1, dt * 8);
    f.pitch += (Math.max(-0.35, Math.min(0.35, f.vy / 500)) - f.pitch) * Math.min(1, dt * 6);
    const dx = f.px - f.x, dy = f.py - f.y, d = Math.hypot(dx, dy) || 1;
    f.ex += (dx / d * Math.min(1, d / 200) - f.ex) * Math.min(1, dt * 8);
    f.ey += (dy / d * Math.min(1, d / 200) - f.ey) * Math.min(1, dt * 8);
    f.blink -= dt; if (f.blink < 0) { f.blinkT = 0.18; f.blink = 2 + Math.random() * 3; }
    if (f.blinkT > 0) f.blinkT -= dt;
    f.bubT -= dt;
    if (f.bubT < 0 && !f.held) { bubble(f.x + f.face * R * 1.1, f.y + R * 0.1, 2 + Math.random() * 3, 30 + Math.random() * 30); f.bubT = 2 + Math.random() * 3; }
    bubbles.forEach((b, i) => {
      if (!b.m.visible) return;
      b.life += dt; b.x += (b.vx + Math.sin(b.life * 5 + i) * 14) * dt; b.y -= b.vy * dt;
      if (b.life > b.max) { b.m.visible = false; return; }
      b.m.position.set(b.x - S.W / 2, S.H / 2 - b.y, S.R * 0.2); b.m.scale.setScalar(b.r);
      b.m.material.opacity = 0.5 * (1 - Math.max(0, (b.life - b.max * 0.6) / (b.max * 0.4)));
    });
    hit.style.transform = `translate(${(f.x - R * 1.25).toFixed(1)}px,${(f.y - R * 1.15).toFixed(1)}px)`;
  }

  function pose() {
    const R = S.R, ph = f.ph, pop = f.pop < 1 ? f.pop * f.pop * (3 - 2 * f.pop) : 1;
    const inflate = Math.max(-0.4, f.infl), sc = R * (1 + inflate) * Math.max(0.02, pop);
    root.position.set(f.x - S.W / 2, S.H / 2 - f.y, 0);
    root.scale.setScalar(sc);
    // 3/4 view: it faces the way it swims, and passes through facing the viewer as it turns round
    root.rotation.set(f.pitch * 0.6, f.face * 0.82 + Math.sin(ph) * 0.09, f.rot, 'YXZ');
    const pulse = Math.sin(ph) * 0.03;
    body.scale.set(1 - pulse, 1 + pulse, 1 + pulse * 0.6);
    tail.pivot.rotation.y = Math.sin(ph) * 0.6;
    const flap = Math.sin(ph * 1.5) * 0.55;
    finL.pivot.rotation.z = -0.25 + flap; finR.pivot.rotation.z = 0.25 - flap;
    finL.pivot.rotation.y = -0.2; finR.pivot.rotation.y = 0.2;
    dorsal.pivot.rotation.x = Math.sin(ph) * 0.15;
    const spk = Math.max(0, Math.min(1, (f.infl - 0.12) / 0.4));
    spikes.scale.setScalar(Math.max(0.001, spk));
    spikes.visible = spk > 0.02;
    const open = Math.max(0, Math.min(1, spk));
    mouth.scale.set(1 + open * 0.8, 1 + open * 0.8, 1);
    lips.scale.setScalar(1 + open * 0.5);
    const bk = f.blinkT > 0 ? 1 - Math.abs(f.blinkT - 0.09) / 0.09 : 0;
    eyes.forEach((e, i) => {
      const sd = i === 0 ? -1 : 1;
      e.pupil.position.x = f.ex * f.face * 0.08;
      e.pupil.position.y = -f.ey * 0.08;
      e.lid.scale.z = 0.001 + bk;
      e.g.scale.setScalar(1 + spk * 0.1);
    });
  }

  let raf = 0, last = performance.now(), popT = 0, dead = false;
  function frame(now) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (f.pop < 1) f.pop = Math.min(1, f.pop + dt * 1.6);
    step(dt); pose(); renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  // ---- picking it up
  hit.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    e.preventDefault();
    try { hit.setPointerCapture(e.pointerId); } catch (err) {}
    f.held = true; f.px = e.clientX; f.py = e.clientY; f.gx = e.clientX - f.x; f.gy = e.clientY - f.y;
    hit.classList.add('x-grab'); puff();
  });
  hit.addEventListener('pointermove', (e) => { f.px = e.clientX; f.py = e.clientY; });
  const drop = (e) => {
    if (!f.held) return;
    f.held = false; hit.classList.remove('x-grab');
    try { hit.releasePointerCapture(e.pointerId); } catch (err) {}
    f.vx = Math.max(-420, Math.min(420, f.vx)); f.vy = Math.max(-300, Math.min(300, f.vy));
    f.inflV -= 2.5; puff();
  };
  hit.addEventListener('pointerup', drop); hit.addEventListener('pointercancel', drop);
  const onMove = (e) => { f.px = e.clientX; f.py = e.clientY; };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', resize);

  return function stop() {
    dead = true; cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove); removeEventListener('resize', resize);
    canvas.remove(); hit.remove();
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
    renderer.dispose();
  };
}
