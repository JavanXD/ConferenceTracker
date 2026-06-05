---
name: update-conference-data
description: >-
  Add or update rows in data/conferences.csv for the Conference Tracker dashboard.
  Use when the user asks to add a conference, update deadlines/links/location,
  fix missing data, verify CFP/CfT/CfW, enrich notes, or edit conference catalog
  entries. Schema: docs/CATALOG.md. Requires web research from official sources before writing values.
---

# Update conference data (`data/conferences.csv`)

**Schema, enums, UI mapping:** [`docs/CATALOG.md`](../../../docs/CATALOG.md) — do not duplicate column lists here.  
**PR workflow:** [CONTRIBUTING.md](../../../CONTRIBUTING.md).

## Scope

- **In scope:** `data/conferences.csv` only.
- **Out of scope:** `index.html` / `app.js` unless the user asks for UI changes.

## Before editing

1. Read the CSV **header** — never reorder columns ([`docs/CATALOG.md`](../../../docs/CATALOG.md)).
2. **Search** for an existing row (name, similar spelling, same domain).
3. **Research on the web** — not training data alone.

## Update vs add

| Situation | Action |
|-----------|--------|
| Already listed | **Update** changed fields only |
| New or distinct regional edition | **Add** one row |
| Duplicates | **Merge** per user intent |

**Never** two rows for the same edition.

## Research

Use **WebSearch** / **WebFetch** until you can cite official evidence.

**Source order:** (1) official site + CFP pages (2) Sessionize / PaperCall / Pretalx / vendor CFP (3) organizer posts if site stale (4) aggregators **as leads only** — verify before writing.

**Collect:** start/end `YYYY-MM-DD`, `MM-DD` deadlines (or `TBD`), direct URLs, city/country, type, IANA timezone, sponsorship if stated, concise `notes`. **`submission_tracks`:** only non-obvious extras (`CTF`, `Panels`, `Villages`) — omit `Talks`/`Trainings`/`Workshops` when deadlines or `cft_`/`cfw_` links already imply them ([`docs/CATALOG.md` — Name badges](../../../docs/CATALOG.md#name-badges)).

### Dates when the row is stale or empty

1. Official site (blog, FAQ, archives) + **CfP Watch** / submission portals.
2. Verified listings (e.g. Crossweb) — confirm on organizer or official source.
3. **Write:** latest edition start/end for this row’s city; matching `cfp_deadline_MM-DD` (not another city’s cycle); edition history + relocation in `notes`; `venue_pattern` `Rotating` if city/format changed; `last_verified_date` = today.

Example pattern (Code Europe Kraków): conference `2025-06-30`–`2025-07-01`, CfP `03-30`, notes list 2023–2025 Kraków + 2026 Warsaw on main site.

### Hard limits

- **Never invent** dates, deadlines, or URLs.
- **`TBD` / `Unknown`** when not verifiable.
- Prefer **last official edition** over `TBD` conference dates for recurring events; `Estimated …` in `notes` only when inferring without an announcement.
- Open CfP, no close date → deadline `TBD`, URL in link column, note in `notes`.

## CSV editing

Quoted commas; empty optional links; bump `last_verified_date` on every touched row; no wide unrelated reformats.

## Checklist

```
- [ ] Row located or confirmed new
- [ ] Official site + CFP checked
- [ ] Fields match docs/CATALOG.md (or TBD/Unknown)
- [ ] last_verified_date + notes/sources
- [ ] User summary ready
```

## Deliverable

1. Added / updated counts and names  
2. Key field changes  
3. High-priority gaps still `TBD`/`Unknown`  
4. Sources when non-obvious  

## Verify locally (optional)

`python3 -m http.server 8000` → `index.html`; no CSV console warnings; deadline filters sane.

## Examples

| Case | Do |
|------|-----|
| CfP open, no close | `cfp_*` = `TBD`, PaperCall URL, note “open, close not published” |
| CfP closed | Keep `MM-DD`; keep conference dates |
| Backfill old editions only | Latest start/end; 2023, 2024… in `notes`; CfP close for **that** edition |
| New BSides | New row; pretalx/sessionize; `venue_pattern` when known |
| City moved | Note + separate row if user wants new city tracked |
