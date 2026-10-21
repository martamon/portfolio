#!/usr/bin/env python3
"""Creates a page for every project in Framer's CMS data that has no page of its own, drops "Coming soon", and
replaces 404.html by a redirect to the home page.

usage: scripts/make-project-pages.py <site-root>

Framer's site only linked some projects from the other pages' footers, so a crawl of the home page misses them.
Every project page shares one route template (same routeId) and differs by its slug and CMS item id, which are
read from the CMS data file. A new page is the template page's HTML with those two values swapped and the
server-rendered content removed: Framer renders the page in the browser (a hydration mismatch is recovered from).
"""
import glob, html, json, os, re, shutil, sys

root = os.path.abspath(sys.argv[1])
cms = glob.glob(os.path.join(root, 'framerusercontent.com', 'cms', '*', '*', '*-chunk-default-0.framercms'))[0]
data = open(cms, 'rb').read()
strs = [m.group().decode('latin1') for m in re.finditer(rb'[ -~]{3,}', data)]

# records look like: <id> createdAt updatedAt ... Ysn9Xxvr1 <title> LE1znLSW0 <slug> ...
items, last_id = [], None
for i, s in enumerate(strs):
    if s == 'createdAt' and i:
        last_id = strs[i - 1]
    elif s == 'LE1znLSW0':
        items.append({'id': last_id, 'slug': strs[i + 1], 'title': strs[i - 1]})

template = os.path.join(root, 'greece', 'index.html')
tpl = open(template, encoding='utf-8').read()


def strip_main(doc):
    """Remove the server-rendered children of <div id="main" ...>."""
    m = re.search(r'<div id="main"[^>]*>', doc)
    depth, pos = 1, m.end()
    for t in re.finditer(r'<(/?)div\b[^>]*>', doc[pos:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return doc[:pos] + doc[pos + t.start():]
    raise SystemExit('unbalanced <div id="main">')


made = []
for it in items:
    slug = it['slug']
    folder = os.path.join(root, slug)
    if slug == 'coming-soon':
        shutil.rmtree(folder, ignore_errors=True)
        continue
    if os.path.exists(os.path.join(folder, 'index.html')):
        continue
    doc = strip_main(tpl)
    m = re.search(r'data-framer-hydrate-v2="([^"]*)"', doc)
    hyd = json.loads(html.unescape(m.group(1)))
    hyd['pathVariables'] = {list(hyd['pathVariables'])[0]: slug}
    hyd['collectionItemId'] = it['id']
    doc = doc.replace(m.group(0), 'data-framer-hydrate-v2="%s"' % html.escape(json.dumps(hyd, separators=(',', ':')), quote=True))
    doc = re.sub(r'<title>[^<]*</title>', '<title>%s - My Framer Site</title>' % html.escape(it['title']), doc, count=1)
    os.makedirs(folder, exist_ok=True)
    open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8').write(doc)
    made.append(slug)

open(os.path.join(root, '404.html'), 'w', encoding='utf-8').write(
    '<!doctype html><meta charset="utf-8"><title>martamon</title>'
    '<script>location.replace("/")</script><noscript><a href="/">martamon</a></noscript>\n')
print('projects:', [i['slug'] for i in items], '| pages created:', made)
