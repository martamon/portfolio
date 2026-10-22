// Contact page: a glowing blue blob with big black eyes (extras/blob-model.js, three.js, no model files). It bobs and hops about on the
// bottom of the page with a soft shadow, its eyes follow the pointer and it blinks; a click/tap makes it hop over to where you pointed
// and squash on landing. start() returns a function that removes everything.
import * as THREE from './three.module.min.js';
import { buildBlob } from './blob-model.js';

export function start() {
  let canvas, renderer;
  try {
    canvas = document.createElement('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { return function () {}; }
  canvas.className = 'x-blob'; canvas.setAttribute('aria-hidden', 'true');
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  document.body.appendChild(canvas);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa8ff, 2.6));
  const key = new THREE.DirectionalLight(0xbfd0ff, 1.2); key.position.set(-2, 3, 4); scene.add(key);

  // the body gets a fine grain (like the fuzz in the picture) and a light rim, added to the standard material
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 1, metalness: 0 });
  bodyMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', [
      'float gr = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);',
      'float rim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.2);',
      'outgoingLight *= 0.82 + 0.36 * gr;',
      'outgoingLight += vec3(0.42, 0.58, 1.0) * rim * 0.5;',
      '#include <opaque_fragment>'].join('\n'));
  };
  const model = buildBlob(THREE, { bodyMaterial: bodyMat }); // 1.84 units tall, feet on y = 0
  const blob = new THREE.Group(); blob.add(model.root); scene.add(blob);

  // soft shapes under and behind it: a contact shadow and a blue glow
  const radial = (stops) => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach((s) => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  };
  const flat = (stops) => new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: radial(stops), transparent: true, depthWrite: false }));
  const shadow = flat([[0, 'rgba(18,28,70,.42)'], [0.55, 'rgba(18,28,70,.16)'], [1, 'rgba(18,28,70,0)']]);
  const glow = flat([[0, 'rgba(110,150,255,.34)'], [0.6, 'rgba(110,150,255,.12)'], [1, 'rgba(110,150,255,0)']]);
  scene.add(shadow, glow);

  const slow = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion:reduce)').matches ? 0.5 : 1;
  const S = { W: 0, H: 0, R: 0, gy: 0, m: 0 };
  const B = { x: innerWidth * 0.72, h: 0, vh: 0, vx: 0, air: false, tx: innerWidth * 0.72, wait: 1.5, sq: 0, sqv: 0, t: 0, lx: 0, ly: 0, blink: 2.5, blinkT: 0 };
  const P = { x: innerWidth / 2, y: innerHeight / 2 };
  const GRAV = 2200 * slow * slow;
  const clampX = (x) => Math.min(Math.max(x, S.m), S.W - S.m);

  function resize() {
    S.W = innerWidth; S.H = innerHeight;
    S.R = S.W < 600 ? 62 : 84; // half the blob's height in px
    S.m = S.R * 1.3; S.gy = S.H - 28; // margin from the sides, y (px) of the ground
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(S.W, S.H, false);
    canvas.style.width = S.W + 'px'; canvas.style.height = S.H + 'px';
    camera.aspect = S.W / S.H;
    camera.position.set(0, 0, S.H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); camera.updateProjectionMatrix();
    blob.scale.setScalar(S.R * 2 / 1.84);
    B.x = clampX(B.x); B.tx = clampX(B.tx);
  }
  resize();

  function hop(dx, vh) {
    vh *= slow;
    B.vh = vh; B.air = true; B.vx = dx / (2 * vh / GRAV); B.sq = -0.22; B.sqv = 0; // crouch, then spring up
  }

  function step(dt) {
    B.t += dt;
    const R = S.R;
    if (!B.air) {
      B.wait -= dt;
      const far = B.tx - B.x;
      if (Math.abs(far) > 14) {
        if (B.wait < 0) { const dx = Math.max(-R * 3.2, Math.min(R * 3.2, far)); hop(dx, 640 + Math.min(300, Math.abs(dx) * 0.6)); B.wait = 0.12; }
      } else if (B.wait < 0) {
        B.tx = S.m + Math.random() * (S.W - 2 * S.m); B.wait = 2.5 + Math.random() * 3.5;
        if (Math.random() < 0.35) hop(0, 520);
      }
    } else {
      B.vh -= GRAV * dt; B.h += B.vh * dt; B.x = clampX(B.x + B.vx * dt);
      if (B.h <= 0 && B.vh < 0) { B.h = 0; B.air = false; B.sqv = Math.min(5, -B.vh / 160); B.vx = 0; }
    }
    // squash and stretch: an underdamped spring; stretched while rising, squashed on landing
    const target = B.air ? Math.max(-0.1, Math.min(0.16, B.vh / 4200)) : 0;
    B.sqv += ((target - B.sq) * 260 - B.sqv * 11) * dt; B.sq += B.sqv * dt;
    // eyes and head turn to the pointer
    const dx = P.x - B.x, dy = P.y - (S.gy - B.h - R), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 220);
    B.lx += (dx / d * k - B.lx) * Math.min(1, dt * 9); B.ly += (dy / d * k - B.ly) * Math.min(1, dt * 9);
    B.blink -= dt; if (B.blink < 0) { B.blinkT = 0.15; B.blink = 2 + Math.random() * 3.5; }
    if (B.blinkT > 0) B.blinkT -= dt;
  }

  function draw() {
    const R = S.R, sy = 1 + B.sq, sxz = 1 - B.sq * 0.55, bob = B.air ? 0 : Math.sin(B.t * 2.1 * slow) * 0.018;
    blob.position.set(B.x - S.W / 2, S.H / 2 - (S.gy - B.h), 0);
    model.root.scale.set(sxz * (1 - bob * 0.6), sy * (1 + bob), sxz * (1 - bob * 0.6));
    blob.rotation.y = B.lx * 0.32 + Math.sin(B.t * 0.8 * slow) * 0.05;
    blob.rotation.x = B.ly * 0.14 - (B.air ? B.vh / 9000 : 0);
    const bl = B.blinkT > 0 ? 0.1 : 1;
    model.eyes.forEach((e) => { e.eye.scale.y = bl; e.pupil.position.set(B.lx * 0.08, -B.ly * 0.08, 0.03); });
    // shadow on the ground (smaller and fainter the higher it is) and the glow behind
    const lift = Math.min(1, B.h / (R * 3.2));
    shadow.position.set(B.x - S.W / 2, S.H / 2 - (S.gy + R * 0.04), -R * 0.6);
    shadow.scale.set(R * (1.5 - 0.5 * lift) * sxz, R * 0.34 * (1 - 0.4 * lift), 1);
    shadow.material.opacity = 1 - 0.55 * lift;
    glow.position.set(B.x - S.W / 2, S.H / 2 - (S.gy - B.h - R), -R * 0.8);
    glow.scale.setScalar(R * 2.3);
    renderer.render(scene, camera);
  }

  let raf = 0, last = 0, alive = true;
  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (document.hidden) return;
    step(dt); draw();
  }
  const onMove = (e) => { P.x = e.clientX; P.y = e.clientY; };
  const onDown = (e) => {
    if (e.target && e.target.closest && e.target.closest('a,button,input,textarea,select,[role=button]')) return;
    P.x = e.clientX; P.y = e.clientY; B.tx = clampX(e.clientX); B.wait = 0;
  };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onDown, { passive: true });
  addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return function stop() {
    alive = false; cancelAnimationFrame(raf);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
    renderer.dispose(); canvas.remove();
  };
}
