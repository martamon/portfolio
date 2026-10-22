// The glowing blue blob (a round, soft creature with big black eyes and a tiny nose) as a three.js model built from primitives.
// buildBlob(THREE) returns { root, body, eyes, nose }; root is 1.84 units tall, face towards +z, feet on y = 0.
// Shared by extras/blob3d.js (the page) and scripts/export-blob-glb.mjs (writes extras/blob.glb, the same model as a file).

export function buildBlob(THREE, opts) {
  opts = opts || {};
  const root = new THREE.Group();
  root.name = 'Blob';

  // body: a sphere pressed into a gumdrop (domed top, flat soft bottom, a little wider low down)
  const g = new THREE.SphereGeometry(1, 128, 96), pos = g.attributes.position, col = [];
  const stops = [[-1, '#c4f3fb'], [-0.6, '#79c2e6'], [-0.15, '#3a46b0'], [0.5, '#4b4cc2'], [1, '#8f8bea']];
  const cols = stops.map((s) => new THREE.Color(s[1])), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = y;
    if (y < 0) { y *= 0.86; const k = 1 + 0.06 * (-t); x *= k; z *= k; } else { const k = 1 - 0.1 * t * t; x *= k; z *= k; y *= 0.98; }
    pos.setXYZ(i, x, y, z);
    let a = 0; while (a < stops.length - 2 && t > stops[a + 1][0]) a++;
    const f = Math.min(1, Math.max(0, (t - stops[a][0]) / (stops[a + 1][0] - stops[a][0])));
    c.copy(cols[a]).lerp(cols[a + 1], f * f * (3 - 2 * f));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const bodyMat = opts.bodyMaterial || new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 1, metalness: 0 });
  const body = new THREE.Mesh(g, bodyMat); body.name = 'Body'; root.add(body);

  // eyes: a slightly lighter, flattened socket, a big glossy black pupil on it and a small white highlight
  const matSocket = new THREE.MeshStandardMaterial({ color: 0x6f73d8, roughness: 1, metalness: 0 });
  const matPupil = new THREE.MeshPhysicalMaterial({ color: 0x03030a, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
  const matShine = new THREE.MeshBasicMaterial({ color: 0xdfe6ff });
  const eyes = [];
  [-1, 1].forEach((sd) => {
    const eye = new THREE.Group(); eye.name = sd < 0 ? 'EyeL' : 'EyeR';
    eye.position.set(sd * 0.4, 0.2, 0.86); eye.rotation.y = sd * 0.5; eye.rotation.x = -0.08;
    const socket = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), matSocket); socket.scale.set(0.37, 0.4, 0.1); eye.add(socket);
    const pupil = new THREE.Group(); pupil.position.z = 0.03; eye.add(pupil);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), matPupil); ball.scale.setScalar(0.27); ball.position.z = 0.03; pupil.add(ball);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), matShine); shine.scale.set(0.065, 0.05, 0.02); shine.position.set(0.09, 0.11, 0.26); shine.rotation.z = 0.6; pupil.add(shine);
    root.add(eye); eyes.push({ eye, pupil, sd });
  });

  // nose: a tiny dark dot
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), new THREE.MeshStandardMaterial({ color: 0x080a22, roughness: 0.6, metalness: 0 }));
  nose.name = 'Nose'; nose.scale.set(0.06, 0.055, 0.03); nose.position.set(0, -0.1, 0.99); root.add(nose);

  root.position.y = 0.86; // feet on y = 0
  const out = new THREE.Group(); out.name = 'BlobModel'; out.add(root);
  return { root: out, inner: root, body, eyes, nose };
}
