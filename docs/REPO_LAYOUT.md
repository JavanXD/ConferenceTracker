# Repository layout

Conference Tracker is a static site plus a curated CSV catalog. Folders are grouped by role.

## Published (tracked in git)

| Path | Purpose |
|------|---------|
| `index.html`, `app.js`, `styles.css` | Dashboard entry and UI (GitHub Pages serves from repo root) |
| `assets/` | Favicons, social preview image, README screenshots |
| `data/` | `conferences.csv` — canonical catalog |
| `docs/` | Schema (`CATALOG.md`) and this layout guide |
| `scripts/` | Public maintainer tools (e.g. `validate_catalog.py`, run in CI) |
| `.github/` | CI workflows and GitHub metadata |
| `.cursor/skills/` | Agent workflow for catalog updates |
| `CNAME`, `robots.txt`, `sitemap.xml` | Hosting and SEO |

## Local only (gitignored)

| Path | Purpose |
|------|---------|
| `data/conferences.csv.bak-*` | Local catalog backups |
| `discovery/` | Private automation (not published) |
| `scripts/scrapers/` | Private data-collection helpers (not published) |
| `TODO.md` | Maintainer notes |

## Conventions

- Edit the catalog only in `data/conferences.csv`.
- Keep new static media under `assets/`.
- Add only CI-safe scripts under `scripts/`; keep private tooling gitignored.
- Run `python3 scripts/validate_catalog.py` before opening a PR.
