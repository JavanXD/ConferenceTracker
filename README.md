# Cybersecurity Conference Tracker

Track cybersecurity, infosec, and hacking speaking opportunities in `conferences.csv`, and view them in the static dashboard (`index.html`).

## Screenshot

![Conference Tracker dashboard screenshot](screenshots/app-screenshot.png)

## Why This Project Exists

Conference submission windows are easy to miss, and discovering relevant events often requires checking many disconnected sources. This project centralizes conference opportunities so speakers, trainers, and workshop leaders can plan submissions earlier and make travel decisions with better data.

ConferenceTracker helps you:

- Monitor upcoming conferences and avoid missing CFP/CfT/CfW deadlines
- Compare events by date, location, and format to plan a realistic speaking calendar
- Identify conferences that may provide travel or accommodation support
- Discover international opportunities for community visibility and professional growth
- Create data-backed requests for training, networking, and conference travel budgets

In short, this repository turns conference discovery from an ad-hoc process into a repeatable workflow that supports both career development and team planning.

## No backend required

This project is a **static site** (HTML, CSS, JavaScript, and `conferences.csv`). There is **no** server-side app, database, or account system to deploy. Personal UI state (filters, persona mode, pipeline, saved trips) stays in **your browser** using `localStorage` and does not get sent to a server.

You can use the **public deployment**, **self-host** a copy, or **run locally**—see [How to run (no backend)](#how-to-run-no-backend) below. Optional future features (accounts, verified badges, sync) would be additive; the core tracker is intended to remain usable as static files only.

## Quick Copy Prompt

```text
Update `conferences.csv` now.

Goal:
- Update existing rows when the conference already exists.
- Add a new row only when no matching conference exists.

Rules:
- Keep exact CSV header names and column order unchanged.
- Use only allowed enums and date formats:
  - `Yes|No|Unknown`, `High|Medium|Low`, `Academic|Industry|Mixed|Unknown`
  - deadlines: `MM-DD` or `TBD`
  - date fields: `YYYY-MM-DD` or `TBD`
- Use official sources first (official site -> CFP platform -> official social -> aggregator as lead only).
- Never invent data; keep `TBD`/`Unknown` when not verifiable.
- Set `last_verified_date` to today for every touched row.

Return:
- Added count, updated count, touched conference names
- Remaining high-priority rows still missing key fields
```

## For AI Agents: Fast Workflow

Project skill (Cursor): [`.cursor/skills/update-conference-data/`](.cursor/skills/update-conference-data/SKILL.md) — full CSV schema, research rules, and update/add workflow.

Use one of these two paths.

### Path A: Update an Existing Entry

1. Locate the existing row by `conference_name`.
2. Update only changed fields (deadlines, links, location, status, notes).
3. Keep valid existing values unchanged.
4. Set `last_verified_date` to today for touched rows.
5. If data is uncertain, keep `TBD`/`Unknown` and explain in `notes`.

### Path B: Add a New Entry

1. Confirm no existing row for the same conference (or same conference + region variant).
2. Add one new row with the exact column order.
3. Fill as many fields as possible from official sources.
4. For missing verified values, use `TBD` or `Unknown` (never invent).
5. Set `last_verified_date` to today.

## Source Priority (Required)

1. Official conference website (main page + official CFP/CFT/CFW pages)
2. Official submission platforms (Sessionize, PaperCall, Pretalx)
3. Official organizer social posts
4. Aggregators/directories only as leads; verify with official source before writing final values

## CSV Schema and Expected Formats

Keep the exact header order in `conferences.csv`:

1. `conference_name` - official name
2. `priority_level` - `High|Medium|Low`
3. `attendees_500_plus` - `Yes|No|Unknown`
4. `academic_acceptance_level` - `Academic|Industry|Mixed|Unknown`
5. `cfp_deadline_month` - month name (e.g. `March`) or `TBD`
6. `submission_tracks` - pipe-separated values (e.g. `Talks|Trainings|Workshops`)
7. `accepts_cfp` - `Yes|No|Unknown`
8. `accepts_cft` - `Yes|No|Unknown`
9. `accepts_cfw` - `Yes|No|Unknown`
10. `accepts_cfv` - `Yes|No|Unknown` (Call for Volunteers)
11. `travel_accommodation_sponsorship` - `Yes|No|Unknown|Partial`
12. `cfp_deadline_MM-DD` - `MM-DD` or `TBD`
13. `cft_deadline_MM-DD` - `MM-DD` or `TBD`
14. `cfw_deadline_MM-DD` - `MM-DD` or `TBD`
15. `cfv_deadline_MM-DD` - `MM-DD` or `TBD`
16. `conference_start_date` - `YYYY-MM-DD` or `TBD`
17. `conference_end_date` - `YYYY-MM-DD` or `TBD`
18. `city` - concrete city, or `TBD` when unknown
19. `country` - concrete country (prefer normalized names like `United States`, `United Kingdom`)
20. `website_or_cfp_link` - main site or direct CFP page URL
21. `cft_link` - direct CfT URL or blank
22. `cfw_link` - direct CfW URL or blank
23. `cfv_link` - direct CfV URL or blank
24. `conference_type` - `In-Person|Hybrid|Virtual`
25. `timezone` - valid IANA timezone (e.g. `Europe/Berlin`)
26. `notes` - short evidence/assumption notes
27. `last_verified_date` - `YYYY-MM-DD`
28. `venue_pattern` - `Rotating|Mostly Fixed|Fixed|Unknown`

### Hard Rules

- Follow the exact column order and header names in `conferences.csv` (do not reorder existing columns).
- Do not change enum values to free text.
- Use `TBD`/`Unknown` instead of guessing.
- If using estimated values from prior years, write `Estimated ...` in `notes`.

## Reusable AI Prompt (Combined: Add + Update + Format Rules)

Copy/paste this when asking an AI agent to run updates:

```text
Update `conferences.csv` now.

Goal:
- Update existing conference rows when they already exist.
- Add new rows only for conferences not currently present.

Execution rules:
1) Preserve exact CSV column order and header names.
2) Prefer official sources in this order:
   a) official conference site
   b) official CFP platform (Sessionize/PaperCall/Pretalx)
   c) official organizer social
   d) aggregator only as lead, must verify with official source
3) Use strict field formats:
   - `attendees_500_plus`: Yes|No|Unknown
   - `academic_acceptance_level`: Academic|Industry|Mixed|Unknown
   - `accepts_cfp` / `accepts_cft` / `accepts_cfw` / `accepts_cfv`: Yes|No|Unknown
   - `travel_accommodation_sponsorship`: Yes|No|Unknown|Partial
   - `cfp_deadline_MM-DD` / `cft_deadline_MM-DD` / `cfw_deadline_MM-DD` / `cfv_deadline_MM-DD`: MM-DD or TBD
   - `conference_start_date` / `conference_end_date` / `last_verified_date`: YYYY-MM-DD or TBD
   - `conference_type`: In-Person|Hybrid|Virtual
   - `timezone`: valid IANA timezone (e.g. Europe/Berlin)
   - `submission_tracks`: pipe-separated values
4) Keep location map-ready for touched rows:
   - set concrete `city` and `country` when known
   - normalize country names (e.g. United States, United Kingdom, United Arab Emirates)
   - if city unknown but country known, set city to TBD and note it
5) Never invent exact values. If not verifiable, use TBD/Unknown.
6) If estimating from prior-year pattern, include `Estimated ...` in `notes`.
7) Update `last_verified_date` to today for every touched row.

Return:
- Added rows count and updated rows count
- List of touched conferences
- Remaining high-priority rows still containing TBD/Unknown in key fields
```

## Pull Request Contribution Flow

For PR-based contribution steps (branching, commit, and PR checklist), see `CONTRIBUTING.md`.

## How to run (no backend)

The dashboard only needs **static file hosting** (or a local HTTP server). Pick one:

### 1. Use the public site

Browse and filter without cloning anything:

**[https://conference-tracker.javan.de/](https://conference-tracker.javan.de/)**

### 2. Self-host

Serve the **repository root** as static files. No runtime, build step, or database is required for the web UI.

Examples:

- **GitHub Pages:** Enable Pages on your fork; publish the branch/folder that contains `index.html` (often the repo root). Relative paths (`./app.js`, `./conferences.csv`) work as long as the site entry URL matches your folder layout.
- **Any static host or web server:** Copy the project files and point the document root at this directory.
- **Object storage + CDN:** Upload the same files; keep relative paths intact.

Forkers get their own URL (e.g. `https://<user>.github.io/<repo>/`); the app works the same.

### 3. Run locally

Browsers block loading `conferences.csv` from `file://` pages, so use a small local HTTP server. From the project root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/index.html](http://localhost:8000/index.html).

Other static servers are fine (for example `npx serve .` or any tool that serves the folder over HTTP).

### Backup and restore (browser data)

The UI includes **Backup & restore**: export or import a JSON file of everything this app keeps in `localStorage` (filters, favorites, private notes, persona, pipeline, saved trips, geocode cache, UI preferences, etc.). Use it to move between browsers or devices, or to snapshot before clearing site data—no account or server required.

### Offline tools (no account)

- **Conference details** — Click a conference name to open a panel with links, persona actions, and optional **private notes** (stored locally). The URL can include `?c=…` to deep-link to a conference after you share or bookmark the link.
- **Export filtered CSV** — Download the current filtered table (plus your notes column) for spreadsheets.
- **Copy shareable link** — Copies the current URL (filters and `persona` / `view` params) for others or another device.
- **Calendar (.ics)** — From the detail panel, download an all-day event for the **next upcoming** CfP/CfT/CfW deadline (when the CSV has a valid date).

## Discovery tooling (optional, gitignored)

Scraping and pipeline automation live in **`discovery/`** (excluded from git — see `discovery/README.md` after you create it locally). Produces proposal CSVs for review; does **not** change `conferences.csv` by default.

```bash
discovery/02_collect/.venv/bin/python discovery/04_orchestrate/step_10_sync.py --research --backend web
```

Merge approved rows with the [update-conference-data skill](.cursor/skills/update-conference-data/SKILL.md). Details: `discovery/00_STEP_ORDER.md`, `discovery/04_orchestrate/GITHUB_ACTIONS.md`.

## Verifying catalog data

Before changing `conferences.csv`:

1. Research on **official** sources — use the [update-conference-data skill](.cursor/skills/update-conference-data/SKILL.md) (required for non-trivial edits).
2. Spot-check in the app (`python3 -m http.server 8000` → open `index.html`) and watch the browser console for CSV warnings.
3. When merging from **discovery proposals** (local `discovery/` folder), run `discovery/06_review/step_01_validate_proposal.py` first; see `discovery/06_review/00_HUMAN_REVIEW.md`.
