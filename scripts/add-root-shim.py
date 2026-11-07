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
# without a service worker (in-app browsers such as LinkedIn's) Framer's CMS loader gets the whole *.framercms file for a ?range= request and
# stops with "Unexpected response length", leaving the home page empty; this cuts the requested slices out in the page, like sw.js does
FETCH_PATCH = r'''var of=window.fetch;if(of&&!(navigator.serviceWorker&&navigator.serviceWorker.controller)){var mm={};window.fetch=function(i,n){try{var u=new URL(String(i&&i.url||i),location.href);if(u.origin===location.origin&&/\.framercms$/.test(u.pathname)&&u.searchParams.has("range")){var b=new URL(u);b.search="";var k=b.href,rg=u.searchParams.get("range").split(",").map(function(s){return s.split("-").map(Number)});var p=mm[k]||(mm[k]=of.call(window,k).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}));return p.then(function(buf){var a=new Uint8Array(buf),ps=rg.map(function(r){return a.subarray(r[0],r[1]+1)}),t=0,o=0;ps.forEach(function(x){t+=x.length});var out=new Uint8Array(t);ps.forEach(function(x){out.set(x,o);o+=x.length});return new Response(out,{status:200,headers:{"content-type":"application/octet-stream"}})}).catch(function(){delete mm[k];return of.call(window,i,n)})}}catch(e){}return of.apply(this,arguments)}}'''
SNIPPET = MARK + '''<script>(function(){''' + FETCH_PATCH + '''var sw="serviceWorker"in navigator;if(sw)navigator.serviceWorker.register("/sw.js").catch(function(){});addEventListener("click",function(e){if(sw&&navigator.serviceWorker.controller)return;var a=e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank")return;if(/coming-soon$/.test(a.getAttribute("href")||""))return;var u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname)return;e.preventDefault();e.stopImmediatePropagation();location.href=u.href},true)})()</script>'''

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
