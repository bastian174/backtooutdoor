# SEO-Audit backtooutdoor.com – Umsetzungsplan

## Context
You asked me to "implement docs/plan.md, run all tests, fix everything red, and open a PR". The repo `bastian174/backtooutdoor` has no `docs/plan.md` on any branch and no tests at all: it's a static DE/EN/FR site on Vercel. You chose: write the SEO plan → save it as `docs/plan.md` → implement it → add a check script in place of tests → fix everything red → PR.

What the scan found across 122 root pages, plus `mindset/` and the sitemap with 245 URLs:
- **Sitemap**: `<loc>https://backtooutdoor.com/gewohnheits-tetris</loc>` has no `.html`. `vercel.json` has no `cleanUrls`, so that URL returns a 404. `about.html`, `ausruestung.html` and `gewohnheits-tetris.html` are linked public pages but are missing from the sitemap.
- **Missing meta description**: `agb.html`, `datenschutz.html`, `impressum.html`.
- **Internal or preview pages are indexable**: `backtooutdoor_hero_vorschau.html`, `immobilien-content.html`, `immobilien-showcase.html`, `immobilien-showcase-interactive.html` and `leitfaden.html`. No other page links to them, and they have no canonical, no robots tag, and partly no OG tags.
- **Missing OG tags** on `ausruestung.html` and the legal pages.
- All good: no duplicate titles or descriptions, each page has exactly one H1, every image has `alt`, the `mindset/` pages have correct canonical, hreflang and robots, and the sitemap includes them. There are no real broken internal links. The `AFFILIATE-LINK` hits in `shop-en/fr.html` sit inside an HTML comment, so they aren't a bug.

## Changes
1. **`docs/plan.md`**: copy this plan into the repo.
2. **`sitemap.xml`**: `gewohnheits-tetris` → `gewohnheits-tetris.html`. Add entries for `about.html`, `ausruestung.html` and `gewohnheits-tetris.html` if it's missing, in the same format as the neighbouring entries (DE-only pages without `xhtml:link`, as the other tetris pages do).
3. **Legal pages** `agb.html`, `datenschutz.html`, `impressum.html`: add a German `<meta name="description">`, plus `og:title`, `og:description` and `og:image` using `https://backtooutdoor.com/og-image.jpg`, the same pattern as `about.html`.
4. **`ausruestung.html`**: add OG tags in the same pattern.
5. **Internal or preview pages** `backtooutdoor_hero_vorschau.html`, `immobilien-*.html`, `leitfaden.html`: add `<meta name="robots" content="noindex, follow">` and keep them out of the sitemap. (`leitfaden.html` is a lead-magnet landing page with no internal links. Note to Bastian: if it should be indexed, remove the noindex and add a canonical.)
6. **`scripts/seo-check.py`** (new, Python standard library only, no dependencies) as the "test suite". It checks:
   - every sitemap `<loc>` points to an existing file
   - every indexable HTML page (no noindex) has a title, meta description, canonical, `lang`, and exactly one H1
   - each canonical points to the page itself
   - no duplicate titles or descriptions
   - internal `href`/`src` links resolve, ignoring `/api/`, `/_vercel/`, external links, and HTML comments
   - hreflang targets exist
   - exit code ≠ 0 on any error
7. **`.github/workflows/seo-check.yml`**: runs the script on push and PR, so future PRs get tested.

## Execution
- Branch `seo/audit-fixes` from `main`. Push access needs `add_repo` with `access: "push"`, then a fresh clone at `/home/user/backtooutdoor`.
- Run `python3 scripts/seo-check.py`, fix everything red until it's green, then commit, push, and open a PR with a short German summary.

## Verification
- `python3 scripts/seo-check.py` → exit 0.
- Run `xmllint --noout sitemap.xml` (or a Python XML parse) to confirm the sitemap is well-formed.
- `git diff --stat` touches only the files above.

## Status (umgesetzt)
- Zusätzlich gefunden und behoben: `portfolio.html` und `unterkuenfte.html` fehlten ebenfalls in der Sitemap; `unterkuenfte.html` bekam `og:url`/`og:image`.
- `python3 scripts/seo-check.py` → grün (254 Seiten, 249 Sitemap-URLs).
- Nachtrag: API-Tests (`tests/api.test.js`, `npm test`) für `verarbeiteLead`, `/api/lead`, `/api/go`, `clean()` und `teil2Ziel`/`teil2Link`; dabei Fehler in `kanalVon()` behoben (E-Book `gewohnheits-tetris` wurde ohne Seitenangabe dem Kanal „Back to Outdoor“ statt „Mindset Tetris“ zugeordnet). README neu, `KI-AGENT-ANLEITUNG.md` auf Gemini/Claude aktualisiert.
