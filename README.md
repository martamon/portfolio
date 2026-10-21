# portfolio

Static mirror of https://martamonteagudo.com (Framer site), served via GitHub Pages on the custom domain https://martamonteagudo.com (see `CNAME`).

- Page HTML lives in `index.html` and one folder per page (`about/`, `contact/`, ...).
- Scripts, images, videos and fonts are self-hosted in `framerusercontent.com/`, `app.framerstatic.com/` and `fonts.gstatic.com/`.
- Images are capped at 2048px and re-encoded to WebP by `scripts/optimize-images.py` (run from the build script; takes ~20 min).
- `scripts/build-mirror.sh` rewrites a raw crawl of the live site into this layout (the base URL is its second argument; pass the domain for a custom-domain build, which also writes `CNAME`).
- `scripts/extras.js` holds the site-specific additions (loaded on every page; every page also gets `<base href="/">` because GitHub Pages serves `/china` as `/china/`, which would break relative links): menu and home captions in IBM Plex Mono with a rolling-letters hover (as paul-michel.framer.website), fade of the About hero video, Instagram video and the RZ image in Lexus (`extras/lexus-rz.webp`), full-screen YouTube video in Schweppes, the single/grid view toggle on project pages (not on the home page), rounded outer corners of the image column, the 3D tilt of the Contact portrait, and the home reel (autoplay with its own sound button, no YouTube UI), and height fixes so each project page ends with its own footer.
- `scripts/site-edits.py` applies content edits to the mirror (brands in the About text; the home project list shows all projects instead of 10). `scripts/make-project-pages.py` creates pages for CMS projects that no crawled page links to (Portugal, Nothing to see here, Studio), removes "Coming soon" and writes the redirecting `404.html`. `scripts/optimize-images.py --only <list>` optimizes just newly added images.
- `scripts/sw.js` is a service worker that serves the byte ranges Framer asks for from its CMS files (`?range=`), which a static host cannot, and serves the CMS images (`framerusercontent.com/images/...`) from this site's copies; without it, client-side navigation to gallery pages fails. The raw crawl must include `framerusercontent.com/cms/` (it only loads on in-page navigation).
- YouTube embeds and social links still point to their original hosts.
- The `clone-website` skill is installed in `.claude/skills/`.
