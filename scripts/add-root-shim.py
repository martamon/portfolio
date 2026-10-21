#!/usr/bin/env python3
"""Adds <base href="/">, the service worker registration, a fallback link handler and the site extras (extras.js) to a root-domain build.

usage: scripts/add-root-shim.py <site-root>
Writes <site-root>/sw.js and injects a small script into every page's <head>.
The script registers the worker; until the worker controls the page (first visit), internal
links are loaded as normal pages instead of through Framer's client-side router.
"""
import os, shutil, sys

root = os.path.abspath(sys.argv[1])
here = os.path.dirname(os.path.abspath(__file__))
shutil.copy(os.path.join(here, 'sw.js'), os.path.join(root, 'sw.js'))
shutil.copy(os.path.join(here, 'extras.js'), os.path.join(root, 'extras.js'))

MARK = '<!--root-shim-->'
BASE_MARK = '<!--base-->'
# GitHub Pages serves /china as /china/, so a relative link like ./about would resolve to /china/about
BASE = BASE_MARK + '<base href="/">'
EXTRAS_MARK = '<!--extras-->'
EXTRAS = EXTRAS_MARK + '<script src="/extras.js" defer></script>'
SNIPPET = MARK + '''<script>(function(){var sw="serviceWorker"in navigator;if(sw)navigator.serviceWorker.register("/sw.js").catch(function(){});addEventListener("click",function(e){if(sw&&navigator.serviceWorker.controller)return;var a=e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank")return;var u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname)return;e.preventDefault();e.stopImmediatePropagation();location.href=u.href},true)})()</script>'''

n = 0
for dp, dn, fs in os.walk(root):
    dn[:] = [d for d in dn if d not in ('.git', 'framerusercontent.com', 'app.framerstatic.com', 'fonts.gstatic.com', '.claude', 'docs', 'scripts')]
    for fn in fs:
        if fn.endswith('.html'):
            p = os.path.join(dp, fn)
            s = open(p, encoding='utf-8').read()
            if '<head>' not in s:
                continue
            add = ('' if BASE_MARK in s else BASE) + ('' if MARK in s else SNIPPET) + ('' if EXTRAS_MARK in s else EXTRAS)
            if add:
                open(p, 'w', encoding='utf-8').write(s.replace('<head>', '<head>' + add, 1))
                n += 1
print(f'shim added to {n} pages')
