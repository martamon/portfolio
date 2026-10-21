#!/usr/bin/env bash
# Rewrites a raw mirror of martamonteagudo.com (html/ + mirror/) into the publishable site in the repo root.
# usage: scripts/build-mirror.sh <raw-dir> [BASE_URL]
set -euo pipefail
RAW="$1"; BASE="${2:-https://martamon.github.io/portfolio}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
for h in framerusercontent.com fonts.gstatic.com app.framerstatic.com; do
  rm -rf "$HERE/$h"; cp -r "$RAW/mirror/$h" "$HERE/$h"
done
rewrite() { sed -E "s#https://(framerusercontent\.com|fonts\.gstatic\.com|app\.framerstatic\.com)/#$BASE/\1/#g" "$@"; }
export -f rewrite 2>/dev/null || true
for f in $(find "$HERE/framerusercontent.com" "$HERE/app.framerstatic.com" "$HERE/fonts.gstatic.com" -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.json' -o -name '*.css' \)); do
  sed -i -E "s#https://(framerusercontent\.com|fonts\.gstatic\.com|app\.framerstatic\.com)/#$BASE/\1/#g" "$f"
done
# Framer's router assumes the site is served from the domain root; on a subpath, load internal links as real pages.
SHIM='<script>addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank")return;var u=new URL(a.href,location.href);if(u.origin!==location.origin)return;if(u.pathname===location.pathname)return;e.preventDefault();e.stopImmediatePropagation();location.href=u.href},true)</script>'
for f in "$RAW"/html/*.html; do
  n="$(basename "$f" .html)"
  out="$HERE/$n/index.html"; [ "$n" = index ] && out="$HERE/index.html"
  mkdir -p "$(dirname "$out")"
  sed -E "s#https://(framerusercontent\.com|fonts\.gstatic\.com|app\.framerstatic\.com)/#$BASE/\1/#g; s#<head>#<head><base href=\"$BASE/\">${SHIM//&/\\&}#" "$f" > "$out"
done
cp "$HERE/coming-soon/index.html" "$HERE/404.html"
touch "$HERE/.nojekyll"
