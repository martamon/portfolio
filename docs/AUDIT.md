# Impeccable audit: martamon.github.io/portfolio

Date: 2026-10-21. Scope: all 13 pages of the live GitHub Pages mirror, at 1440x900 and 390x844.
Method: `impeccable detect` (61-rule detector) on every page and viewport, plus scripted DOM checks
(headings, landmarks, alt text, link names, touch targets, horizontal scroll, iframes, video, network weight).
Not run: screen reader, real touch device, keyboard walkthrough. No PRODUCT.md exists, so no brand intent was assumed.
The site is a Framer export: most findings come from the Framer design itself, and the mirror copies it faithfully.

## Audit Health Score: 11/20 (Acceptable)

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | White and grey text on pale blue fails contrast (1.2:1 to 3.8:1); no `<h1>` on any page |
| 2 | Performance | 1 | Mirror loads ~63 MB on the home page vs ~15 MB on the original |
| 3 | Theming | 2 | Single light theme, no dark mode, colours are Framer-generated classes, not tokens |
| 4 | Responsive | 3 | No horizontal scroll at 390px; 8 to 14 touch targets under 44px per page |
| 5 | Implementation Integrity | 3 | Coherent system; weak points are generic page titles and one default font |
| **Total** | | **11/20** | **Acceptable** |

## Implementation Integrity verdict
Pass, with caveats. The pages share one consistent visual system. Verified issues: 10 pages are titled
"<Name> - My Framer Site" (Framer default), About and Contact reuse the home title, and Inter is the
primary body font on Home and Contact.

## Findings

**[P1] Mirror serves full-size images (regression from the original)**
- Category: Performance. Location: `framerusercontent.com/images/*`, referenced with `?width=` params.
- Framer resized images on the fly from those query strings. GitHub Pages ignores them, so every visitor gets the original file.
  Measured on the home page after scrolling: original 15.0 MB total (9.4 MB images), mirror 62.6 MB (57.1 MB images).
  18 PNGs are over 1 MB, the largest 7.6 MB. Only 0 to 2 images per page use lazy loading.
- Fix: generate resized WebP variants at build time and rewrite the URLs. Suggested command: `/impeccable optimize`.

**[P1] Low-contrast text**
- Category: Accessibility. WCAG 1.4.3.
- White heading links on #cfebfe: 1.2:1 (needs 4.5:1), on all pages (the nav link).
- Grey #9a9aa1 body and footer text on #96cded: 1.6:1, on all pages.
- Grey #9a9aa1 on #d4eeff: 2.3:1, on 10 pages. About page tags (#799ab9 on #9fcbf6): 1.7:1.
- Fix: darken text or the background so each pair reaches 4.5:1 (3:1 for large text). Suggested command: `/impeccable colorize`.

**[P1] No `<h1>` on any page**
- Category: Accessibility. Every page starts at `<h2>`; About also skips from h2 to h5.
- Suggested command: `/impeccable harden`.

**[P2] Unnamed links and untitled iframes**
- 1 to 2 links per page have no text or aria-label (icon links). Some YouTube and embed iframes have no `title`.
- Suggested command: `/impeccable harden`.

**[P2] Small touch targets**
- 8 to 14 links per page are under 44x44px at 390px wide. Suggested command: `/impeccable adapt`.

**[P2] No reduced-motion handling**
- No `prefers-reduced-motion` rule found on any page, yet the site uses rolling text, scroll effects and background video. Suggested command: `/impeccable animate`.

**[P2] Page titles and sharing**
- 10 pages say "My Framer Site"; About and Contact repeat the home title. Suggested command: `/impeccable clarify`.

**[P3] Typography**
- Home hero caption is 147 characters of all-caps body text; line-height 1.2 on caption text (needs 1.3) on 9 pages;
  About paragraph runs ~103 characters per line (aim under 80); Inter is the main body font.
  Suggested command: `/impeccable typeset`.

**[P3] Autoplay videos**: About has 2 muted background videos with no controls and no pause. Fine for decoration; add a pause if they carry meaning.

## Patterns and systemic issues
- Contrast failures come from three shared colours (white, #9a9aa1, #737378) on the pale blue gradient, so fixing the palette fixes most pages at once.
- Nav and footer repeat the same issues on all 13 pages.

## Positive findings
- `lang="en"`, viewport meta and meta description present on every page; `main`, `nav`, `header` and `footer` landmarks used (About has no `<main>`).
- No horizontal scroll at 390px on any page.
- Real `alt` attributes on nearly all images (a few on China and Schweppes are missing; many decorative ones are empty on purpose).
- All pages render the same text as the original site.

## Recommended actions
1. **[P1] `/impeccable optimize`**: resize and lazy-load images in the mirror (largest win, ~63 MB to ~15 MB).
2. **[P1] `/impeccable colorize`**: fix the three text colours to meet 4.5:1.
3. **[P1] `/impeccable harden`**: add an `<h1>` per page, link names, iframe titles.
4. **[P2] `/impeccable adapt`**: enlarge touch targets.
5. **[P2] `/impeccable animate`**: add reduced-motion alternatives.
6. **[P2] `/impeccable clarify`**: write real page titles.
7. **[P3] `/impeccable typeset`**, then **`/impeccable polish`** as the final pass.

Note: changing the design means editing the mirrored HTML and scripts by hand, since Framer generates them. Edits would be overwritten if the mirror is rebuilt from the live site.
