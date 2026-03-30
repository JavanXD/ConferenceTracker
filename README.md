# Cybersecurity Conference Tracker

Track cybersecurity, infosec, and hacking speaking opportunities in `conferences.csv`, and view them in the static dashboard (`index.html`).

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
10. `travel_accommodation_sponsorship` - `Yes|No|Unknown|Partial`
11. `cfp_deadline_MM-DD` - `MM-DD` or `TBD`
12. `cft_deadline_MM-DD` - `MM-DD` or `TBD`
13. `cfw_deadline_MM-DD` - `MM-DD` or `TBD`
14. `conference_start_date` - `YYYY-MM-DD` or `TBD`
15. `conference_end_date` - `YYYY-MM-DD` or `TBD`
16. `city` - concrete city, or `TBD` when unknown
17. `country` - concrete country (prefer normalized names like `United States`, `United Kingdom`)
18. `website_or_cfp_link` - main site or direct CFP page URL
19. `cft_link` - direct CfT URL or blank
20. `cfw_link` - direct CfW URL or blank
21. `conference_type` - `In-Person|Hybrid|Virtual`
22. `timezone` - valid IANA timezone (e.g. `Europe/Berlin`)
23. `notes` - short evidence/assumption notes
24. `last_verified_date` - `YYYY-MM-DD`
25. `venue_pattern` - `Rotating|Mostly Fixed|Fixed|Unknown`

### Hard Rules

- Do not add/remove/reorder columns.
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
   - `priority_level`: High|Medium|Low
   - `attendees_500_plus`: Yes|No|Unknown
   - `academic_acceptance_level`: Academic|Industry|Mixed|Unknown
   - `accepts_cfp` / `accepts_cft` / `accepts_cfw`: Yes|No|Unknown
   - `travel_accommodation_sponsorship`: Yes|No|Unknown|Partial
   - `cfp_deadline_MM-DD` / `cft_deadline_MM-DD` / `cfw_deadline_MM-DD`: MM-DD or TBD
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

## Local Dashboard Run

Run a local server from the project root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000/index.html](http://localhost:8000/index.html).
