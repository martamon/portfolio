# portfolio

Static mirror of https://martamonteagudo.com (Framer site), served via GitHub Pages on the custom domain https://martamonteagudo.com (see `CNAME`).

- Page HTML lives in `index.html` and one folder per page (`about/`, `contact/`, ...).
- Scripts, images, videos and fonts are self-hosted in `framerusercontent.com/`, `app.framerstatic.com/` and `fonts.gstatic.com/`.
- Images are capped at 2048px and re-encoded to WebP by `scripts/optimize-images.py` (run from the build script; takes ~20 min).
- `scripts/build-mirror.sh` rewrites a raw crawl of the live site into this layout (the base URL is its second argument; pass the domain for a custom-domain build, which also writes `CNAME`).
- YouTube embeds and social links still point to their original hosts.
- The `clone-website` skill is installed in `.claude/skills/`.
