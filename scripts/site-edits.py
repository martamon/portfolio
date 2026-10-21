#!/usr/bin/env python3
"""Content edits applied on top of the mirrored Framer site (idempotent). Run by build-mirror.sh.

usage: scripts/site-edits.py <site-root>
- About: adds Google, Schweppes and Colgate-Palmolive to the list of brands (page HTML, About module, search indexes).
- Home: the project list asked Framer for 10 items at a time and never loaded more; it now asks for 100, so every
  project shows.
"""
import glob, os, sys

root = os.path.abspath(sys.argv[1])
site = os.path.join(root, 'framerusercontent.com', 'sites')


def edit(path, pairs):
    s = open(path, encoding='utf-8').read()
    t = s
    for old, new in pairs:
        t = t.replace(old, new)
    if t != s:
        open(path, 'w', encoding='utf-8').write(t)
        print('edited', os.path.relpath(path, root))


BRANDS = [('Procter & Gamble, Iberdrola...', 'Procter & Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive...'),
          ('Procter &amp; Gamble, Iberdrola...', 'Procter &amp; Gamble, Iberdrola, Google, Schweppes, Colgate-Palmolive...')]
files = [os.path.join(root, 'about', 'index.html')] + glob.glob(os.path.join(site, '*', 'searchIndex-*.json'))
for f in glob.glob(os.path.join(site, '*', '*.mjs')):
    if 'Coca-Cola, Toyota' in open(f, encoding='utf-8', errors='ignore').read():
        files.append(f)
for f in files:
    edit(f, BRANDS)

for f in glob.glob(os.path.join(site, '*', '*.mjs')):
    if 'pageSize:10,query:Gr()' in open(f, encoding='utf-8', errors='ignore').read():
        edit(f, [('pageSize:10,query:Gr()', 'pageSize:100,query:Gr()')])
