#!/usr/bin/env python3
"""Shrinks the mirrored images the way Framer's image CDN did on the fly.

Framer served images resized from ?scale-down-to=... (never above 2048px); a static host ignores
those parameters and ships the originals. This caps the long side at 2048px, re-encodes to WebP
(lossless when that is not much bigger than lossy, so flat graphics and text stay crisp) and
rewrites every reference to the renamed files. Files that would not get meaningfully smaller are kept.

usage: scripts/optimize-images.py <site-root>
"""
import io, os, re, sys
from PIL import Image

MAX_SIDE = 2048
SKIP_BELOW = 150_000       # bytes: not worth touching
KEEP_IF_RATIO = 0.85       # keep the new file only if it is under 85% of the old size
LOSSY_Q = 86
TEXT_EXT = ('.html', '.mjs', '.js', '.json', '.css')

root = os.path.abspath(sys.argv[1])
img_dir = os.path.join(root, 'framerusercontent.com', 'images')


def encode(im, has_alpha, is_png):
    out = []
    if is_png:
        b = io.BytesIO(); im.save(b, 'WEBP', lossless=True, quality=100, method=6); out.append(b.getvalue())
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=LOSSY_Q, method=6, alpha_quality=100)
    lossy = b.getvalue()
    if out and len(out[0]) <= 1.3 * len(lossy):
        return out[0]
    return lossy


renames, saved, before, after = {}, 0, 0, 0
for name in sorted(os.listdir(img_dir)):
    stem, ext = os.path.splitext(name)
    ext = ext.lower()
    path = os.path.join(img_dir, name)
    size = os.path.getsize(path)
    before += size
    if ext not in ('.png', '.jpg', '.jpeg', '.webp') or size < SKIP_BELOW:
        after += size
        continue
    im = Image.open(path)
    if getattr(im, 'n_frames', 1) > 1:          # animated: leave alone
        after += size
        continue
    im.load()
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    if max(im.size) > MAX_SIDE:
        k = MAX_SIDE / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    data = encode(im, has_alpha, ext == '.png')
    if len(data) > KEEP_IF_RATIO * size:
        after += size
        continue
    new = stem + '.webp'
    os.remove(path)
    with open(os.path.join(img_dir, new), 'wb') as f:
        f.write(data)
    after += len(data)
    if new != name:
        renames[name] = new

if renames:
    pat = re.compile(r'(?<![A-Za-z0-9])(' + '|'.join(re.escape(k) for k in renames) + r')(?![A-Za-z0-9])')
    n_files = 0
    for dp, _, fs in os.walk(root):
        if '.git' in dp.split(os.sep):
            continue
        for fn in fs:
            if not fn.endswith(TEXT_EXT):
                continue
            p = os.path.join(dp, fn)
            with open(p, encoding='utf-8', errors='surrogateescape') as f:
                s = f.read()
            t = pat.sub(lambda m: renames[m.group(1)], s)
            if t != s:
                n_files += 1
                with open(p, 'w', encoding='utf-8', errors='surrogateescape') as f:
                    f.write(t)
    print(f'rewrote references in {n_files} files')
print(f'images: {before/1048576:.1f} MB -> {after/1048576:.1f} MB ({len(renames)} renamed)')
