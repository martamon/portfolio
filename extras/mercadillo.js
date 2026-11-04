// The Sunday travelling market of a Galician village: little wooden stalls under striped awnings that sell vegetables, fruit, bread, cheese, empanadas,
// octopus, sausages and honey. Shared by the planet and the bike ride. Everything is built at "unit" size (a stall is about 3.2 wide) and scaled by the caller.
export const KINDS = ['veg', 'fruit', 'bread', 'cheese', 'pulpo', 'empanada', 'sausage', 'honey'];
export function stall(THREE, std, kind, awn, shadows) {
  const g = new THREE.Group(), PI = Math.PI;
  const add = (geo, col, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, typeof col === 'number' ? std(col) : col); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; o.castShadow = !!shadows; o.receiveShadow = !!shadows; g.add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), S = (r) => new THREE.IcosahedronGeometry(r, 1), C = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n || 8);
  add(B(3.0, .9, 1.0), 0xb98a5a, 0, .45, .3); add(B(3.15, .08, 1.15), 0xe9d3aa, 0, .94, .3);                       // wooden counter and its top
  for (const sx of [-1.5, 1.5]) { add(C(.06, .06, 2.5, 6), 0x8a6a4c, sx, 1.25, -.75); add(C(.06, .06, 2.2, 6), 0x8a6a4c, sx, 1.1, 1.0); }
  add(B(3.1, 1.3, .06), 0xfff1dc, 0, 1.7, -.78);                                                                   // cloth at the back
  for (let i = 0; i < 6; i++) add(B(.54, .07, 2.05), i % 2 ? 0xfff4e4 : awn, -1.35 + i * .54, 2.5, .12, .2);        // striped awning
  const row = (geo, col, n, x0, dx, y, z, jit) => { for (let i = 0; i < n; i++) add(geo, col, x0 + i * dx + ((i * 37 % 7) / 7 - .5) * (jit || 0), y, z + ((i * 53 % 5) / 5 - .5) * (jit || 0) * .6); };
  const Y = 1.0;
  if (kind === 'veg') { for (const x of [-1.0, 0, 1.0]) add(B(.84, .22, .62), 0x9a7048, x, Y + .1, .4); row(S(.24), 0x7cc25a, 3, -1.0, .12, Y + .32, .4, .3); row(S(.22), 0xe05a46, 3, 0, .2, Y + .3, .4, .3); row(C(.1, .02, .5, 6), 0xf09a3a, 5, .75, .1, Y + .38, .4, .2); add(S(.3), 0x9bc96a, -1.35, 1.35, .4); }
  else if (kind === 'fruit') { for (const x of [-1.0, 0, 1.0]) add(B(.84, .22, .62), 0x9a7048, x, Y + .1, .4); row(S(.17), 0xf2a23a, 5, -1.3, .17, Y + .3, .4, .25); row(S(.17), 0xe9526a, 5, -.3, .16, Y + .3, .4, .25); row(S(.15), 0xd6e05a, 5, .72, .15, Y + .3, .4, .25); }
  else if (kind === 'bread') { for (let i = 0; i < 6; i++) { const o = add(S(.26), 0xd9a45c, -1.2 + i * .48, Y + .28, .4 + (i % 2) * .15); o.scale.set(1.6, .8, .8); o.rotation.y = i * .5; } for (let i = 0; i < 3; i++) add(C(.28, .28, .1, 12), 0xe6b872, -.8 + i * .8, Y + .08, .1); }
  else if (kind === 'cheese') { for (let i = 0; i < 3; i++) { add(C(.4, .4, .22, 14), 0xf6e6a8, -1.0 + i * 1.0, Y + .12, .4); add(C(.34, .34, .2, 14), 0xf3dd8c, -1.0 + i * 1.0, Y + .34, .4); } add(new THREE.ConeGeometry(.3, .5, 10), 0xfaedb8, .3, Y + .3, .08); add(new THREE.ConeGeometry(.28, .45, 10), 0xfaedb8, 1.3, Y + .27, .08); }
  else if (kind === 'pulpo') { for (const x of [-.9, .5]) { add(C(.55, .45, .1, 14), 0xdcdcd8, x, Y + .08, .35); const h = add(S(.34), 0xe9876e, x, Y + .42, .35); h.scale.set(1, 1.15, 1); for (let k = 0; k < 6; k++) { const a = k * 1.05; add(C(.05, .02, .8, 5), 0xe9876e, x + Math.cos(a) * .3, Y + .3, .35 + Math.sin(a) * .3, Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0); } } add(S(.18), 0xf4e8c8, 1.3, Y + .16, .5); add(S(.15), 0xf4e8c8, 1.15, Y + .14, .26); }
  else if (kind === 'empanada') { for (let i = 0; i < 3; i++) { add(B(.9, .05, .55), 0xcfd0d2, -1.0 + i * 1.0, Y + .05, .4); const e = add(B(.82, .16, .48), 0xe3a24e, -1.0 + i * 1.0, Y + .17, .4); e.scale.y = 1; add(B(.5, .02, .3), 0xf0c47a, -1.0 + i * 1.0, Y + .26, .4); } }
  else if (kind === 'sausage') { for (let i = 0; i < 7; i++) { const x = -1.2 + i * .4; add(C(.04, .04, .35, 4), 0x8a6a4c, x, 2.15, .15); add(C(.1, .1, .6, 8), i % 2 ? 0x9a3f35 : 0xb4573f, x, 1.8, .15); add(C(.1, .1, .6, 8), i % 2 ? 0xb4573f : 0x9a3f35, x + .12, 1.4, .15); } for (let i = 0; i < 3; i++) add(S(.28), 0xd8a0a0, -1 + i, Y + .3, .4); }
  else { for (let i = 0; i < 9; i++) { const o = add(C(.17, .17, .34, 10), 0xe0a238, -1.2 + (i % 5) * .5, Y + .21, .15 + Math.floor(i / 5) * .45); add(C(.18, .18, .06, 10), 0xfff1dc, o.position.x, Y + .41, o.position.z); } for (let i = 0; i < 4; i++) add(S(.12), 0xfff6e6, -1.0 + i * .5, Y + .1, .85); add(B(.7, .22, .5), 0x9a7048, 1.0, Y + .12, .85); row(S(.1), 0xfff2de, 5, .75, .12, Y + .3, .85, .1); }
  return g;
}
// a string of little flags across the street
export function bunting(THREE, std, span, n, cols) {
  const g = new THREE.Group(), pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(new THREE.Vector3((u - .5) * span, -Math.sin(u * Math.PI) * .55, 0)); }
  const cu = new THREE.CatmullRomCurve3(pts); g.add(new THREE.Mesh(new THREE.TubeGeometry(cu, 12, .03, 4), std(0x6b4a2e)));
  for (let i = 1; i < n; i++) { const p = cu.getPoint(i / n), f = new THREE.Mesh(new THREE.ConeGeometry(.2, .42, 3), std(cols[i % cols.length])); f.position.set(p.x, p.y - .21, p.z); f.rotation.x = Math.PI; g.add(f); }
  return g;
}
