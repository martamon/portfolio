// Writes extras/blob.glb, the blob of extras/blob-model.js as a glTF binary file (for Blender, three.js, <model-viewer>, ...).
// Usage: node scripts/export-blob-glb.mjs <path to a `three` package, r160 or later, e.g. node_modules/three>
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildBlob } from '../extras/blob-model.js';

const three = resolve(process.argv[2] || 'node_modules/three');
const THREE = await import(pathToFileURL(resolve(three, 'build/three.module.js')).href);
const { GLTFExporter } = await import(pathToFileURL(resolve(three, 'examples/jsm/exporters/GLTFExporter.js')).href);

// GLTFExporter reads blobs with FileReader, which Node lacks
globalThis.FileReader = class {
  readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onloadend(); }); }
  readAsDataURL(b) { b.arrayBuffer().then((r) => { this.result = 'data:' + (b.type || 'application/octet-stream') + ';base64,' + Buffer.from(r).toString('base64'); this.onloadend(); }); }
};

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../extras/blob.glb');
const scene = new THREE.Scene();
scene.add(buildBlob(THREE).root);
const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
writeFileSync(out, Buffer.from(glb));
console.log('wrote', out, glb.byteLength, 'bytes');
