# portfolio

Static mirror of https://martamonteagudo.com (Framer site), served via GitHub Pages at https://martamon.github.io/portfolio/.

- Page HTML lives in `index.html` and one folder per page (`about/`, `contact/`, ...).
- Scripts, images, videos and fonts are self-hosted in `framerusercontent.com/`, `app.framerstatic.com/` and `fonts.gstatic.com/`.
- `scripts/build-mirror.sh` rewrites a raw crawl of the live site into this layout (the base URL is its second argument).
- YouTube embeds and social links still point to their original hosts.
- The `clone-website` skill is installed in `.claude/skills/`.
